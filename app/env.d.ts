declare module 'react-router' {
  import type { PrismaClient } from '@prisma/client';

  interface AppLoadContext {
    prismaClient: PrismaClient
  }
}

export {}