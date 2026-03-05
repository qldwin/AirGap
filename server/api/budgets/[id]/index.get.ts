import {z} from 'zod'
import {getBudgetById} from "#server/services/budgets.service";

const paramsSchema = z.object({
    id: z.string().uuid({message: "Identifiant de budget invalide"})
})

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On vérifier l'auth
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