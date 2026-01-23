import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
import { categories } from '~/drizzle/schema/categories'
import { assoTransactionsCategories } from '~/drizzle/schema/assoTransactionsCategories'
import { importRules } from '~/drizzle/schema/importRules'
import { or, isNull, and, desc, eq } from 'drizzle-orm'

/** * Fonctions utilitaires privées pour réduire la complexité
 */

const getTransactionSignature = (date: Date, amount: number, description: string) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return `${dateStr}_${amount}_${description.trim()}`;
};

const findCategoryByRules = (description: string, rules: any[]) => {
    const lowDesc = description.toLowerCase();
    const rule = rules.find(r => lowDesc.includes(r.keyword.toLowerCase()));
    return rule ? rule.categoryId : null;
};

const resolveCategory = async (tx: any, t: any, typeId: number, rules: any[], categoryMap: Map<string, number>) => {
    // 1. Choix manuel de l'utilisateur
    if (t.selectedCategoryId) return Number(t.selectedCategoryId);

    // 2. Matching par nom textuel (CSV)
    if (t.categoryName?.trim()) {
        const key = t.categoryName.toLowerCase().trim();
        if (categoryMap.has(key)) return categoryMap.get(key)!;

        const [newCat] = await tx.insert(categories).values({
            name: t.categoryName.trim(),
            typeId,
            isDefault: false
        }).returning({ id: categories.id });

        categoryMap.set(key, newCat.id);
        return newCat.id;
    }

    // 3. Application des règles automatiques
    return findCategoryByRules(t.description || '', rules);
};

/**
 * Fonctions de Service Exportées
 */

export const getTransactionById = async (transactionId: number, userId: number) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
        accountId: transactions.accountId,
        devise: transactions.devise,
        categoryName: categories.name,
        categoryId: categories.id
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(assoTransactionsCategories.categoryId, categories.id))
        .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
        .limit(1);

    const row = rows[0];
    return row ? {
        ...row,
        category: row.categoryName ? { id: row.categoryId, name: row.categoryName } : null
    } : null;
}

export const deleteTransaction = async (transactionId: number, userId: number) => {
    return await db.transaction(async (tx) => {
        await tx.delete(assoTransactionsCategories).where(eq(assoTransactionsCategories.transactionId, transactionId));
        const [deleted] = await tx.delete(transactions)
            .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
            .returning();
        return deleted;
    });
}

export const updateTransaction = async (
    transactionId: number,
    userId: number,
    updateData: Partial<typeof transactions.$inferInsert>,
    newCategoryId?: number | null
) => {
    return await db.transaction(async (tx) => {
        const [updated] = await tx.update(transactions)
            .set({ ...updateData, updatedAt: new Date() })
            .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
            .returning();

        if (newCategoryId !== undefined) {
            await tx.delete(assoTransactionsCategories).where(eq(assoTransactionsCategories.transactionId, transactionId));
            if (newCategoryId) {
                await tx.insert(assoTransactionsCategories).values({ transactionId, categoryId: newCategoryId });
            }
        }
        return updated;
    });
}

export const getUserTransactions = async (userId: number) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
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
        category: row.categoryName ? { id: row.categoryId, name: row.categoryName } : null
    }));
}

export const createTransaction = async (data: typeof transactions.$inferInsert, categoryId?: number) => {
    return await db.transaction(async (tx) => {
        const [newTx] = await tx.insert(transactions).values(data).returning();
        if (categoryId) {
            await tx.insert(assoTransactionsCategories).values({ transactionId: newTx.id, categoryId });
        }
        return newTx;
    });
}

export const importTransactionsBulk = async (userId: number, rawTransactions: any[]) => {
    return await db.transaction(async (tx) => {
        const now = new Date();

        // 1. Préparation (Règles, Catégories, Signatures anti-doublon)
        const rules = (await tx.select().from(importRules).where(or(eq(importRules.userId, userId), isNull(importRules.userId))))
            .sort((a, b) => b.keyword.length - a.keyword.length);

        const categoryMap = new Map((await tx.select().from(categories)).map(c => [c.name.toLowerCase().trim(), c.id]));
        const existing = await tx.select().from(transactions).where(eq(transactions.userId, userId));
        const signatures = new Set(existing.map(t => getTransactionSignature(new Date(t.date), Number(t.amount), t.description)));

        let importedCount = 0;

        for (const t of rawTransactions) {
            const amount = Math.abs(Number(t.amount));
            const dateObj = new Date(t.date);
            const typeId = Number(t.amount) >= 0 ? 1 : 2;

            if (signatures.has(getTransactionSignature(dateObj, amount, t.description))) continue;

            const matchedId = await resolveCategory(tx, t, typeId, rules, categoryMap);

            const [newTx] = await tx.insert(transactions).values({
                userId,
                accountId: t.accountId || 1,
                description: t.description?.trim() || 'Import CSV',
                amount: String(amount),
                date: dateObj,
                typeTransactionsId: typeId,
                devise: 'EUR',
                recurrence: 'Aucune',
                startRecurrence: dateObj,
                updatedAt: now
            }).returning({ id: transactions.id });

            if (matchedId) {
                await tx.insert(assoTransactionsCategories).values({ transactionId: newTx.id, categoryId: matchedId });
            }
            importedCount++;
        }
        return importedCount;
    });
};