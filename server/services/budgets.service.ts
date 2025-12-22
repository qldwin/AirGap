// server/services/budgets.service.ts
import { db } from '~/server/db'
import { budgets } from '~/drizzle/schema/budgets'
import { categories } from '~/drizzle/schema/categories'
import { assoBudgetCategories } from '~/drizzle/schema/assoBudgetCategories'
import { and, desc, eq } from 'drizzle-orm'

// 1. RÉCUPÉRER LES BUDGETS (Avec agrégation des catégories)
export const getUserBudgets = async (userId: number) => {
    // A. Données brutes avec jointures
    const rows = await db.select({
        id: budgets.id,
        name: budgets.name,
        amount: budgets.amount,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        accountId: budgets.accountId,

        // Infos Catégorie
        categoryName: categories.name,
        categoryId: categories.id,
    })
        .from(budgets)
        .leftJoin(assoBudgetCategories, eq(budgets.id, assoBudgetCategories.budgetId))
        .leftJoin(categories, eq(assoBudgetCategories.categoryId, categories.id))
        .where(eq(budgets.userId, userId))
        .orderBy(desc(budgets.startDate));

    // B. Agrégation (On regroupe les lignes par Budget ID)
    const budgetsMap = new Map();

    for (const row of rows) {
        if (!budgetsMap.has(row.id)) {
            budgetsMap.set(row.id, {
                id: row.id,
                name: row.name,
                amount: row.amount,
                startDate: row.startDate,
                endDate: row.endDate,
                accountId: row.accountId,
                categories: [] // On prépare le tableau
            });
        }

        if (row.categoryId) {
            const budget = budgetsMap.get(row.id);
            if (!budget.categories.some((c: any) => c.id === row.categoryId)) {
                budget.categories.push({
                    id: row.categoryId,
                    name: row.categoryName,
                });
            }
        }
    }

    return Array.from(budgetsMap.values());
}

// 2. CRÉER UN BUDGET
export const createBudget = async (
    data: typeof budgets.$inferInsert,
    categoryIds?: number[]
) => {
    return await db.transaction(async (tx) => {
        // A. Création du budget principal
        const [newBudget] = await tx.insert(budgets)
            .values(data)
            .returning();

        // B. Création des liaisons (si des catégories sont sélectionnées)
        if (categoryIds && categoryIds.length > 0) {
            const linksToCreate = categoryIds.map(catId => ({
                budgetId: newBudget.id,
                categoryId: catId
            }));

            await tx.insert(assoBudgetCategories).values(linksToCreate);
        }

        // --- C. CORRECTION POUR L'AFFICHAGE IMMÉDIAT ---
        const linkedCategories = await tx.select({
            id: categories.id,
            name: categories.name
        })
            .from(categories)
            .innerJoin(assoBudgetCategories, eq(categories.id, assoBudgetCategories.categoryId))
            .where(eq(assoBudgetCategories.budgetId, newBudget.id));

        // On retourne l'objet fusionné
        return {
            ...newBudget,
            categories: linkedCategories
        };
    });
}

// 3. MODIFIER UN BUDGET
export const updateBudget = async (
    budgetId: number,
    userId: number,
    updateData: Partial<typeof budgets.$inferInsert>,
    newCategoryIds?: number[]
) => {
    return await db.transaction(async (tx) => {
        let updatedBudget = null;

        // A. Update Budget Table
        if (Object.keys(updateData).length > 0) {
            const result = await tx.update(budgets)
                .set(updateData)
                .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
                .returning();
            updatedBudget = result[0];
        } else {
            const result = await tx.select().from(budgets)
                .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
            updatedBudget = result[0];
        }

        if (!updatedBudget) return null;

        // B. Update Categories
        if (newCategoryIds !== undefined) {
            await tx.delete(assoBudgetCategories)
                .where(eq(assoBudgetCategories.budgetId, budgetId));

            if (newCategoryIds.length > 0) {
                await tx.insert(assoBudgetCategories).values(
                    newCategoryIds.map(catId => ({
                        budgetId: budgetId,
                        categoryId: catId
                    }))
                );
            }
        }

        // --- C. CORRECTION POUR L'AFFICHAGE APRÈS UPDATE ---
        const linkedCategories = await tx.select({
            id: categories.id,
            name: categories.name
        })
            .from(categories)
            .innerJoin(assoBudgetCategories, eq(categories.id, assoBudgetCategories.categoryId))
            .where(eq(assoBudgetCategories.budgetId, budgetId));

        return {
            ...updatedBudget,
            categories: linkedCategories
        };
    });
}

// 4. SUPPRIMER UN BUDGET
export const deleteBudget = async (budgetId: number, userId: number) => {
    return await db.transaction(async (tx) => {
        await tx.delete(assoBudgetCategories)
            .where(eq(assoBudgetCategories.budgetId, budgetId));

        const [deletedRow] = await tx.delete(budgets)
            .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
            .returning();

        return deletedRow;
    });
}

// 5. GET BY ID (Optionnel, pour le détail)
export const getBudgetById = async (budgetId: number, userId: number) => {
    const result = await getUserBudgets(userId);
    return result.find(b => b.id === budgetId) || null;
}