import { db } from '~/server/db';
import { categories } from '~/drizzle/schema/categories';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    const body = await readBody(event);

    if (!body.name || !body.typeId) {
        throw createError({ statusCode: 400, message: 'Le nom et le type sont requis.' });
    }

    try {
        const newCategory = await db.insert(categories).values({
            name: body.name,
            typeId: body.typeId,
            userId: user.id,
            isDefault: false,
        }).returning();

        return { success: true, category: newCategory[0] };

    } catch (error) {
        console.error("Erreur création catégorie", error);
        throw createError({ statusCode: 500, message: "Impossible de créer la catégorie" });
    }
});