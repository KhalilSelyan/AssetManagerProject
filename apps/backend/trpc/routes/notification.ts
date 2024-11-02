import { initTRPC, TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { notificationTable } from "@assetmanager/db/schema";
import { Context } from "../context.js";
import { protectedProcedure } from "../middleware.js";
import { db } from "@assetmanager/db";

const t = initTRPC.context<Context>().create();

export const notificationRouter = t.router({
  // Get all notifications for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    try {
      const notifications = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, userId))
        .orderBy(desc(notificationTable.createdAt));

      return notifications;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notifications",
      });
    }
  }),

  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      try {
        const [updatedNotification] = await db
          .update(notificationTable)
          .set({ isRead: true })
          .where(
            and(
              eq(notificationTable.id, input.notificationId),
              eq(notificationTable.userId, userId)
            )
          )
          .returning();

        if (!updatedNotification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        return updatedNotification;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.userId;

    try {
      await db
        .update(notificationTable)
        .set({ isRead: true })
        .where(eq(notificationTable.userId, userId));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark all notifications as read",
      });
    }
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      try {
        const [deletedNotification] = await db
          .delete(notificationTable)
          .where(
            and(
              eq(notificationTable.id, input.notificationId),
              eq(notificationTable.userId, userId)
            )
          )
          .returning();

        if (!deletedNotification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        return deletedNotification;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),

  // Delete all notifications
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.userId;

    try {
      await db
        .delete(notificationTable)
        .where(eq(notificationTable.userId, userId));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete all notifications",
      });
    }
  }),
});
