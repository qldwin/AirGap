import {relations} from "drizzle-orm";
import {users} from "./users";
import {accounts} from "./accounts";
import {transactions} from "./transactions";
import {budgets} from "./budgets";
import {historyTransacts} from "./historyTransacts";
import {categories} from "./categories";
import {budgetCategories} from "./budgetCategories";
import {accountCategories} from "./accountCategories";

export const userRelations = relations(users, ({many}) => ({
    accounts: many(accounts),
    budgets: many(budgets),
    transactions: many(transactions),

}));

export const accountRelations = relations(accounts, ({one, many}) => ({
    user: one(users, {fields: [accounts.userId], references: [users.id]}),
    categories: many(accountCategories),
    historyTransacts: many(historyTransacts),
}));

export const historyTransactRelations = relations(historyTransacts, ({one}) => ({
    account: one(accounts, {fields: [historyTransacts.account_id], references: [accounts.id]}),
}));

export const budgetRelations = relations(budgets, ({one, many}) => ({
    user: one(users, {fields: [budgets.userId], references: [users.id]}),
    categories: many(budgetCategories),
}));

export const categoryRelations = relations(categories, ({many}) => ({
    accounts: many(accountCategories),
    budgets: many(budgetCategories),
}));

export const budgetCategoryRelations = relations(budgetCategories, ({one}) => ({
    budget: one(budgets, {fields: [budgetCategories.budgetId], references: [budgets.id]}),
    category: one(categories, {fields: [budgetCategories.categoryId], references: [categories.id]}),
}));

export const accountCategoryRelations = relations(accountCategories, ({one}) => ({
    account: one(accounts, {fields: [accountCategories.accountId], references: [accounts.id]}),
    category: one(categories, {fields: [accountCategories.categoryId], references: [categories.id]}),
}));