import {z} from 'zod';
import {transactions} from "~/drizzle/schema";
import {db} from "~/server/db";

const transactionSchema = z.object({
    description: z.string().min(1, 'Description requise'),
    amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
    type: z.enum(['income', 'expense']),
    category: z.string().optional(),
    date: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const {user} = await requireUserSession(event)

        // Vérifier si l'utilisateur est connecté
        if (!user) {
            return createError({
                statusCode: 401,
                statusMessage: 'Non authentifié'
            });
        }

        // Récupérer les données du body

        const body = await readBody(event);

        // Valider les données
        const result = transactionSchema.safeParse(body);
        if (!result.success) {
            return createError({
                statusCode: 400,
                statusMessage: 'Données invalides',
                data: result.error.format()
            });
        }


        const {description, amount, type, category} = result.data;

        if (!user["id"]) {
            return createError({
                statusCode: 401,
                statusMessage: 'Session invalide - ID utilisateur manquant'
            });
        }else {
            const transaction = await db.insert(transactions).values({
                userId: user["id"],
                description,
                amount,
                type,
                category: category || null,
                // date: date,
            }).returning();

            return {
                transaction,
                message: 'Transaction créée avec succès'
            };
        }


    } catch (error) {
        console.error('Erreur lors de la création de la transaction:', error);
        return createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur'
        });
    }

});
