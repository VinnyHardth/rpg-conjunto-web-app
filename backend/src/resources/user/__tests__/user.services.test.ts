import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUser
} from "../user.services";

const mockUserDelegate = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn()
}));

vi.mock("../../../prisma", () => ({
  __esModule: true,
  default: {
    user: mockUserDelegate
  }
}));

const mockGenSalt = vi.hoisted(() => vi.fn());
const mockHash = vi.hoisted(() => vi.fn());

vi.mock("bcryptjs", () => ({
  genSalt: mockGenSalt,
  hash: mockHash
}));

const resetMocks = () => {
  for (const fn of Object.values(mockUserDelegate)) {
    fn.mockReset();
  }
  mockGenSalt.mockReset();
  mockHash.mockReset();
};

describe("user.services", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("hashes password when creating a user", async () => {
    mockGenSalt.mockResolvedValueOnce("salt");
    mockHash.mockResolvedValueOnce("hashed");
    const created = {
      id: "user-1",
      email: "player@example.com",
      password: "hashed",
      deletedAt: null
    };
    mockUserDelegate.create.mockResolvedValueOnce(created);

    const result = await createUser({
      email: "player@example.com",
      nickname: "Player",
      password: "plain"
    });

    expect(mockGenSalt).toHaveBeenCalledWith(10);
    expect(mockHash).toHaveBeenCalledWith("plain", "salt");
    expect(mockUserDelegate.create).toHaveBeenCalledWith({
      data: {
        email: "player@example.com",
        nickname: "Player",
        password: "hashed"
      }
    });
    expect(result).toEqual(created);
  });

  it("hashes password on update when provided", async () => {
    mockGenSalt.mockResolvedValueOnce("salt");
    mockHash.mockResolvedValueOnce("new-hash");
    const updated = {
      id: "user-2",
      email: "player@example.com",
      password: "new-hash"
    };
    mockUserDelegate.update.mockResolvedValueOnce(updated);

    const result = await updateUser("user-2", { password: "secret" });

    expect(mockGenSalt).toHaveBeenCalledWith(10);
    expect(mockHash).toHaveBeenCalledWith("secret", "salt");
    expect(mockUserDelegate.update).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { password: "new-hash" }
    });
    expect(result).toEqual(updated);
  });

  it("does not hash when password absent on update", async () => {
    const updated = { id: "user-3", email: "p@example.com" };
    mockUserDelegate.update.mockResolvedValueOnce(updated);

    const result = await updateUser("user-3", { nickname: "Player" });

    expect(mockGenSalt).not.toHaveBeenCalled();
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockUserDelegate.update).toHaveBeenCalledWith({
      where: { id: "user-3" },
      data: { nickname: "Player" }
    });
    expect(result).toEqual(updated);
  });

  it("fetches user by id and strips nothing else", async () => {
    const user = {
      id: "user-4",
      email: "player@example.com",
      password: "hash"
    };
    mockUserDelegate.findUnique.mockResolvedValueOnce(user);

    const result = await getUserById("user-4");

    expect(mockUserDelegate.findUnique).toHaveBeenCalledWith({
      where: { id: "user-4" }
    });
    expect(result).toEqual(user);
  });

  it("fetches user by email", async () => {
    const user = { id: "user-5", email: "player@example.com" };
    mockUserDelegate.findUnique.mockResolvedValueOnce(user);

    const result = await getUserByEmail("player@example.com");

    expect(mockUserDelegate.findUnique).toHaveBeenCalledWith({
      where: { email: "player@example.com" }
    });
    expect(result).toEqual(user);
  });

  it("lists active users", async () => {
    const users = [
      { id: "user-6", email: "a@example.com" },
      { id: "user-7", email: "b@example.com" }
    ];
    mockUserDelegate.findMany.mockResolvedValueOnce(users);

    const result = await getUsers();

    expect(mockUserDelegate.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null }
    });
    expect(result).toEqual(users);
  });

  it("soft deletes a user", async () => {
    const deleted = { id: "user-8", deletedAt: new Date() };
    mockUserDelegate.update.mockResolvedValueOnce(deleted);

    const result = await deleteUser({ id: "user-8" });

    expect(mockUserDelegate.update).toHaveBeenCalledWith({
      where: { id: "user-8" },
      data: { deletedAt: expect.any(Date) }
    });
    expect(result).toEqual(deleted);
  });
});
