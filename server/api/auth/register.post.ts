import { db } from '~/server/db'
import { users } from '~/drizzle/schema/users'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.email || !body.password) {
        throw createError({ statusCode: 400, message: 'Champs manquants' })
    }

    const hashedPassword = await hashPassword(body.password)

    const newUser = await db.insert(users).values({
        email: body.email,
        password: hashedPassword,
        name: body.name || null,
    }).returning();

    const user = newUser[0];

    await setUserSession(event, {
        user: {
            id: user.id, // C'est bien un number ici
            email: user.email,
            name: user.name
        }
    })

    return { success: true }
})