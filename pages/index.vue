<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto px-4">

      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Tableau de bord</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 p-4 rounded-lg shadow-sm border">
          <h3 class="text-lg font-medium text-primary-700 dark:text-primary-300 mb-1">Solde total</h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <p v-else class="text-3xl font-bold text-primary-800 dark:text-primary-200">{{ formatCurrency(balance) }}</p>

          <div v-if="!loading && balanceChange !== null" class="mt-2 text-sm" :class="balanceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            <span>{{ formatPercent(balanceChange) }}</span> vs mois dernier
          </div>
        </div>

        <div class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">Revenus (ce mois)</h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <p v-else class="text-3xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(monthlyIncome) }}</p>

          <div v-if="!loading && incomeChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="incomeChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatPercent(incomeChange) }}
            </span> vs mois dernier
          </div>
        </div>

        <div class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">Dépenses (ce mois)</h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <p v-else class="text-3xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(monthlyExpense) }}</p>

          <div v-if="!loading && expenseChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="expenseChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatPercent(expenseChange) }}
            </span> vs mois dernier
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"/>
      </div>

      <reportsStats v-else :transactions="transactions" />

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

definePageMeta({
  middleware: ['authenticated']
});

const { data: apiResult, pending: loading } = await useFetch('/api/transactions', {
  key: 'dashboard-data',
  lazy: false
});

const transactions = computed(() => {
  const list = apiResult.value?.transactions || [];

  // 1. Formatage simple
  const formatted = list.map(t => ({
    ...t,
    amount: Number(t.amount),
    typeTransactionsId: Number(t.typeTransactionsId),
    typeStr: Number(t.typeTransactionsId) === 1 ? 'income' : 'expense',
    dateObj: new Date(t.date),
    categoryName: t.category?.name || 'Aucune'
  }));

  // 2. TRI DU PLUS VIEUX AU PLUS RÉCENT (Impératif pour le calcul du solde)
  const chronological = formatted.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // 3. CALCUL DU SOLDE CUMULÉ
  let currentRunningBalance = 0;

  const withCumulative = chronological.map(t => {
    const change = t.typeTransactionsId === 1 ? t.amount : -t.amount;
    currentRunningBalance += change;

    return {
      ...t,
      cumulativeBalance: currentRunningBalance // C'est cette valeur que le graphique attend !
    };
  });

  // 4. On renvoie inversé (Récent en premier) car souvent préféré pour les listes
  // Mais le graphique saura le retrier.
  return [...withCumulative].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
});

// --- KPI CALCULATIONS ---
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const getPreviousMonth = (year, month) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
const { year: prevYear, month: prevMonth } = getPreviousMonth(currentYear, currentMonth);

const balance = computed(() => transactions.value.reduce((total, t) => total + (t.typeStr === 'income' ? t.amount : -t.amount), 0));
const monthlyIncome = computed(() => transactions.value.filter(t => t.typeStr === 'income' && t.dateObj.getMonth() === currentMonth && t.dateObj.getFullYear() === currentYear).reduce((sum, t) => sum + t.amount, 0));
const monthlyExpense = computed(() => transactions.value.filter(t => t.typeStr === 'expense' && t.dateObj.getMonth() === currentMonth && t.dateObj.getFullYear() === currentYear).reduce((sum, t) => sum + t.amount, 0));

const prevIncome = computed(() => transactions.value.filter(t => t.typeStr === 'income' && t.dateObj.getMonth() === prevMonth && t.dateObj.getFullYear() === prevYear).reduce((sum, t) => sum + t.amount, 0));
const prevExpense = computed(() => transactions.value.filter(t => t.typeStr === 'expense' && t.dateObj.getMonth() === prevMonth && t.dateObj.getFullYear() === prevYear).reduce((sum, t) => sum + t.amount, 0));

const incomeChange = computed(() => prevIncome.value === 0 ? null : ((monthlyIncome.value - prevIncome.value) / Math.abs(prevIncome.value)) * 100);
const expenseChange = computed(() => prevExpense.value === 0 ? null : ((monthlyExpense.value - prevExpense.value) / Math.abs(prevExpense.value)) * 100);
const balanceChange = computed(() => {
  const curBal = monthlyIncome.value - monthlyExpense.value;
  const prevBal = prevIncome.value - prevExpense.value;
  return prevBal === 0 ? null : ((curBal - prevBal) / Math.abs(prevBal)) * 100;
});

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
const formatPercent = (val) => {
  if (val === null) return '-';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};
</script>