import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCampaignMember,
  getCampaignMembersByCampaignId,
  getCampaignMembersByUserId,
  deleteCampaignMember
} from "../campaignMember.services";

const mockCampaignMember = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn()
}));

vi.mock("../../../prisma", () => ({
  __esModule: true,
  default: {
    campaignMember: mockCampaignMember
  }
}));

const resetMocks = () => {
  for (const fn of Object.values(mockCampaignMember)) {
    fn.mockReset();
  }
};

describe("campaignMember.services", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("creates campaign members", async () => {
    const created = { id: "member-1" };
    mockCampaignMember.create.mockResolvedValueOnce(created);

    const result = await createCampaignMember({
      campaignId: "campaign-1",
      userId: "user-1",
      role: "PLAYER"
    });

    expect(mockCampaignMember.create).toHaveBeenCalledWith({
      data: {
        campaignId: "campaign-1",
        userId: "user-1",
        role: "PLAYER"
      }
    });
    expect(result).toBe(created);
  });

  it("includes user information when listing by campaign id", async () => {
    const members = [{ id: "member-1", user: { id: "user-1" } }];
    mockCampaignMember.findMany.mockResolvedValueOnce(members);

    const result = await getCampaignMembersByCampaignId("campaign-1");

    expect(mockCampaignMember.findMany).toHaveBeenCalledWith({
      where: { campaignId: "campaign-1" },
      include: {
        user: true
      }
    });
    expect(result).toBe(members);
  });

  it("includes campaign information when listing by user id", async () => {
    const members = [{ id: "member-3", campaign: { id: "campaign-2" } }];
    mockCampaignMember.findMany.mockResolvedValueOnce(members);

    const result = await getCampaignMembersByUserId("user-2");

    expect(mockCampaignMember.findMany).toHaveBeenCalledWith({
      where: { userId: "user-2" },
      include: { campaign: true }
    });
    expect(result).toBe(members);
  });

  it("soft deletes campaign members", async () => {
    const deleted = { id: "member-5", deletedAt: new Date() };
    mockCampaignMember.update.mockResolvedValueOnce(deleted);

    const result = await deleteCampaignMember("member-5");

    expect(mockCampaignMember.update).toHaveBeenCalledWith({
      where: { id: "member-5" },
      data: { deletedAt: expect.any(Date) }
    });
    expect(result).toBe(deleted);
  });
});
