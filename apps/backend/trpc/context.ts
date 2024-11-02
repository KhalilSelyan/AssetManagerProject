import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Session, User } from "@assetmanager/db/schema";
export function createContext({ req, res }: CreateFastifyContextOptions) {
  // complains about cookies not being on the type but it is
  // @ts-ignore
  const csrfToken = req.cookies["csrfToken"];
  return { req, res, csrfToken };
}

export type Context = inferAsyncReturnType<typeof createContext> & {
  user?: User;
  session?: Session;
};
