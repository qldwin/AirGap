CREATE TYPE "public"."typeTransactionEnum" AS ENUM('depense', 'revenu', 'non_categorise');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"accountName" varchar(255) NOT NULL,
	"accountType" varchar(255) NOT NULL,
	"balance" numeric(15, 3) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assoAccountsCategories" (
	"accountId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	CONSTRAINT "assoAccountsCategories_accountId_categoryId_pk" PRIMARY KEY("accountId","categoryId")
);
--> statement-breakpoint
CREATE TABLE "assoBudgetCategories" (
	"budgetId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	CONSTRAINT "assoBudgetCategories_budgetId_categoryId_pk" PRIMARY KEY("budgetId","categoryId")
);
--> statement-breakpoint
CREATE TABLE "assoTransactionsCategories" (
	"transactionId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	CONSTRAINT "assoTransactionsCategories_transactionId_categoryId_pk" PRIMARY KEY("transactionId","categoryId")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"accountId" uuid,
	"name" varchar(255) NOT NULL,
	"amount" numeric(15, 3) NOT NULL,
	"recurrence" varchar(30) NOT NULL,
	"startRecurrence" timestamp NOT NULL,
	"endRecurrence" timestamp,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type_id" uuid NOT NULL,
	"user_id" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"isDefault" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "import_rules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"keyword" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"senderRecipientId" uuid,
	"typeTransactionsId" uuid NOT NULL,
	"description" text NOT NULL,
	"devise" varchar(3) NOT NULL,
	"amount" numeric NOT NULL,
	"recurrence" varchar NOT NULL,
	"startRecurrence" timestamp NOT NULL,
	"endRecurrence" timestamp,
	"date" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "senderRecipient" (
	"id" uuid PRIMARY KEY NOT NULL,
	"accountId" uuid,
	"name" varchar(50) NOT NULL,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "typeTransactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "typeTransactionEnum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurrences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parentType" varchar(20) NOT NULL,
	"parentId" uuid NOT NULL,
	"frequency" varchar(50) NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"occurrences" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoAccountsCategories" ADD CONSTRAINT "assoAccountsCategories_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoAccountsCategories" ADD CONSTRAINT "assoAccountsCategories_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoBudgetCategories" ADD CONSTRAINT "assoBudgetCategories_budgetId_budgets_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoBudgetCategories" ADD CONSTRAINT "assoBudgetCategories_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoTransactionsCategories" ADD CONSTRAINT "assoTransactionsCategories_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assoTransactionsCategories" ADD CONSTRAINT "assoTransactionsCategories_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_type_id_typeTransactions_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."typeTransactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rules" ADD CONSTRAINT "import_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rules" ADD CONSTRAINT "import_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderRecipientId_senderRecipient_id_fk" FOREIGN KEY ("senderRecipientId") REFERENCES "public"."senderRecipient"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_typeTransactionsId_typeTransactions_id_fk" FOREIGN KEY ("typeTransactionsId") REFERENCES "public"."typeTransactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senderRecipient" ADD CONSTRAINT "senderRecipient_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;