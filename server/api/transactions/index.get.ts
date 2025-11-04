import {eq, desc} from 'drizzle-orm';
import {db} from '../../db';
import {transactions} from "~/drizzle/schema/transactions";

export default defineEventHandler(async (event) => {
    try {
        const { user } = await requireUserSession(event)

        // Vérifier si l'utilisateur est connecté
        if (!user) {
            return createError({
                statusCode: 401,
                statusMessage: 'Non authentifié'
            });
        }
        if (!user["id"]) {
            return createError({
                statusCode: 401,
                statusMessage: 'Session invalide - ID utilisateur manquant'
            });
        }else {
            // Récupérer les transactions de l'utilisateur
            const userTransactions = await db.select()
                .from(transactions)
                .where(eq(transactions.userId, user["id"]))
                .orderBy(desc(transactions.date));

            return {
                transactions: userTransactions
            };
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        return createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur'
        });
    }
}); 