import { getAllCategories } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    const query = getQuery(event);
    const typeId = query.typeId ? Number(query.typeId) : undefined;

    try {
        const data = await getAllCategories(user.id, typeId);

        return {
            success: true,
            categories: data
        };
    } catch (error) {
        console.error("Erreur récupération catégories:", error);
        throw createError({ statusCode: 500, message: "Erreur serveur" });
    }
});