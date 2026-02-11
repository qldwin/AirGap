// server/api/transactions/[id]/index.get.ts
import { z } from 'zod'
import { getTransactionById } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const params = await getValidatedRouterParams(event, (params) => paramsSchema.safeParse(params))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            message: 'Identifiant de transaction invalide'
        })
    }

    const transaction = await getTransactionById(params.data.id, user.id)

    if (!transaction) {
        throw createError({
            statusCode: 404, // Not Found
            message: 'Transaction introuvable'
        })
    }

    return { success: true, transaction }
})

