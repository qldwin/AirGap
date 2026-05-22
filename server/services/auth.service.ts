import { createUser, getUserByEmail } from '#server/services/user.service'
import { hashPassword, verifyPassword } from '#imports'
import { users } from '~~/drizzle/schema'

let dummyHash: string | null = null

const getDummyHash = async () => {
    if (!dummyHash) {
        dummyHash = await hashPassword('dummy-password-for-timing-safety')
    }
    return dummyHash
}

/**
 * Gère l'inscription complète d'un utilisateur
 * Retourne null si l'email est déjà pris (le handler gère l'erreur HTTP)
 */
export const registerUser = async (data: typeof users.$inferInsert) => {
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) return null

    if (!data.password) {
        throw createError({ statusCode: 400, message: 'Mot de passe requis' })
    }

    const hashedPassword = await hashPassword(data.password)

    return await createUser({
        ...data,
        password: hashedPassword
    })
}

/**
 * Gère la logique de connexion
 * Retourne null si les identifiants sont invalides
 */
export const loginUser = async (email: string, passwordPlain: string) => {
    const user = await getUserByEmail(email)

    const isMatch = await verifyPassword(user?.password ?? await getDummyHash(), passwordPlain)

    if (!user || !isMatch) return null

    if (user.deletedAt) {
        throw createError({
            statusCode: 403,
            message: 'Ce compte a été supprimé.'
        })
    }

    return user
}