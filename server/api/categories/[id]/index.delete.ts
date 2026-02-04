import { z } from 'zod';
import { deleteCategory } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
});

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p));
    if (!params.success) throw createError({ statusCode: 400, message: 'ID invalide' });

    try {
        const deletedCategory = await deleteCategory(params.data.id);

        if (!deletedCategory) {
            throw createError({ statusCode: 404, message: 'Catégorie introuvable' });
        }

        return {
            success: true,
            message: 'Catégorie supprimée avec succès',
            deletedId: deletedCategory.id
        };

    } catch (error: any) {
        if (error.code === '23503') {
            throw createError({
                statusCode: 409,
                message: 'Impossible de supprimer cette catégorie car elle est utilisée dans des transactions ou budgets.'
            });
        }

        if (error.statusCode) throw error;

        console.error('Erreur suppression:', error);
        throw createError({ statusCode: 500, message: 'Erreur serveur' });
    }
});