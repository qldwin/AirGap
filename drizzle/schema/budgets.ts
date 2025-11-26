import {pgTable, serial, integer, varchar, decimal, timestamp} from "drizzle-orm/pg-core";
import {users} from "./users";
import {relations} from "drizzle-orm";
import {categories} from "./categories";
import {recurrences} from "~/drizzle/schema/recurrences";

// Table Budget
export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
    name: varchar('name', {length: 255}).notNull(),
    amount: decimal('amount', {precision: 15, scale: 3}).notNull(),
    recurrencesId: integer('recurrenceId').notNull().references(() => recurrences.id),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const budgetRelations = relations(budgets, ({one}) => ({
    user: one(users, { fields: [budgets.userId], references: [users.id] }),
    categories: one(categories, {fields: [budgets.categoryId], references: [categories.id]}),
    recurrences: one(recurrences, { fields: [budgets.recurrencesId], references: [recurrences.id] }),
}));