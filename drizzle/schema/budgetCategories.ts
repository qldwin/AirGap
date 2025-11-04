import {pgTable, integer, primaryKey} from 'drizzle-orm/pg-core';
import {budgets} from "./budgets";
import {categories} from "./categories";

// Table BudgetCategory
export const budgetCategories = pgTable('budgetCategories', {
    budgetId: integer('budgetId').notNull().references(() => budgets.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.budgetId, table.categoryId]}),
    };
});