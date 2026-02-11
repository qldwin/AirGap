import { pgTable, varchar, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { assoBudgetCategories } from "./assoBudgetCategories";
import { assoTransactionsCategories } from "./assoTransactionsCategories";
import { assoAccountsCategories } from "./assoAccountsCategories";
import { typeTransactions } from "./typeTransactions";
import { users } from "./users";

export const categories = pgTable('categories', {
    id: uuid('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    typeId: uuid('type_id').references(() => typeTransactions.id).notNull(),
    userId: uuid('user_id').references(() => users.id),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    isDefault: boolean('isDefault').default(true),
});

export const categoryRelations = relations(categories, ({many, one}) => ({
    accounts: many(assoAccountsCategories),
    budgets: many(assoBudgetCategories),
    transactions: many(assoTransactionsCategories),
    type: one(typeTransactions, {
        fields: [categories.typeId],
        references: [typeTransactions.id],
    }),
    user: one(users, {
        fields: [categories.userId],
        references: [users.id],
    }),
}));