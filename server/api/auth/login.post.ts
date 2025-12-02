import {eq} from 'drizzle-orm';
import {db} from "~/server/db";
import { users } from '~/drizzle/schema/users';
import {z} from "zod";

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe est requis'),
})

export default defineEventHandler(async (event) => {
    const {email, password} = await readValidatedBody(event, loginSchema.parse);

    // Rechercher l'utilisateur par email
    try {
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user.length) {
            return createError({
                statusCode: 401,
                message: 'Identifiants incorrects'
            });
        }
        const isPasswordValid = await verifyPassword(user[0].password, password);

        if (!isPasswordValid) {
            return createError({
                statusCode: 401,
                statusMessage: 'Invalid email or password',
            });
        } else {
            await setUserSession(event, {
                user: {
                    id: user[0].id,
                    email: user[0].email,
                    name: user[0].name,
                }
            })
        }

        return {};
    } catch (error) {
        console.error(error);
        return createError({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
});