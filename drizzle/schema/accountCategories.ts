import {pgTable, integer, primaryKey} from "drizzle-orm/pg-core";
import {accounts} from "./accounts";
import {categories} from "./categories";

// Table AccountCategory
export const accountCategories = pgTable('accountCategories', {
    accountId: integer('accountId').notNull().references(() => accounts.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.accountId, table.categoryId]}),
    };
});