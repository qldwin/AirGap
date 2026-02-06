<template>
  <div class="pt-4 pb-8 px-4">
    <div class="max-w-7xl mx-auto">

      <div class="flex justify-center mb-10">
        <div class="bg-gray-50 dark:bg-neutral-800/50 p-1.5 rounded-lg inline-flex items-center gap-2 border border-gray-200 dark:border-neutral-700 backdrop-blur-sm z-20">

          <button
              v-for="p in ['month', 'quarter', 'year']"
              :key="p"
              class="px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-out"
              :class="period === p
        ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-md transform scale-105'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'"
              @click="changePeriod(p)"
          >
            {{ p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année' }}
          </button>

          <div v-if="period === 'year'" class="h-4 w-px bg-gray-300 dark:bg-neutral-600 mx-1"></div>

          <div v-if="period === 'year'" class="relative">

            <button
                class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 dark:bg-neutral-700 rounded-lg shadow-md transition-all"
                @click="isYearMenuOpen = !isYearMenuOpen"
            >
              {{ selectedYear }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="isYearMenuOpen ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <div
                v-if="isYearMenuOpen"
                class="absolute top-full mt-2 right-0 w-32 bg-white dark:bg-neutral-700 rounded-lg shadow-xl border border-gray-100 dark:border-neutral-700 overflow-hidden z-50"
            >
              <button
                  v-for="annee in anneesData?.years"
                  :key="annee"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  :class="selectedYear === annee ? 'text-primary-600 font-bold bg-indigo-50 dark:bg-neutral-700/50' : 'text-neutral-600 dark:text-neutral-300'"
                  @click="selectYear(annee)"
              >
                {{ annee }}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div class="card mb-8 p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Cashflow</h3>
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
        <div class="card p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
          <div class="mb-8">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Revenus vs Dépenses</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Comparatif des volumes</p>
          </div>
          <ClientOnly>
            <div style="height: 350px; position: relative;">
              <canvas ref="incomeExpenseChart" style="max-height: 100%;"/>
            </div>
          </ClientOnly>
        </div>

        <div class="card p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow duration-300">
          <div class="mb-8">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Solde du compte</h3>
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

// --- CONFIGURATION ---
const CURRENT_YEAR_FIXED = new Date().getFullYear(); // 2026 (ou année actuelle)
const isYearMenuOpen = ref(false);
const { data: anneesData } = await useFetch('/api/calendar/years');
const selectedYear = ref(CURRENT_YEAR_FIXED);
const { data: transactionsData } = await useFetch('/api/calendar/', {
  query: { year: selectedYear },
  watch: [selectedYear]
});
const { data: currentYearData } = await useFetch('/api/calendar/', {
  query: { year: CURRENT_YEAR_FIXED },
  key: 'static-balance-chart'
});

// --- ACTIONS UI ---
const changePeriod = (p) => {
  if (period.value === p) return;
  period.value = p;
  if (p !== 'year') {
    selectedYear.value = CURRENT_YEAR_FIXED;
  }
};

const selectYear = (annee) => {
  selectedYear.value = annee;
  isYearMenuOpen.value = false;
};

Chart.register(...registerables, SankeyController, Flow);

const props = defineProps({
  transactions: { type: Array, required: false, default: () => [] }
});

// --- ÉTAT ---
const period = ref('month');
const incomeExpenseChart = ref(null);
const balanceChart = ref(null);
const sankeyChart = ref(null);
const charts = { incomeExpense: null, balance: null, sankey: null };

const THEME = {
  colors: {
    income: '#34d399', expense: '#fb7185', balance: '#6366f1',
    textLight: '#64748b', textDark: '#94a3b8',
    gridLight: '#e2e8f0', gridDark: '#334155',
    cardBgLight: '#ffffff', cardBgDark: 'rgba(51,65,85,0)',
  }
};

// =========================================================================
// LOGIQUE A : DYNAMIQUE (Bar Chart & Sankey)
// =========================================================================

const cleanTransactions = computed(() => {
  let source = [];
  if (transactionsData.value?.transactions) source = transactionsData.value.transactions;
  else source = props.transactions;

  if (!source || source.length === 0) return [];

  return source.map(t => {
    const d = new Date(t.date);
    return {
      ...t,
      categoryName: t.category ? t.category.name : (t.categoryName || 'Autre'),
      dateObj: Number.isNaN(d.getTime()) ? new Date() : d,
      amount: Math.abs(Number(t.amount)),
      typeStr: t.typeStr || (Number(t.amount) >= 0 ? 'income' : 'expense'),
    };
  });
});

const filteredTransactions = computed(() => {
  const list = cleanTransactions.value;
  if (!list.length) return [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const userYear = selectedYear.value;
  let startDate, endDate;

  if (period.value === 'month') {
    startDate = new Date(currentYear, now.getMonth(), 1);
    endDate = new Date(currentYear, now.getMonth() + 1, 0);
  } else if (period.value === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(currentYear, quarter * 3, 1);
    endDate = new Date(currentYear, (quarter + 1) * 3, 0);
  } else {
    startDate = new Date(userYear, 0, 1);
    endDate = new Date(userYear + 1, 0, 1);
  }

  return list
      .filter(t => t.dateObj >= startDate && t.dateObj < endDate)
      .sort((a, b) => a.dateObj - b.dateObj);
});

const getIncomeVsExpensesData = () => {
  const groupedData = new Map();
  const useMonthlyGrouping = period.value === 'year' || period.value === 'quarter';

  filteredTransactions.value.forEach(t => {
    let key;
    if (useMonthlyGrouping) key = t.dateObj.toLocaleString('fr-FR', { month: 'short' });
    else key = t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

    if (!groupedData.has(key)) groupedData.set(key, { income: 0, expense: 0 });
    if (t.typeStr === 'income' || t.typeTransactionsId === 1) groupedData.get(key).income += t.amount;
    else groupedData.get(key).expense += t.amount;
  });

  return {
    labels: Array.from(groupedData.keys()),
    datasets: [
      { label: 'Revenus', data: Array.from(groupedData.values()).map(v => v.income), backgroundColor: THEME.colors.income, borderRadius: 3 },
      { label: 'Dépenses', data: Array.from(groupedData.values()).map(v => v.expense), backgroundColor: THEME.colors.expense, borderRadius: 3 }
    ]
  };
};

const getSankeyData = () => {
  const incomeCats = {};
  const expenseCats = {};

  filteredTransactions.value.forEach(t => {
    const cat = t.categoryName || 'Autre';
    const val = Math.abs(t.amount);

    if (t.typeStr === 'income' || t.typeTransactionsId === 1) {
      incomeCats[cat] = (incomeCats[cat] || 0) + val;
    } else {
      expenseCats[cat] = (expenseCats[cat] || 0) + val;
    }
  });

  const data = [];
  Object.entries(incomeCats).forEach(([c, v]) => data.push({ from: c, to: 'Budget', flow: v }));
  Object.entries(expenseCats).forEach(([c, v]) => data.push({ from: 'Budget', to: c, flow: v }));

  return data;
};

// =========================================================================
// LOGIQUE B : STATIQUE (Line Chart)
// =========================================================================

const currentYearBalanceData = computed(() => {
  const source = currentYearData.value?.transactions || [];
  const initialBalance = currentYearData.value?.initialBalance || 0;

  if (!source.length && initialBalance === 0) return { labels: [], datasets: [] };

  const mapped = source.map(t => {
    const rawAmount = Number(t.amount);
    return {
      dateObj: new Date(t.date),
      amount: Math.abs(rawAmount),
      typeStr: t.typeStr || (rawAmount >= 0 ? 'income' : 'expense'),
    };
  }).sort((a, b) => a.dateObj - b.dateObj);

  let runningBalance = initialBalance;
  const dailyMap = new Map();

  const startDate = new Date(CURRENT_YEAR_FIXED, 0, 1);
  const startKey = startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

  dailyMap.set(startKey, initialBalance);

  mapped.forEach(t => {
    if (t.typeStr === 'income') runningBalance += t.amount;
    else runningBalance -= t.amount;

    if (t.dateObj.getFullYear() === CURRENT_YEAR_FIXED) {
      const dateKey = t.dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      dailyMap.set(dateKey, runningBalance);
    }
  });

  const now = new Date();
  const todayKey = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  dailyMap.set(todayKey, runningBalance);

  return {
    labels: Array.from(dailyMap.keys()),
    datasets: [{
      label: `Solde ${CURRENT_YEAR_FIXED}`,
      data: Array.from(dailyMap.values()),
      borderColor: THEME.colors.balance,
      borderWidth: 3,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: THEME.colors.balance,
      pointBorderWidth: 2,
      pointHitRadius: 20
    }]
  };
});

// =========================================================================
// RENDU GRAPHIQUE
// =========================================================================

const renderDynamicCharts = () => {
  if (import.meta.server) return;
  if (!cleanTransactions.value.length) return;

  const isDark = document.documentElement.classList.contains('dark');
  const commonOptions = getChartConfig(isDark);

  drawIncomeExpenseChart(commonOptions);
  drawSankeyChart(isDark, commonOptions);
};

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
        displayColors: true,
        callbacks: {
          label: (ctx) => {
            let label = ctx.dataset.label || '';

            if (label) {
              label += ': ';
            }

            if (ctx.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(ctx.parsed.y);
            }

            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: THEME.font, size: 11 } }
      },
      y: {
        border: { display: false },
        grid: { color: gridColor, borderDash: [4, 4], drawBorder: false },
        ticks: {
          color: textColor,
          padding: 10,
          font: { family: THEME.font, size: 11, weight: 500 },
          callback: (v) => new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
          }).format(v)
        }
      }
    }
  };
};

