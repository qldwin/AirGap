// server/api/transactions/index.get.ts
import { getUserTransactions } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On s'assure que l'utilisateur est connecté
    const user =  requireAuth(event)

    try {
        // 2. Appel du service
        const transactions = await getUserTransactions(user.id)

        // 3. Réponse
        return {
            success: true,
            count: transactions.length, // Pratique pour le frontend
            transactions: transactions
        }
    } catch (error) {
        // Gestion d'erreur globale au cas où la DB plante
        console.error('Erreur récupération transactions:', error)
        throw createError({
            statusCode: 500,
            message: 'Impossible de récupérer vos transactions'
        })
    }
})