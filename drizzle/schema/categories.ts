import {pgTable, serial, varchar, timestamp} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm';
import {boolean} from "drizzle-orm/pg-core/columns/boolean";
import {assoBudgetCategories} from "./assoBudgetCategories";
import {assoTransactionsCategories} from "./assoTransactionsCategories";
import {assoAccountsCategories} from "~/drizzle/schema/assoAccountsCategories";

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    isDefault: boolean('isDefault').default(true),
});

export const categoryRelations = relations(categories, ({many}) => ({
    accounts: many(assoAccountsCategories),
    budgets: many(assoBudgetCategories),
    transactions: many(assoTransactionsCategories),
}));