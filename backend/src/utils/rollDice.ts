import { Dice, DiceResult } from "dice-typescript";

export type RollOutcome = {
  expression: string;
  renderedExpression: string;
  total: number;
  successes: number;
  failures: number;
  rolls: number[];
};

export type DifficultyLabel = "Fácil" | "Médio" | "Difícil";

export type DifficultyRollOutcome = RollOutcome & {
  diceCount: number;
  threshold: number;
  difficulty: DifficultyLabel;
};

const DIFFICULTY_THRESHOLDS: Record<DifficultyLabel, number> = {
  Fácil: 2,
  Médio: 3,
  Difícil: 4,
};

const dice = new Dice();

const sanitizeExpression = (expression: string): string =>
  expression.replace(/\s+/g, "");

const extractRollValues = (result: DiceResult): number[] => {
  const values: number[] = [];
  const pattern = /\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(result.renderedExpression)) !== null) {
    const numbers = match[1].split(",").map((value) => Number(value.trim()));
    numbers.forEach((value) => {
      if (!Number.isNaN(value)) {
        values.push(value);
      }
    });
  }

  return values;
};

export const rollExpression = (expression: string): RollOutcome => {
  const normalizedExpression = sanitizeExpression(expression);
  const result = dice.roll(normalizedExpression);

  return {
    expression: normalizedExpression,
    renderedExpression: result.renderedExpression,
    total: result.total,
    successes: result.successes,
    failures: result.failures,
    rolls: extractRollValues(result),
  };
};

const normalizeDiceCount = (diceCount: number): number => {
  if (!Number.isFinite(diceCount)) return 0;
  return Math.max(0, Math.floor(diceCount));
};

const normalizeDifficulty = (difficulty: DifficultyLabel): DifficultyLabel => {
  return DIFFICULTY_THRESHOLDS[difficulty] ? difficulty : "Médio";
};

export const rollDifficulty = (
  diceCount: number,
  difficulty: DifficultyLabel,
): DifficultyRollOutcome => {
  const sanitizedDifficulty = normalizeDifficulty(difficulty);
  const threshold = DIFFICULTY_THRESHOLDS[sanitizedDifficulty];
  const normalizedCount = normalizeDiceCount(diceCount);

  if (normalizedCount <= 0) {
    throw new Error("diceCount must be a positive integer");
  }

  const expression = `${normalizedCount}d6>=${threshold}`;
  const outcome = rollExpression(expression);

  return {
    ...outcome,
    diceCount: normalizedCount,
    threshold,
    difficulty: sanitizedDifficulty,
  };
};
