import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const createTable = pgTableCreator((name) => `disctest_${name}`);

export const userTable = createTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionTable = createTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const assetTable = createTable("asset", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => userTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionTable = createTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assetTable.id),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => userTable.id),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => userTable.id),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  details: jsonb("details"),
});

export const notificationTable = createTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedAssetId: uuid("related_asset_id").references(() => assetTable.id),
  relatedTransactionId: uuid("related_transaction_id").references(
    () => transactionTable.id
  ),
});

// Schemas
export const insertUserSchema = createInsertSchema(userTable);
export const selectUserSchema = createSelectSchema(userTable);

export const insertAssetSchema = createInsertSchema(assetTable);
export const selectAssetSchema = createSelectSchema(assetTable);

export const insertTransactionSchema = createInsertSchema(transactionTable);
export const selectTransactionSchema = createSelectSchema(transactionTable);

export const insertNotificationSchema = createInsertSchema(notificationTable);
export const selectNotificationSchema = createSelectSchema(notificationTable);

// Types
export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Asset = InferSelectModel<typeof assetTable>;
export type NewAsset = InferInsertModel<typeof assetTable>;
export type Transaction = InferSelectModel<typeof transactionTable>;
export type NewTransaction = InferInsertModel<typeof transactionTable>;
export type Notification = InferSelectModel<typeof notificationTable>;
export type NewNotification = InferInsertModel<typeof notificationTable>;

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createAssetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const transferAssetSchema = z.object({
  assetId: z.string().uuid(),
  toUserId: z.string().uuid(),
});
