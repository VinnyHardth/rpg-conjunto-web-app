import { vi } from "vitest";

export type PrismaMock = {
  appliedEffect: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  effect: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  status: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  characterAttribute: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

export const createPrismaMock = () => {
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
  } as unknown as PrismaMock;

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
};
