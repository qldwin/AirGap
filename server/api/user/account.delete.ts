import { z } from 'zod'
import { getUserByEmail, softDeleteUser } from '#server/services/user.service'

const deleteSchema = z.object({
    password: z.string().optional()
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const result = await readValidatedBody(event, body => deleteSchema.safeParse(body))
    if (!result.success) throw createError({ statusCode: 400, message: 'Données invalides' })

    const userInDb = await getUserByEmail(session.user.email)
    if (!userInDb) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    if (session.user.authProvider === 'local') {
        if (!result.data.password) {
            throw createError({ statusCode: 400, message: 'Mot de passe requis' })
        }

        if (!userInDb.password) {
            throw createError({ statusCode: 400, message: 'Aucun mot de passe configuré' })
        }

        if (!await verifyPassword(userInDb.password, result.data.password)) {
            throw createError({ statusCode: 403, message: 'Mot de passe incorrect' })
        }
    }

    await softDeleteUser(session.user.id)
    await clearUserSession(event)

    return { success: true }
})