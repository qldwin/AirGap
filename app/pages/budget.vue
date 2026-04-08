<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Budgets</h1>
        </div>

        <div class="flex items-center space-x-3">
          <Button
              class="w-full btn btn-primary flex justify-center cursor-pointer text-primary-50 bg-primary-500 hover:bg-primary-600 focus:ring-primary-300 transition-colors"
              @click="openAddBudgetModal()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau budget
          </Button>
        </div>
      </div>

      <div class="card p-6 bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-50">Mes Budgets</h2>
        </div>

        <div v-if="loading" class="flex justify-center my-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="budgets.length === 0" class="text-center py-8">
          <p class="text-neutral-600 dark:text-neutral-400">Aucun budget défini. Cliquez sur "Nouveau budget" pour
            commencer.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="budget in sortedBudgets" :key="budget.id"
               class="bg-neutral-50 dark:bg-neutral-800 p-4 border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50">{{ budget.name }}</h3>

              <div class="flex items-center space-x-2">
                <Button
                    class="cursor-pointer p-1 text-neutral-500 hover:text-primary-600 transition-colors rounded"
                    @click="editBudget(budget)">
                  <span class="sr-only">Modifier</span>
                  <SquarePen/>
                </Button>
                <Button
                    class="cursor-pointer p-1 text-neutral-500 hover:text-primary-550 transition-colors rounded"
                    @click="confirmDeleteBudget(budget)">
                  <span class="sr-only">Supprimer</span>
                  <TrashIcon/>
                </Button>
              </div>
            </div>

            <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex flex-wrap gap-2">
              <span>Catégorie(s):
                <span v-if="budget.categories && budget.categories.length > 0" class="font-medium">
                  {{ budget.categories.map(c => c.name).join(', ') }}
                </span>
                <span v-else class="font-medium italic">Aucune</span>
              </span>
              <span class="mx-2 hidden sm:inline">•</span>
              <span>Période: <span class="font-medium ">{{
                  formatDateRange(budget.startDate, budget.endDate)
                }}</span></span>
            </div>

            <div class="mb-2 flex justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ formatCurrency(getBudgetSpent(budget)) }} dépensés sur {{ formatCurrency(budget.amount) }}
              </span>
              <span class="font-medium"
                    :class="getBudgetSpent(budget) > Number(budget.amount) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                {{ getBudgetSpent(budget) > Number(budget.amount) ? 'Dépassé de' : 'Reste' }}:
                {{ formatCurrency(Math.abs(Number(budget.amount) - getBudgetSpent(budget))) }}
              </span>
            </div>

            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                  class="h-2 rounded-full transition-all duration-1000 ease-out"
                  :class="getBudgetSpent(budget) > Number(budget.amount) ? 'bg-red-500' : 'bg-primary-600'"
                  :style="{
    width: animateBars ? `${Math.min((getBudgetSpent(budget) / Number(budget.amount)) * 100, 100)}%` : '0%'
  }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <BudgetModal
        v-model="showBudgetModal"
        :budget="editingBudget"
        @budget-added="onBudgetSaved"
        @budget-updated="onBudgetSaved"
    />

  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {SquarePen, TrashIcon} from "lucide-vue-next";

definePageMeta({
  middleware: ['authenticated']
});

const loading = ref(true);
const budgets = ref([]);
const transactions = ref([]);
const categories = ref([]);
const showBudgetModal = ref(false);
const editingBudget = ref(null);
const animateBars = ref(false);

// --- Computed ---
const sortedBudgets = computed(() => {
  return [...budgets.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

// --- Chargement des données ---

const loadInitialData = async () => {
  loading.value = true;
  animateBars.value = false;

  try {
    const results = await Promise.allSettled([
      $fetch('/api/budgets'),
      $fetch('/api/transactions'),
      $fetch('/api/categories'),
    ]);

    const [budgetsResult, transResult, catsResult] = results;

    if (budgetsResult.status === 'fulfilled') {
      budgets.value = budgetsResult.value.budgets || [];
    } else {
      console.error("Erreur chargement budgets:", budgetsResult.reason);
      budgets.value = [];
    }

    if (transResult.status === 'fulfilled') {
      transactions.value = transResult.value.transactions || [];
    } else {
      transactions.value = [];
    }

    if (catsResult.status === 'fulfilled') {
      const data = catsResult.value;
      if (Array.isArray(data)) {
        categories.value = data;
      } else if (data && data.categories) {
        categories.value = data.categories;
      } else {
        categories.value = [];
      }
      console.log("✅ Catégories chargées :", categories.value.length);
    } else {
      console.error("❌ Erreur chargement catégories:", catsResult.reason);
    }

  } catch (err) {
    console.error('Erreur critique chargement:', err);
  } finally {
    loading.value = false;

    setTimeout(() => {
      animateBars.value = true;
    }, 50);
  }
};
// --- Logique Métier ---

const getBudgetSpent = (budget) => {
  if (!budget.categories || budget.categories.length === 0) return 0;

  const budgetCatIds = new Set(budget.categories.map(c => c.id));
  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);
  const relevantTransactions = transactions.value.filter(t => {
    const isExpense = t.typeTransaction === 'depense';
    const isCorrectCategory = budgetCatIds.has(t.categoryId);
    const tDate = new Date(t.date);
    const isInDateRange = tDate >= start && tDate <= end;
    return isExpense && isCorrectCategory && isInDateRange;
  });

  return relevantTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
};

// --- Gestion du Modal ---

const openAddBudgetModal = () => {
  editingBudget.value = null;
  showBudgetModal.value = true;
};

const editBudget = (budget) => {
  editingBudget.value = budget;
  showBudgetModal.value = true;
};

const onBudgetSaved = () => {
  loadInitialData();
};

// --- Suppression ---

const confirmDeleteBudget = async (budget) => {
  if (!confirm(`Supprimer le budget "${budget.name}" ?`)) return;

  try {
    await $fetch(`/api/budgets/${budget.id}`, {method: 'DELETE'});
    budgets.value = budgets.value.filter(b => b.id !== budget.id);
  } catch (err) {
    console.error('Erreur suppression:', err);
    alert("Impossible de supprimer");
  }
};

// --- Formattage ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(amount);
};

const formatDateRange = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

// Init
onMounted(() => {
  loadInitialData();
});
</script>