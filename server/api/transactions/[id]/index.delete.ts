// server/api/transactions/[id]/index.delete.ts
import { z } from 'zod'
import { deleteTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.string().uuid({ message: "Identifiant de transaction invalide" })
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            statusMessage: params.error.issues[0].message
        })
    }
    const deletedTransaction = await deleteTransaction(params.data.id, user.id)
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