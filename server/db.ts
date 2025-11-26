import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '~/drizzle/schema/users';
import { accounts } from '~/drizzle/schema/accounts';
import { transactions } from '~/drizzle/schema/transactions';
import { categories } from '~/drizzle/schema/categories';
import { budgets } from '~/drizzle/schema/budgets';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ou ta string hardcodée, mais préférable env
});

export const db = drizzle(pool, {
    schema: {
        users,
        accounts,
        transactions,
        categories,
        budgets,
    },
});