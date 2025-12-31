<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-10xl mx-auto">
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

      <div class="card mb-8 p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Cashflow</h3>
        <ClientOnly>
          <div style="height: 400px; position: relative;">
            <canvas ref="sankeyChart" style="max-height: 100%; width: 100%;"/>
          </div>
        </ClientOnly>
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
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";
import { SankeyController, Flow } from 'chartjs-chart-sankey';

Chart.register(...registerables, SankeyController, Flow);

definePageMeta({
  middleware: ['authenticated']
});

// --- État ---
const loading = ref(true);
const transactions = ref([]);
const period = ref('month');

const incomeExpenseChart = ref(null);
const balanceChart = ref(null);
const sankeyChart = ref(null);

const charts = {
  incomeExpense: null,
  balance: null,
  sankey: null
};

// --- Logique Métier (Inchangée) ---
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
    startDate = new Date(now.getFullYear(), 0, 1);
  }
  return transactions.value.filter(t => t.dateObj >= startDate);
});

// --- Préparation des Données Graphiques (Inchangées) ---

const getIncomeVsExpensesData = () => {
  const isYearly = period.value === 'year';
  const labels = [];
  const incomeData = [];
  const expenseData = [];
  const groupedData = new Map();

  filteredTransactions.value.forEach(t => {
    let key;
    if (isYearly) key = t.dateObj.toLocaleString('fr-FR', { month: 'short' });
    else key = t.dateObj.getDate().toString();

    if (!groupedData.has(key)) groupedData.set(key, { income: 0, expense: 0 });
    if (t.typeStr === 'income') groupedData.get(key).income += t.amount;
    else groupedData.get(key).expense += t.amount;
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
      { label: 'Revenus', data: incomeData, backgroundColor: 'rgba(76, 175, 80, 0.6)', borderColor: '#4CAF50', borderWidth: 1 },
      { label: 'Dépenses', data: expenseData, backgroundColor: 'rgba(244, 67, 54, 0.6)', borderColor: '#F44336', borderWidth: 1 }
    ]
  };
};

