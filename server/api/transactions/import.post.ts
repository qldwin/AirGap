import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';
import { importTransactionsBulk } from '~/server/services/transactions.service';

const importSchema = z.object({
    transactions: z.array(z.object({
        date: z.coerce.date(),
        description: z.string(),
        amount: z.number(),
        accountId: z.number().int().default(1),
        selectedCategoryId: z.number().int().nullable().optional(),
        categoryName: z.string().nullable().optional()
    }))
});

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const body = await readValidatedBody(event, (b) => importSchema.safeParse(b));

    if (!body.success) {
        console.error("Erreur Validation Zod:", body.error.issues);
        throw createError({
            statusCode: 400,
            message: "Données invalides : " + body.error.issues[0].message
        });
    }

    try {
        const count = await importTransactionsBulk(user.id, body.data.transactions);
        return { success: true, count };
    } catch (error: any) {
        console.error("Erreur SQL Import:", error);
        throw createError({
            statusCode: 500,
            message: error.message || "Erreur serveur lors de l'importation."
        });
    }
});