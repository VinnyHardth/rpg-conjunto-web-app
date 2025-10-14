import { PrismaClient } from "@prisma/client";
import { genSalt, hash } from "bcryptjs";

const prisma = new PrismaClient();

export const seedUser = async () => {
  const users = [
    { nickname: "Admin", email: "admin@example.com", password: "admin1" },
    {
      nickname: "Player1",
      email: "player1@example.com",
      password: "player1",
    },
  ];

  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const salt = await genSalt(10);
      const hashedPassword = await hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }),
  );

  await Promise.all(
    hashedUsers.map(async (user) => {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }),
  );
};
