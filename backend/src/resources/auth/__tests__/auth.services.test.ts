import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyCredentials, logout } from "../auth.services";

const mockFindUnique = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const PrismaClientMock = vi.hoisted(() =>
  vi.fn(() => ({
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate
    }
  }))
);

vi.mock("@prisma/client", () => ({
  PrismaClient: PrismaClientMock
}));

const mockCompare = vi.hoisted(() => vi.fn());
const mockGenSalt = vi.hoisted(() => vi.fn());
const mockHash = vi.hoisted(() => vi.fn());

vi.mock("bcryptjs", () => ({
  compare: mockCompare,
  genSalt: mockGenSalt,
  hash: mockHash
}));

const baseUser = {
  id: "user-1",
  email: "player@example.com",
  password: "stored-password",
  deletedAt: null
};

beforeEach(() => {
  mockFindUnique.mockReset();
  mockUpdate.mockReset();
  mockCompare.mockReset();
  mockGenSalt.mockReset();
  mockHash.mockReset();
  PrismaClientMock.mockClear();
});

describe("verifyCredentials", () => {
  it("returns null when user is not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await verifyCredentials({
      email: baseUser.email,
      password: "secret"
    });

    expect(result).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns null when user is deleted", async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, deletedAt: new Date() });

    const result = await verifyCredentials({
      email: baseUser.email,
      password: "secret"
    });

    expect(result).toBeNull();
  });

  it("returns sanitized user when password matches hash", async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser });
    mockCompare.mockResolvedValue(true);

    const result = await verifyCredentials({
      email: baseUser.email,
      password: "secret"
    });

    expect(mockCompare).toHaveBeenCalledWith("secret", "stored-password");
    expect(result).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      deletedAt: null
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rehashes legacy plain-text passwords", async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser, password: "secret" });
    mockCompare.mockResolvedValue(false);
    mockGenSalt.mockResolvedValue("salt");
    mockHash.mockResolvedValue("new-hash");

    const result = await verifyCredentials({
      email: baseUser.email,
      password: "secret"
    });

    expect(mockGenSalt).toHaveBeenCalledWith(10);
    expect(mockHash).toHaveBeenCalledWith("secret", "salt");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { password: "new-hash" }
    });
    expect(result).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      deletedAt: null
    });
  });

  it("returns null when password verification fails", async () => {
    mockFindUnique.mockResolvedValue({ ...baseUser });
    mockCompare.mockResolvedValue(false);

    const result = await verifyCredentials({
      email: baseUser.email,
      password: "wrong"
    });

    expect(result).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("resolves when session is destroyed successfully", async () => {
    const destroy = vi.fn((cb: (err?: unknown) => void) => cb());

    await expect(
      logout({ destroy } as unknown as Express.Request["session"])
    ).resolves.toBeUndefined();
    expect(destroy).toHaveBeenCalled();
  });

  it("rejects when session destroy returns an error", async () => {
    const destroy = vi.fn((cb: (err?: unknown) => void) =>
      cb(new Error("fail"))
    );

    await expect(
      logout({ destroy } as unknown as Express.Request["session"])
    ).rejects.toThrow("fail");
    expect(destroy).toHaveBeenCalled();
  });

  it("resolves immediately when session is undefined", async () => {
    await expect(logout(undefined)).resolves.toBeUndefined();
  });
});
