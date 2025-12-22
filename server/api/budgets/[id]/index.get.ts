// server/api/budgets/[id]/index.get.ts
import { z } from 'zod'
import { getBudgetById } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On attend bien l'utilisateur (avec await !)
    const user = await requireAuth(event)

    // 2. Validation des paramètres (l'ID du budget)
    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Identifiant de budget invalide'
        })
    }

    // 3. Appel du service
    const budget = await getBudgetById(params.data.id, user.id)

    // 4. Vérification d'existence
    if (!budget) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Budget introuvable'
        })
    }

    return {
        success: true,
        budget
    }
})