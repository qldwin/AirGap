<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Transactions</h1>
        </div>

        <div class="flex items-center gap-4">
          <div
              class="flex items-center bg-white dark:bg-neutral-800 rounded-xl px-4 py-1.5 border border-neutral-200 dark:border-neutral-750 shadow-xl focus-within:border-primary-500/50 transition-all duration-300">
            <Search class="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0"/>
            <Input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="bg-transparent border-none text-sm outline-none placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 transition-all duration-300 ease-in-out w-32 sm:w-48 focus:w-48 sm:focus:w-80"
            />
          </div>

          <div class="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1"/>

          <div class="flex items-center">
            <input
                ref="fileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileUpload"
            >
            <Button
                class="cursor-pointer text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center active:scale-90"
                :disabled="isParsing"
                title="Importer CSV"
                @click="$refs.fileInput.click()"
            >
              <ArrowUpFromLine v-if="!isParsing" class="h-5 w-5 stroke-[2]"/>
            </Button>
          </div>

          <Button
              class="cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
              @click="openTransactionModal"
          >
            <PlusIcon class="h-4 w-4 stroke-[3]"/>
            <span class="hidden sm:inline">Nouvelle transaction</span>
          </Button>
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
          <Table class="w-full" aria-hidden="true">
            <TableHeader>
              <TableRow
                  class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-750">
                <TableHead
                    class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                  Date
                </TableHead>
                <TableHead
                    class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                  Description
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                  Montant
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              <TableRow v-for="transaction in filteredTransactions" :key="transaction.id"
                        class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <TableCell class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  {{ formatDate(transaction.date) }}
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-neutral-800 dark:text-neutral-200">
                  <div class="flex items-center">
                    <span>{{ transaction.description }}</span>
                    <span v-if="transaction.category"
                          class="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600">
                      {{ transaction.category }}
                  </span>
                  </div>
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-right font-medium whitespace-nowrap"
                           :class="getTransactionClass(transaction)">
                  {{ getTransactionSign(transaction) }} {{ formatCurrency(transaction.amount) }}
                </TableCell>

                <TableCell class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="flex justify-end space-x-2">
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-primary-550 transition-colors rounded"
                        @click="editTransaction(transaction)">
                      <span class="sr-only">Modifier</span>
                      <SquarePen/>
                    </Button>
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-red-500 transition-colors rounded"
                        @click="confirmDeleteTransaction(transaction)">
                      <span class="sr-only">Supprimer</span>
                      <TrashIcon/>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
import {ref, onMounted, computed} from 'vue';
import {
  Search,
  ArrowUpFromLine,
  PlusIcon,
  TrashIcon,
  SquarePen,
} from 'lucide-vue-next';
import Papa from 'papaparse';

const searchQuery = ref('');

const filteredTransactions = computed(() => {
  const all = transactions.value || [];
  if (!searchQuery.value.trim()) return all;

  const q = searchQuery.value.toLowerCase();

  return all.filter(t =>
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.amount && t.amount.toString().includes(q))
  );
});

// --- CONFIGURATION ---
definePageMeta({
  middleware: ['authenticated']
});

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

// --- HELPER FUNCTIONS ---
const isIncome = (t) => t.typeTransaction === 'revenu';
const getTransactionClass = (t) => isIncome(t) ? 'text-primary-550' : 'text-red-500';
const getTransactionSign = (t) => isIncome(t) ? '+' : '-';

const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(amount);
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(date);
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
      typeTransaction: t.typeTransaction
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
/**
 * Extrait et nettoie les données d'une ligne CSV brute.
 * (Niveau 1 de profondeur)
 */
const transformCSVRow = (row) => {
  const keys = Object.keys(row);
  const amountKey = keys.find(k => k.toLowerCase().includes('montant') || k.toLowerCase().includes('amount'));
  const dateKey = keys.find(k => k.toLowerCase().includes('date') && !k.toLowerCase().includes('valeur'));
  const descKey = keys.find(k => k.toLowerCase().includes('libell') || k.toLowerCase().includes('label'));

  const rawAmount = row[amountKey];
  const cleanAmount = typeof rawAmount === 'string'
      ? Number.parseFloat(rawAmount.replaceAll(/\s/g, '').replace(',', '.'))
      : Number(rawAmount);

  let cleanDate = new Date();
  if (dateKey && row[dateKey]) {
    const dateStr = row[dateKey];
    cleanDate = dateStr.includes('/')
        ? new Date(dateStr.split('/').reverse().join('-'))
        : new Date(dateStr);
  }

  return {
    date: cleanDate,
    description: descKey ? (row[descKey] || 'Import CSV') : 'Import CSV',
    amount: cleanAmount,
    accountId: null,
    selectedCategoryId: null,
    status: 'missing_category'
  };
};

/**
 * Version promisifiée de Papa.parse pour aplatir le flux asynchrone.
 */
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "ISO-8859-1",
      worker: false,
      complete: resolve,
      error: reject
    });
  });
};

/**
 * Fonction principale simplifiée (Niveau 1).
 */
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  isParsing.value = true;
  pendingImport.value = [];
  showMissingOnly.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 50));

    const results = await parseCSV(file);

    const formattedTransactions = results.data
        .filter(row => Object.keys(row).some(k =>
            k.toLowerCase().includes('montant') ||
            k.toLowerCase().includes('amount') ||
            k.toLowerCase().includes('solde')
        ))
        .map(transformCSVRow);

    const response = await $fetch('/api/transactions/classify', {
      method: 'POST',
      body: {transactions: formattedTransactions}
    });

    await saveTransactions(response.transactions);

  } catch (err) {
    console.error("Erreur mapping/classification:", err);
    alert(`Erreur: ${err.message}`);
  } finally {
    isParsing.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const closeImportModal = () => {
  pendingImport.value = [];
  isParsing.value = false;
  showMissingOnly.value = false;
}

// --- IMPORT CSV : SAUVEGARDE ---
const saveTransactions = async (data) => {
  if (!data || data.length === 0) {
    console.error("❌ Erreur : Tentative d'importation d'un tableau vide !");
    return;
  }

  try {
    isImporting.value = true;
    const response = await $fetch('/api/transactions/import', {
      method: 'POST',
      body: {transactions: data}
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
  selectedTransaction.value = {...transaction};
  showTransactionModal.value = true;
};

const onTransactionSaved = () => {
  loadTransactions();
  showTransactionModal.value = false;
};

const confirmDeleteTransaction = async (transaction) => {
  if (confirm(`Supprimer "${transaction.description}" ?`)) {
    try {
      await $fetch(`/api/transactions/${transaction.id}`, {method: 'DELETE'});
      transactions.value = transactions.value.filter(t => t.id !== transaction.id);
    } catch (error) {
      alert("Erreur suppression.");
      console.log('erreur suppression transaction:', error);
    }
  }
};
</script>
<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #262626;
}
</style>