    import { db } from '~/server/db'
    import { categories } from '~/drizzle/schema/categories'
    import {eq, asc, and, isNull, or} from 'drizzle-orm'

    export const getAllCategories = async (userId: number, typeId?: number) => {
        const userCondition = or(
            isNull(categories.userId),
            eq(categories.userId, userId)
        );

        const whereCondition = typeId
            ? and(userCondition, eq(categories.typeId, typeId))
            : userCondition;

        return db.select()
            .from(categories)
            .where(whereCondition)
            .orderBy(asc(categories.name));
    }

    export const getCategoryById = async (categoryId: number) => {
        const result = await db.select()
            .from(categories)
            .where(eq(categories.id, categoryId))
            .limit(1);

        return result[0];
    }

    export const createCategory = async (data: { name: string; typeId: number; userId: number }) => {
        const [newCategory] = await db.insert(categories).values({
            name: data.name,
            typeId: data.typeId,
            userId: data.userId,
        }).returning();

        return newCategory;
    };

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

    export const deleteCategory = async (categoryId: number) => {
        const [deletedCategory] = await db.delete(categories)
            .where(eq(categories.id, categoryId))
            .returning();

        return deletedCategory;
    }