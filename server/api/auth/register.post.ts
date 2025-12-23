import { z } from 'zod'
import { registerUser } from '~/server/services/auth.service'
import {db} from "~/server/db";
import {accounts} from "~/drizzle/schema";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
})

export default defineEventHandler(async (event) => {
    const result = await readValidatedBody(event, body => registerSchema.safeParse(body))

    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0].message })
    }

    const newUser = await registerUser({
        email: result.data.email,
        password: result.data.password,
        name: result.data.name
    })

    try {
        await db.insert(accounts).values({
            userId: newUser.id,
            accountName: "Compte Courant",
            accountType: "Courant",
            balance: "0",
            currency: "EUR"
        })
    } catch (e) {
        console.error("Erreur création compte", e)
    }

    await setUserSession(event, {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
        },
        loggedInAt: new Date()
    })

    return { success: true, user: newUser }
})