// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema/index';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

const connectionString = config.databaseUrl;

if (!connectionString) {
    throw new Error("❌ ERREUR CRITIQUE : La variable d'environnement DATABASE_URL est manquante ou vide !");
}

console.log("🔌 Initialisation Base de Données...");

const pool = new Pool({
    connectionString: connectionString,
});

export const db = drizzle(pool, { schema });