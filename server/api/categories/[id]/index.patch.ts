import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { categories } from '~/drizzle/schema/categories';

export default defineEventHandler(async (event) => {
    // 1. Récupération et validation de l'ID
    const id = getRouterParam(event, 'id');

    if (!id || Number.isNaN(Number(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID de catégorie invalide'
        });
    }

    // 2. Récupération des données envoyées (Body)
    const body = await readBody(event);

    if (!body || Object.keys(body).length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Aucune donnée fournie pour la mise à jour'
        });
    }

    try {
        // 3. Préparation des données à mettre à jour
        const updateData: any = {
            updatedAt: new Date(), // On met toujours à jour la date de modification
        };

        if (body.name) {
            updateData.name = body.name;
        }

        if (body.typeId) {
            updateData.typeId = body.typeId;
        }

        if (body.isDefault !== undefined) {
            updateData.isDefault = body.isDefault;
        }

        // 4. Exécution de la mise à jour avec Drizzle
        const [updatedCategory] = await db.update(categories)
            .set(updateData)
            .where(eq(categories.id, Number(id)))
            .returning();

        // 5. Si aucune catégorie n'est retournée, c'est que l'ID n'existe pas
        if (!updatedCategory) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Catégorie introuvable'
            });
        }

        return { category: updatedCategory };

    } catch (error: any) {
        if (error.statusCode) throw error;

        if (error.code === '23505') {
            throw createError({
                statusCode: 409, // Conflict
                statusMessage: 'Une catégorie avec ce nom existe déjà'
            });
        }

        console.error('Erreur lors de la mise à jour de la catégorie:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur lors de la mise à jour'
        });
    }
});