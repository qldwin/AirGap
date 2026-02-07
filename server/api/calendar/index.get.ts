// server/api/calendar/index.get.ts
import {getUserTransactionsByYear} from "~/server/services/calendar.service";

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const { year , month, quarter } = getQuery(event)

    if (!year || Number.isNaN(Number(year))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Année invalide'
        })
    }

    try {
        const result = await getUserTransactionsByYear(user.id, Number(year), month ? Number(month) : undefined, quarter ? Number(quarter) : undefined);

        return {
            success: true,
            initialBalance: result.initialBalance,
            transactions: result.transactions
        }
    } catch (error) {
        console.error('Erreur récupération transactions:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer vos transactions pour cette année'
        })
    }
})