ALTER TABLE "typeTransactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "type_id" TO "typeId";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_type_id_typeTransactions_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_typeTransactionsId_typeTransactions_id_fk";

DROP TABLE "typeTransactions" CASCADE;--> statement-breakpoint
--> statement-breakpoint