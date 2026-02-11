import { z } from 'zod';
import { getCategoryById } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

const paramsSchema = z.object({
    id: z.string().uuid()
});

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p));
    if (!params.success) {
        throw createError({ statusCode: 400, message: 'ID invalide' });
    }

    try {
        const category = await getCategoryById(params.data.id);

        if (!category) {
            throw createError({ statusCode: 404, message: 'Catégorie introuvable' });
        }

        return { success: true, category };
    } catch (error: any) {
        if (error.statusCode) throw error;
        throw createError({ statusCode: 500, message: 'Erreur serveur' });
    }
});