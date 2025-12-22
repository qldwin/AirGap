// server/api/budgets/index.get.ts
import { getUserBudgets } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On identifie l'utilisateur
    const user = await requireAuth(event)

    try {
        // 2. Appel du service de lecture (et non de création)
        const budgets = await getUserBudgets(user.id)

        // 3. On renvoie la liste
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