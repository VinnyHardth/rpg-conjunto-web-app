import { beforeEach, describe, expect, it, vi } from "vitest";
import { SourceType, StackingPolicy } from "@prisma/client";
import {
  advanceAllEffectsTurn,
  advanceEffectTurn,
  applyEffectTurn
} from "../appliedEffect.services";

const prismaMock = vi.hoisted(() => {
  const prisma = {
    appliedEffect: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn()
    },
    effect: {
      findUnique: vi.fn()
    },
    status: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    characterAttribute: {
      findFirst: vi.fn()
    },
    $transaction: vi.fn()
  };

  const tx = {
    appliedEffect: prisma.appliedEffect,
    effect: prisma.effect,
    status: prisma.status,
    characterAttribute: prisma.characterAttribute
  };

  prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

  const reset = () => {
    for (const delegate of [
      prisma.appliedEffect,
      prisma.effect,
      prisma.status,
      prisma.characterAttribute
    ]) {
      for (const fn of Object.values(delegate)) {
        fn.mockReset();
      }
    }
    prisma.$transaction.mockReset();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
  };

  return { prisma, tx, reset };
});

vi.mock("../../../prisma", () => ({
  __esModule: true,
  default: prismaMock.prisma
}));

const { tx, reset } = prismaMock;

describe("applyEffectTurn", () => {
  beforeEach(() => {
    reset();
  });

  it("applies instantaneous damage with resistance mitigation", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-1",
      stackingPolicy: StackingPolicy.REPLACE,
      damageType: "PHISICAL",
      targets: [
        {
          componentType: "STATUS",
          componentName: "HP",
          operationType: "ADD"
        }
      ]
    });
    tx.status.findUnique.mockResolvedValue({
      id: "status-hp",
      valueActual: 20,
      valueMax: 30,
      valueBonus: 0
    });
    tx.status.update.mockResolvedValue({});
    tx.characterAttribute.findFirst.mockResolvedValue({
      valueBase: 2,
      valueInv: 1,
      valueExtra: 1
    });

    const result = await applyEffectTurn({
      characterId: "char-1",
      effectId: "effect-1",
      sourceType: SourceType.ITEM,
      currentTurn: 4,
      duration: 0,
      stacksDelta: 1,
      valuePerStack: -8
    });

    expect(tx.characterAttribute.findFirst).toHaveBeenCalledWith({
      where: {
        characterId: "char-1",
        attribute: { name: "Res. Física" }
      },
      include: { attribute: true }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-hp" },
      data: { valueActual: 16 }
    });
    expect(result).toMatchObject({
      applied: null,
      immediate: {
        results: [
          {
            target: "HP",
            delta: -4,
            initialValue: 20,
            finalValue: 16
          }
        ]
      }
    });
    expect(tx.appliedEffect.create).not.toHaveBeenCalled();
  });

  it("creates a new stacking effect when none exists", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-2",
      stackingPolicy: StackingPolicy.REFRESH,
      damageType: "NONE",
      targets: [
        {
          componentType: "STATUS",
          componentName: "MP",
          operationType: "ADD"
        }
      ]
    });
    tx.appliedEffect.findFirst.mockResolvedValue(null);
    tx.appliedEffect.create.mockResolvedValue({
      id: "applied-1",
      stacks: 1,
      value: 3,
      expiresAt: 15,
      duration: 5
    });
    tx.status.findUnique.mockResolvedValue({
      id: "status-mp",
      valueActual: 5,
      valueMax: 20,
      valueBonus: 0
    });

    const result = await applyEffectTurn({
      characterId: "char-2",
      effectId: "effect-2",
      sourceType: SourceType.SKILL,
      currentTurn: 10,
      duration: 5,
      stacksDelta: 0,
      valuePerStack: 3
    });

    expect(tx.appliedEffect.create).toHaveBeenCalledWith({
      data: {
        characterId: "char-2",
        effectId: "effect-2",
        sourceType: SourceType.SKILL,
        duration: 5,
        startedAt: 10,
        expiresAt: 15,
        stacks: 1,
        value: 3
      }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-mp" },
      data: { valueActual: 8 }
    });
    expect(result.applied).toEqual({
      id: "applied-1",
      stacks: 1,
      value: 3,
      expiresAt: 15,
      duration: 5
    });
    expect(result.immediate).toBeNull();
  });

  it("stacks an existing effect according to policy", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-3",
      stackingPolicy: StackingPolicy.STACK,
      damageType: "NONE",
      targets: [
        {
          componentType: "STATUS",
          componentName: "MP",
          operationType: "ADD"
        }
      ]
    });
    tx.appliedEffect.findFirst.mockResolvedValue({
      id: "applied-2",
      stacks: 1,
      duration: 2,
      expiresAt: 12
    });
    tx.appliedEffect.update.mockResolvedValue({
      id: "applied-2",
      stacks: 3,
      duration: 4,
      expiresAt: 14,
      value: 6
    });
    tx.status.findUnique.mockResolvedValue({
      id: "status-mp",
      valueActual: 10,
      valueMax: 40,
      valueBonus: 0
    });

    const result = await applyEffectTurn({
      characterId: "char-3",
      effectId: "effect-3",
      sourceType: SourceType.SKILL,
      currentTurn: 10,
      duration: 4,
      stacksDelta: 2,
      valuePerStack: 2
    });

    expect(tx.appliedEffect.update).toHaveBeenCalledWith({
      where: { id: "applied-2" },
      data: {
        stacks: 3,
        duration: 4,
        expiresAt: 14,
        value: 6
      }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-mp" },
      data: { valueActual: 16 }
    });
    expect(result.applied).toEqual({
      id: "applied-2",
      stacks: 3,
      duration: 4,
      expiresAt: 14,
      value: 6
    });
  });
});

