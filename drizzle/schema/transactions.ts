import {pgTable, serial, integer, timestamp, numeric, varchar} from 'drizzle-orm/pg-core';
import {accounts} from './accounts';

// Table Transactions
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    accountId: integer('userId').notNull().references(() => accounts.id),
    description: varchar('description', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    category: varchar('category', { length: 255 }),
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});