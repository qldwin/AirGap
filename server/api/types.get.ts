import { db } from '~/server/db'
import { typeTransactions } from '~/drizzle/schema/typeTransactions'

export default defineEventHandler(async () => {
    try {
        const types = await db.select().from(typeTransactions);
        return types;
    } catch (error) {
        console.error("Erreur récupération types:", error);
        throw createError({
            statusCode: 500,
            message: "Impossible de récupérer les types de transactions"
        });
    }
});