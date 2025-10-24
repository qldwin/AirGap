// server/api/user.patch.ts

import { defineEventHandler, readBody, createError } from 'h3'
import {eq} from 'drizzle-orm';
import {users} from "~/drizzle/schema";
import { db } from '~/server/db'
import bcrypt from 'bcrypt'

// ⚙️ Middleware d’auth — à adapter selon ton système
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { currentPassword, newPassword } = body

  // Exemple : récupération de l’ID utilisateur depuis ta session
  const userId = event.context.session?.data?.user?.id
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId))

  if (!user) {
    throw createError({ statusCode: 404, message: 'Utilisateur non trouvé' })
  }

  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) {
    throw createError({ statusCode: 400, message: 'Mot de passe actuel incorrect' })
  }

  if (!newPassword || newPassword.length < 8) {
    throw createError({ statusCode: 400, message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId))

  return { success: true, message: 'Mot de passe mis à jour avec succès' }
})
