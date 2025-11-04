import {pgTable, serial, integer, varchar, decimal, timestamp} from "drizzle-orm/pg-core";
import {users} from "./users";

// Table Budget
export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    name: varchar('name', {length: 255}).notNull(),
    amount: decimal('amount', {precision: 15, scale: 3}).notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});