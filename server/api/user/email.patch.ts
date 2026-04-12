import { z } from 'zod'
import { getUserByEmail, updateUserEmail } from '#server/services/user.service'

const emailSchema = z.object({
    email: z.email('Email invalide')
})

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Non authentifie' })
    }

    const result = await readValidatedBody(event, (body) => emailSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.issues[0]?.message
        })
    }

    const newEmail = result.data.email

    const existingUser = await getUserByEmail(newEmail)
    if (newEmail === session.user.email || (existingUser && existingUser.id !== session.user.id)) {
        throw createError({ statusCode: 400, message: 'Impossible de faire la modification ! Contactez le support.' })
    }

    try {
        await updateUserEmail(session.user.id, newEmail)

        await setUserSession(event, {
            user: {
                id: session.user.id,
                email: newEmail,
                name: session.user.name
            },
            loggedInAt: new Date()
        })

        return {
            success: true,
            message: 'Email mis a jour avec succes'
        }
    } catch (error) {
        console.error(error)
        throw createError({ statusCode: 500, message: 'Erreur serveur' })
    }
})

