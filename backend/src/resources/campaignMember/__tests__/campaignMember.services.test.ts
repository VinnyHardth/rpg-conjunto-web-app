import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCampaignMember,
  getCampaignMembersByCampaignId,
  getCampaignMembersByUserId,
  deleteCampaignMember
} from "../campaignMember.services";

const mockCampaignMember = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn()
}));

const mockCharacterPerCampaign = vi.hoisted(() => ({
  updateMany: vi.fn()
}));

const mockTransaction = vi.hoisted(() =>
  vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
    callback({
      campaignMember: mockCampaignMember,
      characterPerCampaign: mockCharacterPerCampaign
    })
  )
);

vi.mock("../../../prisma", () => ({
  __esModule: true,
  default: {
    campaignMember: mockCampaignMember,
    characterPerCampaign: mockCharacterPerCampaign,
    $transaction: mockTransaction
  }
}));

const resetMocks = () => {
  mockCampaignMember.findUnique.mockReset();
  mockCampaignMember.create.mockReset();
  mockCampaignMember.findMany.mockReset();
  mockCampaignMember.update.mockReset();
  mockCharacterPerCampaign.updateMany.mockReset();
  mockTransaction.mockReset();
};

describe("campaignMember.services", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("creates campaign members", async () => {
    const created = { id: "member-1" };
    mockCampaignMember.findUnique.mockResolvedValueOnce(null);
    mockCampaignMember.create.mockResolvedValueOnce(created);

    const result = await createCampaignMember({
      campaignId: "campaign-1",
      userId: "user-1",
      role: "PLAYER"
    });

    expect(mockCampaignMember.findUnique).toHaveBeenCalledWith({
      where: {
        campaignId_userId: {
          campaignId: "campaign-1",
          userId: "user-1"
        }
      }
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

  it("reactivates existing members when already present", async () => {
    const existing = {
      id: "member-2",
      campaignId: "campaign-1",
      userId: "user-1",
      role: "PLAYER",
      status: "ACTIVE"
    };
    const updated = { ...existing, role: "MASTER", deletedAt: null };

    mockCampaignMember.findUnique.mockResolvedValueOnce(existing);
    mockCampaignMember.update.mockResolvedValueOnce(updated);

    const result = await createCampaignMember({
      campaignId: "campaign-1",
      userId: "user-1",
      role: "MASTER",
      status: "ACTIVE"
    });

    expect(mockCampaignMember.update).toHaveBeenCalledWith({
      where: { id: "member-2" },
      data: {
        role: "MASTER",
        status: "ACTIVE",
        deletedAt: null
      }
    });
    expect(result).toBe(updated);
  });

  it("includes user information when listing by campaign id", async () => {
    const members = [{ id: "member-1", user: { id: "user-1" } }];
    mockCampaignMember.findMany.mockResolvedValueOnce(members);

    const result = await getCampaignMembersByCampaignId("campaign-1");

    expect(mockCampaignMember.findMany).toHaveBeenCalledWith({
      where: { campaignId: "campaign-1", deletedAt: null },
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
      where: { userId: "user-2", deletedAt: null },
      include: { campaign: true }
    });
    expect(result).toBe(members);
  });

  it("soft deletes campaign members and their characters in the campaign", async () => {
    const deleted = {
      id: "member-5",
      campaignId: "campaign-1",
      userId: "user-99",
      deletedAt: new Date()
    };
    mockCampaignMember.update.mockResolvedValueOnce(deleted);
    mockTransaction.mockImplementationOnce(async (callback) =>
      callback({
        campaignMember: mockCampaignMember,
        characterPerCampaign: mockCharacterPerCampaign
      })
    );

    const result = await deleteCampaignMember("member-5");

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockCampaignMember.update).toHaveBeenCalledWith({
      where: { id: "member-5" },
      data: { deletedAt: expect.any(Date) }
    });
    expect(mockCharacterPerCampaign.updateMany).toHaveBeenCalledWith({
      where: {
        campaignId: "campaign-1",
        deletedAt: null,
        character: { userId: "user-99" }
      },
      data: { deletedAt: expect.any(Date) }
    });
    expect(result).toBe(deleted);
  });
});
