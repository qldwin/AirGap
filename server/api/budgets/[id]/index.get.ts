// server/api/budgets/[id]/index.get.ts
import { z } from 'zod'
import { getBudgetById } from '~/server/services/budgets.service'
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

    const budget = await getBudgetById(params.data.id, user.id)

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