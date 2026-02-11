import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema/index';
import { useRuntimeConfig } from '#imports';

console.log("🚀 DÉMARRAGE VERSION SÉCURISÉE 🚀");

const config = useRuntimeConfig();
const connectionString = config.databaseUrl;

// 2. Vérification sécurisée
if (!connectionString) {
    throw new Error("❌ ERREUR : La variable databaseUrl est VIDE. Vérifiez NUXT_DATABASE_URL dans Dokploy.");
}

const hiddenUrl = connectionString.replace(/:[^:]*@/, ':****@');
console.log(`🔌 Connexion DB vers : ${hiddenUrl}`);

const pool = new Pool({
    connectionString: connectionString,
});

export const db = drizzle(pool, { schema });