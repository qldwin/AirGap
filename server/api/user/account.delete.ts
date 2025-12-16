// server/api/user/account.delete.ts
import { z } from 'zod'
import { softDeleteUser, getUserByEmail } from '~/server/services/user.service'
import { verifyPassword } from '~/server/utils/hashing'

const deleteSchema = z.object({
    password: z.string().min(1, "Le mot de passe est requis pour confirmer")
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: "Non authentifié" })

    // 1. On valide que le mot de passe est envoyé dans le body
    const result = await readValidatedBody(event, body => deleteSchema.safeParse(body))
    if (!result.success) throw createError({ statusCode: 400, message: "Mot de passe requis" })

    // 2. On récupère l'user complet (avec son hash de password) depuis la DB
    const userInDb = await getUserByEmail(session.user.email)

    if (!userInDb || !await verifyPassword(userInDb.password, result.data.password)) {
        throw createError({ statusCode: 403, message: "Mot de passe incorrect" })
    }

    // 3. Suppression et Logout
    await softDeleteUser(session.user.id)
    await clearUserSession(event)

    return { success: true }
})