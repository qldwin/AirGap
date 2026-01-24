<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Transactions</h1>
        <div class="flex items-center space-x-3">
          <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="handleFileUpload"
          >

          <button
              class="btn bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-4 py-2 rounded-lg flex items-center transition-colors"
              :disabled="isImporting || isParsing"
              @click="$refs.fileInput.click()"
          >
            <svg v-if="isParsing" class="animate-spin h-5 w-5 mr-2 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span v-if="isParsing">Lecture...</span>
            <span v-else>Importer CSV</span>
          </button>

          <button
              class="btn btn-primary text-sm px-4 py-2 flex items-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              @click="openTransactionModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle transaction
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="transactions.length === 0" class="py-8 text-center text-neutral-500">
          <p>Aucune transaction enregistrée.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <th class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">Date</th>
              <th class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">Description</th>
              <th class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">Montant</th>
              <th class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <td class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                {{ formatDate(transaction.date) }}
              </td>

              <td class="py-3 px-4 text-sm text-neutral-800 dark:text-neutral-200">
                <div class="flex items-center">
                  <span>{{ transaction.description }}</span>
                  <span v-if="transaction.category" class="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600">
                      {{ transaction.category }}
                  </span>
                </div>
              </td>

              <td class="py-3 px-4 text-sm text-right font-medium whitespace-nowrap" :class="getTransactionClass(transaction)">
                {{ getTransactionSign(transaction) }} {{ formatCurrency(transaction.amount) }}
              </td>

              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="flex justify-end space-x-2">
                  <button class="p-1 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded" @click="editTransaction(transaction)">
                    <span class="sr-only">Modifier</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="p-1 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded" @click="confirmDeleteTransaction(transaction)">
                    <span class="sr-only">Supprimer</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="pendingImport.length > 0 || isParsing" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">

        <div class="p-6 border-b border-neutral-200 dark:border-neutral-700 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-50">Valider l'importation</h2>
            <p v-if="isParsing" class="text-sm text-neutral-500 mt-1 animate-pulse">Lecture du fichier en cours...</p>
            <p v-else class="text-sm text-neutral-500 mt-1">
              {{ pendingImport.length }} transactions trouvées
              <span v-if="hasMissingCategories" class="text-red-500 font-medium">
                (dont {{ pendingImport.filter(t => !t.selectedCategoryId).length }} à classer)
              </span>
            </p>
          </div>

          <div v-if="!isParsing && hasMissingCategories" class="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
            <input
                id="filterMissing"
                v-model="showMissingOnly"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            >
            <label for="filterMissing" class="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
              Masquer les transactions validées
            </label>
          </div>

          <button class="text-neutral-400 hover:text-neutral-500 sm:ml-4" @click="closeImportModal">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3 text-right">Montant</th>
              <th class="px-4 py-3 w-1/3">Catégorie</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">

            <template v-if="isParsing">
              <tr v-for="i in 6" :key="i" class="animate-pulse bg-white dark:bg-neutral-800">
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-20"/></td>
                <td class="px-4 py-3">
                  <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-48 mb-2"/>
                  <div class="h-3 bg-gray-100 dark:bg-neutral-700/50 rounded w-32"/>
                </td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-16 ml-auto"/></td>
                <td class="px-4 py-3"><div class="h-9 bg-gray-200 dark:bg-neutral-700 rounded w-full"/></td>
              </tr>
            </template>

            <template v-else>
              <tr v-for="(row, index) in displayedImports" :key="index" class="bg-white dark:bg-neutral-800">
                <td class="px-4 py-3 whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                  {{ formatDate(row.date) }}
                </td>
                <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                  {{ row.description }}
                </td>
                <td class="px-4 py-3 text-right font-medium" :class="row.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(row.amount) }}
                </td>

                <td class="px-4 py-3">
                  <div v-if="row.selectedCategoryId && !showMissingOnly" class="flex items-center text-green-600 font-medium">
                    <span class="mr-2">✅</span>
                    {{ categories.find(c => c.id === row.selectedCategoryId)?.name }}
                    <button class="ml-2 text-xs text-neutral-400 hover:text-neutral-600 underline" @click="row.selectedCategoryId = null">
                      Modifier
                    </button>
                  </div>

                  <div v-else>
                    <CategorySelector
                        v-model="row.selectedCategoryId"
                        :categories="categories"
                        placeholder="Choisir une catégorie..."
                    />
                  </div>
                </td>
              </tr>

              <tr v-if="displayedImports.length === 0 && pendingImport.length > 0">
                <td colspan="4" class="text-center py-12 text-neutral-500">
                  <div class="flex flex-col items-center justify-center">
                    <span class="text-2xl mb-2">🎉</span>
                    <p class="font-medium">Toutes les transactions affichées sont catégorisées !</p>
                    <p class="text-sm mt-1">Décochez la case pour revérifier toutes les lignes.</p>
                  </div>
                </td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>

        <div class="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex justify-between items-center">
          <div class="text-sm">
            <template v-if="!isParsing">
              <span v-if="hasMissingCategories" class="text-red-600 font-bold flex items-center">
                ⚠️ Il reste des transactions non catégorisées !
              </span>
              <span v-else class="text-green-600 font-bold">
                Tout est prêt !
              </span>
            </template>
            <template v-else>
              <span class="text-neutral-400 italic">Analyse en cours...</span>
            </template>
          </div>

          <div class="flex space-x-3">
            <button
                class="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                @click="closeImportModal"
            >
              Annuler
            </button>
            <button
                :disabled="hasMissingCategories || isImporting || isParsing"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                @click="saveTransactions"
            >
              <span v-if="isImporting" class="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              Valider l'import
            </button>
          </div>
        </div>
      </div>
    </div>

    <TransactionModal
        v-model="showTransactionModal"
        :transaction="selectedTransaction"
        @transaction-added="onTransactionSaved"
        @transaction-updated="onTransactionSaved"
    />
  </div>
