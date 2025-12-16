import { createUser, getUserByEmail } from '~/server/services/user.service'
import { hashPassword } from '~/server/utils/hashing'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validation basique
    if (!body.email || !body.password) {
        throw createError({ statusCode: 400, message: 'Email et mot de passe requis' })
    }

    // 2. VÉRIFICATION CRITIQUE : L'email existe-t-il déjà ?
    // Sans ça, l'application plante (Erreur 500) si l'email est pris.
    const existingUser = await getUserByEmail(body.email)
    if (existingUser) {
        throw createError({
            statusCode: 409, // 409 Conflict est le code HTTP approprié
            message: 'Un compte existe déjà avec cet email'
        })
    }

    const hashedPassword = await hashPassword(body.password)

    const user = await createUser({
        email: body.email,
        password: hashedPassword,
        name: body.name || null,
    })

    // 5. Mise en session (Connexion automatique après inscription)
    await setUserSession(event, {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        loggedInAt: new Date()
    })

    return { success: true }
})