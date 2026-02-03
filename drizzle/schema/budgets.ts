import {pgTable, serial, integer, varchar, decimal, timestamp} from "drizzle-orm/pg-core";
import {users} from "./users";
import {relations} from "drizzle-orm";
import {accounts} from "./accounts";
import {assoBudgetCategories} from "./assoBudgetCategories";

// Table Budget
export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    accountId: integer('accountId').references(() => accounts.id),
    name: varchar('name', {length: 255}).notNull(),
    amount: decimal('amount', {precision: 15, scale: 3}).notNull(),
    recurrence: varchar('recurrence').notNull(),
    startRecurrence: timestamp('startRecurrence').notNull(),
    endRecurrence: timestamp('endRecurrence'),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const budgetRelations = relations(budgets, ({ one, many }) => ({
    user: one(users, {
        fields: [budgets.userId],
        references: [users.id]
    }),
    account: one(accounts, {
        fields: [budgets.accountId],
        references: [accounts.id]
    }),
    categories: many(assoBudgetCategories),
}));