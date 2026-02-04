// server/api/transactions/index.post.ts
import { z } from 'zod'
import { createTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth'

const createTransactionSchema = z.object({
    amount: z.number({ required_error: "Le montant est requis" })
        .positive("Le montant doit être positif"),

    description: z.string({ required_error: "La description est requise" })
        .min(1, "La description ne peut pas être vide"),

    date: z.coerce.date({ required_error: "La date est requise" }),

    accountId: z.number({ required_error: "Le compte est requis" }).int(),

    typeTransactionsId: z.number({ required_error: "Le type est requis" }).int(),

    categoryId: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const body = await readValidatedBody(event, (b) => createTransactionSchema.safeParse(b))

    if (!body.success) {
        throw createError({
            statusCode: 400,
            message: body.error.issues[0].message
        })
    }

    const { categoryId, ...restBody } = body.data

    const transactionData = {
        ...restBody,
        userId: user.id,
        amount: String(body.data.amount),

        devise: "EUR",
        recurrence: "Aucune",
        startRecurrence: body.data.date,

        createdAt: new Date(),
        updatedAt: new Date(),
    }

    try {
        const newTransaction = await createTransaction(transactionData, categoryId)

        return {
            success: true,
            transaction: newTransaction
        }
    } catch (error) {
        console.error('Erreur création transaction:', error)
        throw createError({
            statusCode: 500,
            message: "Impossible de créer la transaction. Vérifiez que le compte et le type existent."
        })
    }
})