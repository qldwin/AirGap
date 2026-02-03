import { defineEventHandler, readBody } from 'h3';
import { db } from '~/server/db';
import { importRules } from '~/drizzle/schema/importRules'

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { transactions } = body;

    const rules = await db.select().from(importRules);

    const enrichedTransactions = transactions.map((tx: any) => {
        if (tx.selectedCategoryId) return tx;

        const description = (tx.description || '').toLowerCase();

        const matchingRule = rules.find((rule) =>
            description.includes(rule.keyword.toLowerCase())
        );

        if (matchingRule) {
            return {
                ...tx,
                selectedCategoryId: matchingRule.categoryId,
                status: 'ready'
            };
        }

        return tx;
    });

    return { transactions: enrichedTransactions };
});