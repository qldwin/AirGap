// server/api/transactions/[id]/index.patch.ts
import { z } from 'zod'
import { updateTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const paramsSchema = z.object({
    id: z.string().uuid()
})

const updateTransactionSchema = z.object({
    amount: z.number().positive({message: "Le montant doit être positif"}).optional(),
    description: z.string().min(1).optional(),
    date: z.coerce.date().optional(),

    typeTransactionsId: z.string().uuid().optional(),
    devise: z.string().length(3).optional(),
    recurrence: z.string().optional(),

    categoryId: z.string().uuid().nullable().optional().or(z.literal('')),
    accountId: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const params = await getValidatedRouterParams(event, (p) => paramsSchema.safeParse(p))
    if (!params.success) {
        throw createError({ statusCode: 400, message: 'ID invalide' })
    }

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

    const { categoryId, ...transactionFields } = body.data

    const dataToUpdate = {
        ...transactionFields,
        amount: transactionFields.amount ? String(transactionFields.amount) : undefined,
        updatedAt: new Date()
    }

    try {
        const updatedTransaction = await updateTransaction(
            params.data.id,
            user.id,
            dataToUpdate,
            categoryId === null ? 0 : categoryId
        )

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
    } catch (error) {
        console.error("Erreur PATCH transaction:", error)
        throw createError({
            statusCode: 500,
            message: "Erreur lors de la mise à jour de la transaction"
        })
    }
})