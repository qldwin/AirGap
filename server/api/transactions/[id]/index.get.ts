// server/api/transactions/[id]/index.get.ts
import { z } from 'zod'
import { getTransactionById } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    // 1. Sécurité : On récupère l'utilisateur connecté (sinon 401)
    const user = requireAuth(event)

    // 2. Validation : On récupère l'ID depuis l'URL (router params)
    const params = await getValidatedRouterParams(event, (params) => paramsSchema.safeParse(params))

    if (!params.success) {
        throw createError({
            statusCode: 400,
            message: 'Identifiant de transaction invalide'
        })
    }

    // 3. Appel du service
    const transaction = await getTransactionById(params.data.id, user.id)

    // 4. Vérification d'existence
    if (!transaction) {
        throw createError({
            statusCode: 404, // Not Found
            message: 'Transaction introuvable'
        })
    }

    return { success: true, transaction }
})

