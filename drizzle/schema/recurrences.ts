import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { budgets } from './budgets';
import { transactions } from './transactions';
import { relations } from 'drizzle-orm';

export const recurrences = pgTable('recurrences', {
    id: serial('id').primaryKey(),
    parentType: varchar('parentType', { length: 20 }).notNull(),
    parentId: integer('parentId').notNull(),
    frequency: varchar('frequency', { length: 50 }).notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate'),
    occurrences: integer('occurrences'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const recurrenceRelations = relations(recurrences, ({ one }) => ({
    budget: one(budgets, { fields: [recurrences.parentId], references: [budgets.id] }),
    transaction: one(transactions, { fields: [recurrences.parentId], references: [transactions.id] }),
}));

