import {pgTable, serial, integer, varchar, timestamp, decimal} from "drizzle-orm/pg-core";
import { users } from "./users";
import { accountCategories } from "./accountCategories";
import { historyTransacts } from "./historyTransacts";
import { relations } from "drizzle-orm";

// Table Account
export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    accountName: varchar('accountName', {length: 255}).notNull(),
    accountType: varchar('accountType', {length: 255}).notNull(),
    balance: decimal('balance', {precision: 15, scale: 3}).notNull(),
    currency: varchar('currency', {length: 3}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});


export const accountRelations = relations(accounts, ({one, many}) => ({
    user: one(users, {fields: [accounts.userId], references: [users.id]}),
    categories: many(accountCategories),
    historyTransacts: many(historyTransacts),
}));
