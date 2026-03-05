import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from '../drizzle/schema/index';
import {useRuntimeConfig} from '#imports';


const config = useRuntimeConfig();
const connectionString = config.databaseUrl;

if (!connectionString) {
    throw new Error("❌ ERREUR : La variable databaseUrl est VIDE. Vérifiez NUXT_DATABASE_URL dans Dokploy.");
}

console.log("🔌 Connexion DB OK !");

const pool = new Pool({
    connectionString: connectionString,
});

export const db = drizzle(pool, {schema});