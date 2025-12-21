import {pgTable, integer, primaryKey} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import { categories } from "./categories";
import { budgets } from "./budgets";

// Table assoBudgetCategory

export const assoBudgetCategories = pgTable('assoBudgetCategories', {
    budgetId: integer('budgetId').notNull().references(() => budgets.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return [
        primaryKey({columns: [table.budgetId, table.categoryId]}),
    ];
});

export const budgetCategoryRelations = relations(assoBudgetCategories, ({one}) => ({
    categories: one(categories, {fields: [assoBudgetCategories.categoryId], references: [categories.id]}),
    budgets: one(budgets, {fields: [assoBudgetCategories.budgetId], references: [budgets.id]}),
}));