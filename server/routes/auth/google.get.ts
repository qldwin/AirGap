import { db } from "#server/db";
import { users } from "~~/drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export default defineOAuthGoogleEventHandler({
    async onSuccess(event, { user }) {

        let dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email)
        });

        if (!dbUser) {
            const [newUser] = await db.insert(users).values({
                email: user.email ?? '',
                name: user.name ?? '',
                password: `oauth_google_${randomUUID()}`,
            }).returning();

            if (!newUser) {
                return sendRedirect(event, '/login?error=oauth');
            }

            dbUser = newUser;
        }

        await setUserSession(event, {
            user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
            },
            loggedInAt: new Date()
        });

        return sendRedirect(event, '/');
    },

    async onError(event, error) {
        console.error('Google OAuth error:', error);
        return sendRedirect(event, '/login?error=oauth');
    }
});