const getSankeyChartConfig = (sData, isDark, commonOptions) => {
  return {
    type: 'sankey',
    data: {
      datasets: [{
        data: sData,
        colorFrom: (c) => c.dataset.data[c.dataIndex].from === 'Budget' ? THEME.colors.expense : THEME.colors.income,
        colorTo: (c) => c.dataset.data[c.dataIndex].to === 'Budget' ? THEME.colors.income : THEME.colors.expense,
        alpha: 0.6,
        size: 'max',
        borderWidth: 8,
        borderColor: isDark ? THEME.colors.cardBgDark : THEME.colors.cardBgLight,
        nodeWidth: 12,
        nodePadding: 30,
        color: isDark ? '#e2e8f0' : '#334155',
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 12, weight: 'bold' }
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (context) => {
              const item = context.raw;
              if (!item) return '';
              const val = new Intl.NumberFormat('fr-FR', {
                style: 'currency', currency: 'EUR'
              }).format(item.flow);
              return `${item.from} → ${item.to} : ${val}`;
            },
            title: (context) => {
              const item = context[0].raw;
              return `${item.from} vers ${item.to}`;
            }
          }
        }
      }
    }
  };
};

const drawSankeyChart = (isDark, commonOptions) => {
  if (charts.sankey) {
    charts.sankey.destroy();
    charts.sankey = null;
  }

  if (!sankeyChart.value) return;

  const sData = getSankeyData();
  if (!sData.length) return;

  const config = getSankeyChartConfig(sData, isDark, commonOptions);
  charts.sankey = new Chart(sankeyChart.value, config);
};

