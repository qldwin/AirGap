// types/auth.d.ts

declare module '#auth-utils' {
    interface User {
        id: string;
        email: string;
        name?: string | null;
    }

    interface UserSession {
        loggedInAt: Date;
    }
}

export {}