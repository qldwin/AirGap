// server/utils/auth.ts

export const requireAuth = async (event: any) => {
    // 1. On demande à Nuxt/H3 de lire la session dans le cookie
    const session = await getUserSession(event)

    // 2. Si pas de session ou pas d'utilisateur dans la session
    if (!session.user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour effectuer cette action'
        })
    }

    // 3. On renvoie l'utilisateur (avec son ID, email, etc.)
    return session.user
}