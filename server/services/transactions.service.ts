import { db } from '~/server/db'
import { transactions } from '~/drizzle/schema/transactions'
import { categories } from '~/drizzle/schema/categories'
import { typeTransactions } from '~/drizzle/schema/typeTransactions'
import { assoTransactionsCategories } from '~/drizzle/schema/assoTransactionsCategories'
import { importRules } from '~/drizzle/schema/importRules'
import { or, isNull, and, desc, eq } from 'drizzle-orm'
import { encryptText, decryptText } from '~/server/utils/crypto'

type MyTx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type ImportContext = Awaited<ReturnType<typeof fetchImportContext>>;
type TransactionSelect = typeof transactions.$inferSelect;
type RuleSelect = typeof importRules.$inferSelect;
type CategorySelect = typeof categories.$inferSelect;
type TypeTxSelect = typeof typeTransactions.$inferSelect;

interface RawTransaction {
    amount: string | number;
    date: string | Date;
    description?: string;
    categoryName?: string;
    selectedCategoryId?: string;
    accountId?: string;
    typeTransactionsId?: string;
}

/**
 * Fonctions utilitaires privées
 */

const getTransactionSignature = (date: Date, amount: number, description: string) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return `${dateStr}_${amount}_${description.trim()}`;
};

const findCategoryByRules = (description: string, rules: RuleSelect[]) => {
    const lowDesc = description.toLowerCase();
    const rule = rules.find(r => lowDesc.includes(r.keyword.toLowerCase()));
    return rule ? rule.categoryId : undefined;
};

const resolveCategory = async (
    tx: MyTx,
    t: RawTransaction,
    typeId: string,
    rules: RuleSelect[],
    categoryMap: Map<string, string>
) => {
    if (t.selectedCategoryId) return t.selectedCategoryId;
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
    return findCategoryByRules(t.description || '', rules);
};
/**
 * Fonctions de Service Exportées
 */

export const getTransactionById = async (transactionId: string, userId: string) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
        accountId: transactions.accountId,
        devise: transactions.devise,
        categoryName: categories.name,
        categoryId: categories.id,
        typeLabel: typeTransactions.type
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(assoTransactionsCategories.categoryId, categories.id))
        .leftJoin(typeTransactions, eq(transactions.typeTransactionsId, typeTransactions.id))
        .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
        .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
        ...row,
        description: decryptText(row.description || ''),
        category: row.categoryName ? { id: row.categoryId, name: row.categoryName } : null
    };
}

export const deleteTransaction = async (transactionId: string, userId: string) => {
    return await db.transaction(async (tx) => {
        await tx.delete(assoTransactionsCategories).where(eq(assoTransactionsCategories.transactionId, transactionId));
        const [deleted] = await tx.delete(transactions)
            .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
            .returning();
        return deleted;
    });
}

