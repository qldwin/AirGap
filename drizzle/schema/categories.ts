import {pgTable, serial, varchar, timestamp} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm';
import {accounts} from './accounts';
import {budgets} from './budgets';
import {transactions} from "./transactions";
import {boolean} from "drizzle-orm/pg-core/columns/boolean";

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    isDefault: boolean('isDefault').default(true),
});

export const categoryRelations = relations(categories, ({many}) => ({
    accounts: many(accounts),
    budgets: many(budgets),
    transactions: many(transactions),
}));