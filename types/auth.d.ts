// types/auth.d.ts


   export interface User {
        id: number; // C'est ici que TypeScript apprend que "id" existe
        email: string;
        name?: string | null;
    }

    export interface UserSession {
        user: User;
        loggedInAt: Date;
    }
