import { db } from '~/server/db'
import { users } from '~/drizzle/schema/users'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Chercher l'utilisateur
    const user = await db.query.users.findFirst({
        where: eq(users.email, body.email)
    })

    if (!user) {
        throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
    }

    // 2. Vérifier le mot de passe
    // verifyPassword vient de nuxt-auth-utils ou bcrypt
    if (!await verifyPassword(user.password, body.password)) {
        throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
    }

    // 3. Mise en session (Le cœur de votre problème initial)
    // On mappe les données de la DB vers la structure de la session
    await setUserSession(event, {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    })

    return { success: true }
})