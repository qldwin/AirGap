// POST /api/budgets/create
import { db } from '~/server/db';
import { budgets, budgetCategories } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Créer le budget
  const [newBudget] = await db.insert(budgets)
    .values({
      name: body.name,
      amount: body.amount,
      userId: body.userId,
      startDate: body.startDate,
      endDate: body.endDate
    })
    .returning();

  // Créer l'association avec la catégorie choisie
  if (body.categoryId) {
    await db.insert(budgetCategories).values({
      budgetId: newBudget.id,
      categoryId: body.categoryId
    });
  }

  return { budget: newBudget };
});
