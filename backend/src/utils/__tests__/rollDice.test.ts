import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DifficultyLabel } from "../rollDice";
import { rollDifficulty, rollExpression } from "../rollDice";

const mockRoll = vi.hoisted(() => vi.fn());
const DiceConstructor = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    roll: mockRoll
  }))
);

vi.mock("dice-typescript", () => ({
  Dice: DiceConstructor
}));

beforeEach(() => {
  mockRoll.mockReset();
  DiceConstructor.mockClear();
  DiceConstructor.mockImplementation(() => ({
    roll: mockRoll
  }));
});

describe("rollExpression", () => {
  it("sanitizes expressions and extracts roll values", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "2d6>=3 [4, 5][1, 2]",
      total: 12,
      successes: 2,
      failures: 0
    });

    const result = rollExpression(" 2 d6 >= 3 ");

    expect(mockRoll).toHaveBeenCalledWith("2d6>=3");
    expect(result.expression).toBe("2d6>=3");
    expect(result.rolls).toEqual([4, 5, 1, 2]);
    expect(result.total).toBe(12);
  });
});

describe("rollDifficulty", () => {
  it("normalizes dice count and delegates to rollExpression", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "3d6>=2 [5, 4, 3]",
      total: 12,
      successes: 3,
      failures: 0
    });

    const result = rollDifficulty(3.7, "Fácil");

    expect(mockRoll).toHaveBeenCalledWith("3d6>=2");
    expect(result.diceCount).toBe(3);
    expect(result.threshold).toBe(2);
    expect(result.difficulty).toBe("Fácil");
  });

  it("defaults unknown difficulty labels to Médio", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "2d6>=3 [6, 6]",
      total: 12,
      successes: 2,
      failures: 0
    });

    const result = rollDifficulty(
      2,
      "Inexistente" as unknown as DifficultyLabel
    );

    expect(result.difficulty).toBe("Médio");
    expect(result.threshold).toBe(3);
  });

  it("throws when dice count is not positive", () => {
    expect(() => rollDifficulty(0, "Médio")).toThrow(
      "diceCount must be a positive integer"
    );
    expect(mockRoll).not.toHaveBeenCalled();
  });
});
