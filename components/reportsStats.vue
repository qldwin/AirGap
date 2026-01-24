<template>
  <div class="pt-4 pb-8 px-4">
    <div class="max-w-7xl mx-auto">

      <div class="flex justify-center mb-10">
        <div class="bg-gray-50 dark:bg-neutral-800/50 p-1.5 rounded-full inline-flex border border-gray-200 dark:border-neutral-700 backdrop-blur-sm">
          <button
              v-for="p in ['month', 'quarter', 'year']"
              :key="p"
              @click="period = p"
              class="px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-out"
              :class="period === p
              ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-md transform scale-105'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'"
          >
            {{ p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année' }}
          </button>
        </div>
      </div>

      <div class="card mb-8 p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Flux de Trésorerie</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Visualisation des mouvements financiers</p>
          </div>
        </div>
        <ClientOnly>
          <div style="height: 450px; position: relative;">
            <canvas ref="sankeyChart" style="max-height: 100%; width: 100%;"/>
          </div>
        </ClientOnly>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        <div class="card p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
          <div class="mb-8">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Entrées vs Sorties</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Comparatif des volumes</p>
          </div>
          <ClientOnly>
            <div style="height: 350px; position: relative;">
              <canvas ref="incomeExpenseChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <div class="card p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
          <div class="mb-8">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Patrimoine</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Évolution du solde réel</p>
          </div>
          <ClientOnly>
            <div style="height: 350px; position: relative;">
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';

Chart.register(...registerables, SankeyController, Flow);

// --- 1. PROPS ---
const props = defineProps({
  transactions: { type: Array, required: true, default: () => [] }
});

// --- ÉTAT ---
const period = ref('month');
const incomeExpenseChart = ref(null);
const balanceChart = ref(null);
const sankeyChart = ref(null);

const charts = { incomeExpense: null, balance: null, sankey: null };

// --- DESIGN SYSTEM (Modern Palette) ---
const THEME = {
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  colors: {
    income: '#34d399', // Emerald 400 (Plus vibrant)
    incomeHover: '#10b981',
    expense: '#fb7185', // Rose 400
    expenseHover: '#f43f5e',
    balance: '#818cf8', // Indigo 400
    balanceStroke: '#6366f1',
    textLight: '#64748b',
    textDark: '#94a3b8',
    gridLight: '#e2e8f0',
    gridDark: '#334155'
  }
};

// --- 2. NETTOYAGE ---
const cleanTransactions = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return [];
  return props.transactions.map(t => {
    const d = new Date(t.date);
    return {
      ...t,
      dateObj: Number.isNaN(d.getTime()) ? new Date() : d,
      amount: Number(t.amount),
      cumulativeBalance: Number(t.cumulativeBalance ?? 0)
    };
  });
});

// --- 3. FILTRAGE ---
const filteredTransactions = computed(() => {
  const list = cleanTransactions.value;
  if (!list.length) return [];
  const now = new Date();
  let startDate = new Date();
  now.setHours(0,0,0,0);

  if (period.value === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period.value === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return list.filter(t => t.dateObj >= startDate).sort((a, b) => a.dateObj - b.dateObj);
});

// --- 4. DATASETS ---
const getIncomeVsExpensesData = () => {
  const groupedData = new Map();
  const isYearly = period.value === 'year';

  filteredTransactions.value.forEach(t => {
    let key;
    if (isYearly) {
      key = t.dateObj.toLocaleString('fr-FR', { month: 'short' });
    } else {
      key = t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
    if (!groupedData.has(key)) groupedData.set(key, { income: 0, expense: 0 });
    if (t.typeStr === 'income' || t.typeTransactionsId === 1) {
      groupedData.get(key).income += t.amount;
    } else {
      groupedData.get(key).expense += t.amount;
    }
  });

  const labels = Array.from(groupedData.keys());
  return {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: Array.from(groupedData.values()).map(v => v.income),
        backgroundColor: THEME.colors.income,
        hoverBackgroundColor: THEME.colors.incomeHover,
        borderRadius: 50, // Pill shape
        borderSkipped: false,
        barThickness: 18, // Plus fin et élégant
      },
      {
        label: 'Dépenses',
        data: Array.from(groupedData.values()).map(v => v.expense),
        backgroundColor: THEME.colors.expense,
        hoverBackgroundColor: THEME.colors.expenseHover,
        borderRadius: 50,
        borderSkipped: false,
        barThickness: 18,
      }
    ]
  };
};

const getBalanceHistoryData = () => {
  const dailyMap = new Map();
  filteredTransactions.value.forEach(t => {
    const dateKey = t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    dailyMap.set(dateKey, t.cumulativeBalance);
  });

  return {
    labels: Array.from(dailyMap.keys()),
    datasets: [{
      label: 'Solde',
      data: Array.from(dailyMap.values()),
      borderColor: THEME.colors.balanceStroke,
      borderWidth: 3,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        return gradient;
      },
      fill: true,
      tension: 0.4, // Courbe lissée
      pointRadius: 0, // Invisible par défaut
      pointHoverRadius: 6, // Visible au survol
      pointBackgroundColor: '#ffffff',
      pointBorderColor: THEME.colors.balanceStroke,
      pointBorderWidth: 2,
      pointHitRadius: 20 // Facilite la sélection
    }]
  };
};

