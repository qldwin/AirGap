import { z } from 'zod'
import { loginUser } from '~/server/services/auth.service'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    // 1. Validation des entrées
    const result = await readValidatedBody(event, body => loginSchema.safeParse(body))
    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Données invalides' })
    }

    // 2. Appel du Service (Logique métier)
    const user = await loginUser(result.data.email, result.data.password)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
    }

    // 3. Gestion de la Session (Infrastructure)
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