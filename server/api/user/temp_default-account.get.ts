// server/api/user/temp_default-account.get.ts
import { db } from '~/server/db'
import { accounts } from '~/drizzle/schema/accounts'
import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, user.id),
        columns: { id: true }
    })

    return {
        accountId: account?.id || null
    }
})