</template>

<script setup>
import Papa from 'papaparse';
import { ref, onMounted, computed } from 'vue';
import CategorySelector from '~/components/CategorySelector.vue';

// --- CONFIGURATION ---
definePageMeta({
  middleware: ['authenticated']
});

const TYPE_INCOME = 1;

// --- ÉTAT ---
const isImporting = ref(false);
const isParsing = ref(false);
const showMissingOnly = ref(false);
const fileInput = ref(null);
const categories = ref([]);
const pendingImport = ref([]);

const transactions = ref([]);
const loading = ref(true);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// --- COMPUTED PROPERTIES ---
const incomeCategories = computed(() => (categories.value || []).filter(c => c.typeId === 1));
const expenseCategories = computed(() => (categories.value || []).filter(c => c.typeId === 2));

const displayedImports = computed(() => {
  if (showMissingOnly.value) {
    return pendingImport.value.filter(t => !t.selectedCategoryId);
  }
  return pendingImport.value;
});

const hasMissingCategories = computed(() => {
  return pendingImport.value.some(t => !t.selectedCategoryId);
});

// --- HELPER FUNCTIONS ---
const isIncome = (t) => t.typeTransactionsId === TYPE_INCOME;
const getTransactionClass = (t) => isIncome(t) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
const getTransactionSign = (t) => isIncome(t) ? '+' : '-';

const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

// --- CHARGEMENT DONNÉES ---
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');
    transactions.value = (response.transactions || []).map(t => ({
      ...t,
      category: t.category?.name || '',
      amount: Number(t.amount),
      typeTransactionsId: Number(t.typeTransactionsId)
    }));
  } catch (error) {
    console.error('Erreur chargement transactions:', error);
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();

    if (Array.isArray(data)) {
      categories.value = data;
    } else if (data.categories && Array.isArray(data.categories)) {
      categories.value = data.categories;
    } else if (data.data && Array.isArray(data.data)) {
      categories.value = data.data;
    } else {
      categories.value = [];
    }
  } catch (e) {
    console.error("Erreur chargement catégories", e);
    categories.value = [];
  }
};

