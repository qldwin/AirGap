<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Budgets</h1>
        </div>
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

      <div class="card p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-50 mb-6">Mes Budgets</h2>

        <div v-if="loading" class="flex justify-center my-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="budgets.length === 0" class="text-center py-8">
          <p class="text-neutral-600 dark:text-neutral-400">Aucun budget défini.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="budget in sortedBudgets" :key="budget.id" class="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50">{{ budget.name }}</h3>
              <div class="flex items-center space-x-2">
                <button class="text-neutral-500 hover:text-primary-600" @click="editBudget(budget)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-neutral-500 hover:text-red-600" @click="confirmDeleteBudget(budget)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex flex-wrap gap-2">
              <span>Catégorie(s): <span class="font-medium">{{ budget.categories?.map(c => c.name).join(', ') || 'Aucune' }}</span></span>
              <span class="mx-2 hidden sm:inline">•</span>
              <span>Période: <span class="font-medium">{{ formatDateRange(budget.startDate, budget.endDate) }}</span></span>
            </div>

            <div class="mb-2 flex justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ formatCurrency(getBudgetSpent(budget)) }} dépensés sur {{ formatCurrency(budget.amount) }}
              </span>
              <span class="font-medium" :class="getBudgetSpent(budget) > Number(budget.amount) ? 'text-red-600' : 'text-green-600'">
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
      <div class="bg-white dark:bg-neutral-800 shadow-xl rounded-lg w-full max-w-md z-50 relative overflow-hidden p-6">
        <h2 class="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
          {{ editingBudget ? 'Modifier le budget' : 'Nouveau budget' }}
        </h2>

        <form class="space-y-4" @submit.prevent="saveBudget">
          <div>
            <label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
            <input id="name" v-model="budgetForm.name" placeholder="Courses annuelles" type="text" class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" required>
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant cible</label>
            <div class="relative">
              <input id="amount" v-model.number="budgetForm.amount" placeholder="0.00" type="number" class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 pr-10" step="0.01" min="0.01" required>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">€</span>
            </div>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie à suivre</label>
            <select id="category" v-model="budgetForm.categoryId" class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" required>
              <option value="" disabled>Sélectionner une catégorie</option>
              <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label for="period" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Période</label>
            <select id="period" v-model="budgetForm.periodType" class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" required>
              <option value="monthly">Ce mois-ci</option>
              <option value="yearly">Cette année</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" @click="closeBudgetModal">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50" :disabled="isSubmitting">
              {{ isSubmitting ? 'En cours...' : (editingBudget ? 'Enregistrer' : 'Ajouter') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

definePageMeta({ middleware: ['authenticated'] });

const loading = ref(true);
const isSubmitting = ref(false);
const budgets = ref([]);
const transactions = ref([]);
const categories = ref([]);
const transactionTypes = ref([]);
const defaultAccountId = ref(null);
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
  if (!categories.value.length || !transactionTypes.value.length) return [];
  const expenseUUID = transactionTypes.value.find(t => t.type === 'depense')?.id;
  return categories.value.filter(c => c.typeId === expenseUUID);
});

const sortedBudgets = computed(() => {
  return [...budgets.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

// --- Data Loading ---
const loadInitialData = async () => {
  loading.value = true;
  try {
    const results = await Promise.allSettled([
      $fetch('/api/budgets'),
      $fetch('/api/transactions'),
      $fetch('/api/categories'),
      $fetch('/api/types'),
      $fetch('/api/user/temp_default-account')
    ]);

    const [budgetsRes, transRes, catsRes, typesRes, accountRes] = results;

    if (budgetsRes.status === 'fulfilled') budgets.value = budgetsRes.value.budgets || [];
    if (transRes.status === 'fulfilled') transactions.value = transRes.value.transactions || [];
    if (typesRes.status === 'fulfilled') transactionTypes.value = typesRes.value;
    if (accountRes.status === 'fulfilled') defaultAccountId.value = accountRes.value.accountId;

    if (catsRes.status === 'fulfilled') {
      const data = catsRes.value;
      categories.value = data.categories || data.data || (Array.isArray(data) ? data : []);
    }
  } catch (err) {
    console.error('Erreur initialisation:', err);
  } finally {
    loading.value = false;
  }
};

const getBudgetSpent = (budget) => {
  if (!budget.categories?.length) return 0;
  const budgetCatIds = new Set(budget.categories.map(c => c.id));
  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);

  return transactions.value
      .filter(t => {
        const tDate = new Date(t.date);
        return t.typeLabel === 'depense' && budgetCatIds.has(t.categoryId) && tDate >= start && tDate <= end;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
};

// --- Modal Management ---
const openAddBudgetModal = () => {
  editingBudget.value = null;
  budgetForm.value = { name: '', amount: '', categoryId: '', accountId: defaultAccountId.value, periodType: 'monthly' };
  showBudgetModal.value = true;
};

const editBudget = (budget) => {
  editingBudget.value = budget;
  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);
  const detectedPeriod = (Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))) > 32 ? 'yearly' : 'monthly';

  budgetForm.value = {
    name: budget.name,
    amount: Number(budget.amount),
    categoryId: budget.categories?.[0]?.id || '',
    accountId: budget.accountId,
    periodType: detectedPeriod
  };
  showBudgetModal.value = true;
};

const closeBudgetModal = () => showBudgetModal.value = false;

const saveBudget = async () => {
  isSubmitting.value = true;
  try {
    const now = new Date();
    const startDate = budgetForm.value.periodType === 'monthly' ? startOfMonth(now) : startOfYear(now);
    const endDate = budgetForm.value.periodType === 'monthly' ? endOfMonth(now) : endOfYear(now);

    const payload = {
      name: budgetForm.value.name,
      amount: Number(budgetForm.value.amount),
      accountId: budgetForm.value.accountId,
      categoryIds: budgetForm.value.categoryId ? [budgetForm.value.categoryId] : [],
      startDate,
      endDate
    };

    if (editingBudget.value) {
      const res = await $fetch(`/api/budgets/${editingBudget.value.id}`, { method: 'PATCH', body: payload });
      const idx = budgets.value.findIndex(b => b.id === editingBudget.value.id);
      if (idx !== -1) budgets.value[idx] = res.budget;
    } else {
      const res = await $fetch('/api/budgets', { method: 'POST', body: payload });
      budgets.value.push(res.budget);
    }
    closeBudgetModal();
  } catch (err) {
    alert("Erreur lors de l'enregistrement");
    console.log(err);
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDeleteBudget = async (budget) => {
  if (confirm(`Supprimer le budget "${budget.name}" ?`)) {
    await $fetch(`/api/budgets/${budget.id}`, { method: 'DELETE' });
    budgets.value = budgets.value.filter(b => b.id !== budget.id);
  }
};

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
const formatDateRange = (s, e) => `${new Date(s).toLocaleDateString()} - ${new Date(e).toLocaleDateString()}`;

onMounted(loadInitialData);
</script>