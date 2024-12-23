import { createPagesFunctionHandler } from "@react-router/cloudflare";
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
// @ts-ignore, provided by react-router on build time
import * as build from '../build/server';

export const onRequest = createPagesFunctionHandler<Env>({
  build: build as any,
  getLoadContext: ({ context }) => {
    const adapter = new PrismaD1(context.cloudflare.env.DB);
    const prismaClient = new PrismaClient({ adapter });

    return {
      prismaClient,
    };
  },
});
