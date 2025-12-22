// server/api/transactions/[id]/index.delete.ts
import { z } from 'zod'
import { deleteTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    // 1. Sécurité : AJOUT DE "await" ICI
    const user = await requireAuth(event)

    // 2. Validation des paramètres
    const params = await getValidatedRouterParams(event, (params) => paramsSchema.safeParse(params))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Identifiant de transaction invalide'
        })
    }

    // 3. Appel du service
    const deletedTransaction = await deleteTransaction(params.data.id, user.id)

    // 4. Vérification
    if (!deletedTransaction) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Transaction introuvable ou déjà supprimée'
        })
    }

    return {
        success: true,
        message: 'Transaction supprimée avec succès',
        id: deletedTransaction.id
    }
})