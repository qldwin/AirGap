import { getAllCategories } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    await requireAuth(event);
    const query = getQuery(event);
    const typeId = query.typeId ? Number(query.typeId) : undefined;

    try {
        const categories = await getAllCategories(typeId);

        return {
            success: true,
            categories: categories
        };
    } catch (error) {
        console.error('Erreur API Categories:', error);
        throw createError({ statusCode: 500, message: 'Erreur récupération catégories' });
    }
});