const getBalanceHistoryData = () => {
  const sorted = [...filteredTransactions.value].sort((a, b) => a.dateObj - b.dateObj);
  const data = [];
  const labels = [];
  const dates = [];
  let currentBalance = 0;

  sorted.forEach(t => {
    if (t.typeStr === 'income') currentBalance += t.amount;
    else currentBalance -= t.amount;
    data.push(currentBalance);
    labels.push(currentBalance.toLocaleString('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }));
    dates.push(t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
  });

  return {
    labels,
    datasets: [{
      label: 'Solde cumulé', data, dates, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3, pointRadius: 0, pointHitRadius: 10, pointHoverRadius: 4, borderWidth: 2
    }]
  };
};

const getSankeyData = () => {
  const incomeCategories = {};
  const expenseCategories = {};

  filteredTransactions.value.forEach(t => {
    if (t.typeStr === 'income') {
      incomeCategories[t.categoryName] = (incomeCategories[t.categoryName] || 0) + t.amount;
    } else {
      expenseCategories[t.categoryName] = (expenseCategories[t.categoryName] || 0) + t.amount;
    }
  });

  const data = [];
  const CENTRAL_NODE = 'Budget Total';

  Object.entries(incomeCategories).forEach(([cat, amount]) => {
    data.push({ from: cat, to: CENTRAL_NODE, flow: amount });
  });

  Object.entries(expenseCategories).forEach(([cat, amount]) => {
    data.push({ from: CENTRAL_NODE, to: cat, flow: amount });
  });

  return data;
};

// --- Gestion des Graphiques ---

const destroyCharts = () => {
  Object.values(charts).forEach(c => {
    if (c) c.destroy();
  });
};

// 1. Fonction pour détecter la couleur actuelle
const getThemeTextColor = () => {
  if (import.meta.client) {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#e5e5e5' : '#1f2937';
  }
  return '#1f2937';
};

const initCharts = () => {
  destroyCharts();

  // 2. On récupère la couleur au moment du rendu
  const textColor = getThemeTextColor();
  // 3. (Optionnel) Couleur de la grille (légèrement visible en dark)
  const gridColor = textColor === '#e5e5e5' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor } // Légende en couleur dynamique
      }
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } }
    }
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

    const verticalHoverLine = {
      id: 'verticalHoverLine',
      beforeDatasetsDraw(chart) {
        const { ctx, tooltip, chartArea: { bottom } } = chart;
        if (tooltip._active && tooltip._active.length) {
          const activePoint = tooltip._active[0];
          const x = activePoint.element.x;
          const y = activePoint.element.y;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, bottom);
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#3b82f6';
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    charts.balance = new Chart(balanceChart.value, {
      type: 'line',
      data: getBalanceHistoryData(),
      plugins: [verticalHoverLine],

      options: {
        ...commonOptions,
        layout: { padding: { bottom: 20 } },
        elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 1 }, line: { borderWidth: 2, tension: 0.3 } },

        scales: {
          x: {
            offset: false,
            grid: { display: false, drawBorder: false },
            ticks: {
              maxTicksLimit: 100,
              autoSkip: false,
              minRotation: 45,
              maxRotation: 45,

              color: textColor,

              font: { size: 10, weight: 'bold' }
            }
          },
          y: {
            beginAtZero: false,
            grid: { display: false, drawBorder: false },
            ticks: { display: false }
          }
        },

        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                const date = context[0].dataset.dates ? context[0].dataset.dates[index] : '';
                return `Date : ${date}`;
              },
              label: (context) => `Solde : ${context.label}`
            }
          }
        }
      }
    });
  }

  // 3. SANKEY DIAGRAM
  if (sankeyChart.value) {
    const sankeyFlows = getSankeyData();

    const getNodeTotal = (nodeName) => {
      let total = 0;
      if (nodeName === 'Budget Total') {
        sankeyFlows.forEach(flow => { if (flow.to === 'Budget Total') total += flow.flow; });
      } else if (sankeyFlows.some(f => f.to === nodeName)) {
        sankeyFlows.forEach(flow => { if (flow.to === nodeName) total += flow.flow; });
      } else {
        sankeyFlows.forEach(flow => { if (flow.from === nodeName) total += flow.flow; });
      }
      return total;
    };

    const customLabels = {};
    const allNodes = new Set();
    sankeyFlows.forEach(f => { allNodes.add(f.from); allNodes.add(f.to); });

    allNodes.forEach(nodeName => {
      const amount = getNodeTotal(nodeName);
      const formattedAmount = amount.toLocaleString('fr-FR', {
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0
      });
      customLabels[nodeName] = `${nodeName} (${formattedAmount})`;
    });

    const getColor = (key) => {
      if (key === 'Budget Total') return '#3b82f6';
      const isIncome = sankeyFlows.some(f => f.from === key && f.to === 'Budget Total');
      return isIncome ? '#4CAF50' : '#F44336';
    };

    if (sankeyFlows.length) {
      charts.sankey = new Chart(sankeyChart.value, {
        type: 'sankey',
        data: {
          datasets: [{
            label: 'Flux financier',
            data: sankeyFlows,
            labels: customLabels,
            colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
            colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
            colorMode: 'gradient',
            nodeWidth: 20,
            size: 'max',

            color: textColor,

            font: { size: 12, weight: 'bold' }
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 20 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const item = ctx.raw;
                  return `${item.from} -> ${item.to}: ${item.flow.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}`;
                }
              }
            }
          }
        }
      });
    }
  }
};

onMounted(() => {
  loadTransactions();

  // 4. OBSERVATEUR DE CHANGEMENT DE THÈME (IMPORTANT)
  if (import.meta.client) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          initCharts();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }
});

watch(period, () => {
  nextTick(() => initCharts());
});
</script>