const getSankeyData = () => {
  const incomeCats = {};
  const expenseCats = {};
  filteredTransactions.value.forEach(t => {
    const cat = t.categoryName || 'Autre';
    if (t.typeStr === 'income' || t.typeTransactionsId === 1) {
      incomeCats[cat] = (incomeCats[cat] || 0) + t.amount;
    } else {
      expenseCats[cat] = (expenseCats[cat] || 0) + t.amount;
    }
  });

  const data = [];
  Object.entries(incomeCats).forEach(([c, v]) => data.push({ from: c, to: 'Budget', flow: v }));
  Object.entries(expenseCats).forEach(([c, v]) => data.push({ from: 'Budget', to: c, flow: v }));
  return data;
};

// --- 5. INITIALISATION ---

const destroyCharts = () => {
  Object.values(charts).forEach(c => { if (c) c.destroy(); });
  charts.incomeExpense = null;
  charts.balance = null;
  charts.sankey = null;
};

// Configuration partagée pour un look cohérent
const getChartConfig = (isDark) => {
  const textColor = isDark ? THEME.colors.textDark : THEME.colors.textLight;
  const gridColor = isDark ? THEME.colors.gridDark : THEME.colors.gridLight;

  return {
    responsive: true,
    maintainAspectRatio: false,
    font: { family: THEME.font },
    plugins: {
      legend: {
        align: 'end',
        labels: {
          color: textColor,
          font: { family: THEME.font, size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 8,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f1f5f9' : '#1e293b',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12, // Tooltip très arrondi
        displayColors: true,
        boxPadding: 6,
        titleFont: { family: THEME.font, size: 13, weight: 700 },
        bodyFont: { family: THEME.font, size: 12, weight: 500 },
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: textColor, font: { family: THEME.font, size: 11 } }
      },
      y: {
        border: { display: false },
        grid: { color: gridColor, borderDash: [4, 4], drawBorder: false }, // Pointillés discrets
        ticks: {
          color: textColor,
          padding: 10,
          font: { family: THEME.font, size: 11, weight: 500 },
          callback: (value) => new Intl.NumberFormat('fr-FR', {
            style: 'currency', currency: 'EUR', maximumFractionDigits: 0
          }).format(value)
        }
      }
    }
  };
};

const initCharts = () => {
  if (!cleanTransactions.value.length) return;

  // Sécurité DOM (Retry)
  if (!incomeExpenseChart.value || !balanceChart.value) {
    setTimeout(initCharts, 100);
    return;
  }

  destroyCharts();

  const isDark = document.documentElement.classList.contains('dark');
  const commonOptions = getChartConfig(isDark);

  // 1. BAR CHART
  charts.incomeExpense = new Chart(incomeExpenseChart.value, {
    type: 'bar',
    data: getIncomeVsExpensesData(),
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        x: { ...commonOptions.scales.x, grid: { display: false } }
      }
    }
  });

  // 2. LINE CHART
  charts.balance = new Chart(balanceChart.value, {
    type: 'line',
    data: getBalanceHistoryData(),
    options: {
      ...commonOptions,
      interaction: { mode: 'index', intersect: false }, // Interaction fluide
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          beginAtZero: false // Dynamique pour voir les variations
        }
      }
    }
  });

  // 3. SANKEY
  if (sankeyChart.value) {
    const sData = getSankeyData();
    if (sData.length > 0) {
      charts.sankey = new Chart(sankeyChart.value, {
        type: 'sankey',
        data: {
          datasets: [{
            data: sData,
            colorFrom: (c) => c.dataset.data[c.dataIndex].from === 'Budget' ? THEME.colors.expense : THEME.colors.income,
            colorTo: (c) => c.dataset.data[c.dataIndex].to === 'Budget' ? THEME.colors.income : THEME.colors.expense,
            colorMode: 'gradient',
            alpha: 0.6,
            size: 'max',
            color: isDark ? '#e2e8f0' : '#334155',
            font: { family: THEME.font, size: 12, weight: 600 }
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 20 },
          plugins: { legend: { display: false }, tooltip: commonOptions.plugins.tooltip }
        }
      });
    }
  }
};

// --- LIFECYCLE ---
watch([() => props.transactions, period], () => { nextTick(() => initCharts()); }, { deep: true, immediate: true });

onMounted(() => {
  if (import.meta.client) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => { if (m.attributeName === 'class') initCharts(); });
    });
    observer.observe(document.documentElement, { attributes: true });
    setTimeout(initCharts, 300);
  }
});
</script>