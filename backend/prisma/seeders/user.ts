import { PrismaClient } from "@prisma/client";
import { genSalt, hash } from "bcryptjs";

export const seedUser = async (prisma: PrismaClient) => {
  const users = [
    { nickname: "Admin", email: "admin@example.com", password: "admin1" },
    {
      nickname: "Player1",
      email: "player1@example.com",
      password: "player1"
    }
  ];

  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const salt = await genSalt(10);
      const hashedPassword = await hash(user.password, salt);
      return { ...user, password: hashedPassword };
    })
  );

  await Promise.all(
    hashedUsers.map(async (user) => {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      });
    })
  );
};
