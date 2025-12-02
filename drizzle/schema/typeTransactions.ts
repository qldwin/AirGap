import {pgTable, serial, pgEnum} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {transactions} from "~/drizzle/schema/transactions";

export const typeTransactionEnum = pgEnum("type_transaction_enum", [
    "depense",
    "revenu",
]);

// Table TypeTransaction
export const typeTransactions = pgTable('typeTransactions', {
    id: serial('id').primaryKey(),
    type: typeTransactionEnum("type").notNull(),
})

export const typeTransactionsRelations = relations(typeTransactions, ({many}) => ({
    transactions: many(transactions),
}));