// server/utils/auth.ts
import type { H3Event } from 'h3'

export const requireAuth = (event: H3Event) => {
    // On vérifie si le middleware a trouvé un utilisateur
    const user = event.context.user

    if (!user) {
        // Si non, on coupe tout de suite avec une erreur 401
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour effectuer cette action'
        })
    }

    // On retourne l'utilisateur.
    // L'avantage : TypeScript sait maintenant que "user" n'est pas null/undefined.
    return user
}