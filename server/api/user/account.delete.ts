import {z} from 'zod'
import {getUserByEmail, softDeleteUser} from "#server/services/user.service";

const deleteSchema = z.object({
    password: z.string().min(1, "Le mot de passe est requis pour confirmer")
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({statusCode: 401, message: "Non authentifié"})

    const result = await readValidatedBody(event, body => deleteSchema.safeParse(body))
    if (!result.success) throw createError({statusCode: 400, message: "Mot de passe requis"})

    const userInDb = await getUserByEmail(session.user.email)

    if (!userInDb || !await verifyUserPassword(userInDb.password, result.data.password)) {
        throw createError({statusCode: 403, message: "Mot de passe incorrect"})
    }

    await softDeleteUser(session.user.id)
    await clearUserSession(event)

    return {success: true}
})