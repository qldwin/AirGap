import { db } from '../db';
import { users } from '~/drizzle/schema/users';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // On ignore les routes d'auth pour éviter une boucle
    if (event.path.startsWith('/api/auth')) return;

    // Récupérer le cookie de session (ou token header)
    // Note: Pour une vraie prod, utilise un vrai gestionnaire de session (comme lucia-auth ou nuxt-auth-utils)
    // Ici, je simule avec un simple cookie "userId" signé pour l'exemple
    const userIdCookie = getCookie(event, 'userId');

    if (userIdCookie) {
        try {
            const userId = Number.parseInt(userIdCookie);
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: { id: true, email: true, name: true } // On ne récupère pas le mdp
            });

            if (user) {
                event.context.user = user;
            }

        } catch (e) {
            // Token invalide ou erreur DB
            deleteCookie(event, 'userId');
            console.error(e);
        }
    }
});