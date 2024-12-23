import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
        input: "./workers/app.ts",
        external: ['@prisma/client']
      }
      : undefined,
  },
  ssr: {
    noExternal: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/utils',
      '@mui/system',
      '@mui/styled-engine',
      // '@prisma/debug', '@prisma/d1-adapter', '@prisma/client', '@prisma/driver-adapter-utils'
    ],
    // noExternal: ['@prisma/debug', '@prisma/d1-adapter', '@prisma/client'],
    target: "webworker",
    // noExternal: true,
    external: ["node:async_hooks"],
    resolve: {
      conditions: ["workerd", "browser"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom",
        "react-dom/server",
        "react-router",
      ],
    },
  },
  plugins: [
    cloudflareDevProxy<Env, Record<string, unknown>>({
      getLoadContext: ({ context }) => {
        const adapter = new PrismaD1(context.cloudflare.env.DB);
        const prismaClient = new PrismaClient({ adapter });

        return {
          prismaClient,
        };
      }
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
