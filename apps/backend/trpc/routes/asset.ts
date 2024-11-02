import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
  assetTable,
  transactionTable,
  notificationTable,
  createAssetSchema,
  transferAssetSchema,
  userTable,
} from "@assetmanager/db/schema";
import { Context } from "../context.js";
import { protectedProcedure } from "../middleware.js";
import { db } from "@assetmanager/db";

const t = initTRPC.context<Context>().create();

// Helper function to create error notification
async function createErrorNotification(
  tx: any,
  userId: string,
  message: string,
  assetId?: string
) {
  await tx.insert(notificationTable).values({
    userId,
    type: "ERROR",
    message,
    relatedAssetId: assetId,
    isRead: false,
  });
}

export const assetRouter = t.router({
  // Create a new asset
  create: protectedProcedure
    .input(createAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      try {
        // Use a transaction to ensure both asset and notification are created
        return await db.transaction(async (tx) => {
          // Create the asset
          const [newAsset] = await tx
            .insert(assetTable)
            .values({
              name: input.name,
              description: input.description,
              ownerId: userId,
            })
            .returning();

          if (!newAsset) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create asset - no asset was returned",
            });
          }

          // Create a success notification
          await tx.insert(notificationTable).values({
            userId: userId,
            type: "ASSET_CREATED",
            message: `Your new asset "${input.name}" has been created successfully.`,
            relatedAssetId: newAsset.id,
          });

          return newAsset;
        });
      } catch (error) {
        // Create error notification outside the failed transaction
        await db.transaction(async (tx) => {
          await createErrorNotification(
            tx,
            userId,
            `Failed to create asset "${input.name}". Please try again.`
          );
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create asset",
        });
      }
    }),

  // Get all assets for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    try {
      const assets = await db
        .select({
          id: assetTable.id,
          name: assetTable.name,
          description: assetTable.description,
          createdAt: assetTable.createdAt,
          updatedAt: assetTable.updatedAt,
          owner: {
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
          },
        })
        .from(assetTable)
        .where(eq(assetTable.ownerId, userId))
        .leftJoin(userTable, eq(assetTable.ownerId, userTable.id));

      return assets;
    } catch (error) {
      // Create error notification for fetch failure
      await db.transaction(async (tx) => {
        await createErrorNotification(
          tx,
          userId,
          "Failed to fetch your assets. Please refresh the page."
        );
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch assets",
      });
    }
  }),

  // Transfer asset to another user
  transfer: protectedProcedure
    .input(transferAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      try {
        // Use a transaction to ensure all related operations succeed or fail together
        return await db.transaction(async (tx) => {
          // Get the original asset to include its name in notifications
          const [originalAsset] = await tx
            .select()
            .from(assetTable)
            .where(eq(assetTable.id, input.assetId))
            .limit(1);

          if (!originalAsset) {
            await createErrorNotification(
              tx,
              userId,
              "Asset not found. Transfer failed.",
              input.assetId
            );
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Asset not found",
            });
          }

          // Verify the asset belongs to the current user
          if (originalAsset.ownerId !== userId) {
            await createErrorNotification(
              tx,
              userId,
              "You do not have permission to transfer this asset.",
              input.assetId
            );
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Not authorized to transfer this asset",
            });
          }

          // Update asset ownership
          const [updatedAsset] = await tx
            .update(assetTable)
            .set({
              ownerId: input.toUserId,
              updatedAt: new Date(),
            })
            .where(eq(assetTable.id, input.assetId))
            .returning();

          // Record the transaction
          const [transaction] = await tx
            .insert(transactionTable)
            .values({
              assetId: input.assetId,
              fromUserId: userId,
              toUserId: input.toUserId,
              details: {
                assetName: originalAsset.name,
                transferDate: new Date().toISOString(),
              },
            })
            .returning();

          if (!transaction) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create transaction record",
            });
          }

          // Create success notifications for both sender and receiver
          await tx.insert(notificationTable).values([
            {
              userId: userId,
              type: "ASSET_SENT",
              message: `You have transferred "${originalAsset.name}" to another user.`,
              relatedAssetId: input.assetId,
              relatedTransactionId: transaction.id,
            },
            {
              userId: input.toUserId,
              type: "ASSET_RECEIVED",
              message: `You have received "${originalAsset.name}" from another user.`,
              relatedAssetId: input.assetId,
              relatedTransactionId: transaction.id,
            },
          ]);

          return updatedAsset;
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        // Create error notification outside the failed transaction
        await db.transaction(async (tx) => {
          await createErrorNotification(
            tx,
            userId,
            "Failed to transfer asset. Please try again.",
            input.assetId
          );
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transfer asset",
        });
      }
    }),
});
