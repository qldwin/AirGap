import {pgTable, serial, integer, timestamp, numeric, varchar} from 'drizzle-orm/pg-core';
import {users} from "./users";

// Table Transactions
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    description: varchar('description', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' ou 'expense'
    category: varchar('category', { length: 255 }),
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});