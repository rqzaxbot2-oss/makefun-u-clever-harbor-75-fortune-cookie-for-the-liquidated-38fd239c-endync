import { createHash } from "node:crypto";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface RubricScores {
  fortuneVoice: number;
  liquidationWit: number;
  laughOverTear: number;
  conciseness: number;
}

export interface FortuneCandidate {
  id: string;
  text: string;
  angle: string;
  rubric: RubricScores;
}

export interface AuditedCandidate extends FortuneCandidate {
  wordCount: number;
  charCount: number;
  plainTextValid: boolean;
  withinWordLimit: boolean;
  compositeScore: number;
  sha256: string;
}

export interface PairwiseMatch {
  round: string;
  matchId: string;
  leftId: string;
  rightId: string;
  winnerId: string;
  margin: number;
  rationale: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  text: string;
  wordCount: number;
  compositeScore: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface BuildArtifacts {
  winner: AuditedCandidate;
  candidates: AuditedCandidate[];
  leaderboard: LeaderboardEntry[];
  roundRobin: PairwiseMatch[];
  bracket: PairwiseMatch[];
  filesWritten: string[];
  bundleDigest: string;
}

const MAX_WORDS = 20;
const PLAIN_ASCII_RE = /^[\x20-\x7E]+$/;
const MARKDOWN_RE = /[*_`#[\]]/;
const WEIGHTS = {
  fortuneVoice: 0.3,
  liquidationWit: 0.3,
  laughOverTear: 0.25,
  conciseness: 0.15,
} as const;

export const CANDIDATES: readonly FortuneCandidate[] = [
  {
    id: "fc-01",
    text: "True peace begins with zero attachments; your liquidation engine just saved you decades of meditation.",
    angle: "zen-detachment-pivot",
    rubric: { fortuneVoice: 98, liquidationWit: 97, laughOverTear: 99, conciseness: 96 },
  },
  {
    id: "fc-02",
    text: "A heavy burden has left your shoulders today, along with your collateral and open positions.",
    angle: "classic-burden-twist",
    rubric: { fortuneVoice: 91, liquidationWit: 90, laughOverTear: 91, conciseness: 95 },
  },
  {
    id: "fc-03",
    text: "Great serenity awaits you now that no red candle can disturb your sleep at three.",
    angle: "peaceful-sleep-relief",
    rubric: { fortuneVoice: 93, liquidationWit: 86, laughOverTear: 94, conciseness: 94 },
  },
  {
    id: "fc-04",
    text: "A wise soul travels light; your margin call has kindly packed your wallet down to zero.",
    angle: "travel-light-proverb",
    rubric: { fortuneVoice: 90, liquidationWit: 91, laughOverTear: 90, conciseness: 93 },
  },
  {
    id: "fc-05",
    text: "Good fortune smiles on you today: your capital gains taxes just became remarkably simple.",
    angle: "silver-lining-taxes",
    rubric: { fortuneVoice: 89, liquidationWit: 85, laughOverTear: 92, conciseness: 95 },
  },
  {
    id: "fc-06",
    text: "When one leveraged door closes, another opens, usually marked with an hourly wage.",
    angle: "open-door-proverb",
    rubric: { fortuneVoice: 87, liquidationWit: 86, laughOverTear: 88, conciseness: 94 },
  },
  {
    id: "fc-07",
    text: "Patience brings prosperity, while fifty-times leverage brings an immediate appreciation for instant noodles.",
    angle: "patience-contrast",
    rubric: { fortuneVoice: 85, liquidationWit: 88, laughOverTear: 89, conciseness: 93 },
  },
  {
    id: "fc-08",
    text: "The universe has cleared your slate, your balance, and every excuse not to go outside.",
    angle: "fresh-slate-blessing",
    rubric: { fortuneVoice: 88, liquidationWit: 84, laughOverTear: 91, conciseness: 94 },
  },
];

export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function clampRubricScore(value: number, field: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Rubric score "${field}" must be a finite number.`);
  }
  return Math.min(100, Math.max(0, value));
}

function isEligible(candidate: AuditedCandidate): boolean {
  return candidate.plainTextValid && candidate.withinWordLimit;
}

