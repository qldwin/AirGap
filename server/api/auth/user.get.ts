import {eq} from 'drizzle-orm';
import {db} from "~/server/db";
import {users} from "~/drizzle/schema";

export default defineEventHandler(async (event) => {
    try {
        if (!event.context.session?.data?.loggedIn || !event.context.session?.data?.user) {
            return createError({
                statusCode: 401,
                message: 'Non authentifié'
            });
        }

        // Récupérer les informations de l'utilisateur depuis la base de données
        const userId = event.context.session?.data?.user?.id;

        // Protection contre les userId null ou non valides
        if (!userId) {
            return createError({
                statusCode: 401,
                message: 'Session invalide - ID utilisateur manquant'
            });
        }

        try {
            const user = await db.select({
                id: users.id,
                email: users.email,
                name: users.name,
                createdAt: users.createdAt
            })
                .from(users)
                .where(eq(users.id, userId));

            return {user};
        } catch (dbError) {
            console.error('Erreur de base de données:', dbError);
            return createError({
                statusCode: 500,
                message: 'Erreur de base de données'
            });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        return createError({
            statusCode: 500,
            message: 'Erreur serveur'
        });
    }
}); 