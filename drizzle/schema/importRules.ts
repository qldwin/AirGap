import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';
import { relations } from 'drizzle-orm';

export const importRules = pgTable('import_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    keyword: varchar('keyword', { length: 255 }).notNull(),
    categoryId: uuid('category_id').references(() => categories.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const importRulesRelations = relations(importRules, ({ one }) => ({
    category: one(categories, {
        fields: [importRules.categoryId],
        references: [categories.id],
    }),
    user: one(users, {
        fields: [importRules.userId],
        references: [users.id],
    }),
}));