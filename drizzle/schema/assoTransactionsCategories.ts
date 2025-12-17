import {integer, pgTable, primaryKey} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {categories} from "./categories";
import {transactions} from "./transactions";

// Table assoTransactionsCategories
export const assoTransactionsCategories = pgTable('assoTransactionsCategories', {
    transactionId: integer('transactionId').notNull().references(() => transactions.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return [
        primaryKey({columns: [table.transactionId, table.categoryId]}),
    ];
});

export const assoTransactionsCategoriesRelations = relations(assoTransactionsCategories, ({one}) => ({
    categories: one(categories, {fields: [assoTransactionsCategories.categoryId], references: [categories.id]}),
    transactions: one(transactions, {fields: [assoTransactionsCategories.transactionId], references: [transactions.id]}),
}));
