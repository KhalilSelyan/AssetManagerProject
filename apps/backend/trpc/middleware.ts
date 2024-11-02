import { TRPCError, initTRPC } from "@trpc/server";
import { validateSessionToken } from "@assetmanager/db/auth";
import { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  // complains about cookies not being on the type but it is
  // @ts-ignore
  const token = ctx.req.cookies.session;

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No token provided" });
  }

  const sessionValidationResult = await validateSessionToken(token);
  if (!sessionValidationResult.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  // Attach user and session to context
  const { user, session } = sessionValidationResult;
  return next({
    ctx: {
      ...ctx,
      user,
      session,
    },
  });
});
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthenticated);