describe("advanceEffectTurn", () => {
  beforeEach(() => {
    reset();
  });

  it("decrements duration and marks expiration", async () => {
    tx.appliedEffect.findUnique.mockResolvedValue({
      id: "applied-5",
      duration: 1,
      deletedAt: null
    });
    tx.appliedEffect.update.mockImplementation(async ({ data }) => ({
      id: "applied-5",
      duration: data.duration,
      deletedAt: data.deletedAt
    }));

    const result = await advanceEffectTurn("applied-5");

    expect(tx.appliedEffect.update).toHaveBeenCalledWith({
      where: { id: "applied-5" },
      data: {
        duration: 0,
        deletedAt: expect.any(Date)
      }
    });
    expect(result.duration).toBe(0);
    expect(result.deletedAt).toBeInstanceOf(Date);
  });

  it("throws when effect no longer exists", async () => {
    tx.appliedEffect.findUnique.mockResolvedValue(null);

    await expect(advanceEffectTurn("missing")).rejects.toThrow(
      "AppliedEffect with ID missing not found or already expired."
    );
    expect(tx.appliedEffect.update).not.toHaveBeenCalled();
  });
});

describe("advanceAllEffectsTurn", () => {
  beforeEach(() => {
    reset();
  });

  it("aggregates updated and expired counts", async () => {
    tx.appliedEffect.updateMany
      .mockResolvedValueOnce({ count: 7 })
      .mockResolvedValueOnce({ count: 3 });

    const result = await advanceAllEffectsTurn();

    expect(tx.appliedEffect.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        deletedAt: null,
        duration: { gt: 0 }
      },
      data: {
        duration: { decrement: 1 }
      }
    });
    expect(tx.appliedEffect.updateMany).toHaveBeenNthCalledWith(2, {
      where: { deletedAt: null, duration: { lte: 0 } },
      data: { deletedAt: expect.any(Date) }
    });
    expect(result).toEqual({ updatedCount: 7, expiredCount: 3 });
  });
});
