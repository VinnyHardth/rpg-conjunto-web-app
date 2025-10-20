import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

import {
  getFullCharacterData,
  getCharactersByCampaignId
} from "../character.services";

const mockPrisma = vi.hoisted(() => ({
  character: {
    findUnique: vi.fn()
  },
  characterAttribute: {
    findMany: vi.fn()
  },
  status: {
    findMany: vi.fn()
  },
  characterHasItem: {
    findMany: vi.fn()
  },
  skill: {
    findMany: vi.fn()
  },
  archetype: {
    findUnique: vi.fn()
  },
  characterPerCampaign: {
    findMany: vi.fn()
  }
}));

vi.mock("../../../prisma", () => ({
  __esModule: true,
  default: mockPrisma
}));

const resetMocks = () => {
  for (const delegate of Object.values(mockPrisma)) {
    for (const fn of Object.values(delegate)) {
      fn.mockReset();
    }
  }
};

describe("character.services", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetMocks();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe("getFullCharacterData", () => {
    it("throws when character does not exist", async () => {
      mockPrisma.character.findUnique.mockResolvedValueOnce(null);

      await expect(getFullCharacterData("missing")).rejects.toThrow(
        "Character not found"
      );

      expect(mockPrisma.character.findUnique).toHaveBeenCalledWith({
        where: { id: "missing" }
      });
    });

    it("returns aggregated character information", async () => {
      const base = { id: "char-1", archetypeId: "arch-1" };
      const attributes = [{ id: "attr-1" }];
      const status = [{ id: "status-1" }];
      const inventory = [{ id: "inventory-1" }];
      const skills = [{ id: "skill-1" }];
      const archetype = { id: "arch-1", name: "Warrior" };

      mockPrisma.character.findUnique.mockResolvedValueOnce(base);
      mockPrisma.characterAttribute.findMany.mockResolvedValueOnce(attributes);
      mockPrisma.status.findMany.mockResolvedValueOnce(status);
      mockPrisma.characterHasItem.findMany.mockResolvedValueOnce(inventory);
      mockPrisma.skill.findMany.mockResolvedValueOnce(skills);
      mockPrisma.archetype.findUnique.mockResolvedValueOnce(archetype);

      const result = await getFullCharacterData("char-1");

      expect(result).toEqual({
        info: base,
        attributes,
        status,
        inventory,
        skills,
        archetype
      });
      expect(mockPrisma.archetype.findUnique).toHaveBeenCalledWith({
        where: { id: "arch-1" }
      });
    });
  });

  describe("getCharactersByCampaignId", () => {
    it("maps campaign links into characters", async () => {
      const characters = [{ id: "char-1" }, { id: "char-2" }];
      mockPrisma.characterPerCampaign.findMany.mockResolvedValueOnce([
        { character: characters[0] },
        { character: characters[1] }
      ]);

      const result = await getCharactersByCampaignId("campaign-1");

      expect(mockPrisma.characterPerCampaign.findMany).toHaveBeenCalledWith({
        where: { campaignId: "campaign-1" },
        include: { character: true }
      });
      expect(result).toEqual(characters);
    });
  });
});
