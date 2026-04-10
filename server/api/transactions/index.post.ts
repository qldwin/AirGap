import {z} from 'zod'
import {createTransaction} from "#server/services/transactions.service";

const createTransactionSchema = z.object({
    amount: z.number({message: "Le montant est requis"})
        .positive("Le montant doit être positif"),
    description: z.string({message: "La description est requise"})
        .min(1, "La description ne peut pas être vide"),
    date: z.coerce.date({message: "La date est requise"}),
    accountId: z.string({message: "Le compte est requis"}).uuid().nullable(),
    typeTransaction: z.enum(["depense", "revenu", "non_categorise"], {
        message: "Le type est requis"
    }),
    categoryId: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const body = await readValidatedBody(event, (b) => createTransactionSchema.safeParse(b))

    if (!body.success) {
        throw createError({
            statusCode: 400,
            message: body.error.issues[0]?.message
        })
    }

    const {categoryId, ...restBody} = body.data
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
            message: "Impossible de créer la transaction."
        })
    }
})