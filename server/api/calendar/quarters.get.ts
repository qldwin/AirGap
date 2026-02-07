// server/api/calendar/quarters.get.ts
import { getAvailableQuarters} from '~/server/services/calendar.service'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    try {
        const quarters = await getAvailableQuarters(user.id)

        return {
            success: true,
            quarters
        }
    } catch (error) {
        console.error('Erreur récupération trimestres disponibles:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Impossible de récupérer les trimestres disponibles'
        })
    }
})