export function scoreCandidate(candidate: FortuneCandidate): AuditedCandidate {
  const trimmed = candidate.text.trim();
  const wordCount = countWords(candidate.text);
  const charCount = candidate.text.length;
  const plainTextValid =
    trimmed.length > 0 &&
    trimmed === candidate.text &&
    PLAIN_ASCII_RE.test(candidate.text) &&
    !MARKDOWN_RE.test(candidate.text) &&
    !/\s{2,}/.test(candidate.text);
  const withinWordLimit = wordCount > 0 && wordCount <= MAX_WORDS;
  const rawScore =
    clampRubricScore(candidate.rubric.fortuneVoice, "fortuneVoice") * WEIGHTS.fortuneVoice +
    clampRubricScore(candidate.rubric.liquidationWit, "liquidationWit") * WEIGHTS.liquidationWit +
    clampRubricScore(candidate.rubric.laughOverTear, "laughOverTear") * WEIGHTS.laughOverTear +
    clampRubricScore(candidate.rubric.conciseness, "conciseness") * WEIGHTS.conciseness;
  const penalty = plainTextValid && withinWordLimit ? 0 : 100;
  const compositeScore = Number(Math.max(0, rawScore - penalty).toFixed(2));

  return {
    ...candidate,
    wordCount,
    charCount,
    plainTextValid,
    withinWordLimit,
    compositeScore,
    sha256: sha256(candidate.text),
  };
}

function judgePair(left: AuditedCandidate, right: AuditedCandidate, round: string, matchId: string): PairwiseMatch {
  const diff = Number((left.compositeScore - right.compositeScore).toFixed(2));
  const leftValid = isEligible(left);
  const rightValid = isEligible(right);
  const leftWins =
    diff !== 0
      ? diff > 0
      : leftValid !== rightValid
        ? leftValid
        : compareIds(left.id, right.id) <= 0;
  const winner = leftWins ? left : right;
  const runnerUp = leftWins ? right : left;
  const margin = Number(Math.abs(diff).toFixed(2));

  return {
    round,
    matchId,
    leftId: left.id,
    rightId: right.id,
    winnerId: winner.id,
    margin,
    rationale: `${winner.id} (${winner.angle}) outperformed ${runnerUp.id} (${runnerUp.angle}) by ${margin.toFixed(2)} pts on fortune voice and liquidation wit.`,
  };
}

function buildSeedOrder(size: number): number[] {
  let order = [0];
  while (order.length < size) {
    const nextSize = order.length * 2;
    order = order.flatMap((idx) => [idx, nextSize - 1 - idx]);
  }
  return order;
}

function roundMeta(entrants: number): { name: string; prefix: string } {
  if (entrants === 2) return { name: "final", prefix: "final" };
  if (entrants === 4) return { name: "semifinal", prefix: "sf" };
  if (entrants === 8) return { name: "quarterfinal", prefix: "qf" };
  return { name: `round-of-${entrants}`, prefix: `r${entrants}` };
}

