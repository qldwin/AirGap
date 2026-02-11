import {pgTable, uuid, pgEnum} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {transactions} from "./transactions";

export const typeTransactionEnum = pgEnum("typeTransactionEnum", [
    "depense",
    "revenu",
    "non_categorise",
]);

// Table TypeTransaction
export const typeTransactions = pgTable('typeTransactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: typeTransactionEnum("type").notNull(),
})

export const typeTransactionsRelations = relations(typeTransactions, ({many}) => ({
    transactions: many(transactions),
}));