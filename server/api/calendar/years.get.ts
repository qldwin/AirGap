// server/api/calendar/years.get.ts

import { getAvailableYears } from '~/server/services/calendar.service'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    try {
        const years = await getAvailableYears(user.id)

        return {
            success: true,
            years
        }
    } catch (error) {
        console.error('Erreur récupération années disponibles:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer les années disponibles'
        })
    }
})