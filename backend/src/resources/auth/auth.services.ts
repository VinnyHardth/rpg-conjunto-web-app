import { PrismaClient } from "@prisma/client";

import { compare } from "bcryptjs";

import { UserDTO } from "../user/user.types";
import { LoginUserDTO } from "./auth.types";

const prisma = new PrismaClient();

const verifyCredentials = async (login: LoginUserDTO): Promise<UserDTO | null> => {
    const user = await prisma.user.findUnique({
        where: { email: login.email },
    });

    if (!user) return null;
    if (user.deletedAt) return null;

    const isPasswordValid = await compare(login.password, user.password);
    if (!isPasswordValid) return null;

    return user;
};

export { verifyCredentials };