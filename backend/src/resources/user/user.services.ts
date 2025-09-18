import { PrismaClient } from "@prisma/client";
import { genSalt, hash } from "bcryptjs";

import { CreateUserDTO, UpdateUserDTO, DeleteUserDTO, UserDTO } from "./user.types";

const prisma = new PrismaClient();

const toUserDTO = (user: any): UserDTO => {
  const { password, ...rest } = user;
  return rest as UserDTO;
};

const createUser = async (data: CreateUserDTO): Promise<UserDTO> => {
  const salt = await genSalt(10);
  const hashedPassword = await hash(data.password, salt);

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });

  return toUserDTO(user);
};

const getUserById = async (id: string): Promise<UserDTO | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ? toUserDTO(user) : null;
};

const getUserByEmail = async (email: string): Promise<UserDTO | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user ? toUserDTO(user) : null;
};

const getUsers = async (): Promise<UserDTO[]> => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
  });

  return users.map(toUserDTO);
};

const updateUser = async (id: string, data: UpdateUserDTO): Promise<UserDTO> => {
  if (data.password) {
    const salt = await genSalt(10);
    data.password = await hash(data.password, salt);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return toUserDTO(user);
};

const deleteUser = async (data: DeleteUserDTO): Promise<UserDTO> => {
  const user = await prisma.user.update({
    where: { id: data.id },
    data: { deletedAt: new Date() },
  });

  return toUserDTO(user);
};

export { createUser, getUserById, getUserByEmail, getUsers, updateUser, deleteUser };