export function runTournament(audited: AuditedCandidate[]): {
  leaderboard: LeaderboardEntry[];
  roundRobin: PairwiseMatch[];
  bracket: PairwiseMatch[];
  winner: AuditedCandidate;
} {
  if (audited.length === 0) {
    throw new Error("Tournament requires at least one candidate.");
  }

  const byId = new Map<string, AuditedCandidate>();
  const wins = new Map<string, number>();
  const losses = new Map<string, number>();
  for (const c of audited) {
    if (!c.id.trim()) throw new Error("Candidate id must be non-empty.");
    if (byId.has(c.id)) throw new Error(`Duplicate candidate id: ${c.id}`);
    byId.set(c.id, c);
    wins.set(c.id, 0);
    losses.set(c.id, 0);
  }

  const roundRobin: PairwiseMatch[] = [];
  let matchCounter = 1;
  for (let i = 0; i < audited.length; i++) {
    for (let j = i + 1; j < audited.length; j++) {
      const m = judgePair(audited[i], audited[j], "round-robin", `rr-${String(matchCounter++).padStart(2, "0")}`);
      roundRobin.push(m);
      const loserId = m.winnerId === m.leftId ? m.rightId : m.leftId;
      wins.set(m.winnerId, (wins.get(m.winnerId) ?? 0) + 1);
      losses.set(loserId, (losses.get(loserId) ?? 0) + 1);
    }
  }

  const seeded = [...audited].sort((a, b) => {
    const winDiff = (wins.get(b.id) ?? 0) - (wins.get(a.id) ?? 0);
    if (winDiff !== 0) return winDiff;
    if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
    if (isEligible(a) !== isEligible(b)) return isEligible(a) ? -1 : 1;
    return compareIds(a.id, b.id);
  });

  const leaderboard: LeaderboardEntry[] = seeded.map((c, idx) => {
    const w = wins.get(c.id) ?? 0;
    const l = losses.get(c.id) ?? 0;
    return {
      rank: idx + 1,
      id: c.id,
      text: c.text,
      wordCount: c.wordCount,
      compositeScore: c.compositeScore,
      wins: w,
      losses: l,
      winRate: Number((w / Math.max(1, w + l)).toFixed(4)),
    };
  });

  const bracket: PairwiseMatch[] = [];
  if (seeded.length === 1) {
    return { leaderboard, roundRobin, bracket, winner: seeded[0] };
  }

  let bracketSize = 1;
  while (bracketSize * 2 <= seeded.length) bracketSize *= 2;
  let currentRound = buildSeedOrder(bracketSize).map((idx) => seeded[idx]);

  while (currentRound.length > 1) {
    const { name, prefix } = roundMeta(currentRound.length);
    const nextRound: AuditedCandidate[] = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      const match = judgePair(currentRound[i], currentRound[i + 1], name, `${prefix}-${i / 2 + 1}`);
      bracket.push(match);
      const matchWinner = byId.get(match.winnerId);
      if (!matchWinner) throw new Error(`Missing match winner: ${match.winnerId}`);
      nextRound.push(matchWinner);
    }
    currentRound = nextRound;
  }

  return { leaderboard, roundRobin, bracket, winner: currentRound[0] };
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrapLines(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const limit = Math.max(1, maxChars);
  const lines: string[] = [];
  let current = "";
  for (const word of trimmed.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > limit && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderFortuneSvg(winner: AuditedCandidate): string {
  const lines = wrapLines(winner.text, 44);
  const lineHeight = 34;
  const startY = Math.round(284 - ((lines.length - 1) * lineHeight) / 2);
  const lineTags = lines
    .map(
      (line, idx) =>
        `  <text x="480" y="${startY + idx * lineHeight}" text-anchor="middle" fill="#1e1b18" font-family="Georgia, serif" font-size="24" font-style="italic">${escapeXml(line)}</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="Fortune Cookie for the Liquidated Trader">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#14110f"/>
      <stop offset="100%" stop-color="#2b2118"/>
    </linearGradient>
    <linearGradient id="cookie" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2c46d"/>
      <stop offset="100%" stop-color="#c9842c"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#bg)"/>
  <text x="480" y="64" text-anchor="middle" fill="#f3d59b" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" letter-spacing="4">FORTUNE COOKIE FOR THE LIQUIDATED TRADER</text>
  <path d="M295 162 C250 110, 360 72, 468 128 C430 144, 385 160, 295 162 Z" fill="url(#cookie)"/>
  <path d="M665 162 C710 110, 600 72, 492 128 C530 144, 575 160, 665 162 Z" fill="url(#cookie)"/>
  <rect x="92" y="196" width="776" height="196" rx="6" fill="#fcfaf2" stroke="#d9ccb2" stroke-width="2"/>
  <rect x="108" y="212" width="744" height="164" fill="none" stroke="#b93a2b" stroke-width="1.5" stroke-dasharray="6 4"/>
${lineTags}
  <text x="480" y="362" text-anchor="middle" fill="#9c2f23" font-family="ui-monospace, monospace" font-size="13">LUCKY NUMBERS: 00 - 00 - 00 - 00 - 00   |   WORDS: ${winner.wordCount}/${MAX_WORDS}   |   SCORE: ${winner.compositeScore.toFixed(2)}</text>
  <text x="480" y="458" text-anchor="middle" fill="#a89984" font-family="ui-monospace, monospace" font-size="13">SHA-256: ${winner.sha256.slice(0, 24)}</text>
</svg>
`;
}

function renderDashboardHtml(
  winner: AuditedCandidate,
  leaderboard: LeaderboardEntry[],
  bracket: PairwiseMatch[]
): string {
  const rows = leaderboard
    .map(
      (e) =>
        `<tr><td>#${e.rank}</td><td>${escapeXml(e.id)}</td><td>${escapeXml(e.text)}</td><td>${e.wordCount}</td><td>${e.wins}-${e.losses}</td><td>${e.compositeScore.toFixed(2)}</td></tr>`
    )
    .join("\n");
  const matchRows = bracket
    .map(
      (m) =>
        `<li><strong>${escapeXml(m.round.toUpperCase())} ${escapeXml(m.matchId)}:</strong> ${escapeXml(m.leftId)} vs ${escapeXml(m.rightId)} &rarr; <strong>${escapeXml(m.winnerId)}</strong> (+${m.margin.toFixed(2)})</li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Fortune Cookie for the Liquidated Trader</title>
  <style>
    body{margin:0;background:#16120f;color:#f4ede2;font-family:system-ui,-apple-system,sans-serif;padding:32px}
    main{max-width:960px;margin:0 auto}
    .slip{background:#fcfaf2;color:#1e1b18;border:2px solid #b93a2b;border-radius:8px;padding:28px;margin:24px 0;text-align:center}
    .quote{font-family:Georgia,serif;font-size:26px;font-style:italic;margin:0 0 12px}
    .meta{font-family:monospace;font-size:13px;color:#8e2a20}
    table{width:100%;border-collapse:collapse;margin-top:16px;font-size:14px}
    th,td{border-bottom:1px solid #352c24;padding:10px;text-align:left}
    th{color:#f0c674}
    ul{line-height:1.7}
  </style>
</head>
<body>
  <main>
    <h1>Fortune Cookie for the Liquidated Trader</h1>
    <section class="slip">
      <p class="quote">${escapeXml(winner.text)}</p>
      <div class="meta">Words: ${winner.wordCount}/${MAX_WORDS} | Plain Text: ${winner.plainTextValid} | Score: ${winner.compositeScore.toFixed(2)} | SHA-256: ${winner.sha256.slice(0, 16)}</div>
    </section>
    <h2>Pairwise Leaderboard</h2>
    <table>
      <thead><tr><th>Rank</th><th>ID</th><th>Fortune</th><th>Words</th><th>W-L</th><th>Score</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
    <h2>Knockout Bracket</h2>
    <ul>
${matchRows}
    </ul>
  </main>
</body>
</html>
`;
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildArtifacts(outputDir: string): BuildArtifacts {
  const targetDir = outputDir.trim();
  if (!targetDir) {
    throw new Error("Output directory must be a non-empty path.");
  }

  const candidates = CANDIDATES.map(scoreCandidate);
  const { leaderboard, roundRobin, bracket, winner } = runTournament(candidates);
  if (!isEligible(winner)) {
    throw new Error("Selected fortune failed plain-text or 20-word constraint.");
  }

  const stagedFiles: Record<string, string> = {
    "fortune.txt": `${winner.text}\n`,
    "fortune.json": toJson({
      fortune: winner.text,
      wordCount: winner.wordCount,
      characterCount: winner.charCount,
      maxWords: MAX_WORDS,
      plainTextValid: winner.plainTextValid,
      withinWordLimit: winner.withinWordLimit,
      sha256: winner.sha256,
    }),
    "board.json": toJson({
      bounty: "Fortune Cookie for the Liquidated Trader",
      champion: {
        id: winner.id,
        fortune: winner.text,
        wordCount: winner.wordCount,
        compositeScore: winner.compositeScore,
      },
      leaderboard,
      bracket,
    }),
    "data.json": toJson({
      rubricWeights: WEIGHTS,
      candidates,
      roundRobin,
    }),
    "dashboard.html": renderDashboardHtml(winner, leaderboard, bracket),
    "screenshots/fortune-cookie.svg": renderFortuneSvg(winner),
  };

  const manifest = Object.keys(stagedFiles)
    .sort()
    .map((relPath) => ({
      path: relPath,
      bytes: Buffer.byteLength(stagedFiles[relPath], "utf8"),
      sha256: sha256(stagedFiles[relPath]),
    }));

  const bundleDigest = sha256(JSON.stringify(manifest));
  stagedFiles["dossier.json"] = toJson({
    entryTitle: "Fortune Cookie for the Liquidated Trader",
    selectedFortune: winner.text,
    constraints: {
      maxWords: MAX_WORDS,
      observedWords: winner.wordCount,
      plainTextOnly: winner.plainTextValid,
      singleLine: !winner.text.includes("\n"),
      deterministic: true,
    },
    championMetrics: {
      id: winner.id,
      angle: winner.angle,
      rubric: winner.rubric,
      compositeScore: winner.compositeScore,
    },
    bundleDigest,
    artifacts: manifest,
  });

  const filesWritten: string[] = [];
  for (const relPath of Object.keys(stagedFiles).sort()) {
    const absPath = path.join(targetDir, relPath);
    mkdirSync(path.dirname(absPath), { recursive: true });
    writeFileSync(absPath, stagedFiles[relPath], "utf8");
    filesWritten.push(relPath);
  }

  return {
    winner,
    candidates,
    leaderboard,
    roundRobin,
    bracket,
    filesWritten,
    bundleDigest,
  };
}

export function main(): void {
  const configuredDir = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  const outputDir = configuredDir || path.resolve("out");
  const result = buildArtifacts(outputDir);
  process.stdout.write(`${result.winner.text}\n`);
}

const isEntrypoint = (() => {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(path.resolve(process.argv[1]));
  } catch {
    return false;
  }
})();

if (isEntrypoint) {
  main();
}