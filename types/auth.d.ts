// types/auth.d.ts

declare module '#auth-utils' {
    interface User {
        id: number; // C'est ici que TypeScript apprend que "id" existe
        email: string;
        name?: string | null;
    }

    interface UserSession {
        user: User;
        loggedInAt: Date;
    }
}

export {}