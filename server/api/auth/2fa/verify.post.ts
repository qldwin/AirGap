import { z } from 'zod'
import { authenticator } from 'otplib'
import { getUserTwoFactorSecret } from '#server/services/user.service'

const schema = z.object({
    code: z.string().length(6)
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)

    if (!session?.user || !session.secure?.twoFactorPending) {
        throw createError({ statusCode: 403, message: 'Non autorisé' })
    }

    const result = await readValidatedBody(event, body => schema.safeParse(body))
    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Code invalide' })
    }

    const user = await getUserTwoFactorSecret(session.user.id)

    if (!user?.twoFactorSecret) {
        throw createError({ statusCode: 400, message: '2FA non configurée' })
    }

    const isValid = authenticator.verify({
        token: result.data.code,
        secret: user.twoFactorSecret
    })

    if (!isValid) {
        throw createError({ statusCode: 400, message: 'Code incorrect' })
    }

    await setUserSession(event, {
        user: session.user,
        secure: { twoFactorPending: false },
        loggedInAt: new Date()
    })

    return { success: true }
})