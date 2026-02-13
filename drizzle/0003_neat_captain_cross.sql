ALTER TABLE "transactions" ADD COLUMN "typeId" "typeTransactionEnum" NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "typeTransactionsId";