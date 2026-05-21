import { z } from 'zod'
import { authenticator } from 'otplib'
import { getUserTwoFactorSecret, updateUserTwoFactor } from '#server/services/user.service'

const schema = z.object({
    code: z.string().length(6)
})

export default defineEventHandler(async (event) => {
    const session = await requireAuth(event)
    const result = await readValidatedBody(event, body => schema.safeParse(body))

    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Code invalide' })
    }

    const user = await getUserTwoFactorSecret(session.id)

    if (!user?.twoFactorSecret) {
        throw createError({ statusCode: 400, message: 'Aucun setup 2FA en cours, appelez /api/auth/2fa/setup d\'abord' })
    }

    const isValid = authenticator.verify({
        token: result.data.code,
        secret: user.twoFactorSecret
    })

    if (!isValid) {
        throw createError({ statusCode: 400, message: 'Code incorrect' })
    }

    await updateUserTwoFactor(session.id, true, user.twoFactorSecret)

    return { success: true }
})