import { initTRPC, TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import {
  assetTable,
  transactionTable,
  userTable,
} from "@assetmanager/db/schema";
import { Context } from "../context.js";
import { protectedProcedure } from "../middleware.js";
import { db } from "@assetmanager/db";

const t = initTRPC.context<Context>().create();

export const transactionRouter = t.router({
  // Get all transactions for a specific asset
  getAllForAsset: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      try {
        // Verify that the user owns the asset or has permission to view it
        const [asset] = await db
          .select()
          .from(assetTable)
          .where(eq(assetTable.id, input.assetId))
          .limit(1);

        if (!asset) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asset not found",
          });
        }

        if (asset.ownerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You do not have permission to view transactions for this asset",
          });
        }

        const fromUserTable = alias(userTable, "fromUser");
        const toUserTable = alias(userTable, "toUser");
        // Get all transactions for the specified asset
        const transactions = await db
          .select({
            id: transactionTable.id,
            assetId: transactionTable.assetId,
            fromUserId: transactionTable.fromUserId,
            toUserId: transactionTable.toUserId,
            transactionDate: transactionTable.transactionDate,
            details: transactionTable.details,
            fromUser: {
              id: fromUserTable.id,
              name: fromUserTable.name,
              email: fromUserTable.email,
            },
            toUser: {
              id: toUserTable.id,
              name: toUserTable.name,
              email: toUserTable.email,
            },
          })
          .from(transactionTable)
          .where(eq(transactionTable.assetId, input.assetId))
          .leftJoin(
            fromUserTable,
            eq(transactionTable.fromUserId, fromUserTable.id)
          )
          .leftJoin(toUserTable, eq(transactionTable.toUserId, toUserTable.id))
          .orderBy(desc(transactionTable.transactionDate));

        return transactions;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch transactions",
        });
      }
    }),
});
