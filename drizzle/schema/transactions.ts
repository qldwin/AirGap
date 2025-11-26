import {pgTable, serial, integer, timestamp, numeric, varchar, pgEnum} from 'drizzle-orm/pg-core';
import {accounts} from './accounts';
import {relations} from "drizzle-orm";
import {categories} from "./categories";
import {recurrences} from "./recurrences";

export const transactionTypes = pgEnum('transactionTypes', ['revenu', 'depense', 'transferts']);

// Table Transactions
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    accountId: integer('accountId').notNull().references(() => accounts.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
    description: varchar('description', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    type: transactionTypes('type').notNull(),
    source: varchar('origin', { length: 255 }), // source de la transaction (nom de l'entreprise, nom du magasin, etc.)
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const transactionRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
    category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
    recurrences: one(recurrences, { fields: [transactions.id], references: [recurrences.id] }),
}));