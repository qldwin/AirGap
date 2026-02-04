// server/api/budgets/index.post.ts
import { z } from 'zod'
import { createBudget } from '~/server/services/budgets.service'
import { requireAuth } from '~/server/utils/auth'

const createBudgetSchema = z.object({
    name: z.string({ required_error: "Le nom est requis" })
        .min(1, "Le nom ne peut pas être vide"),

    amount: z.number({ required_error: "Le montant est requis" })
        .positive("Le montant doit être positif"),

    startDate: z.coerce.date({ required_error: "La date de début est requise" }),
    endDate: z.coerce.date({ required_error: "La date de fin est requise" }),

    accountId: z.number().int().optional().nullable(),

    categoryIds: z.array(z.number().int()).optional()
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const body = await readValidatedBody(event, (b) => createBudgetSchema.safeParse(b))

    if (!body.success) {
        throw createError({ statusCode: 400, message: body.error.issues[0].message })
    }

    const { categoryIds, ...restBody } = body.data

    const budgetData = {
        ...restBody,
        userId: user.id,
        amount: String(restBody.amount),

        recurrence: "Aucune",
        startRecurrence: restBody.startDate,

        createdAt: new Date(),
        updatedAt: new Date(),
    }

    try {
        const newBudget = await createBudget(budgetData, categoryIds)

        return {
            success: true,
            budget: newBudget
        }
    } catch (error) {
        console.error('Erreur création budget:', error)
        throw createError({
            statusCode: 500,
            message: "Impossible de créer le budget"
        })
    }
})