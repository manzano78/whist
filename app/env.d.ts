import type { ReactNode } from 'react';

declare module 'react-router' {
  import type { PrismaClient } from '@prisma/client';

  interface AppLoadContext {
    prismaClient: PrismaClient
  }
}

declare global {
  type RouteHandle<LoaderData = unknown, Params = unknown> = {
    navigationConfig?: {
      title: ReactNode | ((loaderData: LoaderData) => ReactNode);
      backUrl?: string | null | false | undefined | 0 | ((arg: { params: Params; loaderData: LoaderData }) => string | null | undefined | false | 0);
      hasNewGameLink?: boolean;
    }
  } | undefined;
}

export {}