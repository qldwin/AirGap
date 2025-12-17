import { z } from 'zod'
import { registerUser } from '~/server/services/auth.service'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
})

export default defineEventHandler(async (event) => {
    const result = await readValidatedBody(event, body => registerSchema.safeParse(body))

    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0].message })
    }

    // Le service s'occupe de vérifier l'email, hasher le mdp et créer l'user
    const newUser = await registerUser({
        email: result.data.email,
        password: result.data.password,
        name: result.data.name
    })

    // On connecte directement l'utilisateur après l'inscription
    await setUserSession(event, {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
        },
        loggedInAt: new Date()
    })

    return { success: true, user: newUser }
})