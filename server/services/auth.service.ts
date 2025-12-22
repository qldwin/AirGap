import { createUser, getUserByEmail } from './user.service'
import { hashPassword, verifyPassword } from '~/server/utils/hashing'
import type { users } from '~/drizzle/schema/users'

/**
 * Gère l'inscription complète d'un utilisateur
 */
export const registerUser = async (data: typeof users.$inferInsert) => {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(data.email)

    if (existingUser) {
        throw createError({
            statusCode: 400,
            message: 'Cet email est déjà utilisé'
        })
    }

    // 2. Hasher le mot de passe
    const hashedPassword = await hashPassword(data.password)

    // 3. Créer l'utilisateur via le User Service
    return await createUser({
        ...data,
        password: hashedPassword
    })
}

/**
 * Gère la logique de connexion
 */
export const loginUser = async (email: string, passwordPlain: string) => {
    // 1. Récupérer l'utilisateur (avec son mot de passe hashé)
    const user = await getUserByEmail(email)

    // 2. Vérifications de base
    if (!user) {
        return null
    }

    // 3. IMPORTANT : Vérifier si le compte a été supprimé (Soft Delete)
    if (user.deletedAt) {
        throw createError({
            statusCode: 403,
            message: 'Ce compte a été supprimé.'
        })
    }

    // 4. Vérifier le mot de passe
    const isMatch = await verifyPassword(user.password, passwordPlain)

    if (!isMatch) {
        return null
    }

    return user
}