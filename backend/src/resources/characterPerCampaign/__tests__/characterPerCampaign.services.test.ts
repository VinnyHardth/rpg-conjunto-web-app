import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CampaignCharacterRole } from "@prisma/client";

import {
  createCharacterPerCampaign,
  getCharacterPerCampaignWithCharacterById,
  getCampaignIdsByCharacterId
} from "../characterPerCampaign.services";

const mockCharacterPerCampaign = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn()
}));

const prismaInstance = vi.hoisted(() => ({
  characterPerCampaign: mockCharacterPerCampaign
}));

const PrismaClientMock = vi.hoisted(() => vi.fn(() => prismaInstance));

vi.mock("@prisma/client", () => ({
  PrismaClient: PrismaClientMock
}));

const resetMocks = () => {
  for (const fn of Object.values(mockCharacterPerCampaign)) {
    fn.mockReset();
  }
  PrismaClientMock.mockClear();
};

describe("characterPerCampaign.services", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("createCharacterPerCampaign", () => {
    it("revives an existing link updating role when found", async () => {
      mockCharacterPerCampaign.findFirst.mockResolvedValueOnce({
        id: "link-1",
        role: "CHARACTER" as CampaignCharacterRole
      });
      const updated = {
        id: "link-1",
        role: "ENEMY" as CampaignCharacterRole,
        deletedAt: null
      };
      mockCharacterPerCampaign.update.mockResolvedValueOnce(updated);

      const result = await createCharacterPerCampaign({
        campaignId: "campaign-1",
        characterId: "character-1",
        role: "ENEMY" as CampaignCharacterRole
      });

      expect(mockCharacterPerCampaign.update).toHaveBeenCalledWith({
        where: { id: "link-1" },
        data: {
          role: "ENEMY",
          deletedAt: null
        }
      });
      expect(result).toBe(updated);
      expect(mockCharacterPerCampaign.create).not.toHaveBeenCalled();
    });

    it("creates a new link when none exists", async () => {
      mockCharacterPerCampaign.findFirst.mockResolvedValueOnce(null);
      const created = { id: "link-2" };
      mockCharacterPerCampaign.create.mockResolvedValueOnce(created);

      const payload = {
        campaignId: "campaign-2",
        characterId: "character-5",
        role: "CHARACTER" as CampaignCharacterRole
      };

      const result = await createCharacterPerCampaign(payload);

      expect(mockCharacterPerCampaign.create).toHaveBeenCalledWith({
        data: payload
      });
      expect(result).toBe(created);
    });
  });

  describe("getCharacterPerCampaignWithCharacterById", () => {
    it("includes character data", async () => {
      const record = {
        id: "link-3",
        character: { id: "character-7" }
      };
      mockCharacterPerCampaign.findUnique.mockResolvedValueOnce(record);

      const result = await getCharacterPerCampaignWithCharacterById("link-3");

      expect(mockCharacterPerCampaign.findUnique).toHaveBeenCalledWith({
        where: { id: "link-3" },
        include: {
          character: true
        }
      });
      expect(result).toBe(record);
    });
  });

  describe("getCampaignIdsByCharacterId", () => {
    it("maps records to campaign ids only for active links", async () => {
      mockCharacterPerCampaign.findMany.mockResolvedValueOnce([
        { campaignId: "campaign-A" },
        { campaignId: "campaign-B" }
      ]);

      const result = await getCampaignIdsByCharacterId("character-9");

      expect(mockCharacterPerCampaign.findMany).toHaveBeenCalledWith({
        where: { characterId: "character-9", deletedAt: null },
        select: { campaignId: true }
      });
      expect(result).toEqual(["campaign-A", "campaign-B"]);
    });
  });
});
