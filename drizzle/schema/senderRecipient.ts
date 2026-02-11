import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { relations } from 'drizzle-orm';
import { transactions } from './transactions';

export const senderRecipient = pgTable('senderRecipient', {
    id: uuid('id').primaryKey(),
    accountId: uuid('accountId').references(() => accounts.id),
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
});

export const senderRecipientRelations = relations(senderRecipient, ({ one, many }) => ({
    account: one(accounts, { fields: [senderRecipient.accountId], references: [accounts.id]}),
    transactions: many(transactions),
}));
