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

    try {
        // 2. Tentative de suppression
        const [deletedCategory] = await db.delete(categories)
            .where(eq(categories.id, Number(id)))
            .returning();

        // 3. Si rien n'est retourné, c'est que l'ID n'existait pas
        if (!deletedCategory) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Catégorie introuvable'
            });
        }

        // 4. Succès
        return {
            message: 'Catégorie supprimée avec succès',
            deletedId: deletedCategory.id
        };

    } catch (error: any) {
        if (error.statusCode) throw error;

        // --- GESTION DES CLÉS ÉTRANGÈRES ---
        // Code erreur PostgreSQL 23503 = foreign_key_violation
        if (error.code === '23503') {
            throw createError({
                statusCode: 409, // 409 Conflict
                statusMessage: 'Impossible de supprimer cette catégorie car elle est liée à des transactions ou des budgets existants.'
            });
        }

        console.error('Erreur lors de la suppression de la catégorie:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur lors de la suppression'
        });
    }
});