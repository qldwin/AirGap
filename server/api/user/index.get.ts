// server/api/user/index.get.ts
import { getUserById } from '~/server/services/user.service'
import {requireAuth} from "~/server/utils/auth";

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