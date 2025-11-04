import {pgTable, integer, primaryKey} from "drizzle-orm/pg-core";
import {accounts} from "./accounts";
import {categories} from "./categories";
import {relations} from "drizzle-orm";

// Table AccountCategory
export const accountCategories = pgTable('accountCategories', {
    accountId: integer('accountId').notNull().references(() => accounts.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.accountId, table.categoryId]}),
    };
});

export const accountCategoryRelations = relations(accountCategories, ({one}) => ({
    account: one(accounts, {fields: [accountCategories.accountId], references: [accounts.id]}),
    category: one(categories, {fields: [accountCategories.categoryId], references: [categories.id]}),
}));