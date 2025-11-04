import {pgTable, serial, varchar, timestamp} from "drizzle-orm/pg-core"
import {accounts} from "~/drizzle/schema/accounts";
import {budgets} from "~/drizzle/schema/budgets";
import {transactions} from "~/drizzle/schema/transactions";
import {relations} from "drizzle-orm";

// Table User
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
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

}));