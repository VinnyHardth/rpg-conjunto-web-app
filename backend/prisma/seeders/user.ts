import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const seedUser = async () => {
  await prisma.user.createMany({
    data: [
      { nickname: "Admin", email: "admin@example.com", password: "admin1" },
      {
        nickname: "Player1",
        email: "player1@example.com",
        password: "player1",
      },
    ],
    skipDuplicates: true,
  });
};
