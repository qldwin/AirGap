import {pgTable, integer, primaryKey} from 'drizzle-orm/pg-core';
import {budgets} from "./budgets";
import {categories} from "./categories";
import {relations} from "drizzle-orm";

// Table BudgetCategory
export const budgetCategories = pgTable('budgetCategories', {
    budgetId: integer('budgetId').notNull().references(() => budgets.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.budgetId, table.categoryId]}),
    };
});

export const budgetCategoryRelations = relations(budgetCategories, ({one}) => ({
    budget: one(budgets, {fields: [budgetCategories.budgetId], references: [budgets.id]}),
    category: one(categories, {fields: [budgetCategories.categoryId], references: [categories.id]}),
}));