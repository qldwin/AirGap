import { db } from '~/server/db'
import { categories } from '~/drizzle/schema/categories'
import { or, eq, isNull, and } from 'drizzle-orm';

export const getAllCategories = async (userId: string, typeEnum?: string) => {
    const conditions = [
        or(eq(categories.userId, userId), isNull(categories.userId))
    ];

    if (typeEnum) {
        conditions.push(eq(categories.typeTransaction, typeEnum as any));
    }

    return await db.select()
        .from(categories)
        .where(and(...conditions))
        .orderBy(categories.name);
};

export const getCategoryById = async (categoryId: string) => {
    const result = await db.select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);
    return result[0];
}

export const createCategory = async (data: {
    name: string;
    typeTransaction: "depense" | "revenu" | "non_categorise";
    userId: string
}) => {
    const [newCategory] = await db.insert(categories).values({
        name: data.name,
        typeTransaction: data.typeTransaction,
        userId: data.userId,
    }).returning();
    return newCategory;
};

export const updateCategory = async (
    categoryId: string,
    updateData: Partial<typeof categories.$inferInsert>
) => {
    const [updatedCategory] = await db.update(categories)
        .set(updateData)
        .where(eq(categories.id, categoryId))
        .returning();
    return updatedCategory;
}

export const deleteCategory = async (categoryId: string) => {
    const [deletedCategory] = await db.delete(categories)
        .where(eq(categories.id, categoryId))
        .returning();
    return deletedCategory;
}