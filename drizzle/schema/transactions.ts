import {pgTable, serial, integer, timestamp, numeric, varchar} from 'drizzle-orm/pg-core';
import {accounts} from './accounts';
import {relations} from "drizzle-orm";
import {senderRecipient} from "./senderRecipient";
import {typeTransactions} from "./typeTransactions";
import {assoTransactionsCategories} from "./assoTransactionsCategories";
import {users} from "./users";

// Table Transactions
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    accountId: integer('accountId').notNull().references(() => accounts.id),
    senderRecipientId: integer('senderRecipientId').references(() => senderRecipient.id),
    typeTransactionsId: integer('typeTransactionsId').notNull().references(() => typeTransactions.id),
    description: varchar('description', { length: 255 }).notNull(),
    devise: varchar('devise', { length: 3 }).notNull(),
    amount: numeric('amount').notNull(),
    recurrence: varchar('recurrence').notNull(),
    startRecurrence: timestamp('startRecurrence').notNull(),
    endRecurrence: timestamp('endRecurrence'),
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const transactionRelations = relations(transactions, ({ one, many }) => ({
    account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
    senderRecipient: many(transactions),
    typeTransactions: one(typeTransactions, { fields: [transactions.typeTransactionsId], references: [typeTransactions.id] }),
    categories: many(assoTransactionsCategories),
}));