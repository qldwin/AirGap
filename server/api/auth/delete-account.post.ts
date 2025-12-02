import {eq} from 'drizzle-orm';
import {useSession} from 'h3';
import {SESSION_CONFIG} from '../../middleware/session';
import {users} from "~/drizzle/schema/users";
import {db} from "~/server/db";

export default defineEventHandler(async (event) => {
    try {
        // Récupérer la session
        const session = await useSession(event, SESSION_CONFIG);

        // Vérifier si l'utilisateur est connecté
        if (!session.data.loggedIn || !session.data.user || !session.data.user.id) {
            return createError({
                statusCode: 401,
                statusMessage: 'Non authentifié'
            });
        }

        const userId = session.data.user.id;

        // Supprimer le compte utilisateur de la base de données
        await db.delete(users).where(eq(users.id, userId)).execute();

        // Effacer la session
        await session.clear();

        return {
            message: 'Compte supprimé avec succès'
        };
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        return createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la suppression du compte'
        });
    }
}); 