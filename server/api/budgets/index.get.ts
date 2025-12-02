import { db } from '~/server/db';
import {budgets} from "~/drizzle/schema/budgets";
import {categories} from "~/drizzle/schema/categories";
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
        .leftJoin(categories, eq(budgets.categoryId, categories.id));

    const budgetsWithCategories = rows.map(row => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        startDate: row.startDate,
        endDate: row.endDate,
        category: row.categoryName ? { id: row.categoryId, name: row.categoryName } : null
    }));

    return { budgets: budgetsWithCategories };
});
