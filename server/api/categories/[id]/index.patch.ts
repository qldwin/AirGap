import { z } from 'zod';
import { updateCategory } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
});

const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    typeId: z.number().int().optional(),
    isDefault: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p));
    if (!params.success) throw createError({ statusCode: 400, message: 'ID invalide' });

    const body = await readValidatedBody(event, (b) => updateCategorySchema.safeParse(b));
    if (!body.success) throw createError({ statusCode: 400, message: body.error.issues[0].message });

    if (Object.keys(body.data).length === 0) {
        return { success: true, message: "Aucune modification demandée" };
    }

    try {
        const updatedCategory = await updateCategory(params.data.id, body.data);

        if (!updatedCategory) {
            throw createError({ statusCode: 404, message: 'Catégorie introuvable' });
        }

        return { success: true, category: updatedCategory };
    } catch (error: any) {
        if (error.code === '23505') {
            throw createError({ statusCode: 409, message: "Ce nom de catégorie existe déjà." });
        }
        console.error('Erreur mise à jour:', error);
        throw createError({ statusCode: 500, message: 'Impossible de modifier la catégorie' });
    }
});