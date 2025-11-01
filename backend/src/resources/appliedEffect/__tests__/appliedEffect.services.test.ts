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
    abilityEffect: {
      findFirst: vi.fn()
    },
    effect: {
      findUnique: vi.fn()
    },
    itemHasEffect: {
      findFirst: vi.fn()
    },
    status: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    },
    characterAttribute: {
      findFirst: vi.fn()
    },
    $transaction: vi.fn()
  };

  const tx = {
    appliedEffect: prisma.appliedEffect,
    abilityEffect: prisma.abilityEffect,
    effect: prisma.effect,
    itemHasEffect: prisma.itemHasEffect,
    status: prisma.status,
    characterAttribute: prisma.characterAttribute
  };

  prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

  const reset = () => {
    for (const delegate of [
      prisma.appliedEffect,
      prisma.abilityEffect,
      prisma.effect,
      prisma.itemHasEffect,
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
    tx.status.findMany.mockResolvedValue([]);
    tx.characterAttribute.findFirst.mockResolvedValue(null);
    tx.abilityEffect.findFirst.mockResolvedValue(null);
    tx.itemHasEffect.findFirst.mockResolvedValue(null);
  });

  it("applies instantaneous damage with resistance mitigation", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-1",
      stackingPolicy: StackingPolicy.REPLACE,
      damageType: "PHISICAL",
      baseDuration: 0,
      targets: [
        {
          componentType: "STATUS",
          componentName: "HP",
          operationType: "ADD"
        }
      ]
    });
    tx.status.findMany.mockResolvedValue([
      {
        id: "status-res-fisica",
        name: "Resistência Física",
        valueActual: { toNumber: () => 3 },
        valueBonus: { toNumber: () => 0 },
        valueMax: { toNumber: () => 0 }
      },
      {
        id: "status-hp",
        name: "HP",
        valueActual: 20,
        valueMax: 30,
        valueBonus: 0
      }
    ]);
    tx.status.update.mockResolvedValue({});

    const result = await applyEffectTurn({
      characterId: "char-1",
      effectId: "effect-1",
      sourceType: SourceType.ITEM,
      currentTurn: 4,
      duration: 0,
      stacksDelta: 1,
      valuePerStack: -8
    });

    expect(tx.status.findMany).toHaveBeenCalledWith({
      where: { characterId: "char-1" }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-hp" },
      data: { valueActual: 15 }
    });
    expect(tx.characterAttribute.findFirst).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      applied: null,
      immediate: {
        results: [
          {
            target: "HP",
            delta: -5,
            initialValue: 20,
            finalValue: 15
          }
        ]
      }
    });
    expect(tx.appliedEffect.create).not.toHaveBeenCalled();
  });

  it("falls back to resistance expertise when status is absent", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-attribute",
      stackingPolicy: StackingPolicy.REPLACE,
      damageType: "MAGIC",
      baseDuration: 0,
      targets: [
        {
          componentType: "STATUS",
          componentName: "HP",
          operationType: "ADD"
        }
      ]
    });
    tx.status.findMany.mockResolvedValue([
      {
        id: "status-hp",
        name: "HP",
        valueActual: 15,
        valueMax: 25,
        valueBonus: 0
      }
    ]);
    tx.characterAttribute.findFirst.mockResolvedValue({
      valueBase: 1,
      valueInv: 1,
      valueExtra: 1
    });

    await applyEffectTurn({
      characterId: "char-2",
      effectId: "effect-attribute",
      sourceType: SourceType.OTHER,
      currentTurn: 2,
      duration: 0,
      valuePerStack: -6
    });

    expect(tx.status.findMany).toHaveBeenCalledWith({
      where: { characterId: "char-2" }
    });
    expect(tx.characterAttribute.findFirst).toHaveBeenCalledWith({
      where: {
        characterId: "char-2",
        attribute: { name: "Res. Mágica" }
      },
      include: { attribute: true }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-hp" },
      data: { valueActual: 12 }
    });
  });

  it("creates a new stacking effect when none exists", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-2",
      stackingPolicy: StackingPolicy.REFRESH,
      damageType: "NONE",
      baseDuration: 0,
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
    tx.status.findMany.mockResolvedValue([
      {
        id: "status-mp",
        name: "MP",
        valueActual: 5,
        valueMax: 20,
        valueBonus: 0
      }
    ]);

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

  it("uses the effect baseDuration when duration is not provided", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-base-duration",
      stackingPolicy: StackingPolicy.REFRESH,
      damageType: "NONE",
      baseDuration: 4,
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
      id: "applied-duration",
      stacks: 1,
      value: 0,
      expiresAt: 14,
      duration: 4
    });
    tx.status.findUnique.mockResolvedValue(null);

    const result = await applyEffectTurn({
      characterId: "char-4",
      effectId: "effect-base-duration",
      sourceType: SourceType.SKILL,
      currentTurn: 10,
      duration: 0,
      stacksDelta: 1,
      valuePerStack: 0
    });

    expect(tx.appliedEffect.create).toHaveBeenCalledWith({
      data: {
        characterId: "char-4",
        effectId: "effect-base-duration",
        sourceType: SourceType.SKILL,
        duration: 4,
        startedAt: 10,
        expiresAt: 14,
        stacks: 1,
        value: 0
      }
    });
    expect(result.applied).toEqual({
      id: "applied-duration",
      stacks: 1,
      value: 0,
      expiresAt: 14,
      duration: 4
    });
    expect(result.immediate).toBeNull();
  });

  it("stacks an existing effect according to policy", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-3",
      stackingPolicy: StackingPolicy.STACK,
      damageType: "NONE",
      baseDuration: 0,
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
    tx.status.findMany.mockResolvedValue([
      {
        id: "status-mp",
        name: "MP",
        valueActual: 10,
        valueMax: 40,
        valueBonus: 0
      }
    ]);

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

  it("resolves dynamic status targets from ability links", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-dynamic",
      stackingPolicy: StackingPolicy.REPLACE,
      damageType: "NONE",
      baseDuration: 0,
      targets: [
        {
          componentType: "STATUS",
          componentName: "TO_DEFINE",
          operationType: "ADD"
        }
      ]
    });

    tx.abilityEffect.findFirst.mockResolvedValue({
      id: "ability-effect-1",
      abilityId: "ability-1",
      effectId: "effect-dynamic",
      formula: JSON.stringify({ target: "status.hp.current" })
    });

    tx.status.findMany.mockResolvedValue([
      {
        id: "status-hp",
        name: "HP",
        valueActual: 10,
        valueMax: 20,
        valueBonus: 0
      }
    ]);

    const result = await applyEffectTurn({
      characterId: "char-dyn",
      effectId: "effect-dynamic",
      sourceType: SourceType.SKILL,
      sourceId: "ability-1",
      currentTurn: 0,
      duration: 0,
      valuePerStack: 5
    });

    expect(tx.abilityEffect.findFirst).toHaveBeenCalledWith({
      where: {
        abilityId: "ability-1",
        effectId: "effect-dynamic",
        deletedAt: null
      }
    });
    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-hp" },
      data: { valueActual: 15 }
    });
    expect(result.immediate?.results?.[0]).toMatchObject({
      target: "HP",
      finalValue: 15
    });
  });

  it("updates status max values when dynamic target points to max", async () => {
    tx.effect.findUnique.mockResolvedValue({
      id: "effect-dynamic-max",
      stackingPolicy: StackingPolicy.REPLACE,
      damageType: "NONE",
      baseDuration: 0,
      targets: [
        {
          componentType: "STATUS",
          componentName: "TO_DEFINE",
          operationType: "ADD"
        }
      ]
    });

    tx.abilityEffect.findFirst.mockResolvedValue({
      id: "ability-effect-max",
      abilityId: "ability-max",
      effectId: "effect-dynamic-max",
      formula: JSON.stringify({ target: "status.hp.max" })
    });

    tx.status.findMany.mockResolvedValue([
      {
        id: "status-hp",
        name: "HP",
        valueActual: 12,
        valueMax: 20,
        valueBonus: 0
      }
    ]);

    const result = await applyEffectTurn({
      characterId: "char-dyn",
      effectId: "effect-dynamic-max",
      sourceType: SourceType.SKILL,
      sourceId: "ability-max",
      currentTurn: 0,
      duration: 0,
      valuePerStack: 5
    });

    expect(tx.status.update).toHaveBeenCalledWith({
      where: { id: "status-hp" },
      data: { valueMax: 25 }
    });
    expect(result.immediate?.results?.[0]).toMatchObject({
      target: "HP (máximo)",
      finalValue: 25
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
