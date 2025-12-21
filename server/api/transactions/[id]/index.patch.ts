// server/api/transactions/[id]/index.patch.ts
import { z } from 'zod'
import { updateTransaction } from '~/server/services/transactions.service'
import { requireAuth } from '~/server/utils/auth' // Assurez-vous que le chemin est bon (parfois c'est session.ts)

// 1. Validation de l'ID URL
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

// 2. Validation du Body (Mise à jour pour correspondre à VOTRE table transactions)
const updateTransactionSchema = z.object({
    amount: z.number().positive({ message: "Le montant doit être positif" }).optional(),
    description: z.string().min(1).optional(),
    date: z.coerce.date().optional(),

    typeTransactionsId: z.number().int().optional(),
    devise: z.string().length(3).optional(),
    recurrence: z.string().optional(),

    categoryId: z.number().int().nullable().optional(),
    accountId: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
    // A. Sécurité
    const user = await requireAuth(event)

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

    // Si le body est vide, on arrête là
    if (Object.keys(body.data).length === 0) {
        return { success: true, message: "Aucune modification demandée" }
    }

    // D. Préparation des données

    const { categoryId, ...transactionFields } = body.data

    const dataToUpdate = {
        ...transactionFields,
        amount: transactionFields.amount ? String(transactionFields.amount) : undefined,
        updatedAt: new Date() // On met à jour la date de modification
    }

    try {
        // E. Appel Service
        const updatedTransaction = await updateTransaction(
            params.data.id,
            user.id,
            dataToUpdate,
            categoryId === null ? 0 : categoryId
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
    } catch (error) {
        console.error("Erreur PATCH transaction:", error)
        throw createError({
            statusCode: 500,
            message: "Erreur lors de la mise à jour de la transaction"
        })
    }
})