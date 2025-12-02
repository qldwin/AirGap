import {eq, and} from 'drizzle-orm';
import {db} from "~/server/db";
import {transactions} from "~/drizzle/schema/transactions";

export default defineEventHandler(async (event) => {
    try {
        const {user} = await requireUserSession(event)

        // Vérifier si l'utilisateur est connecté
        if (!user) {
            return createError({
                statusCode: 401,
                statusMessage: 'Non authentifié'
            });
        }

        const userId = user["id"];

        // Vérifier si l'ID de transaction est fourni
        if (!event.context.params?.id) {
            return createError({
                statusCode: 400,
                statusMessage: 'ID de transaction manquant'
            });
        }

        const transactionId = parseInt(event.context.params.id, 10);

        if (isNaN(transactionId)) {
            return createError({
                statusCode: 400,
                statusMessage: 'ID de transaction invalide'
            });
        }

        // Vérifier si la transaction existe et appartient à l'utilisateur
        const existingTransaction = await db.select()
            .from(transactions)
            .where(and(
                eq(transactions.id, transactionId),
                eq(transactions.userId, userId)
            ));

        if (!existingTransaction) {
            return createError({
                statusCode: 404,
                statusMessage: 'Transaction non trouvée'
            });
        }

        // Supprimer la transaction
        await db.delete(transactions)
            .where(and(
                eq(transactions.id, transactionId),
                eq(transactions.userId, userId)
            ));

        return {
            success: true,
            message: 'Transaction supprimée avec succès'
        };
    } catch (error) {
        console.error('Erreur lors de la suppression de la transaction:', error);
        return createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur'
        });
    }
}); 