<template>
  <div class="pt-16 pb-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Budgets</h1>

        <div class="flex items-center space-x-3">
          <button
              class="btn btn-primary text-sm px-4 py-2 flex items-center"
              @click="openAddBudgetModal()"
          >
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle budget
          </button>
          <button class="btn btn-outline text-sm px-3 py-1" @click="navigateTo('/dashboard')">
          Retour au tableau de bord
        </button>
        </div>
      </div>

<!--      &lt;!&ndash; Résumé du budget &ndash;&gt;-->
<!--      <div class="card p-6 mb-8">-->
<!--        <div class="flex items-center justify-between mb-4">-->
<!--          <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-50">Budget Total - {{-->
<!--              currentPeriodLabel-->
<!--            }}</h2>-->
<!--        </div>-->

<!--        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">-->
<!--          <div class="card bg-white dark:bg-neutral-800 p-4 shadow-sm">-->
<!--            <h3 class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Budget total</h3>-->
<!--            <p-->
<!--class="text-2xl font-bold"-->
<!--                :class="balance ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'">{{ formatCurrency(balance) || 0}}</p>-->
<!--          </div>-->

<!--          <div class="card bg-white dark:bg-neutral-800 p-4 shadow-sm">-->
<!--            <h3 class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Dépenses actuelles</h3>-->
<!--            <p-->
<!--class="text-2xl font-bold"-->
<!--               :class="totalExpenses > totalBudget ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'">-->
<!--              {{ formatCurrency(totalExpenses) }}</p>-->
<!--          </div>-->

<!--          <div class="card bg-white dark:bg-neutral-800 p-4 shadow-sm">-->
<!--            <h3 class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Restant</h3>-->
<!--            <p-->
<!--class="text-2xl font-bold"-->
<!--               :class="totalRest = totalBudget - totalExpenses < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">-->
<!--              {{ formatCurrency(totalRest) }}</p>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="mb-3">-->
<!--          <div class="flex items-center justify-between mb-2">-->
<!--            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Progression : {{-->
<!--                formatPercent(((totalExpenses / totalBudget) * 100) || 0)-->
<!--              }}</span>-->
<!--            <span class="text-sm text-neutral-600 dark:text-neutral-400">{{-->
<!--                formatCurrency(totalExpenses)-->
<!--              }} / {{ formatCurrency(totalBudget) }}</span>-->
<!--          </div>-->
<!--          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">-->
<!--            <div-->
<!--                class="h-2.5 rounded-full"-->
<!--                :class="totalExpenses > totalBudget ? 'bg-red-500' : 'bg-primary-600'"-->
<!--                :style="{ width: `${formatPercent((totalExpenses / totalBudget) * 100, 100) || 0}` }"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

      <!-- Liste des budgets par catégorie -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-50">Budgets par catégorie</h2>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-neutral-700 dark:text-neutral-300">Période : </label>
            <select
v-model="currentPeriod"
                    class="px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-sm">
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center my-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="budgets.length === 0" class="text-center py-8">
          <p class="text-neutral-600 dark:text-neutral-400">Aucun budget défini. Cliquez sur "Nouveau budget" pour
            commencer.</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Budget par catégorie -->
          <div v-for="budget in sortedBudgets" :key="budget.id" class="bg-white dark:bg-neutral-800 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50">{{ budget.name }}</h3>
              <div class="flex items-center space-x-2">
                <button
class="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
                        @click="editBudget(budget)">
                  <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
class="text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                        @click="confirmDeleteBudget(budget)">
                  <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <span>Catégorie: <span class="font-medium">{{ budget.categories }}</span></span>
              <span class="mx-2">•</span>
              <span>Période: <span class="font-medium">{{ formatPeriod(budget.period) }}</span></span>
            </div>

            <div class="mb-2 flex justify-between">
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ formatCurrency(getCategoryExpenses(budget.categories)) }} dépensés sur {{
                  formatCurrency(budget.amount)
                }}
              </span>
              <span
                  class="font-medium"
                  :class="getCategoryExpenses(budget.categories) > budget.amount ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'"
              >
                {{
                  getCategoryExpenses(budget.categories) > budget.amount ? 'Dépassé' : 'Restant'
                }}: {{ formatCurrency(Math.abs(budget.amount - getCategoryExpenses(budget.categories))) }}
              </span>
            </div>

            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                  class="h-2 rounded-full"
                  :class="getCategoryExpenses(budget.categories) > budget.amount ? 'bg-red-500' : 'bg-primary-600'"
                  :style="{ width: `${Math.min((getCategoryExpenses(budget.categories) / budget.amount) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer un budget -->
    <div v-if="showBudgetModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="closeBudgetModal"/>
      <div class="bg-white dark:bg-neutral-800 shadow-xl rounded-lg w-full max-w-md mx-auto z-50 relative">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
            {{ editingBudget ? 'Modifier le budget' : 'Nouveau budget' }}
          </h2>

          <form class="space-y-4" @submit.prevent="saveBudget">
            <div>
              <label
for="name"
                     class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
              <input
                  id="name"
                  v-model="budgetForm.name"
                  type="text"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Budget alimentaire, Loisirs, etc."
                  required
              >
            </div>

            <div>
              <label
for="amount"
                     class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant</label>
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
              <label for="category" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie</label>
             <select id="category" class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" required>
               <option value="" disabled>Sélectionner une catégorie</option>
               <option value="Alimentation">Alimentation</option>
               <option value="Shopping">Shopping</option>
               <option value="Transport">Transport</option>
               <option value="Loisirs">Loisirs</option>
               <option value="Santé">Santé</option>
               <option value="Logement">Logement</option>
               <option value="Factures">Factures</option>
               <option value="Autres">Autres</option>
             </select>
            </div>

            <div>
              <label
