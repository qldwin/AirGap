import { z } from 'zod'
import * as otplib from 'otplib'
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

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
        throw createError({ statusCode: 400, message: '2FA non activée' })
    }

    const isValid = otplib.authenticator.verify({
        token: result.data.code,
        secret: user.twoFactorSecret
    })

    if (!isValid) {
        throw createError({ statusCode: 400, message: 'Code incorrect' })
    }

    await updateUserTwoFactor(session.id, false, null)

    return { success: true }
})