const renderBalanceChart = () => {
  if (import.meta.server) return;

  if (!currentYearBalanceData.value.labels.length) return;

  const isDark = document.documentElement.classList.contains('dark');
  const commonOptions = getChartConfig(isDark);

  if (charts.balance) { charts.balance.destroy(); charts.balance = null; }

  if (balanceChart.value) {
    charts.balance = new Chart(balanceChart.value, {
      type: 'line',
      data: currentYearBalanceData.value,
      options: {
        ...commonOptions,
        interaction: { mode: 'index', intersect: false },
        scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, beginAtZero: false } }
      }
    });
  }
};

const drawIncomeExpenseChart = (commonOptions) => {
  if (charts.incomeExpense) {
    charts.incomeExpense.destroy();
    charts.incomeExpense = null;
  }

  if (!incomeExpenseChart.value) return;

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
};

// --- WATCHERS ---
watch([() => props.transactions, transactionsData, period], () => {
  nextTick(() => renderDynamicCharts());
}, { deep: true, immediate: true });

watch(currentYearData, () => {
  nextTick(() => renderBalanceChart());
}, { immediate: true });

onMounted(() => {
  if (import.meta.client) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          renderDynamicCharts();
          renderBalanceChart();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    setTimeout(() => {
      renderDynamicCharts();
      renderBalanceChart();
    }, 300);
  }
});
</script>