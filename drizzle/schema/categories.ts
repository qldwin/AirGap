import {pgTable, serial, varchar, timestamp} from 'drizzle-orm/pg-core'

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});