export const updateTransaction = async (
    transactionId: string,
    userId: string,
    updateData: Partial<typeof transactions.$inferInsert>,
    newCategoryId?: string | null
) => {
    const finalUpdateData = { ...updateData };
    if (finalUpdateData.description) {
        finalUpdateData.description = encryptText(finalUpdateData.description);
    }

    return await db.transaction(async (tx) => {
        const [updated] = await tx.update(transactions)
            .set({ ...finalUpdateData, updatedAt: new Date() })
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

export const getUserTransactions = async (userId: string) => {
    const rows = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        typeTransactionsId: transactions.typeTransactionsId,
        categoryName: categories.name,
        categoryId: categories.id,
        typeLabel: typeTransactions.type
    })
        .from(transactions)
        .leftJoin(assoTransactionsCategories, eq(transactions.id, assoTransactionsCategories.transactionId))
        .leftJoin(categories, eq(assoTransactionsCategories.categoryId, categories.id))
        .leftJoin(typeTransactions, eq(transactions.typeTransactionsId, typeTransactions.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date));

    return rows.map(row => ({
        ...row,
        description: decryptText(row.description || ''),
        category: row.categoryName ? { id: row.categoryId, name: row.categoryName } : null
    }));
}

export const createTransaction = async (data: typeof transactions.$inferInsert, categoryId?: string) => {
    const encryptedData = {
        ...data,
        description: data.description ? encryptText(data.description) : ''
    };

    return await db.transaction(async (tx) => {
        const [newTx] = await tx.insert(transactions).values(encryptedData).returning();
        if (categoryId) {
            await tx.insert(assoTransactionsCategories).values({ transactionId: newTx.id, categoryId });
        }
        return newTx;
    });
}

type TransactionInsert = typeof transactions.$inferInsert;
type AssociationInsert = typeof assoTransactionsCategories.$inferInsert;

export async function fetchImportContext(tx: MyTx, userId: string) {
    const now = new Date();
    const rules = (await tx.select().from(importRules).where(or(eq(importRules.userId, userId), isNull(importRules.userId))))
        .sort((a: RuleSelect, b: RuleSelect) => b.keyword.length - a.keyword.length);
    const categoryMap = new Map<string, string>((await tx.select().from(categories)).map((c: CategorySelect) => [c.name.toLowerCase().trim(), c.id]));
    const allTypes = await tx.select().from(typeTransactions);
    const incomeTypeId = allTypes.find((t: TypeTxSelect) => t.type === 'revenu')?.id;
    const expenseTypeId = allTypes.find((t: TypeTxSelect) => t.type === 'depense')?.id;

    if (!incomeTypeId || !expenseTypeId) {
        throw new Error("Impossible de trouver les types 'revenu' et 'depense' dans la base de données.");
    }
    return { now, rules, categoryMap, incomeTypeId, expenseTypeId };
}

export async function getDuplicateDetector(tx: MyTx, userId: string)
    : Promise<Set<string>> {
    const existing = await tx.select().from(transactions).where(eq(transactions.userId, userId));
    return new Set<string>(existing.map((t: TransactionSelect) =>
        getTransactionSignature(new Date(t.date), Number(t.amount), decryptText(t.description || '').toLowerCase().trim())
    ));
}

export async function executeBulkInsert(tx: MyTx, transactionsToInsert: TransactionInsert[], associatedCategories: (string | undefined)[]) {
    const BATCH_SIZE = 100;

    for (let i = 0; i < transactionsToInsert.length; i += BATCH_SIZE) {
        const txBatch = transactionsToInsert.slice(i, i + BATCH_SIZE);
        const catBatch = associatedCategories.slice(i, i + BATCH_SIZE);

        if (txBatch.length > 0) {
            if (txBatch.some(t => !t.accountId)) {
                throw new Error("Erreur import: accountId (UUID) manquant pour certaines transactions.");
            }

            const insertedRows = await tx.insert(transactions)
                .values(txBatch)
                .returning({ id: transactions.id });

            const associationRows: AssociationInsert[] = [];

            insertedRows.forEach((row: { id: string }, index: number) => {
                const catId = catBatch[index];
                if (catId) {
                    associationRows.push({
                        transactionId: row.id,
                        categoryId: catId
                    });
                }
            });

            if (associationRows.length > 0) {
                await tx.insert(assoTransactionsCategories).values(associationRows);
            }
        }
    }
}

export async function prepareTransactionRow(t: RawTransaction, signatures: Set<string>, context: ImportContext, tx: MyTx, userId: string, targetAccountId: string):
    Promise<{ transaction: TransactionInsert; matchedId: string | undefined } | null> {

    const { incomeTypeId, rules, categoryMap, expenseTypeId, now } = context;

    const amount = Math.abs(Number(t.amount));
    const dateObj = new Date(t.date);
    const cleanDesc = t.description?.trim() || 'Import CSV';


    if (signatures.has(getTransactionSignature(dateObj, amount, cleanDesc.toLowerCase()))) {
        return null;
    }

    const typeId = t.typeTransactionsId || (Number(t.amount) >= 0 ? incomeTypeId : expenseTypeId);

    let matchedId = await resolveCategory(tx, t, typeId, rules, categoryMap);

    if (!matchedId) {
        matchedId = categoryMap.get('non catégorisé') || categoryMap.get('non categorise');
    }

    const transaction = {
        userId,
        accountId: targetAccountId,
        description: encryptText(cleanDesc),
        amount: String(amount),
        date: dateObj,
        typeTransactionsId: typeId,
        devise: 'EUR',
        recurrence: 'Aucune',
        startRecurrence: dateObj,
        updatedAt: now
    };

    return { transaction, matchedId };
}

export const importTransactionsBulk = async (userId: string, rawTransactions: RawTransaction[], targetAccountId: string) => {
    return await db.transaction(async (tx) => {

        let importedCount = 0;

        const context = await fetchImportContext(tx, userId);
        const signatures = await getDuplicateDetector(tx, userId);
        const transactionsToInsert: TransactionInsert[] = [];
        const associatedCategories: (string | undefined)[] = [];

        for (const t of rawTransactions ) {

            const prepared = await prepareTransactionRow(t, signatures, context, tx, userId, targetAccountId);
            if (!prepared) continue;

            transactionsToInsert.push(prepared.transaction)
            associatedCategories.push(prepared.matchedId)

            importedCount++;
        }
        await executeBulkInsert(tx, transactionsToInsert, associatedCategories);
        return importedCount;
    });
};