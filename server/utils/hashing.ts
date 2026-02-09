import { hash, compare } from 'bcrypt'

const SALT_ROUNDS = 10

/**
 * Hache un mot de passe en clair.
 * À utiliser lors de l'inscription (Register).
 */
export const hashUserPassword = async (password: string): Promise<string> => {
    return await hash(password, SALT_ROUNDS)
}

/**
 * Vérifie si un mot de passe en clair correspond au hash stocké.
 * À utiliser lors de la connexion (Login).
 * * @param hashedPassword - Le mot de passe crypté venant de la DB
 * @param hashedUserPassword
 * @param plainPassword - Le mot de passe saisi par l'utilisateur
 */
export const verifyUserPassword = async (hashedUserPassword: string, plainPassword: string): Promise<boolean> => {
    return await compare(plainPassword, hashedUserPassword)
}