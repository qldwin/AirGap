import { db } from '../db';
import { users } from '~/drizzle/schema/users';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    if (event.path.startsWith('/api/auth')) return;

    const userIdCookie = getCookie(event, 'userId');

    if (userIdCookie) {
        try {
            const userId = userIdCookie;

            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: { id: true, email: true, name: true }
            });

            if (user) {
                event.context.user = user;
            }

        } catch (e) {
            deleteCookie(event, 'userId');
            console.error(e);
        }
    }
});