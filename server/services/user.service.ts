// server/services/user.service.ts
import { db } from '~/server/db'
import { users } from '~/drizzle/schema/users'
import { eq } from 'drizzle-orm'

export const getUserByEmail = async (email: string) => {
    return await db.query.users.findFirst({
        where: eq(users.email, email)
    });
}

export const getUserById = async (userId: string) => {
    return await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true

        }
    });
}

export const createUser = async (userInsertData: typeof users.$inferInsert) => {
    const newUser = await db.insert(users).values(userInsertData).returning();
    return newUser[0];
}

export const softDeleteUser = async (userId: string) => {
    return db.update(users)
        .set({
            deletedAt: new Date(),
            email: `deleted-${userId}-${Date.now()}@deleted.com`,
            name: 'Utilisateur supprimé'
        })
        .where(eq(users.id, userId));
}

export const updateUserPassword = async (userId: string, newHashedPassword: string) => {
    return db.update(users)
        .set({
            password: newHashedPassword,
            updatedAt: new Date()
        })
        .where(eq(users.id, userId));
}