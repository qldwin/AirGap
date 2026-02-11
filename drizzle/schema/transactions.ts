import {pgTable, uuid, timestamp, numeric, varchar, text} from 'drizzle-orm/pg-core';
import {accounts} from './accounts';
import {relations} from "drizzle-orm";
import {senderRecipient} from "./senderRecipient";
import {typeTransactions} from "./typeTransactions";
import {assoTransactionsCategories} from "./assoTransactionsCategories";
import {users} from "./users";

// Table Transactions
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId').notNull().references(() => users.id),
    accountId: uuid('accountId').notNull().references(() => accounts.id),
    senderRecipientId: uuid('senderRecipientId').references(() => senderRecipient.id),
    typeTransactionsId: uuid('typeTransactionsId').notNull().references(() => typeTransactions.id),
    description: text('description').notNull(),
    devise: varchar('devise', { length: 3 }).notNull(),
    amount: numeric('amount').notNull(),
    recurrence: varchar('recurrence').notNull(),
    startRecurrence: timestamp('startRecurrence').notNull(),
    endRecurrence: timestamp('endRecurrence'),
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const transactionRelations = relations(transactions, ({ one, many }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id]
    }),

    account: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id]
    }),

    senderRecipient: one(senderRecipient, {
        fields: [transactions.senderRecipientId],
        references: [senderRecipient.id]
    }),

    typeTransactions: one(typeTransactions, {
        fields: [transactions.typeTransactionsId],
        references: [typeTransactions.id]
    }),

    categories: many(assoTransactionsCategories),
}));