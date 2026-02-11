import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema/index';
import { useRuntimeConfig } from '#imports';

console.log("🔌 Initialisation Base de Données...");

const config = useRuntimeConfig();
const connectionString = config.databaseUrl;

if (!connectionString) {
    throw new Error("❌ ERREUR : La variable DATABASE_URL est vide ! Vérifie Dokploy.");
}

const pool = new Pool({
    connectionString: connectionString,
});

export const db = drizzle(pool, { schema });