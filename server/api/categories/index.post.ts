import { z } from 'zod';
import { createCategory } from '~/server/services/categories.service';
import { requireAuth } from '~/server/utils/auth';

// Schéma de validation
const createCategorySchema = z.object({
    name: z.string({ required_error: "Le nom est requis" })
        .min(1, "Le nom ne peut pas être vide"),

    typeId: z.number({ required_error: "Le type est requis" }).int(),

    isDefault: z.boolean().optional().default(false)
});

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const body = await readValidatedBody(event, (b) => createCategorySchema.safeParse(b));

    if (!body.success) {
        throw createError({ statusCode: 400, message: body.error.issues[0].message });
    }

    try {
        const newCategory = await createCategory(body.data);

        return {
            success: true,
            category: newCategory
        };

    } catch (error: any) {
        // Gestion des erreurs spécifiques BDD
        if (error.code === '23505') { // Unique constraint
            throw createError({ statusCode: 409, message: `La catégorie "${body.data.name}" existe déjà.` });
        }
        if (error.code === '23503') { // Foreign key
            throw createError({ statusCode: 400, message: "Type de catégorie invalide." });
        }

        console.error('Erreur création catégorie:', error);
        throw createError({ statusCode: 500, message: 'Erreur serveur lors de la création' });
    }
});