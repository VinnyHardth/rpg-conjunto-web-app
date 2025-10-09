import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    id: "10000000-0000-0000-0000-000000000000",
    nickname: "Strength",
    email: "a@gmail.com",
    password: "1232",
  },
];

export const userSeeder = async () => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    await prisma.user.createMany({ data: userData });
  }
};
