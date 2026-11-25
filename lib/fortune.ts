export const MAX_FORTUNE_WORDS = 20;
export const MIN_FORTUNE_WORDS = 5;
export const MAX_FORTUNE_CHARS = 160;

export interface FortuneCandidate {
  readonly id: string;
  readonly text: string;
  readonly theme: string;
  readonly fortuneVoice: number;
  readonly punchlineSharpness: number;
  readonly warmthOverCruelty: number;
  readonly cryptoSpecificity: number;
  readonly brevityRhythm: number;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly normalized: string;
  readonly wordCount: number;
  readonly charCount: number;
  readonly errors: readonly string[];
}

export interface HumorScoreBreakdown {
  readonly total: number;
  readonly fortuneVoice: number;
  readonly punchlineSharpness: number;
  readonly warmthOverCruelty: number;
  readonly cryptoSpecificity: number;
  readonly brevityRhythm: number;
  readonly structuralBonus: number;
}

export interface PairwiseComparison {
  readonly leftId: string;
  readonly rightId: string;
  readonly winnerId: string;
  readonly loserId: string;
  readonly margin: number;
  readonly rationale: string;
}

export interface RankedFortune {
  readonly candidate: FortuneCandidate;
  readonly validation: ValidationResult;
  readonly score: HumorScoreBreakdown;
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly netMargin: number;
  readonly rank: number;
}

export interface TournamentResult {
  readonly winner: RankedFortune;
  readonly rankings: readonly RankedFortune[];
  readonly matches: readonly PairwiseComparison[];
}

export const FORTUNE_CANDIDATES: readonly FortuneCandidate[] = [
  {
    id: "enlightenment-accelerator",
    text: "A wise person lets go of earthly possessions; your exchange simply accelerated your enlightenment.",
    theme: "detachment",
    fortuneVoice: 9.8,
    punchlineSharpness: 9.7,
    warmthOverCruelty: 9.6,
    cryptoSpecificity: 9.3,
    brevityRhythm: 9.7,
  },
  {
    id: "inner-peace-leverage",
    text: "True inner peace begins the moment leverage frees you from the burden of having money.",
    theme: "zen-leverage",
    fortuneVoice: 9.5,
    punchlineSharpness: 9.4,
    warmthOverCruelty: 9.4,
    cryptoSpecificity: 9.5,
    brevityRhythm: 9.5,
  },
  {
    id: "sleep-peacefully",
    text: "You will soon master the ancient art of sleeping peacefully, having nothing left to check overnight.",
    theme: "peaceful-sleep",
    fortuneVoice: 9.4,
    punchlineSharpness: 9.2,
    warmthOverCruelty: 9.7,
    cryptoSpecificity: 8.8,
    brevityRhythm: 9.1,
  },
  {
    id: "infinite-gains",
    text: "Do not fear hitting zero; from here, every single percentage gain is mathematically infinite.",
    theme: "optimistic-math",
    fortuneVoice: 9.1,
    punchlineSharpness: 9.3,
    warmthOverCruelty: 9.5,
    cryptoSpecificity: 8.7,
    brevityRhythm: 9.4,
  },
  {
    id: "no-taxes",
    text: "The storm has passed, and in its mercy, it left you no taxes to file.",
    theme: "silver-lining",
    fortuneVoice: 9.2,
    punchlineSharpness: 9.0,
    warmthOverCruelty: 9.3,
    cryptoSpecificity: 8.6,
    brevityRhythm: 9.3,
  },
  {
    id: "flat-line-stability",
    text: "Good news approaches: your portfolio has finally achieved the legendary stability of a flat horizontal line.",
    theme: "stability",
    fortuneVoice: 8.9,
    punchlineSharpness: 9.1,
    warmthOverCruelty: 9.0,
    cryptoSpecificity: 9.2,
    brevityRhythm: 8.9,
  },
  {
    id: "priceless-lesson",
    text: "Today you learned a priceless lesson, conveniently billed to your margin account in real time.",
    theme: "tuition",
    fortuneVoice: 8.8,
    punchlineSharpness: 9.2,
    warmthOverCruelty: 9.1,
    cryptoSpecificity: 9.6,
    brevityRhythm: 9.2,
  },
  {
    id: "second-monitor",
    text: "Your future holds great clarity, mostly because you can no longer afford a second monitor.",
    theme: "clarity",
    fortuneVoice: 9.0,
    punchlineSharpness: 8.9,
    warmthOverCruelty: 9.2,
    cryptoSpecificity: 8.5,
    brevityRhythm: 9.1,
  },
  {
    id: "other-side",
    text: "Fortune favors the bold, though tonight it clearly favored the person on the other side.",
    theme: "counterparty",
    fortuneVoice: 9.1,
    punchlineSharpness: 8.8,
    warmthOverCruelty: 8.9,
    cryptoSpecificity: 8.9,
    brevityRhythm: 9.2,
  },
  {
    id: "resume-journey",
    text: "A journey of a thousand miles begins with closing the chart and updating your resume today.",
    theme: "new-beginnings",
    fortuneVoice: 9.3,
    punchlineSharpness: 8.7,
    warmthOverCruelty: 8.6,
    cryptoSpecificity: 8.8,
    brevityRhythm: 8.8,
  },
  {
    id: "strangers-joy",
    text: "Wealth is temporary, but the screenshots of your liquidation will bring strangers joy forever.",
    theme: "immortality",
    fortuneVoice: 8.7,
    punchlineSharpness: 9.0,
    warmthOverCruelty: 8.1,
    cryptoSpecificity: 9.7,
    brevityRhythm: 9.3,
  },
  {
    id: "cured-obsession",
    text: "Rejoice: the market has cured your obsession with green candles by removing your trading balance.",
    theme: "healing",
    fortuneVoice: 8.6,
    punchlineSharpness: 8.8,
    warmthOverCruelty: 8.8,
    cryptoSpecificity: 9.5,
    brevityRhythm: 9.0,
  },
];

