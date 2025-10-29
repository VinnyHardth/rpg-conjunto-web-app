import {
  rollExpression,
  rollDifficulty as rollDifficultyInternal,
  RollOutcome,
  AbilityRollOutcome,
  AbilityRollOptions
} from "../../utils/rollDice";

export type DifficultyRollOptions = AbilityRollOptions;

export const rollDifficulty = (
  options: DifficultyRollOptions
): AbilityRollOutcome => {
  return rollDifficultyInternal(options);
};

export const rollCustom = (expression: string): RollOutcome => {
  return rollExpression(expression);
};
