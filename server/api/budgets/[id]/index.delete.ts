// server/api/budgets/[id]/index.delete.ts
import { z } from 'zod'
import { deleteBudget } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Identifiant de budget invalide'
        })
    }

    try {
        const deletedBudget = await deleteBudget(params.data.id, user.id)

        if (!deletedBudget) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Budget introuvable ou déjà supprimé'
            })
        }

        return {
            success: true,
            message: 'Budget supprimé avec succès',
            id: deletedBudget.id
        }
    } catch (error: any) {
        if (error.statusCode === 404) throw error

        console.error('Erreur suppression budget:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de supprimer le budget'
        })
    }
})