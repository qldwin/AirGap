import { db } from '~/server/db'
import { users } from '~/drizzle/schema/users'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {

    const session = await getUserSession(event);
    const userId = session.user?.id;

    if (!userId) {
        throw createError({
            statusCode: 401,
            message: "Non authentifié"
        });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) {
        throw createError({
            statusCode: 404,
            message: "Utilisateur introuvable"
        });
    }

    return user;
});
