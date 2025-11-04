import {pgTable, serial, integer, varchar, numeric, timestamp} from "drizzle-orm/pg-core";

// Table HistoryTransact
export const historyTransacts = pgTable('history_transacts', {
    id: serial('id').primaryKey(),
    account_id: integer('account_id').notNull(),
    transaction_type: varchar('transaction_type', {length: 10}).notNull(),
    amount: numeric('amount').notNull(),
    description: varchar('description', {length: 255}),
    date: timestamp('date').defaultNow().notNull(),
});