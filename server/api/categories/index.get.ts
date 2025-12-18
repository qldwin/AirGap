// server/api/categories/index.get.ts

import { asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { categories } from '~/drizzle/schema/categories';

export default defineEventHandler(async (event) => {
    try {
        // Récupération des paramètres (ex: ?typeId=1)
        const query = getQuery(event);
        const typeId = query.typeId;

        // On utilise db.select()... ou db.query...
        // Ici on utilise db.query pour profiter de l'API relationnelle de Drizzle
        const result = await db.query.categories.findMany({
            where: typeId ? eq(categories.typeId, Number(typeId)) : undefined,
            orderBy: [asc(categories.name)],
        });

        return {
            categories: result
        };

    } catch (error) {
        console.error('Erreur API Categories:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer les catégories'
        });
    }
});