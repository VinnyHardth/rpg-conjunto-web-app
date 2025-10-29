import { Dice, DiceResult } from "dice-typescript";

export type RollOutcome = {
  expression: string;
  renderedExpression: string;
  total: number;
  successes: number;
  failures: number;
  rolls: number[];
};

export type ModifierBreakdown = {
  attribute: number;
  expertise: number;
  misc: number;
};

export type AbilityRollOutcome = RollOutcome & {
  baseRoll: number;
  modifiers: ModifierBreakdown;
  modifiersTotal: number;
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
    rolls: extractRollValues(result)
  };
};

const normalizeModifier = (value: number | null | undefined): number => {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return value;
};

const formatModifier = (value: number): string => {
  const absolute = Math.abs(value);
  if (absolute === 0) return "";
  const sign = value >= 0 ? "+" : "-";
  return `${sign} ${absolute}`;
};

const buildExpression = (modifiers: ModifierBreakdown): string => {
  const segments = ["1d20"];
  if (modifiers.attribute !== 0) {
    segments.push(formatModifier(modifiers.attribute));
  }
  if (modifiers.expertise !== 0) {
    segments.push(formatModifier(modifiers.expertise));
  }
  if (modifiers.misc !== 0) {
    segments.push(formatModifier(modifiers.misc));
  }
  return segments
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const buildRenderedExpression = (
  baseRenderedExpression: string,
  modifiers: ModifierBreakdown
): string => {
  const segments = [baseRenderedExpression.trim()];
  if (modifiers.attribute !== 0) {
    segments.push(formatModifier(modifiers.attribute));
  }
  if (modifiers.expertise !== 0) {
    segments.push(formatModifier(modifiers.expertise));
  }
  if (modifiers.misc !== 0) {
    segments.push(formatModifier(modifiers.misc));
  }
  return segments
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export type AbilityRollOptions = {
  attributeValue: number;
  expertiseValue?: number | null;
  miscBonus?: number | null;
};

export const rollDifficulty = ({
  attributeValue,
  expertiseValue = 0,
  miscBonus = 0
}: AbilityRollOptions): AbilityRollOutcome => {
  const modifiers: ModifierBreakdown = {
    attribute: normalizeModifier(attributeValue),
    expertise: normalizeModifier(expertiseValue),
    misc: normalizeModifier(miscBonus)
  };

  const baseOutcome = rollExpression("1d20");
  const baseRoll = baseOutcome.rolls[0] ?? baseOutcome.total;

  const modifiersTotal =
    modifiers.attribute + modifiers.expertise + modifiers.misc;
  const total = baseRoll + modifiersTotal;

  const expression = buildExpression(modifiers);
  const renderedExpression = buildRenderedExpression(
    baseOutcome.renderedExpression,
    modifiers
  );

  return {
    ...baseOutcome,
    expression,
    renderedExpression,
    total,
    baseRoll,
    modifiers,
    modifiersTotal
  };
};
