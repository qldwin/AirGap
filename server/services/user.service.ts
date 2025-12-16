// server/services/user.service.ts
import { db } from '~/server/db'
import { users } from '~/drizzle/schema/users'
import { eq } from 'drizzle-orm'

// 1. Fonction pour le Login (Récupère tout, y compris le password)
export const getUserByEmail = async (email: string) => {
    return await db.query.users.findFirst({
        where: eq(users.email, email)
    });
}

// 2. Fonction pour le Profil (Ne renvoie PAS le password)
export const getUserById = async (userId: number) => {
    return await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
            // Pas de password ici pour la sécurité
        }
    });
}

// 3. Fonction pour l'Inscription
export const createUser = async (userInsertData: typeof users.$inferInsert) => {
    const newUser = await db.insert(users).values(userInsertData).returning();
    return newUser[0];
}

// 3. Fonction pour la suppression douce (soft delete) d'un utilisateur
export const softDeleteUser = async (userId: number) => {
    return db.update(users)
        .set({
            deletedAt: new Date(),
            email: `deleted-${userId}-${Date.now()}@deleted.com`,
            name: 'Utilisateur supprimé'
        })
        .where(eq(users.id, userId));
}

// 4. Fonction pour mettre à jour le mot de passe d'un utilisateur
export const updateUserPassword = async (userId: number, newHashedPassword: string) => {
    return db.update(users)
        .set({
            password: newHashedPassword,
            updatedAt: new Date() // On met toujours à jour la date de modif
        })
        .where(eq(users.id, userId));
}