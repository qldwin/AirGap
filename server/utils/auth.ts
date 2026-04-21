import type {H3Event} from 'h3'
import {eq} from "drizzle-orm";
import {db} from "#server/db";
import {users} from "~~/drizzle/schema";

declare module '#auth-utils' {
    interface User {
        id: string;
        email: string;
        name?: string | null;
    }
}

export interface UserSession {
    id: string;
    email: string;
    name?: string | null;
}

export const requireAuth = async (event: H3Event): Promise<UserSession> => {
    const session = await getUserSession(event)
    console.log('User session:', session)
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour effectuer cette action'
        })
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    });

    if (!dbUser) {
        await clearUserSession(event);
        throw createError({
            statusCode: 401,
            message: 'Session invalide ou compte supprimé'
        });
    }

    return session.user as UserSession
}