// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../drizzle/schema/index';

const pool = new Pool({
    host: 'localhost',      
    port: 5432,             
    user: 'finantia',      
    password: 'example',    
    database: 'finantia',   
});

export const db = drizzle(pool, { schema });