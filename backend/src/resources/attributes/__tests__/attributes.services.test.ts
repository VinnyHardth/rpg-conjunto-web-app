import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAttributesByKind,
  getAttributesByCharacterId
} from "../attributes.services";

const mockAttributes = vi.hoisted(() => ({
  findMany: vi.fn()
}));

const mockCharacterAttribute = vi.hoisted(() => ({
  findMany: vi.fn()
}));

const prismaInstance = vi.hoisted(() => ({
  attributes: mockAttributes,
  characterAttribute: mockCharacterAttribute
}));

const PrismaClientMock = vi.hoisted(() => vi.fn(() => prismaInstance));

vi.mock("@prisma/client", () => ({
  PrismaClient: PrismaClientMock
}));

const resetMocks = () => {
  mockAttributes.findMany.mockReset();
  mockCharacterAttribute.findMany.mockReset();
  PrismaClientMock.mockClear();
};

describe("attributes.services", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("filters attributes by kind", async () => {
    const entries = [{ id: "attr-1", kind: "BASE" }];
    mockAttributes.findMany.mockResolvedValueOnce(entries);

    const result = await getAttributesByKind("BASE" as any);

    expect(mockAttributes.findMany).toHaveBeenCalledWith({
      where: { kind: "BASE" }
    });
    expect(result).toBe(entries);
  });

  it("maps character attribute relations to their attribute entities", async () => {
    mockCharacterAttribute.findMany.mockResolvedValueOnce([
      { attribute: { id: "attr-1" } },
      { attribute: { id: "attr-2" } }
    ]);

    const result = await getAttributesByCharacterId("character-3");

    expect(mockCharacterAttribute.findMany).toHaveBeenCalledWith({
      where: { characterId: "character-3" },
      include: { attribute: true }
    });
    expect(result).toEqual([{ id: "attr-1" }, { id: "attr-2" }]);
  });
});
