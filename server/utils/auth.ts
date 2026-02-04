// server/utils/auth.ts
import type { H3Event } from 'h3'

export interface UserSession {
    id: number;
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