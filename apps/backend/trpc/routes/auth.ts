import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  validateSessionToken,
} from "@assetmanager/db/auth";
import {
  loginSchema,
  registerSchema,
  userTable,
} from "@assetmanager/db/schema";
import { Context } from "../context.js";
import { protectedProcedure, publicProcedure } from "../middleware.js";
import { db } from "@assetmanager/db";
import { hashPassword, verifyPassword } from "@assetmanager/db";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const authRouter = t.router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Check if user exists
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1)
        .then((results) => results[0] || null);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const [user] = await db
        .insert(userTable)
        .values({
          email,
          passwordHash: hashedPassword,
          name,
        })
        .returning();

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user record",
        });
      }

      // Create session
      const token = generateSessionToken();
      const { session } = await createSession(token, user.id);

      // Set the session token as an HTTP-only cookie, complains about setCookie not being on the type but it is
      // @ts-ignore
      ctx.res.setCookie("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: session.expiresAt,
        path: "/",
      });

      return {
        user,
      };
    }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    // Find user
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }

    // Create session
    const token = generateSessionToken();
    const { session } = await createSession(token, user.id);

    // Set the session token as an HTTP-only cookie, complains about setCookie not being on the type but it is
    // @ts-ignore
    ctx.res.setCookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: session.expiresAt,
      path: "/",
    });

    return {
      user,
    };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Invalidate the session in the database
    await invalidateSession(ctx.session.id);

    // clear the session cookie, complains about setCookie not being on the type but it is
    // @ts-ignore
    ctx.res.clearCookie("session", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return { success: true };
  }),
  getUser: publicProcedure.query(async ({ ctx }) => {
    // complains about cookies not being on the type but it is
    // @ts-ignore
    const token = ctx.req.cookies.session;

    if (!token) {
      return null;
    }

    const sessionValidationResult = await validateSessionToken(token);
    if (!sessionValidationResult.session) {
      return null;
    }

    const { user } = sessionValidationResult;

    return {
      user,
    };
  }),
  getByEmail: protectedProcedure
    .input(z.string().email())
    .mutation(async ({ ctx, input }) => {
      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, input))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),
});
