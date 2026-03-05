import {users} from "~~/drizzle/schema";
import {db} from "#server/db";
import {eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    if (event.path.startsWith('/api/auth')) return;


    const userIdCookie = getCookie(event, 'userId');

    if (userIdCookie) {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, userIdCookie),
                columns: {id: true, email: true, name: true}
            });

            if (user) {
                event.context.user = user;
            }

        } catch (e) {
            // Token invalide ou erreur DB
            deleteCookie(event, 'userId');
            console.error(e);
        }
    }
});