for="period"
                     class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Période</label>
              <select
                  id="period"
                  v-model="budgetForm.period"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  required
              >
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
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
definePageMeta({
  middleware: ['authenticated']
});

// État
const loading = ref(true);
const budgets = ref([]);
const transactions = ref([]);
const showBudgetModal = ref(false);
const editingBudget = ref(null);
const isSubmitting = ref(false);
const currentPeriod = ref('monthly');

// Formulaire pour le budget
const budgetForm = ref({
  name: '',
  amount: '',
  category: '',
  period: 'monthly',
});

// Label pour la période actuelle
const currentPeriodLabel = computed(() => {
  return currentPeriod.value === 'monthly' ? 'Mois en cours' : 'Année en cours';
});

// Trier les budgets par catégories
const sortedBudgets = computed(() => {
  return [...budgets.value]
      .filter(budget => currentPeriod.value === 'all' || budget.period === currentPeriod.value)
      .sort((a, b) => a.name.localeCompare(b.name));
});

// Total des budgets
const totalRest = computed(() => {
  return sortedBudgets.value.reduce((total, budget) => total + budget.amount, 0);
});

// Transactions filtrées selon la période
const filteredTransactions = computed(() => {
  if (!transactions.value.length) return [];

  const now = new Date();
  let startDate;

  if (currentPeriod.value === 'monthly') {
    // Ce mois-ci
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // Cette année
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return transactions.value
      .filter(t => t.type === 'expense' && new Date(t.date) >= startDate);
});

// Total des dépenses pour la période actuelle
const totalExpenses = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(t.amount), 0);
});

const totalBudget = computed(() => {
  return sortedBudgets.value.reduce((total, budget) => total + Number(budget.amount), 0);
});

// Récupérer les dépenses par catégorie
const getCategoryExpenses = (category) => {
  return filteredTransactions.value
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
};

const categories = ref([]);

const loadCategories = async () => {
  try {
    const res = await $fetch('/api/budgets/categories');
    categories.value = res.categories || [];
  } catch (err) {
    console.error('Erreur lors du chargement des catégories :', err);
  }
};

// Charger les budgets
const loadBudgets = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/budgets');
    budgets.value = response.budgets || [];
  } catch (error) {
    console.error('Erreur lors du chargement des budgets:', error);
    // Afficher un toast d'erreur ici
  }
};

// Charger les transactions
const loadTransactions = async () => {
  try {
    const response = await $fetch('/api/transactions');
    transactions.value = response.transactions || [];
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error);
    // Afficher un toast d'erreur ici
  } finally {
    loading.value = false;
  }
};

// Ouvrir le modal d'ajout de budget
const openAddBudgetModal = () => {
  editingBudget.value = null;
  budgetForm.value = {
    name: '',
    amount: '',
    category: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  };
  showBudgetModal.value = true;
};

// Ouvrir le modal d'édition de budget
const editBudget = (budget) => {
  editingBudget.value = budget;
  budgetForm.value = {
    name: budget.name,
    amount: budget.amount,
    category: budget.categories,
    period: budget.period,
    startDate: budget.startDate.split('T')[0]
  };
  showBudgetModal.value = true;
};

// Fermer le modal de budget
const closeBudgetModal = () => {
  showBudgetModal.value = false;
};

// Sauvegarder le budget (création ou mise à jour)
const saveBudget = async () => {
  try {
    isSubmitting.value = true;

    const payload = {
      name: budgetForm.value.name,
      amount: Number(budgetForm.value.amount),
      categoryId: budgetForm.value.category,
      period: budgetForm.value.period,
      startDate: new Date(budgetForm.value.startDate).toISOString(),
      endDate: undefined
    };

    let response;

    if (editingBudget.value) {
      // Mettre à jour un budget existant
      response = await $fetch(`/api/budgets/${editingBudget.value.id}`, {
        method: 'PUT',
        body: payload
      });

      // Mettre à jour le budget dans la liste
      const index = budgets.value.findIndex(b => b.id === editingBudget.value.id);
      if (index !== -1) {
        budgets.value[index] = response.budget;
      }

      // Afficher un toast de succès ici
    } else {
      // Créer un nouveau budget
      response = await $fetch('/api/budgets/create', {
        method: 'POST',
        body: payload
      });

      // Ajouter le budget à la liste
      budgets.value.push(response.budget);

      // Afficher un toast de succès ici
    }

    closeBudgetModal();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du budget:', error);
    // Afficher un toast d'erreur ici
  } finally {
    isSubmitting.value = false;
  }
};

// Confirmer la suppression d'un budget
const confirmDeleteBudget = (budget) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le budget "${budget.name}" ?`)) {
    deleteBudget(budget.id);
  }
};

// Supprimer un budget
const deleteBudget = async (id) => {
  try {
    await $fetch(`/api/budgets/${id}`, {
      method: 'DELETE'
    });

    // Supprimer le budget de la liste
    budgets.value = budgets.value.filter(b => b.id !== id);

    // Afficher un toast de succès ici
  } catch (error) {
    console.error('Erreur lors de la suppression du budget:', error);
    // Afficher un toast d'erreur ici
  }
};

// Formater les montants en euros
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatPercent = (value) => {
  if (value === null) return '-';
  return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
};

// Formater la période
const formatPeriod = (period) => {
  const formats = {
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    yearly: 'Annuel'
  };
  return formats[period] || period;
};

// Charger les données au chargement de la page
onMounted(async () => {
  await Promise.all([
    loadBudgets(),
    loadTransactions(),
    loadCategories()
  ]);
});

// Recharger les données quand la période change
watch(currentPeriod, () => {
  // Les données sont déjà chargées, pas besoin de recharger depuis l'API
  // Les computed s'occuperont de filtrer les données
});
</script> 