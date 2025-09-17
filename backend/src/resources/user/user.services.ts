import { PrismaClient } from "@prisma/client";
import { genSalt, hash } from "bcryptjs";

import { CreateUserDTO, UpdateUserDTO, DeleteUserDTO, UserDTO } from "./user.types";

const prisma = new PrismaClient();

const userFields = {
    id: true,
    email: true,
    name: true,
    nickname: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

const createUser = async (data: CreateUserDTO): Promise<UserDTO> => {
    // Hash the password before saving the user

    console.log('Creating user with data:', data); // Debug log

    const salt = await genSalt(10);
    const hashedPassword = await hash(data.password, salt);

    return prisma.user.create({
        data: {...data, password: hashedPassword},
        select: userFields,
    });
};

const getUserById = async (id: string): Promise<UserDTO | null> => {
    return prisma.user.findUnique({
        where: {id},
        select: userFields,
    });
}

const getUserByEmail = async (email: string): Promise<UserDTO | null> => {
    return prisma.user.findUnique({
        where: {email},
        select: userFields,
    });
}

const getUsers = async (): Promise<UserDTO[]> => {
    return prisma.user.findMany({
        where: {deletedAt: null},
        select: userFields,
    });
}

const updateUser = async (id: string, data: UpdateUserDTO): Promise<UserDTO> => {
    if (data.password) {
        // Hash the new password before updating the user
        const salt = await genSalt(10);
        data.password = await hash(data.password, salt);
    }

    return prisma.user.update({
        where: {id},
        data,
        select: userFields,
    });
}

const deleteUser = async (data: DeleteUserDTO): Promise<UserDTO> => {
    return prisma.user.update({
        where: {id: data.id},
        data: {deletedAt: new Date()},
        select: userFields,
    });
}

export { createUser, getUserById, getUserByEmail, getUsers, updateUser, deleteUser };