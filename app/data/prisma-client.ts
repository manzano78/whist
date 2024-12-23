import type { PrismaClient } from '@prisma/client';
import { prismaClientAsyncLocalStorage } from '~/data/prisma-client-contex';

export function getPrismaClient(): PrismaClient {
  const prismaClient = prismaClientAsyncLocalStorage.getStore();

  if (!prismaClient) {
    throw new Error(`No prisma client found in the async local storage.`);
  }

  return prismaClient;
}
