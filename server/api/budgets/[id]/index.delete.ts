// server/api/budgets/[id]/index.delete.ts
import { z } from 'zod'
import { deleteBudget } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

// Validation de l'ID URL
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On attend l'utilisateur
    const user = await requireAuth(event)

    // 2. Validation ID
    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Identifiant de budget invalide'
        })
    }

    try {
        // 3. Appel du Service
        const deletedBudget = await deleteBudget(params.data.id, user.id)

        // 4. Vérification
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
        // Si c'est notre erreur 404, on la laisse passer
        if (error.statusCode === 404) throw error

        console.error('Erreur suppression budget:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de supprimer le budget'
        })
    }
})