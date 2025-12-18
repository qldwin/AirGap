import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { categories } from '~/drizzle/schema/categories';

export default defineEventHandler(async (event) => {
    // 1. Récupération de l'ID depuis l'URL
    const id = getRouterParam(event, 'id');

    // 2. Validation : Est-ce bien un chiffre ?
    if (!id || Number.isNaN(Number(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID de catégorie invalide'
        });
    }

    try {
        // 3. Requête à la base de données
        const category = await db.query.categories.findFirst({
            where: eq(categories.id, Number(id)),
        });

        // 4. Gestion du cas "Non trouvé"
        if (!category) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Catégorie introuvable'
            });
        }

        // 5. Retourner la donnée
        return { category };

    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        console.error('Erreur lors de la récupération de la catégorie:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur lors de la récupération de la catégorie'
        });
    }
});