// POST /api/budgets/create
import { db } from '~/server/db';
import {budgets} from "~/drizzle/schema/budgets";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Créer le budget
  const [newBudget] = await db.insert(budgets)
    .values({
      name: body.name,
      amount: body.amount,
      userId: body.userId,
      categoryId: body.categoryId,
      startDate: body.startDate,
      endDate: body.endDate
    })
    .returning();

  return {budget: newBudget};
});