export const FORTUNES: readonly string[] = FORTUNE_CANDIDATES.map((item) => item.text);

const FORTUNE_VOICE_PATTERNS: readonly RegExp[] = [
  /\b(wise|peace|enlightenment|ancient|fortune|journey|future|rejoice|good news|storm|wealth|do not fear)\b/i,
  /^(a wise|true|you will|do not|the storm|good news|today you|your future|fortune|a journey|wealth|rejoice)\b/i,
];

const TRADING_LOSS_PATTERNS: readonly RegExp[] = [
  /\b(exchange|leverage|margin|portfolio|chart|liquidation|market|candles|balance|taxes|zero|monitor)\b/i,
];

const MARKDOWN_OR_HTML_PATTERN = /(\*\*|__|~~|`|<\/?[a-z][^>]*>|\[[^\]]+\]\([^)]+\)|^#{1,6}\s)/i;
const CONTROL_CHAR_PATTERN = /[\x00-\x1f\x7f]/;
const NON_PRINTABLE_ASCII_PATTERN = /[^\x20-\x7e]/;

export function normalizePlainText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function tokenizeWords(input: string): string[] {
  const normalized = normalizePlainText(input);
  if (normalized.length === 0) {
    return [];
  }
  return normalized.split(" ");
}

export function countWords(input: string): number {
  return tokenizeWords(input).length;
}

export function validateFortune(
  input: string,
  maxWords: number = MAX_FORTUNE_WORDS,
): ValidationResult {
  const errors: string[] = [];
  if (typeof input !== "string") {
    return {
      valid: false,
      normalized: "",
      wordCount: 0,
      charCount: 0,
      errors: ["Fortune must be a string."],
    };
  }

  if (input.includes("\n") || input.includes("\r")) {
    errors.push("Fortune must be a single line of plain text.");
  }

  const normalized = normalizePlainText(input);
  const words = tokenizeWords(normalized);
  const wordCount = words.length;
  const charCount = normalized.length;

  if (wordCount === 0) {
    errors.push("Fortune must not be empty.");
  }
  if (wordCount > maxWords) {
    errors.push(`Fortune exceeds ${maxWords} words (got ${wordCount}).`);
  }
  if (wordCount > 0 && wordCount < MIN_FORTUNE_WORDS) {
    errors.push(`Fortune is too short to read as a proverb (got ${wordCount} words).`);
  }
  if (charCount > MAX_FORTUNE_CHARS) {
    errors.push(`Fortune exceeds ${MAX_FORTUNE_CHARS} characters (got ${charCount}).`);
  }
  if (CONTROL_CHAR_PATTERN.test(input)) {
    errors.push("Fortune contains control characters.");
  }
  if (NON_PRINTABLE_ASCII_PATTERN.test(normalized)) {
    errors.push("Fortune must use plain ASCII text only.");
  }
  if (MARKDOWN_OR_HTML_PATTERN.test(normalized)) {
    errors.push("Fortune must not contain Markdown or HTML formatting.");
  }
  if (
    (normalized.startsWith("\"") && normalized.endsWith("\"")) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    errors.push("Fortune must not be wrapped in surrounding quotation marks.");
  }
  if (charCount > 0 && !/[.!?]$/.test(normalized)) {
    errors.push("Fortune must end with standard terminal punctuation.");
  }

  return {
    valid: errors.length === 0,
    normalized,
    wordCount,
    charCount,
    errors,
  };
}

export function isValidFortune(
  input: string,
  maxWords: number = MAX_FORTUNE_WORDS,
): boolean {
  return validateFortune(input, maxWords).valid;
}

function roundScore(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function computeStructuralBonus(text: string): number {
  const validation = validateFortune(text);
  if (!validation.valid) {
    return -25;
  }

  let bonus = 0;
  if (validation.wordCount >= 11 && validation.wordCount <= 16) {
    bonus += 0.6;
  } else if (validation.wordCount >= 8 && validation.wordCount <= 18) {
    bonus += 0.3;
  }

  if (/[;:,]/.test(validation.normalized)) {
    bonus += 0.35;
  }

  const voiceHits = FORTUNE_VOICE_PATTERNS.filter((re) => re.test(validation.normalized)).length;
  bonus += voiceHits * 0.2;

  const tradingHits = TRADING_LOSS_PATTERNS.filter((re) => re.test(validation.normalized)).length;
  bonus += tradingHits * 0.25;

  return roundScore(bonus);
}

export function scoreFortune(candidate: FortuneCandidate): HumorScoreBreakdown {
  const structuralBonus = computeStructuralBonus(candidate.text);
  const weighted =
    candidate.fortuneVoice * 0.26 +
    candidate.punchlineSharpness * 0.28 +
    candidate.warmthOverCruelty * 0.20 +
    candidate.cryptoSpecificity * 0.14 +
    candidate.brevityRhythm * 0.12;

  const total = roundScore(weighted + structuralBonus);

  return {
    total,
    fortuneVoice: candidate.fortuneVoice,
    punchlineSharpness: candidate.punchlineSharpness,
    warmthOverCruelty: candidate.warmthOverCruelty,
    cryptoSpecificity: candidate.cryptoSpecificity,
    brevityRhythm: candidate.brevityRhythm,
    structuralBonus,
  };
}

export function scoreFortuneText(text: string, id: string = "custom"): HumorScoreBreakdown {
  const validation = validateFortune(text);
  const normalized = validation.normalized;
  const hasVoice = FORTUNE_VOICE_PATTERNS.some((re) => re.test(normalized));
  const hasOpening = FORTUNE_VOICE_PATTERNS[1].test(normalized);
  const hasTrading = TRADING_LOSS_PATTERNS.some((re) => re.test(normalized));
  const hasPivot = /[;:]/.test(normalized) ? 1 : /,/.test(normalized) ? 0.6 : 0;
  const sweetSpot =
    validation.wordCount >= 11 && validation.wordCount <= 16
      ? 9.2
      : validation.valid
        ? 8.2
        : 3.0;

  const synthetic: FortuneCandidate = {
    id,
    text: normalized,
    theme: "evaluated",
    fortuneVoice: hasOpening ? 9.0 : hasVoice ? 8.2 : 6.5,
    punchlineSharpness: roundScore(7.0 + hasPivot * 1.8),
    warmthOverCruelty: /\b(loser|idiot|stupid|broke forever)\b/i.test(normalized) ? 4.0 : 8.5,
    cryptoSpecificity: hasTrading ? 9.0 : 6.0,
    brevityRhythm: sweetSpot,
  };

  return scoreFortune(synthetic);
}

function buildComparisonRationale(
  winner: FortuneCandidate,
  loser: FortuneCandidate,
  winnerScore: HumorScoreBreakdown,
  loserScore: HumorScoreBreakdown,
): string {
  const deltas: Array<{ readonly label: string; readonly diff: number }> = [
    { label: "authentic fortune cadence", diff: winnerScore.fortuneVoice - loserScore.fortuneVoice },
    { label: "punchline turn", diff: winnerScore.punchlineSharpness - loserScore.punchlineSharpness },
    { label: "laugh-over-tear warmth", diff: winnerScore.warmthOverCruelty - loserScore.warmthOverCruelty },
    { label: "liquidation specificity", diff: winnerScore.cryptoSpecificity - loserScore.cryptoSpecificity },
    { label: "concise rhythm", diff: winnerScore.brevityRhythm - loserScore.brevityRhythm },
  ];
  deltas.sort((a, b) => b.diff - a.diff);
  const strongest = deltas[0];
  return `${winner.id} edges ${loser.id} on ${strongest.label}.`;
}

export function compareFortunes(
  left: FortuneCandidate,
  right: FortuneCandidate,
): PairwiseComparison {
  const leftScore = scoreFortune(left);
  const rightScore = scoreFortune(right);

  let leftWins = false;
  if (leftScore.total !== rightScore.total) {
    leftWins = leftScore.total > rightScore.total;
  } else if (leftScore.punchlineSharpness !== rightScore.punchlineSharpness) {
    leftWins = leftScore.punchlineSharpness > rightScore.punchlineSharpness;
  } else if (leftScore.fortuneVoice !== rightScore.fortuneVoice) {
    leftWins = leftScore.fortuneVoice > rightScore.fortuneVoice;
  } else if (leftScore.warmthOverCruelty !== rightScore.warmthOverCruelty) {
    leftWins = leftScore.warmthOverCruelty > rightScore.warmthOverCruelty;
  } else {
    leftWins = left.id.localeCompare(right.id) <= 0;
  }

  const winner = leftWins ? left : right;
  const loser = leftWins ? right : left;
  const winnerScore = leftWins ? leftScore : rightScore;
  const loserScore = leftWins ? rightScore : leftScore;
  const margin = roundScore(Math.abs(leftScore.total - rightScore.total));

  return {
    leftId: left.id,
    rightId: right.id,
    winnerId: winner.id,
    loserId: loser.id,
    margin,
    rationale: buildComparisonRationale(winner, loser, winnerScore, loserScore),
  };
}

export function compareFortuneTexts(
  leftText: string,
  rightText: string,
): PairwiseComparison {
  const leftScore = scoreFortuneText(leftText, "left");
  const rightScore = scoreFortuneText(rightText, "right");
  const leftCandidate: FortuneCandidate = {
    id: "left",
    text: normalizePlainText(leftText),
    theme: "custom",
    fortuneVoice: leftScore.fortuneVoice,
    punchlineSharpness: leftScore.punchlineSharpness,
    warmthOverCruelty: leftScore.warmthOverCruelty,
    cryptoSpecificity: leftScore.cryptoSpecificity,
    brevityRhythm: leftScore.brevityRhythm,
  };
  const rightCandidate: FortuneCandidate = {
    id: "right",
    text: normalizePlainText(rightText),
    theme: "custom",
    fortuneVoice: rightScore.fortuneVoice,
    punchlineSharpness: rightScore.punchlineSharpness,
    warmthOverCruelty: rightScore.warmthOverCruelty,
    cryptoSpecificity: rightScore.cryptoSpecificity,
    brevityRhythm: rightScore.brevityRhythm,
  };
  return compareFortunes(leftCandidate, rightCandidate);
}

export function runPairwiseTournament(
  candidates: readonly FortuneCandidate[] = FORTUNE_CANDIDATES,
): TournamentResult {
  const validCandidates = candidates.filter((candidate) => validateFortune(candidate.text).valid);
  if (validCandidates.length === 0) {
    throw new Error("No valid fortunes available for pairwise tournament.");
  }

  const winsMap = new Map<string, number>();
  const lossesMap = new Map<string, number>();
  const tiesMap = new Map<string, number>();
  const marginMap = new Map<string, number>();

  for (const candidate of validCandidates) {
    winsMap.set(candidate.id, 0);
    lossesMap.set(candidate.id, 0);
    tiesMap.set(candidate.id, 0);
    marginMap.set(candidate.id, 0);
  }

  const matches: PairwiseComparison[] = [];
  for (let i = 0; i < validCandidates.length; i += 1) {
    for (let j = i + 1; j < validCandidates.length; j += 1) {
      const match = compareFortunes(validCandidates[i], validCandidates[j]);
      matches.push(match);
      winsMap.set(match.winnerId, (winsMap.get(match.winnerId) ?? 0) + 1);
      lossesMap.set(match.loserId, (lossesMap.get(match.loserId) ?? 0) + 1);
      marginMap.set(match.winnerId, roundScore((marginMap.get(match.winnerId) ?? 0) + match.margin));
      marginMap.set(match.loserId, roundScore((marginMap.get(match.loserId) ?? 0) - match.margin));
    }
  }

  const preliminary = validCandidates.map((candidate) => ({
    candidate,
    validation: validateFortune(candidate.text),
    score: scoreFortune(candidate),
    wins: winsMap.get(candidate.id) ?? 0,
    losses: lossesMap.get(candidate.id) ?? 0,
    ties: tiesMap.get(candidate.id) ?? 0,
    netMargin: marginMap.get(candidate.id) ?? 0,
  }));

  preliminary.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    if (b.netMargin !== a.netMargin) {
      return b.netMargin - a.netMargin;
    }
    return a.candidate.id.localeCompare(b.candidate.id);
  });

  const rankings: RankedFortune[] = preliminary.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return {
    winner: rankings[0],
    rankings,
    matches,
  };
}

export function rankFortunes(
  candidates: readonly FortuneCandidate[] = FORTUNE_CANDIDATES,
): readonly RankedFortune[] {
  return runPairwiseTournament(candidates).rankings;
}

export function selectBestFortune(
  candidates: readonly FortuneCandidate[] = FORTUNE_CANDIDATES,
): RankedFortune {
  return runPairwiseTournament(candidates).winner;
}

export function getWinningFortune(): string {
  return selectBestFortune(FORTUNE_CANDIDATES).candidate.text;
}

export const PRIMARY_FORTUNE: string = getWinningFortune();
export const BEST_FORTUNE: string = PRIMARY_FORTUNE;
export const DEFAULT_FORTUNE: string = PRIMARY_FORTUNE;

export default PRIMARY_FORTUNE;