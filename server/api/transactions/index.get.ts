// server/api/transactions/index.get.ts
import { getUserTransactions } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    try {
        const transactions = await getUserTransactions(user.id)

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