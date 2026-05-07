import {db} from "#server/db";
import {eq} from "drizzle-orm";
import {users} from "~~/drizzle/schema";

export default defineOAuthGitHubEventHandler({
    config: {
        scope: ['user:email']
    },

    async onSuccess(event, {user, tokens}) {
        let userEmail = user.email;

        if (!userEmail) {
            try {
                const res = await $fetch<Array<{ email: string; primary: boolean }>>(
                    'https://api.github.com/user/emails',
                    {
                        headers:
                            {
                                Authorization: `Bearer ${tokens.access_token}`,
                                'User-Agent': 'AirGap'
                            }
                    }
                );
                userEmail = res?.find((e) => e.primary)?.email || res?.[0]?.email || null;
            } catch (e) {
                console.error('Failed to fetch GitHub email:', e);
                return sendRedirect(event, '/login?error=oauth');
            }
        }

        if (!userEmail) {
            return sendRedirect(event, '/login?error=oauth');
        }

        let dbUser = await db.query.users.findFirst({
            where: eq(users.email, userEmail)
        });

        if (dbUser && dbUser.authProvider !== 'github') {
            return sendRedirect(event, `/login?error=wrong_provider&expected=${dbUser.authProvider}`);
        }


        if (!dbUser) {
            const [newUser] = await db.insert(users).values({
                email: userEmail,
                name: user.name ?? '',
                authProvider: 'github',
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
        console.error('GitHub OAuth error:', error);
        return sendRedirect(event, '/login?error=oauth');
    }
});