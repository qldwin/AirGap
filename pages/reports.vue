<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Rapports</h1>

        <button class="btn btn-outline text-sm px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" @click="navigateTo('/dashboard')">
          Retour au tableau de bord
        </button>
      </div>

      <div class="card mb-8 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Période :</span>
          <div class="flex gap-4">
            <label class="flex items-center cursor-pointer">
              <input v-model="period" type="radio" value="month" class="mr-2 text-primary-600 focus:ring-primary-500">
              <span class="text-sm">Ce mois</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="period" type="radio" value="quarter" class="mr-2 text-primary-600 focus:ring-primary-500">
              <span class="text-sm">Ce trimestre</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="period" type="radio" value="year" class="mr-2 text-primary-600 focus:ring-primary-500">
              <span class="text-sm">Cette année</span>
            </label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-1">Revenus totaux</h3>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(totalIncome) }}</p>
        </div>

        <div class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-1">Dépenses totales</h3>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(totalExpenses) }}</p>
        </div>

        <div class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-1">Solde net</h3>
          <p class="text-3xl font-bold" :class="netBalance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'">{{ formatCurrency(netBalance) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Revenus vs Dépenses</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="incomeExpenseChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Évolution du solde</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="balanceChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Dépenses par catégorie</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="expensesChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Revenus par catégorie</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="incomeChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>
      </div>

      <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Transactions de la période</h3>
        <div v-if="!loading && filteredTransactions.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800">
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Date</th>
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Description</th>
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Catégorie</th>
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Type</th>
              <th class="text-right py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Montant</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="transaction in filteredTransactions.slice(0, 10)" :key="transaction.id" class="border-b border-neutral-200 dark:border-neutral-800">
              <td class="py-3 px-2 text-sm text-neutral-600 dark:text-neutral-400">{{ formatDate(transaction.date) }}</td>
              <td class="py-3 px-2 text-sm text-neutral-800 dark:text-neutral-200">{{ transaction.description }}</td>
              <td class="py-3 px-2 text-sm text-neutral-600 dark:text-neutral-400">{{ transaction.categoryName }}</td>
              <td class="py-3 px-2 text-sm">
                  <span :class="transaction.typeStr === 'income' ? 'px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs' : 'px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs'">
                    {{ transaction.typeStr === 'income' ? 'Revenu' : 'Dépense' }}
                  </span>
              </td>
              <td class="py-3 px-2 text-sm text-right font-medium" :class="transaction.typeStr === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ transaction.typeStr === 'income' ? '+' : '-' }} {{ formatCurrency(transaction.amount) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="loading" class="flex justify-center p-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>
        <p v-else class="text-center text-neutral-500 p-8">
          Aucune transaction pour cette période
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

definePageMeta({
  middleware: ['authenticated']
});

// --- État ---
const loading = ref(true);
const transactions = ref([]);
const period = ref('month');

const incomeExpenseChart = ref(null);
const balanceChart = ref(null);
const expensesChart = ref(null);
const incomeChart = ref(null);

// Instances Chart.js
const charts = {
  incomeExpense: null,
  balance: null,
  expenses: null,
  income: null
};

// --- Couleurs ---
const colors = {
  expenses: ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB', '#9966FF', '#C9CBCF', '#7CB342', '#FB8C00', '#F44336'],
  income: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#2196F3', '#3F51B5']
};

// --- Logique Métier ---

const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');

    const rawTransactions = response.transactions || [];

    transactions.value = rawTransactions.map(t => ({
      ...t,
      amount: Number(t.amount),
      typeStr: t.typeTransactionsId === 1 ? 'income' : 'expense',
      dateObj: new Date(t.date),
      categoryName: t.category?.name || 'Non catégorisé'
    })).sort((a, b) => b.dateObj - a.dateObj);

    nextTick(() => initCharts());
  } catch (error) {
    console.error('Erreur chargement transactions:', error);
  } finally {
    loading.value = false;
  }
};

