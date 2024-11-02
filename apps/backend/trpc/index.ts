import { initTRPC } from "@trpc/server";
import { authRouter } from "./routes/auth.js";
import { assetRouter } from "./routes/asset.js";
import { notificationRouter } from "./routes/notification.js";
import { transactionRouter } from "./routes/transaction.js";

const t = initTRPC.create({});

export const appRouter = t.router({
  auth: authRouter,
  asset: assetRouter,
  notification: notificationRouter,
  transaction: transactionRouter,
});

export type AppRouter = typeof appRouter;
