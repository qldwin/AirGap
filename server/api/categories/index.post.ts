import { db } from '~/server/db';
import { categories } from '~/drizzle/schema/categories';

export default defineEventHandler(async (event) => {
    // 1. Lire le corps de la requête
    const body = await readBody(event);

    // 2. Validation des champs obligatoires
    if (!body || !body.name || !body.typeId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Le nom et le type (Revenu/Dépense) sont obligatoires.'
        });
    }

    try {
        // 3. Insertion dans la base de données
        // .values() accepte un objet ou un tableau d'objets
        // .returning() nous renvoie immédiatement la catégorie créée
        const [newCategory] = await db.insert(categories)
            .values({
                name: body.name,
                typeId: Number(body.typeId), // On s'assure que c'est un chiffre

                // Par défaut, une catégorie créée par l'utilisateur n'est pas "par défaut" (système)
                // Sauf si précisé autrement dans le body
                isDefault: body.isDefault ?? false,
            })
            .returning();

        // 4. Succès
        return {
            category: newCategory
        };

    } catch (error: any) {
        // --- GESTION DES ERREURS BDD ---

        // Erreur 23505 : Unique Violation (Si le nom existe déjà)
        if (error.code === '23505') {
            throw createError({
                statusCode: 409, // Conflict
                statusMessage: `La catégorie "${body.name}" existe déjà.`
            });
        }

        // Erreur 23503 : Foreign Key Violation (Si le typeId envoyé n'est pas 1 ou 2)
        if (error.code === '23503') {
            throw createError({
                statusCode: 400,
                statusMessage: "Le type de catégorie (Revenu/Dépense) est invalide."
            });
        }

        // Erreur générique
        console.error('Erreur lors de la création de la catégorie:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur serveur lors de la création de la catégorie'
        });
    }
});