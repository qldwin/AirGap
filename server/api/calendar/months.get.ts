// server/api/calendar/years.get.ts
import { getAvailableMonths } from '~/server/services/calendar.service'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    try {
        const months = await getAvailableMonths(user.id)

        return {
            success: true,
            months
        }
    } catch (error) {
        console.error('Erreur récupération mois disponibles:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer les mois disponibles'
        })
    }


})