const filteredTransactions = computed(() => {
  if (!transactions.value.length) return [];

  const now = new Date();
  let startDate;

  now.setHours(0,0,0,0);

  if (period.value === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period.value === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
  } else {
    // Year
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return transactions.value.filter(t => t.dateObj >= startDate);
});

// Totaux
const totalIncome = computed(() =>
    filteredTransactions.value
        .filter(t => t.typeStr === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
);

const totalExpenses = computed(() =>
    filteredTransactions.value
        .filter(t => t.typeStr === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
);

const netBalance = computed(() => totalIncome.value - totalExpenses.value);

// --- Préparation des Données Graphiques ---

const getIncomeVsExpensesData = () => {
  const isYearly = period.value === 'year';
  const labels = [];
  const incomeData = [];
  const expenseData = [];

  const groupedData = new Map();

  filteredTransactions.value.forEach(t => {
    let key;
    if (isYearly) {
      key = t.dateObj.toLocaleString('fr-FR', { month: 'short' });
    } else {
      key = t.dateObj.getDate().toString();
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { income: 0, expense: 0, sortDate: t.dateObj });
    }

    if (t.typeStr === 'income') {
      groupedData.get(key).income += t.amount;
    } else {
      groupedData.get(key).expense += t.amount;
    }
  });

  const sortedKeys = Array.from(groupedData.keys()).reverse();

  sortedKeys.forEach(key => {
    labels.push(key);
    incomeData.push(groupedData.get(key).income);
    expenseData.push(groupedData.get(key).expense);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: incomeData,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4CAF50',
        borderWidth: 1
      },
      {
        label: 'Dépenses',
        data: expenseData,
        backgroundColor: 'rgba(244, 67, 54, 0.6)',
        borderColor: '#F44336',
        borderWidth: 1
      }
    ]
  };
};

const getCategoryData = (type) => {
  const dataMap = {};

  filteredTransactions.value
      .filter(t => t.typeStr === type)
      .forEach(t => {
        const cat = t.categoryName;
        dataMap[cat] = (dataMap[cat] || 0) + t.amount;
      });

  const labels = Object.keys(dataMap);

  return {
    labels,
    datasets: [{
      data: labels.map(l => dataMap[l]),
      backgroundColor: type === 'income' ? colors.income : colors.expenses,
      hoverOffset: 4
    }]
  };
};

const getBalanceHistoryData = () => {
  const sorted = [...filteredTransactions.value].sort((a, b) => a.dateObj - b.dateObj);

  const labels = sorted.map(t => t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
  const data = [];

  let currentBalance = 0;
  sorted.forEach(t => {
    if (t.typeStr === 'income') currentBalance += t.amount;
    else currentBalance -= t.amount;
    data.push(currentBalance);
  });

  return {
    labels,
    datasets: [{
      label: 'Solde cumulé',
      data,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3
    }]
  };
};

// --- Gestion des Graphiques ---

const destroyCharts = () => {
  Object.values(charts).forEach(c => {
    if (c) c.destroy();
  });
};

const initCharts = () => {
  destroyCharts();

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // 1. Bar Chart (Rev vs Dep)
  if (incomeExpenseChart.value) {
    charts.incomeExpense = new Chart(incomeExpenseChart.value, {
      type: 'bar',
      data: getIncomeVsExpensesData(),
      options: commonOptions
    });
  }

  // 2. Line Chart (Balance)
  if (balanceChart.value) {
    charts.balance = new Chart(balanceChart.value, {
      type: 'line',
      data: getBalanceHistoryData(),
      options: commonOptions
    });
  }

  // 3. Doughnut (Dépenses)
  if (expensesChart.value) {
    const expenseData = getCategoryData('expense');
    if (expenseData.labels.length) {
      charts.expenses = new Chart(expensesChart.value, {
        type: 'doughnut',
        data: expenseData,
        options: { ...commonOptions, cutout: '65%' }
      });
    }
  }

  // 4. Doughnut (Revenus)
  if (incomeChart.value) {
    const incomeData = getCategoryData('income');
    if (incomeData.labels.length) {
      charts.income = new Chart(incomeChart.value, {
        type: 'doughnut',
        data: incomeData,
        options: { ...commonOptions, cutout: '65%' }
      });
    }
  }
};

// --- Utilitaires ---

const formatCurrency = (val) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('fr-FR');

// --- Lifecycle ---

onMounted(() => {
  loadTransactions();
});

watch(period, () => {
  // Petit délai pour laisser le computed recalculer les filteredTransactions
  nextTick(() => initCharts());
});
</script>