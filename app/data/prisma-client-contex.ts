import { AsyncLocalStorage } from 'node:async_hooks';
import type { PrismaClient } from '@prisma/client';

export const prismaClientAsyncLocalStorage = new AsyncLocalStorage<PrismaClient>();
