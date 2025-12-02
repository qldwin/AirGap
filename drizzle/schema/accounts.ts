import {pgTable, serial, integer, varchar, timestamp, decimal} from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { transactions } from "./transactions";
import {budgets} from "./budgets";
import {assoAccountsCategories} from "./assoAccountsCategories";
import {senderRecipient} from "./senderRecipient";

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
    user: many(users),
    categories: many(assoAccountsCategories),
    transactions: many(transactions),
    budgets: many(budgets),
    senderRecipient: many(senderRecipient),
}));
