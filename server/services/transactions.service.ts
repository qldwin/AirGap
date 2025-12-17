// server/services/transaction.service.ts
import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
import {and, desc, eq} from 'drizzle-orm'
import {assoTransactionsCategories} from "~/drizzle/schema";

export const getTransactionById = async (transactionId: number, userId: number) => {
    return await db.query.transactions.findFirst({
        where: and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
        ),
        // Optionnel : Récupérer les infos liées (Catégorie, Compte, etc.)
        // Adaptez les noms ci-dessous selon vos relations définies dans le schema
        /*
        with: {
            category: true,
            account: true
        }
        */
    })
}

export const deleteTransaction = async (transactionId: number, userId: number) => {
    const deletedRows = await db.delete(transactions)
        .where(and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId) // Sécurité critique
        ))
        .returning(); // Renvoie les données supprimées

    // On retourne le premier élément (ou undefined si rien n'a été supprimé)
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

export const getUserTransactions = async (userId: number) => {
    return await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
        orderBy: [desc(transactions.date)],
    })
}

export const createTransaction = async (
    data: typeof transactions.$inferInsert,
    categoryId?: number // On ajoute l'ID de catégorie en optionnel
) => {
    // On ouvre une "Transaction BDD" (Atomicité)
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
                // Ajoutez ici d'autres champs si votre table asso en a besoin (ex: createdAt)
            });
        }

        return newTransaction;
    });
}