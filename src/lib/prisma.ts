import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 開発環境でのホットリロード時に新しいインスタンスが作成されるのを防ぐ
// ただし、スキーマが変更された場合は新しいインスタンスを作成
const prisma = globalThis.prisma ?? prismaClientSingleton();

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

