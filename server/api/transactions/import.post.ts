import { z } from 'zod';
import { defineEventHandler, readValidatedBody, createError } from 'h3';
import { requireAuth } from '~/server/utils/auth';
import { importTransactionsBulk } from '~/server/services/transactions.service';

const importSchema = z.object({
    targetAccountId: z.string().uuid(),
    transactions: z.array(z.object({
        date: z.coerce.date(),
        description: z.string(),
        amount: z.coerce.number(),
        accountId: z.string().uuid().optional(),
        selectedCategoryId: z.string().uuid().nullable().optional(),
        categoryName: z.string().nullable().optional()
    }))
});

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    const body = await readValidatedBody(event, (b) => importSchema.safeParse(b));

    if (!body.success) {
        console.error("Erreur Validation Zod:", JSON.stringify(body.error.issues, null, 2));
        throw createError({
            statusCode: 400,
            statusMessage: "Validation Failed",
            data: body.error.issues
        });
    }

    try {
        const count = await importTransactionsBulk(
            user.id,
            body.data.transactions,
            body.data.targetAccountId
        );
        return { success: true, count };
    } catch (error: any) {
        console.error("Erreur SQL Import:", error);
        throw createError({
            statusCode: 500,
            message: error.message || "Erreur serveur lors de l'importation."
        });
    }
});