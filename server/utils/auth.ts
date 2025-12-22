// server/utils/auth.ts
import type { H3Event } from 'h3'

// 1. On définit la structure exacte de l'utilisateur stocké en session
export interface UserSession {
    id: number;
    email: string;
    username?: string;
    // Ajoutez d'autres champs si vous en stockez d'autres (avatar, role, etc.)
}

export const requireAuth = async (event: H3Event): Promise<UserSession> => {
    // 2. On récupère la session
    const session = await getUserSession(event)

    // 3. Vérification stricte
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour effectuer cette action'
        })
    }

    // 4. LE SECRET EST ICI : On force le typage avec "as UserSession"
    // Cela garantit à TypeScript que l'objet retourné contient bien un "id" (number)
    return session.user as UserSession
}