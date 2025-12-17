import { z } from 'zod'
import { updateTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

// 1. Validation de l'ID URL
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

// 2. Validation du Body
const updateTransactionSchema = z.object({
    amount: z.number().positive({ message: "Le montant doit être positif" }).optional(),
    description: z.string().min(1).optional(),
    date: z.coerce.date().optional(),
    categoryId: z.number().int().optional(),
    accountId: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
    // A. Sécurité
    const user = requireAuth(event)

    // B. Validation ID
    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))
    if (!params.success) {
        throw createError({ statusCode: 400, message: 'ID invalide' })
    }

    // C. Validation Body
    const body = await readValidatedBody(event, (b) => updateTransactionSchema.safeParse(b))
    if (!body.success) {
        throw createError({
            statusCode: 400,
            message: body.error.issues[0].message
        })
    }
    if (Object.keys(body.data).length === 0) {
        return { success: true, message: "Aucune modification demandée" }
    }

    // D. Préparation des données (La correction est ICI 👇)
    const dataToUpdate = {
        ...body.data,
        amount: body.data.amount ? String(body.data.amount) : undefined
    }

    // E. Appel Service
    const updatedTransaction = await updateTransaction(
        params.data.id,
        user.id,
        dataToUpdate
    )

    // F. Vérification
    if (!updatedTransaction) {
        throw createError({
            statusCode: 404,
            message: 'Transaction introuvable'
        })
    }

    return {
        success: true,
        transaction: updatedTransaction
    }
})