import { db } from '~/server/db'
import { categories } from '~/drizzle/schema/categories'
import { eq, asc } from 'drizzle-orm'

// 1. RÉCUPÉRATION DE LA LISTE (GET /)
export const getAllCategories = async (typeId?: number) => {
    const whereCondition = typeId ? eq(categories.typeId, typeId) : undefined;

    return await db.select()
        .from(categories)
        .where(whereCondition)
        .orderBy(asc(categories.name));
}

// 2. RÉCUPÉRATION D'UNE SEULE CATÉGORIE (GET /:id)
export const getCategoryById = async (categoryId: number) => {
    const result = await db.select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

    return result[0];
}

// 3. CRÉATION (POST /)
export const createCategory = async (data: typeof categories.$inferInsert) => {
    const [newCategory] = await db.insert(categories)
        .values(data)
        .returning();

    return newCategory;
}

// 4. MODIFICATION (PATCH /:id)
export const updateCategory = async (
    categoryId: number,
    updateData: Partial<typeof categories.$inferInsert>
) => {
    const [updatedCategory] = await db.update(categories)
        .set(updateData)
        .where(eq(categories.id, categoryId))
        .returning();

    return updatedCategory;
}

// 5. SUPPRESSION (DELETE /:id)
export const deleteCategory = async (categoryId: number) => {
    const [deletedCategory] = await db.delete(categories)
        .where(eq(categories.id, categoryId))
        .returning();

    return deletedCategory;
}