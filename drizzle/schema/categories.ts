import {pgTable, serial, varchar, timestamp} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm';
import {accountCategories} from './accountCategories';
import {budgetCategories} from './budgetCategories';

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const categoryRelations = relations(categories, ({many}) => ({
    accounts: many(accountCategories),
    budgets: many(budgetCategories),
}));