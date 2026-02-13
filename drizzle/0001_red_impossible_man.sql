ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "recurrence" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "import_rules" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "senderRecipient" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "recurrences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "recurrences" ALTER COLUMN "parentId" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "recurrences" ALTER COLUMN "parentId" DROP NOT NULL;