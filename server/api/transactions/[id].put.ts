import {eq, and} from 'drizzle-orm';
import {transactions} from "~/drizzle/schema";
import {db} from "~/server/db";

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

        // Récupérer les données du corps de la requête
        const body = await readBody(event);

        if (!body || !body.description || !body.amount || !body.type || !body.date) {
            return createError({
                statusCode: 400,
                statusMessage: 'Données de transaction incomplètes'
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

        // Mettre à jour la transaction
        const updatedTransaction = await db.update(transactions)
            .set({
                description: body.description,
                amount: body.amount,
                type: body.type,
                category: body.category,
                // date: body.date
            })
            .where(and(
                eq(transactions.id, transactionId),
                eq(transactions.userId, userId)
            ))
            .returning();

        return {
            transaction: updatedTransaction
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la transaction:', error);
        return createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur'
        });
    }
}); 