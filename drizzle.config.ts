import type {Config} from 'drizzle-kit';

export default {
    schema: "./drizzle/**/*.ts",
    out: './drizzle-migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.NUXT_DATABASE_URL || '',
    },
    verbose: true,
    strict: true,
} satisfies Config;