onMounted(() => {
  loadCategories();
  loadTransactions();
});

// --- IMPORT CSV : LECTURE + CLASSIFICATION ---
const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  isParsing.value = true;
  pendingImport.value = [];
  showMissingOnly.value = true;

  setTimeout(() => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "ISO-8859-1",
      worker: false,
      complete: async (results) => {
        try {
          // --- 1. MAPPING CSV ---
          const formattedTransactions = results.data
              .filter(row => {
                const keys = Object.keys(row);
                return keys.some(k => k.toLowerCase().includes('montant') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('solde'));
              })
              .map((row) => {
                const keys = Object.keys(row);
                const amountKey = keys.find(k => k.toLowerCase().includes('montant') || k.toLowerCase().includes('amount'));
                const dateKey = keys.find(k => k.toLowerCase().includes('date') && !k.toLowerCase().includes('valeur'));
                const descKey = keys.find(k => k.toLowerCase().includes('libell') || k.toLowerCase().includes('label'));

                const rawAmount = row[amountKey];
                const cleanAmount = typeof rawAmount === 'string' ? Number.parseFloat(rawAmount.replaceAll(/\s/g, '').replace(',', '.')) : Number(rawAmount);

                let cleanDate = new Date();
                if (dateKey && row[dateKey]) {
                  const dateStr = row[dateKey];
                  if (dateStr.includes('/')) {
                    const [day, month, year] = dateStr.split('/');
                    cleanDate = new Date(`${year}-${month}-${day}`);
                  } else {
                    cleanDate = new Date(dateStr);
                  }
                }

                return {
                  date: cleanDate,
                  description: descKey ? (row[descKey] || 'Import CSV') : 'Import CSV',
                  amount: cleanAmount,
                  accountId: 1,
                  selectedCategoryId: null,
                  status: 'missing_category'
                };
              });

          if (formattedTransactions.length === 0) {
            alert("Aucune transaction valide trouvée.");
            isParsing.value = false;
            return;
          }

          // --- 2. CLASSIFICATION AUTO (BACKEND) ---
          const response = await $fetch('/api/transactions/classify', {
            method: 'POST',
            body: { transactions: formattedTransactions }
          });

          pendingImport.value = response.transactions;

          if (!pendingImport.value.some(t => !t.selectedCategoryId)) {
            showMissingOnly.value = false;
          }

        } catch (err) {
          console.error("Erreur mapping/classification:", err);
          alert(`Erreur: ${err.message}`);
        } finally {
          isParsing.value = false;
          if (fileInput.value) fileInput.value.value = '';
        }
      },
      error: (error) => { /* ... */ }
    });
  }, 50);
};

const closeImportModal = () => {
  pendingImport.value = [];
  isParsing.value = false;
  showMissingOnly.value = false;
}

// --- IMPORT CSV : SAUVEGARDE ---
const saveTransactions = async () => {
  try {
    isImporting.value = true;
    const response = await $fetch('/api/transactions/import', {
      method: 'POST',
      body: { transactions: pendingImport.value }
    });

    alert(`${response.count} transactions importées avec succès !`);
    closeImportModal();
    loadTransactions();

  } catch (err) {
    console.error("Erreur lors de la sauvegarde :", err);
    alert("Erreur lors de l'enregistrement des transactions.");
  } finally {
    isImporting.value = false;
  }
};

// --- CRUD UNITAIRE ---
const openTransactionModal = () => {
  selectedTransaction.value = null;
  showTransactionModal.value = true;
};

const editTransaction = (transaction) => {
  selectedTransaction.value = { ...transaction };
  showTransactionModal.value = true;
};

const onTransactionSaved = () => {
  loadTransactions();
  showTransactionModal.value = false;
};

const confirmDeleteTransaction = async (transaction) => {
  if (confirm(`Supprimer "${transaction.description}" ?`)) {
    try {
      await $fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' });
      transactions.value = transactions.value.filter(t => t.id !== transaction.id);
    } catch (error) {
      alert("Erreur suppression.");
    }
  }
};
</script>