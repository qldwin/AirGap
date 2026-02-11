import { getAllCategories } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';
import { z } from 'zod';

const querySchema = z.object({
    typeId: z.string().uuid().optional()
});

export default defineEventHandler(async (event) => {

    const user = await requireAuth(event);
    const { typeId } = await getValidatedQuery(event, (params) => querySchema.parse(params));

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