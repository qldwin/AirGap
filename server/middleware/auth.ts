export default defineEventHandler(async (event) => {
    if (event.path.startsWith('/api/auth')) return;
    if (event.path.startsWith('/api/_auth')) return;
    if (event.path.startsWith('/auth')) return;

    const session = await getUserSession(event);
    if (session?.user) {
        event.context.user = session.user;
    }
});