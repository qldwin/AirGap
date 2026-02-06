// server/services/calendar.service.ts
import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
//import { accounts } from '~/drizzle/schema/accounts'
import { categories } from '~/drizzle/schema/categories'
import { typeTransactions } from '~/drizzle/schema/typeTransactions'
import { assoTransactionsCategories } from "~/drizzle/schema/assoTransactionsCategories";
import { and, eq, gte, lt, desc, sql } from 'drizzle-orm' // Ajoute desc et sql si besoin

export const getUserTransactionsByYear = async (userId: number, year: number) => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    const pastTransactions = await db.select({
        amount: transactions.amount,
        typeEnum: typeTransactions.type
    })
        .from(transactions)
        .leftJoin(typeTransactions, eq(transactions.typeTransactionsId, typeTransactions.id))
        .where(and(
            eq(transactions.userId, userId),
            lt(transactions.date, startDate)
        ));

    const initialBalance = pastTransactions.reduce((acc, t) => {
        const val = Number(t.amount);
        return t.typeEnum === 'revenu' ? acc + val : acc - val;
    }, 0);

    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        date: transactions.date,
        description: transactions.description,
        typeEnum: typeTransactions.type,
        typeTransactionsId: transactions.typeTransactionsId,
        categoryName: categories.name,
        categoryId: categories.id,
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(categories.id, assoTransactionsCategories.categoryId))
        .leftJoin(typeTransactions, eq(transactions.typeTransactionsId, typeTransactions.id))
        .where(and(
            eq(transactions.userId, userId),
            gte(transactions.date, startDate),
            lt(transactions.date, endDate)
        ))
        .orderBy(transactions.date)

    return {
        initialBalance: initialBalance,
        transactions: rows.map(row => ({
            id: row.id,
            amount: row.amount,
            date: row.date,
            description: row.description,
            typeStr: row.typeEnum === 'revenu' ? 'income' : 'expense',
            typeTransactionsId: row.typeTransactionsId,
            category: row.categoryId ? { id: row.categoryId, name: row.categoryName } : null,
        }))
    };
}

export const getAvailableYears = async (userId: number) => {
    const yearSql = sql<number>`EXTRACT(YEAR FROM ${transactions.date})`

    const rows = await db.select({
        year: yearSql
    })
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .groupBy(yearSql)
        .orderBy(desc(yearSql))

    return rows.map(row => row.year)
}

