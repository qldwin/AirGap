import { createUser, getUserByEmail } from './user.service'
import { hashUserPassword, verifyUserPassword } from '~/server/utils/hashing'
import type { users } from '~/drizzle/schema/users'

/**
 * Gère l'inscription complète d'un utilisateur
 */
export const registerUser = async (data: typeof users.$inferInsert) => {
    const existingUser = await getUserByEmail(data.email)

    if (existingUser) {
        throw createError({
            statusCode: 400,
            message: 'Cet email est déjà utilisé'
        })
    }

    const hashedUserPassword = await hashUserPassword(data.password)

    return await createUser({
        ...data,
        password: hashedUserPassword
    })
}

/**
 * Gère la logique de connexion
 */
export const loginUser = async (email: string, passwordPlain: string) => {
    const user = await getUserByEmail(email)

    if (!user) {
        return null
    }

    if (user.deletedAt) {
        throw createError({
            statusCode: 403,
            message: 'Ce compte a été supprimé.'
        })
    }

    const isMatch = await verifyUserPassword(user.password, passwordPlain)

    if (!isMatch) {
        return null
    }

    return user
}