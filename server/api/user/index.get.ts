// server/api/user/index.get.ts
import { getUserById } from '~/server/services/user.service'

export default defineEventHandler(async (event) => {

    const sessionUser = requireAuth(event);
    const user = await getUserById(sessionUser.id);

    if (!user) {
        throw createError({
            statusCode: 404,
            message: "Utilisateur introuvable"
        });
    }

    return user;
});