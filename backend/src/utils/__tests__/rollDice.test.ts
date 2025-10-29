import { beforeEach, describe, expect, it, vi } from "vitest";
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
  it("combines modifiers with a d20 roll and evaluates success", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "1d20 [15]",
      total: 15,
      successes: 0,
      failures: 0
    });

    const result = rollDifficulty({
      attributeValue: 3,
      expertiseValue: 2
    });

    expect(mockRoll).toHaveBeenCalledWith("1d20");
    expect(result.baseRoll).toBe(15);
    expect(result.modifiers.attribute).toBe(3);
    expect(result.modifiers.expertise).toBe(2);
    expect(result.modifiersTotal).toBe(5);
    expect(result.total).toBe(20);
    expect(result.expression).toBe("1d20 + 3 + 2");
    expect(result.renderedExpression).toBe("1d20 [15] + 3 + 2");
  });

  it("ignores invalid modifiers", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "1d20 [8]",
      total: 8,
      successes: 0,
      failures: 0
    });

    const result = rollDifficulty({
      attributeValue: Number.NaN,
      expertiseValue: undefined,
      miscBonus: null
    });

    expect(result.modifiersTotal).toBe(0);
    expect(result.total).toBe(8);
  });

  it("allows negative modifiers and misc bonus", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "1d20 [9]",
      total: 9,
      successes: 0,
      failures: 0
    });

    const result = rollDifficulty({
      attributeValue: -1,
      expertiseValue: 4,
      miscBonus: 2
    });

    expect(result.modifiers).toEqual({
      attribute: -1,
      expertise: 4,
      misc: 2
    });
    expect(result.modifiersTotal).toBe(5);
    expect(result.total).toBe(14);
    expect(result.renderedExpression).toBe("1d20 [9] - 1 + 4 + 2");
  });

  it("still returns total when dice result array is empty", () => {
    mockRoll.mockReturnValue({
      renderedExpression: "1d20",
      total: 11,
      successes: 0,
      failures: 0
    });

    const result = rollDifficulty({
      attributeValue: 0
    });

    expect(result.baseRoll).toBe(11);
    expect(result.total).toBe(11);
    expect(result.modifiersTotal).toBe(0);
  });
});
