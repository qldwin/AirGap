import { db } from '~/server/db';
import { budgets, budgetCategories, categories } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
    const rows = await db.select({
        id: budgets.id,
        name: budgets.name,
        amount: budgets.amount,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        categoryId: categories.id,
        categoryName: categories.name
    })
        .from(budgets)
        .leftJoin(budgetCategories, eq(budgets.id, budgetCategories.budgetId))
        .leftJoin(categories, eq(budgetCategories.categoryId, categories.id));

    const budgetsWithCategories = rows.reduce((acc, row) => {
        const existing = acc.find(b => b.id === row.id);
        if (existing) {
            if (row.categoryName) existing.categories.push({ id: row.categoryId, name: row.categoryName });
        } else {
            acc.push({
                id: row.id,
                name: row.name,
                amount: row.amount,
                startDate: row.startDate,
                endDate: row.endDate,
                categories: row.categoryName ? [{ id: row.categoryId, name: row.categoryName }] : []
            });
        }
        return acc;
    }, [] as unknown[]);

    return { budgets: budgetsWithCategories };
});
