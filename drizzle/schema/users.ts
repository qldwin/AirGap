import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { budgets } from "./budgets";
import { transactions } from "./transactions";
import { categories } from "./categories";

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', {length: 255}).notNull().unique(),
    name: varchar('name', {length: 255}),
    password: varchar('password', {length: 255}).notNull(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    deletedAt: timestamp('deletedAt'),
});

export const userRelations = relations(users, ({many}) => ({
    accounts: many(accounts),
    budgets: many(budgets),
    transactions: many(transactions),
    categories: many(categories),
}));