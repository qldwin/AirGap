import {pgTable, serial, primaryKey} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import { categories } from "./categories";
import { budgets } from "./budgets";

// Table BudgetCategory

export const assoBudgetCategories = pgTable('assoBudgetCategories', {
    budgetId: serial('budgetId').notNull().references(() => budgets.id),
    categoryId: serial('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.budgetId, table.categoryId]}),
    };
});

export const budgetCategoryRelations = relations(assoBudgetCategories, ({one}) => ({
    categories: one(categories, {fields: [assoBudgetCategories.categoryId], references: [categories.id]}),
    budgets: one(budgets, {fields: [assoBudgetCategories.budgetId], references: [budgets.id]}),
}));