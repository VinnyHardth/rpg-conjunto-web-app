import { PrismaClient } from "@prisma/client";

import { compare, genSalt, hash } from "bcryptjs";

import { UserDTO } from "../user/user.types";
import { LoginUserDTO } from "./auth.types";

const prisma = new PrismaClient();

const verifyCredentials = async (
  login: LoginUserDTO,
): Promise<UserDTO | null> => {
  const userRecord = await prisma.user.findUnique({
    where: { email: login.email },
  });

  if (!userRecord) return null;
  if (userRecord.deletedAt) return null;

  let passwordHash = userRecord.password;
  let isPasswordValid = false;

  try {
    isPasswordValid = await compare(login.password, passwordHash);
  } catch {
    isPasswordValid = false;
  }

  if (!isPasswordValid && passwordHash === login.password) {
    const salt = await genSalt(10);
    passwordHash = await hash(login.password, salt);
    await prisma.user.update({
      where: { id: userRecord.id },
      data: { password: passwordHash },
    });
    isPasswordValid = true;
  }

  if (!isPasswordValid) return null;

  const { password: _password, ...userWithoutPassword } = {
    ...userRecord,
    password: passwordHash,
  };

  return userWithoutPassword as UserDTO;
};

const logout = async (session: Express.Request["session"]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!session) {
      resolve();
      return;
    }

    session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export { verifyCredentials, logout };
