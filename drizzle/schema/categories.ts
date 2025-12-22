import {pgTable, serial, varchar, timestamp, integer} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm';
import {boolean} from "drizzle-orm/pg-core/columns/boolean";
import {assoBudgetCategories} from "./assoBudgetCategories";
import {assoTransactionsCategories} from "./assoTransactionsCategories";
import {assoAccountsCategories} from "./assoAccountsCategories";
import { typeTransactions } from "./typeTransactions";
// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    typeId: integer('type_id').references(() => typeTransactions.id).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    isDefault: boolean('isDefault').default(true),
});

export const categoryRelations = relations(categories, ({many, one}) => ({
    accounts: many(assoAccountsCategories),
    budgets: many(assoBudgetCategories),
    transactions: many(assoTransactionsCategories),
    type: one(typeTransactions, {
        fields: [categories.typeId],
        references: [typeTransactions.id],
    }),
}));