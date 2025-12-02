import {pgTable, serial, primaryKey} from "drizzle-orm/pg-core";
import {accounts} from "./accounts";
import {categories} from "./categories";
import {relations} from "drizzle-orm";

// Table AssoAccountsCategories
export const assoAccountsCategories = pgTable('assoAccountsCategories', {
    accountId: serial('accountId').notNull().references(() => accounts.id),
    categoryId: serial('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.accountId, table.categoryId]}),
    };
});

export const assoAccountsCategoriesRelations = relations(assoAccountsCategories, ({one}) => ({
    accounts: one(accounts, {fields: [assoAccountsCategories.accountId], references: [accounts.id]}),
    categories: one(categories, {fields: [assoAccountsCategories.categoryId], references: [categories.id]}),
}));