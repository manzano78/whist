import { createRequestHandler } from "react-router";
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request, env) {
    const adapter = new PrismaD1(env.DB);
    const prismaClient = new PrismaClient({ adapter });

    return requestHandler(request, { prismaClient })
  },
} satisfies ExportedHandler<Env>;
