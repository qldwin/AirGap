// server/api/budgets/index.get.ts
import { getUserBudgets } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    try {
        const budgets = await getUserBudgets(user.id)

        return {
            success: true,
            budgets: budgets
        }
    } catch (error) {
        console.error('Erreur récupération budgets:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer vos budgets'
        })
    }
})