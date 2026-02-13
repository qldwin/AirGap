// server/api/categories/index.get.ts
import { getAllCategories } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const query = getQuery(event);
    const typeValue = Array.isArray(query.type) ? query.type[0] : query.type;
    const typeEnum = typeof typeValue === 'string' ? typeValue : undefined;

    try {
        const data = await getAllCategories(user.id, typeEnum);

        return {
            success: true,
            categories: data
        };
    } catch (error) {
        console.error("Erreur récupération catégories:", error);
        throw createError({ statusCode: 500, message: "Erreur serveur" });
    }
});