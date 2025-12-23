<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Budgets</h1>

        <div class="flex items-center space-x-3">
          <button
              class="btn btn-primary text-sm px-4 py-2 flex items-center bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              @click="openAddBudgetModal()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau budget
          </button>
        </div>
      </div>

      <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-50">Mes Budgets</h2>
        </div>

        <div v-if="loading" class="flex justify-center my-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="budgets.length === 0" class="text-center py-8">
          <p class="text-neutral-600 dark:text-neutral-400">Aucun budget défini. Cliquez sur "Nouveau budget" pour commencer.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="budget in sortedBudgets" :key="budget.id" class="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50">{{ budget.name }}</h3>

              <div class="flex items-center space-x-2">
                <button class="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400" @click="editBudget(budget)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-neutral-500 hover:text-red-600 dark:hover:text-red-400" @click="confirmDeleteBudget(budget)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
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
              <span>Période: <span class="font-medium">{{ formatDateRange(budget.startDate, budget.endDate) }}</span></span>
            </div>

            <div class="mb-2 flex justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ formatCurrency(getBudgetSpent(budget)) }} dépensés sur {{ formatCurrency(budget.amount) }}
              </span>
              <span class="font-medium" :class="getBudgetSpent(budget) > Number(budget.amount) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                {{ getBudgetSpent(budget) > Number(budget.amount) ? 'Dépassé de' : 'Reste' }}:
                {{ formatCurrency(Math.abs(Number(budget.amount) - getBudgetSpent(budget))) }}
              </span>
            </div>

            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getBudgetSpent(budget) > Number(budget.amount) ? 'bg-red-500' : 'bg-primary-600'"
                  :style="{ width: `${Math.min((getBudgetSpent(budget) / Number(budget.amount)) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showBudgetModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="closeBudgetModal"/>
      <div class="bg-white dark:bg-neutral-800 shadow-xl rounded-lg w-full max-w-md z-50 relative overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
            {{ editingBudget ? 'Modifier le budget' : 'Nouveau budget' }}
          </h2>

          <form class="space-y-4" @submit.prevent="saveBudget">
            <div>
              <label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
              <input
                  id="name"
                  v-model="budgetForm.name"
                  type="text"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Ex: Courses mensuelles"
                  required
              >
            </div>

            <div>
              <label for="amount" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant cible</label>
              <div class="relative">
                <input
                    id="amount"
                    v-model.number="budgetForm.amount"
                    type="number"
                    class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-10"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                >
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">€</span>
              </div>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie à suivre</label>
              <select
                  id="category"
                  v-model="budgetForm.categoryId"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  required>
                <option value="" disabled>Sélectionner une catégorie</option>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="period" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Période</label>
              <select
                  id="period"
                  v-model="budgetForm.periodType"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  required
              >
                <option value="monthly">Ce mois-ci</option>
                <option value="yearly">Cette année</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                  type="button"
                  class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="closeBudgetModal"
              >
                Annuler
              </button>
              <button
                  type="submit"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">En cours...</span>
                <span v-else>{{ editingBudget ? 'Enregistrer' : 'Ajouter' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

definePageMeta({
  middleware: ['authenticated']
});

// État global
const loading = ref(true);
const isSubmitting = ref(false);

// Données
const budgets = ref([]);
const transactions = ref([]);
const categories = ref([]);

// Modal et Formulaire
const showBudgetModal = ref(false);
const editingBudget = ref(null);
const budgetForm = ref({
  name: '',
  amount: '',
  categoryId: '',
  accountId: null,
  periodType: 'monthly',
});

// --- Computed ---

const expenseCategories = computed(() => {
  if (!categories.value || categories.value.length === 0) return [];

  return categories.value.filter(c => {
    // On vérifie le typeId (format objet JS) OU type_id (format brut BDD)
    // On utilise == pour accepter "2" (string) et 2 (number)
    const type = c.typeId ?? c.type_id;
    return type == 2;
  });
});

const sortedBudgets = computed(() => {
  return [...budgets.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

// --- Chargement des données ---

const loadInitialData = async () => {
  loading.value = true;
  try {
    // Promise.allSettled attend que tout finisse, succès ou échec
    const results = await Promise.allSettled([
      $fetch('/api/budgets'),
      $fetch('/api/transactions'),
      $fetch('/api/categories'),
    ]);

    const [budgetsResult, transResult, catsResult] = results;

    // 1. Gestion des Budgets
    if (budgetsResult.status === 'fulfilled') {
      budgets.value = budgetsResult.value.budgets || [];
    } else {
      console.error("Erreur chargement budgets:", budgetsResult.reason);
      budgets.value = []; // On initialise vide pour ne pas casser la vue
    }

    // 2. Gestion des Transactions
    if (transResult.status === 'fulfilled') {
      transactions.value = transResult.value.transactions || [];
    } else {
      transactions.value = [];
    }

    // 3. Gestion des Catégories (CELLE QUI VOUS INTÉRESSE)
    if (catsResult.status === 'fulfilled') {
      const data = catsResult.value;
      // On gère les deux formats possibles (tableau direct ou objet {categories: []})
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
  }
};
// --- Logique Métier ---

const getBudgetSpent = (budget) => {
  if (!budget.categories || budget.categories.length === 0) return 0;

  const budgetCatIds = new Set(budget.categories.map(c => c.id));

  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);

  const relevantTransactions = transactions.value.filter(t => {
    const isExpense = t.typeTransactionsId === 2;

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
  budgetForm.value = {
    name: '',
    amount: '',
    categoryId: '',
    accountId: null,
    periodType: 'monthly',
  };
  showBudgetModal.value = true;
};

const editBudget = (budget) => {
  editingBudget.value = budget;

  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const detectedPeriod = diffDays > 32 ? 'yearly' : 'monthly';

  budgetForm.value = {
    name: budget.name,
    amount: Number(budget.amount),
    categoryId: budget.categories && budget.categories.length > 0 ? budget.categories[0].id : '',
    accountId: budget.accountId,
    periodType: detectedPeriod
  };
  showBudgetModal.value = true;
};

const closeBudgetModal = () => {
  showBudgetModal.value = false;
};

// --- Sauvegarde ---

const saveBudget = async () => {
  isSubmitting.value = true;
  try {
    // 1. Calcul des dates selon la sélection "Mensuel/Annuel"
    const now = new Date();
    let startDate, endDate;

    if (budgetForm.value.periodType === 'monthly') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    }

    // 2. Construction du payload pour l'API
    const payload = {
      name: budgetForm.value.name,
      amount: Number(budgetForm.value.amount),
      accountId: undefined,

      categoryIds: budgetForm.value.categoryId ? [budgetForm.value.categoryId] : [],
      startDate: startDate,
      endDate: endDate
    };

    let response;

    if (editingBudget.value) {
      // PATCH
      response = await $fetch(`/api/budgets/${editingBudget.value.id}`, {
        method: 'PATCH',
        body: payload
      });

      const index = budgets.value.findIndex(b => b.id === editingBudget.value.id);
      if (index !== -1) {
        budgets.value[index] = response.budget;
      }
    } else {
      // POST
      response = await $fetch('/api/budgets', {
        method: 'POST',
        body: payload
      });
      budgets.value.push(response.budget);
    }

    closeBudgetModal();
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
    alert("Erreur lors de l'enregistrement : " + (err.data?.message || err.message));
  } finally {
    isSubmitting.value = false;
  }
};

// --- Suppression ---

const confirmDeleteBudget = async (budget) => {
  if (!confirm(`Supprimer le budget "${budget.name}" ?`)) return;

  try {
    await $fetch(`/api/budgets/${budget.id}`, { method: 'DELETE' });
    budgets.value = budgets.value.filter(b => b.id !== budget.id);
  } catch (err) {
    console.error('Erreur suppression:', err);
    alert("Impossible de supprimer");
  }
};

// --- Formattage ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
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