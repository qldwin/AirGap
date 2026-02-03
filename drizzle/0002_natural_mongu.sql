CREATE TABLE "import_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"keyword" varchar(255) NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assoBudgetCategories" ALTER COLUMN "budgetId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "assoBudgetCategories" ALTER COLUMN "categoryId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "accountId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "type_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "import_rules" ADD CONSTRAINT "import_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rules" ADD CONSTRAINT "import_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_type_id_typeTransactions_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."typeTransactions"("id") ON DELETE no action ON UPDATE no action;