import {
  rollExpression,
  rollDifficulty as rollDifficultyInternal,
  RollOutcome,
  DifficultyRollOutcome,
  DifficultyLabel,
} from "../../utils/rollDice";

export type DifficultyRollOptions = {
  diceCount: number;
  difficulty: DifficultyLabel;
};

export const rollDifficulty = ({
  diceCount,
  difficulty,
}: DifficultyRollOptions): DifficultyRollOutcome => {
  return rollDifficultyInternal(diceCount, difficulty);
};

export const rollCustom = (expression: string): RollOutcome => {
  return rollExpression(expression);
};
