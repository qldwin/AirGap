// server/api/auth/login.post.ts
import { z } from 'zod'
import { verifyPassword } from '~/server/utils/hashing'
import { getUserByEmail } from '~/server/services/user.service'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    const result = await readValidatedBody(event, body => loginSchema.safeParse(body))

    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Données invalides' })
    }

    const { email, password } = result.data
    const user = await getUserByEmail(email)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
    }

    if (!await verifyPassword(user.password, password)) {
        throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
    }

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