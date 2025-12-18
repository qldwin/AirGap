// server/services/transaction.service.ts
import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
import { categories } from '~/drizzle/schema/categories' // IMPORTANT : Ajouter cet import
import { assoTransactionsCategories } from "~/drizzle/schema/assoTransactionsCategories" // Vérifiez le chemin, parfois c'est assoTransactionsCategories.ts
import { and, desc, eq } from 'drizzle-orm'

export const getTransactionById = async (transactionId: number, userId: number) => {
    return await db.query.transactions.findFirst({
        where: and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
        ),
    })
}

export const deleteTransaction = async (transactionId: number, userId: number) => {
    // Note : Si vous avez des clés étrangères en cascade, ça supprimera aussi la liaison.
    // Sinon, idéalement, il faudrait supprimer la ligne dans assoTransactionsCategories avant.
    const deletedRows = await db.delete(transactions)
        .where(and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
        ))
        .returning();

    return deletedRows[0];
}

export const updateTransaction = async (
    transactionId: number,
    userId: number,
    updateData: Partial<typeof transactions.$inferInsert>
) => {
    const updatedRows = await db.update(transactions)
        .set({
            ...updateData,
            updatedAt: new Date()
        })
        .where(and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
        ))
        .returning();

    return updatedRows[0];
}

// --- C'EST ICI QUE TOUT CHANGE ---
export const getUserTransactions = async (userId: number) => {
    // On utilise .select() pour faire des jointures manuelles précises
    const rows = await db.select({
        // Champs de la transaction
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId, // Important pour la couleur (Revenu/Dépense)

        // On récupère le NOM de la catégorie
        categoryName: categories.name
    })
        .from(transactions)
        // 1ère Jointure : Transaction -> Table de liaison
        .leftJoin(
            assoTransactionsCategories,
            eq(transactions.id, assoTransactionsCategories.transactionId)
        )
        // 2ème Jointure : Table de liaison -> Catégorie
        .leftJoin(
            categories,
            eq(assoTransactionsCategories.categoryId, categories.id)
        )
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date));

    // TRANSFORMATION DES DONNÉES
    // On reformate pour que le Frontend reçoive l'objet { category: { name: ... } } qu'il attend
    return rows.map(row => ({
        id: row.id,
        amount: row.amount,
        description: row.description,
        date: row.date,
        typeTransactionsId: row.typeTransactionsId,
        // On crée l'objet category si un nom a été trouvé
        category: row.categoryName ? { name: row.categoryName } : null
    }));
}

export const createTransaction = async (
    data: typeof transactions.$inferInsert,
    categoryId?: number
) => {
    return await db.transaction(async (tx) => {
        // 1. Insérer la Transaction
        const [newTransaction] = await tx.insert(transactions)
            .values(data)
            .returning();

        // 2. Si une catégorie est fournie, on crée le lien
        if (categoryId) {
            await tx.insert(assoTransactionsCategories).values({
                transactionId: newTransaction.id,
                categoryId: categoryId
            });
        }

        return newTransaction;
    });
}