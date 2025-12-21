// server/api/transactions/index.get.ts
import { getUserTransactions } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Sécurité : IMPORTANT - On attend la résolution de la promesse session
    const user = await requireAuth(event)

    try {
        // 2. Appel du service
        const transactions = await getUserTransactions(user.id)

        // 3. Réponse standardisée
        return {
            success: true,
            count: transactions.length,
            transactions: transactions
        }
    } catch (error) {
        console.error('Erreur récupération transactions:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer vos transactions'
        })
    }
})