// server/api/user/password.patch.ts
import { z } from 'zod'
import { getUserByEmail, updateUserPassword } from '~/server/services/user.service'
import { verifyPassword, hashPassword } from '~/server/utils/hashing'

const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmPassword"]
});

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) {
        throw createError({ statusCode: 401, message: "Non authentifié" })
    }

    const result = await readValidatedBody(event, body => passwordChangeSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.issues[0].message
        })
    }

    const { currentPassword, newPassword } = result.data

    const userInDb = await getUserByEmail(session.user.email)

    if (!userInDb) {
        throw createError({ statusCode: 404, message: "Utilisateur introuvable" })
    }

    const isPasswordValid = await verifyPassword(userInDb.password, currentPassword)
    if (!isPasswordValid) {
        throw createError({
            statusCode: 403,
            message: "Le mot de passe actuel est incorrect"
        })
    }

    const newHashedPassword = await hashPassword(newPassword)

    await updateUserPassword(session.user.id, newHashedPassword)

    return {
        success: true,
        message: "Mot de passe modifié avec succès"
    }
})