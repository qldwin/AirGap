<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Rapports</h1>
        
        <button class="btn btn-outline text-sm px-3 py-1" @click="navigateTo('/dashboard')">
          Retour au tableau de bord
        </button>
      </div>
      
      <!-- Filtres de période -->
      <div class="card mb-8 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Période:</label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input v-model="period" type="radio" value="month" class="mr-2" >
              <span>Ce mois</span>
            </label>
            <label class="flex items-center">
              <input v-model="period" type="radio" value="quarter" class="mr-2" >
              <span>Trimestre</span>
            </label>
            <label class="flex items-center">
              <input v-model="period" type="radio" value="year" class="mr-2" >
              <span>Année</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Résumé financier -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card p-4">
          <h3 class="text-lg font-medium text-primary-700 dark:text-primary-300 mb-1">Revenus totaux</h3>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(totalIncome) }}</p>
        </div>
        
        <div class="card p-4">
          <h3 class="text-lg font-medium text-primary-700 dark:text-primary-300 mb-1">Dépenses totales</h3>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(totalExpenses) }}</p>
        </div>
        
        <div class="card p-4">
          <h3 class="text-lg font-medium text-primary-700 dark:text-primary-300 mb-1">Solde net</h3>
          <p class="text-3xl font-bold" :class="netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ formatCurrency(netBalance) }}</p>
        </div>
      </div>

      <!-- Graphiques principaux -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Graphique des revenus vs dépenses -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Revenus vs Dépenses</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="incomeExpenseChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <!-- Graphique d'évolution de solde -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Évolution du solde</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="balanceChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Graphiques secondaires -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Répartition des dépenses par catégorie -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Dépenses par catégorie</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="expensesChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <!-- Répartition des revenus par catégorie -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Revenus par catégorie</h3>
          <ClientOnly>
            <div style="height: 320px; position: relative;">
              <canvas ref="incomeChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Tableau des transactions récentes -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Transactions récentes</h3>
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
                <td class="py-3 px-2 text-sm text-neutral-600 dark:text-neutral-400">{{ transaction.category || 'Non catégorisé' }}</td>
                <td class="py-3 px-2 text-sm">
                  <span :class="transaction.type === 'income' ? 'px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs' : 'px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs'">
                    {{ transaction.type === 'income' ? 'Revenu' : 'Dépense' }}
                  </span>
                </td>
                <td class="py-3 px-2 text-sm text-right font-medium" :class="transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ transaction.type === 'income' ? '+' : '-' }} {{ formatCurrency(transaction.amount) }}
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
// Enregistrer tous les composants Chart.js
import {Chart, registerables} from "chart.js";

Chart.register(...registerables);

definePageMeta({
  middleware: ['authenticated']
});

// État
const loading = ref(true);
const transactions = ref([]);
const period = ref('month');

// Références pour les canvas des graphiques
const incomeExpenseChart = ref(null);
const balanceChart = ref(null);
const expensesChart = ref(null);
const incomeChart = ref(null);

// Instances des graphiques
let incomeExpenseChartInstance = null;
let balanceChartInstance = null; 
let expensesChartInstance = null;
let incomeChartInstance = null;

// Palettes de couleurs
const expenseColors = [
  '#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB',
  '#9966FF', '#C9CBCF', '#7CB342', '#FB8C00', '#F44336'
];

const incomeColors = [
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', 
  '#2196F3', '#3F51B5'
];

// Charger les transactions
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');
    transactions.value = response.transactions || [];
    
    // Trier par date (plus récent d'abord)
    transactions.value.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Initialiser les graphiques après le chargement des données
    nextTick(() => {
      initCharts();
    });
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error);
  } finally {
    loading.value = false;
  }
};

