// server/utils/auth.ts
import type { H3Event } from 'h3'

declare module '#auth-utils' {
    interface User {
        id: string;
        email: string;
        username?: string;
    }
}

export interface UserSession {
    id: string;
    email: string;
    username?: string;
}

export const requireAuth = async (event: H3Event): Promise<UserSession> => {
    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour effectuer cette action'
        })
    }
    return session.user as UserSession
}