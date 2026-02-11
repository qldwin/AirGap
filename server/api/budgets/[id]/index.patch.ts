// server/api/budgets/[id]/index.patch.ts
import { z } from 'zod'
import { updateBudget } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.string().uuid()
})

const updateBudgetSchema = z.object({
    name: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    accountId: z.string().uuid().nullable().optional().or(z.literal('')),

    categoryIds: z.array(z.string().uuid()).optional()
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))
    if (!params.success) {
        throw createError({ statusCode: 400, message: 'ID de budget invalide' })
    }

    const body = await readValidatedBody(event, (b) => updateBudgetSchema.safeParse(b))
    if (!body.success) {
        throw createError({
            statusCode: 400,
            message: body.error.issues[0].message
        })
    }

    if (Object.keys(body.data).length === 0) {
        return { success: true, message: "Aucune modification demandée" }
    }

    const { categoryIds, ...restBody } = body.data

    const budgetData = {
        ...restBody,
        amount: restBody.amount ? String(restBody.amount) : undefined,
        updatedAt: new Date()
    }

    try {
        const updatedBudget = await updateBudget(
            params.data.id,
            user.id,
            budgetData,
            categoryIds
        )

        if (!updatedBudget) {
            throw createError({
                statusCode: 404,
                message: 'Budget introuvable'
            })
        }

        return {
            success: true,
            budget: updatedBudget
        }
    } catch (error) {
        console.error('Erreur Update Budget:', error)
        throw createError({
            statusCode: 500,
            message: "Erreur lors de la mise à jour du budget"
        })
    }
})