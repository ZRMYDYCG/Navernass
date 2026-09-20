import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 2,
  }),
});

async function main() {
  const exists = await prisma.news.count();
  if (!exists) {
    await prisma.news.create({
      data: {
        type: "announcement",
        title: "Narraverse 后端已就绪",
        content: "NestJS、Better Auth、Prisma 与 MySQL 基础设施已完成初始化。",
        author: "Narraverse",
        status: "published",
        priority: 100,
      },
    });
  }
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
