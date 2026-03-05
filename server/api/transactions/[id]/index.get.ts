import {z} from 'zod'
import {getTransactionById} from "#server/services/transactions.service";

const paramsSchema = z.object({
    id: z.string().uuid({message: "Identifiant de transaction invalide"})
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

    return {success: true, transaction}
})

