import { db } from '~/server/db';
import { desc, eq } from 'drizzle-orm';
import { transactions } from "~/drizzle/schema/transactions";

export default defineEventHandler(async (event) => {
    const accountId = Number(getQuery(event).accountId);
    if (!accountId) {
        throw createError({ statusCode: 400, statusMessage: 'accountId manquant' });
    }

    const accountTransactions = await db.query.transactions.findMany({
        where: eq(transactions.accountId, accountId),
        orderBy: [desc(transactions.date)],
    });

    return accountTransactions;
});