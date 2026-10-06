import {and, eq, gte, isNull, lte, ne, or, sql} from 'drizzle-orm'
import {assoTransactionsCategories, transactions} from "~~/drizzle/schema";
import {db} from "#server/db";
import {computeNextOccurrenceDate, MAX_CATCHUP_OCCURRENCES, NO_RECURRENCE} from "#server/utils/recurrence.utils.ts";

export type RecurrenceRunResult = {
    templatesFound: number;
    transactionsGenerated: number;
    errors: { templateId: string; message: string }[];
};

/**
 * Traite toutes les transactions récurrentes dont la prochaine occurrence
 * est due, et génère les transactions correspondantes.
 *
 * Idempotent et safe en multi-instance : chaque template est verrouillé
 * (`FOR UPDATE SKIP LOCKED`) le temps de son traitement, donc si deux
 * instances du serveur lancent le job en même temps, elles ne traiteront
 * jamais le même template simultanément.
 */
export async function processRecurrences(now: Date = new Date()): Promise<RecurrenceRunResult> {
    const dueTemplates = await db.select()
        .from(transactions)
        .where(and(
            ne(transactions.recurrence, NO_RECURRENCE),
            lte(transactions.nextOccurrenceDate, now),
            or(
                isNull(transactions.endRecurrence),
                gte(transactions.endRecurrence, transactions.nextOccurrenceDate)
            )
        ));

    const result: RecurrenceRunResult = {
        templatesFound: dueTemplates.length,
        transactionsGenerated: 0,
        errors: []
    };

    for (const template of dueTemplates) {
        try {
            const generatedForThisTemplate = await db.transaction(async (tx) => {
                const locked = await tx.execute(sql`
                    SELECT id FROM transactions WHERE id = ${template.id} FOR UPDATE SKIP LOCKED
                `);
                if (locked.rows.length === 0) return 0;

                const [assoc] = await tx.select({categoryId: assoTransactionsCategories.categoryId})
                    .from(assoTransactionsCategories)
                    .where(eq(assoTransactionsCategories.transactionId, template.id))
                    .limit(1);

                let cursor = new Date(template.nextOccurrenceDate);
                let count = 0;

                while (cursor <= now && count < MAX_CATCHUP_OCCURRENCES) {
                    if (template.endRecurrence && cursor > new Date(template.endRecurrence)) break;

                    const [inserted] = await tx.insert(transactions).values({
                        userId: template.userId,
                        accountId: template.accountId,
                        senderRecipientId: template.senderRecipientId,
                        typeTransaction: template.typeTransaction,
                        description: template.description,
                        devise: template.devise,
                        amount: template.amount,
                        recurrence: NO_RECURRENCE,
                        startRecurrence: cursor,
                        endRecurrence: null,
                        date: cursor,
                    }).returning({id: transactions.id});

                    if (assoc?.categoryId && inserted) {
                        await tx.insert(assoTransactionsCategories).values({
                            transactionId: inserted.id,
                            categoryId: assoc.categoryId
                        });
                    }

                    count++;
                    cursor = computeNextOccurrenceDate(cursor, template.recurrence);
                }

                if (count > 0) {
                    await tx.update(transactions)
                        .set({nextOccurrenceDate: cursor, updatedAt: new Date()})
                        .where(eq(transactions.id, template.id));
                }

                return count;
            });

            result.transactionsGenerated += generatedForThisTemplate;
        } catch (err: any) {
            result.errors.push({templateId: template.id, message: err.message ?? String(err)});
        }
    }

    return result;
}