// Filtrer les transactions selon la période sélectionnée
const filteredTransactions = computed(() => {
  if (!transactions.value.length) return [];

  const now = new Date();
  let startDate;

  if (period.value === 'month') {
    // Ce mois-ci
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period.value === 'quarter') {
    // Ce trimestre
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
  } else {
    // Cette année
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return transactions.value.filter(t => new Date(t.date) >= startDate);
});

// Calculs financiers
const totalIncome = computed(() => {
  return filteredTransactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
});

const totalExpenses = computed(() => {
  return filteredTransactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
});

const netBalance = computed(() => totalIncome.value - totalExpenses.value);


// Données pour le graphique revenus vs dépenses
const getIncomeVsExpensesData = () => {
  if (period.value === 'month') {
    // Données par jour du mois
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
    const incomeData = Array(daysInMonth).fill(0);
    const expenseData = Array(daysInMonth).fill(0);
    
    filteredTransactions.value.forEach(t => {
      const date = new Date(t.date);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate() - 1;
        if (t.type === 'income') {
          incomeData[day] += Number(t.amount);
        } else {
          expenseData[day] += Number(t.amount);
        }
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenus',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 92, 0.5)',
          borderColor: 'rgb(75, 192, 92)',
          borderWidth: 1
        },
        {
          label: 'Dépenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  } else if (period.value === 'quarter') {
    // Données par mois du trimestre
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const quarterMonths = months.slice(quarter * 3, quarter * 3 + 3);
    
    const incomeData = Array(3).fill(0);
    const expenseData = Array(3).fill(0);
    
    filteredTransactions.value.forEach(t => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth() - quarter * 3;
      if (monthIndex >= 0 && monthIndex < 3) {
        if (t.type === 'income') {
          incomeData[monthIndex] += Number(t.amount);
        } else {
          expenseData[monthIndex] += Number(t.amount);
        }
      }
    });
    
    return {
      labels: quarterMonths,
      datasets: [
        {
          label: 'Revenus',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 92, 0.5)',
          borderColor: 'rgb(75, 192, 92)',
          borderWidth: 1
        },
        {
          label: 'Dépenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  } else {
    // Données par mois de l'année
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);
    
    filteredTransactions.value.forEach(t => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth();
      if (t.type === 'income') {
        incomeData[monthIndex] += Number(t.amount);
      } else {
        expenseData[monthIndex] += Number(t.amount);
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Revenus',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 92, 0.5)',
          borderColor: 'rgb(75, 192, 92)',
          borderWidth: 1
        },
        {
          label: 'Dépenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  }
};

// Données pour l'évolution du solde
const getBalanceHistoryData = () => {
  if (!filteredTransactions.value.length) {
    return { labels: [], datasets: [] };
  }

  // Trier les transactions par date
  const sortedTransactions = [...filteredTransactions.value]
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let balance = 0;
  const balances = [];
  const dates = [];
  
  sortedTransactions.forEach(t => {
    if (t.type === 'income') {
      balance += Number(t.amount);
    } else {
      balance -= Number(t.amount);
    }
    balances.push(balance);
    dates.push(formatDate(t.date));
  });
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Solde',
        data: balances,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        fill: true,
        tension: 0.1
      }
    ]
  };
};

// Données pour les dépenses par catégorie
const getExpensesByCategoryData = () => {
  const expensesByCategory = {};
  
  filteredTransactions.value
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category || 'Non catégorisé';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += Number(t.amount);
    });
  
  const categories = Object.keys(expensesByCategory);

  if (categories.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: categories,
    datasets: [{
      data: categories.map(cat => expensesByCategory[cat]),
      backgroundColor: expenseColors.slice(0, categories.length),
      hoverOffset: 4
    }]
  };
};

// Données pour les revenus par catégorie
const getIncomeByCategoryData = () => {
  const incomeByCategory = {};
  
  filteredTransactions.value
    .filter(t => t.type === 'income')
    .forEach(t => {
      const category = t.category || 'Non catégorisé';
      if (!incomeByCategory[category]) {
        incomeByCategory[category] = 0;
      }
      incomeByCategory[category] += Number(t.amount);
    });
  
  const categories = Object.keys(incomeByCategory);

  if (categories.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: categories,
    datasets: [{
      data: categories.map(cat => incomeByCategory[cat]),
      backgroundColor: incomeColors.slice(0, categories.length),
      hoverOffset: 4
    }]
  };
};

// Initialiser les graphiques
const initCharts = () => {
  // Détruire les instances précédentes pour éviter les doublons
  if (incomeExpenseChartInstance) incomeExpenseChartInstance.destroy();
  if (balanceChartInstance) balanceChartInstance.destroy();
  if (expensesChartInstance) expensesChartInstance.destroy();
  if (incomeChartInstance) incomeChartInstance.destroy();
  
  // Attendre que les éléments DOM soient disponibles
  if (incomeExpenseChart.value && balanceChart.value && expensesChart.value && incomeChart.value) {
    // Graphique revenus vs dépenses
    incomeExpenseChartInstance = new Chart(incomeExpenseChart.value, {
      type: 'bar',
      data: getIncomeVsExpensesData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Graphique évolution du solde
    balanceChartInstance = new Chart(balanceChart.value, {
      type: 'line',
      data: getBalanceHistoryData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
    
    // Graphique dépenses par catégorie
    const expensesData = getExpensesByCategoryData();
    if (expensesData.labels.length > 0) {
      expensesChartInstance = new Chart(expensesChart.value, {
        type: 'doughnut',
        data: expensesData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            }
          },
          cutout: '60%'
        }
      });
    }
    
    // Graphique revenus par catégorie
    const incomeData = getIncomeByCategoryData();
    if (incomeData.labels.length > 0) {
      incomeChartInstance = new Chart(incomeChart.value, {
        type: 'doughnut',
        data: incomeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            }
          },
          cutout: '60%'
        }
      });
    }
  }
};

// Formater les montants en euros
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Formater les dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Charger les transactions au chargement du composant
onMounted(async () => {
  await loadTransactions();
});

// Mettre à jour les graphiques quand la période change
watch(period, () => {
  nextTick(() => {
    initCharts();
  });
});
</script> 