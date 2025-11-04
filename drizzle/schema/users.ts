import {pgTable, serial, varchar, timestamp} from "drizzle-orm/pg-core"

// Table User
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', {length: 255}).notNull().unique(),
    name: varchar('name', {length: 255}),
    password: varchar('password', {length: 255}).notNull(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});
