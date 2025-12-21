import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
import { categories } from '~/drizzle/schema/categories'
import { assoTransactionsCategories } from '~/drizzle/schema/assoTransactionsCategories'
import { and, desc, eq } from 'drizzle-orm'

// 1. RÉCUPÉRATION D'UNE SEULE TRANSACTION (GET /:id)
export const getTransactionById = async (transactionId: number, userId: number) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
        accountId: transactions.accountId, // Ajouté pour cohérence
        devise: transactions.devise,
        recurrence: transactions.recurrence,
        startRecurrence: transactions.startRecurrence,
        endRecurrence: transactions.endRecurrence,

        categoryName: categories.name,
        categoryId: categories.id
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(assoTransactionsCategories.categoryId, categories.id))
        .where(and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
        ))
        .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
        ...row,
        category: row.categoryName
            ? { id: row.categoryId, name: row.categoryName }
            : null
    };
}

// 2. SUPPRESSION (DELETE /:id)
export const deleteTransaction = async (transactionId: number, userId: number) => {
    return await db.transaction(async (tx) => {
        // A. Supprimer d'abord le lien dans la table d'association
        await tx.delete(assoTransactionsCategories)
            .where(eq(assoTransactionsCategories.transactionId, transactionId));

        // B. Supprimer la transaction (Vérification userId pour sécurité)
        const [deletedTransaction] = await tx.delete(transactions)
            .where(and(
                eq(transactions.id, transactionId),
                eq(transactions.userId, userId)
            ))
            .returning();

        return deletedTransaction;
    });
}

// 3. MODIFICATION (PATCH /:id)
export const updateTransaction = async (
    transactionId: number,
    userId: number,
    updateData: Partial<typeof transactions.$inferInsert>,
    newCategoryId?: number | null
) => {
    return await db.transaction(async (tx) => {
        // A. Mise à jour de la transaction
        const [updatedTransaction] = await tx.update(transactions)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(and(
                eq(transactions.id, transactionId),
                eq(transactions.userId, userId)
            ))
            .returning();

        // B. Mise à jour de la catégorie (si argument fourni)
        if (newCategoryId !== undefined) {
            // 1. Nettoyage de l'ancienne catégorie
            await tx.delete(assoTransactionsCategories)
                .where(eq(assoTransactionsCategories.transactionId, transactionId));

            // 2. Insertion de la nouvelle (si non nulle)
            if (newCategoryId) {
                await tx.insert(assoTransactionsCategories).values({
                    transactionId: transactionId,
                    categoryId: newCategoryId
                });
            }
        }

        return updatedTransaction;
    });
}

// 4. RÉCUPÉRATION DE LA LISTE (GET /)
export const getUserTransactions = async (userId: number) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
        accountId: transactions.accountId, // Ajouté pour cohérence
        devise: transactions.devise,

        categoryName: categories.name,
        categoryId: categories.id
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(assoTransactionsCategories.categoryId, categories.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date));

    return rows.map(row => ({
        ...row,
        category: row.categoryName
            ? { id: row.categoryId, name: row.categoryName }
            : null
    }));
}

// 5. CRÉATION (POST /)
export const createTransaction = async (
    data: typeof transactions.$inferInsert,
    categoryId?: number
) => {
    return await db.transaction(async (tx) => {
        // A. Insérer transaction
        const [newTransaction] = await tx.insert(transactions)
            .values(data)
            .returning();

        // B. Lier la catégorie si fournie
        if (categoryId) {
            await tx.insert(assoTransactionsCategories).values({
                transactionId: newTransaction.id,
                categoryId: categoryId
            });
        }

        return newTransaction;
    });
}