<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Transactions</h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center bg-white dark:bg-neutral-800 rounded-full px-4 py-1.5 border border-neutral-200 dark:border-neutral-700 shadow-sm focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500/50 transition-all duration-300">
            <MagnifyingGlassIcon class="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="bg-transparent border-none text-sm outline-none placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 transition-all duration-300 ease-in-out w-32 sm:w-48 focus:w-48 sm:focus:w-80"
            >
          </div>

          <div class="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1"/>

          <div class="flex items-center">
            <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileUpload">
            <button
                type="button"
                class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center active:scale-90"
                :disabled="isParsing"
                title="Importer CSV"
                @click="fileInput.click()"
            >
              <ArrowUpTrayIcon v-if="!isParsing" class="h-5 w-5 stroke-[2]" />
              <svg v-else class="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </button>
          </div>

          <button
              type="button"
              class="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center gap-2"
              @click="openTransactionModal"
          >
            <PlusIcon class="h-4 w-4 stroke-[3]" />
            <span class="hidden sm:inline">Ajouter</span>
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
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
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
                  <button class="p-1 text-neutral-500 hover:text-primary-600 transition-colors rounded" @click="editTransaction(transaction)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="p-1 text-neutral-500 hover:text-red-600 transition-colors rounded" @click="confirmDeleteTransaction(transaction)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
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

    <TransactionModal
        v-model="showTransactionModal"
        :transaction="selectedTransaction"
        :types="transactionTypes"
        :account-id="defaultAccountId"
        @transaction-added="loadTransactions"
        @transaction-updated="loadTransactions"
    />
  </div>
</template>

<script setup>
import Papa from 'papaparse';
import { ref, onMounted, computed } from 'vue';
import { MagnifyingGlassIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/vue/24/outline';

definePageMeta({ middleware: ['authenticated'] });

// --- ÉTAT ---
const transactions = ref([]);
const transactionTypes = ref([]);
const defaultAccountId = ref(null);
const searchQuery = ref('');
const loading = ref(true);
const isParsing = ref(false);
const fileInput = ref(null);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// --- COMPUTED ---
const filteredTransactions = computed(() => {
  const all = transactions.value || [];
  if (!searchQuery.value.trim()) return all;
  const q = searchQuery.value.toLowerCase();
  return all.filter(t =>
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.amount?.toString().includes(q)
  );
});

// --- HELPERS ---
const isIncome = (t) => t.typeLabel === 'revenu';
const getTransactionClass = (t) => isIncome(t) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
const getTransactionSign = (t) => isIncome(t) ? '+' : '-';
const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
const formatDate = (dateStr) => dateStr ? new Intl.DateTimeFormat('fr-FR').format(new Date(dateStr)) : '';

// --- ACTIONS ---
const loadTransactions = async () => {
  try {
    loading.value = true;
    const res = await $fetch('/api/transactions');
    transactions.value = (res.transactions || []).map(t => ({
      ...t,
      category: t.category?.name || '',
      amount: Number(t.amount)
    }));
  } finally {
    loading.value = false;
  }
};

const loadInitialData = async () => {
  try {
    const [types, account] = await Promise.all([
      $fetch('/api/types'),
      $fetch('/api/user/temp_default-account')
    ]);
    transactionTypes.value = types;
    defaultAccountId.value = account.accountId;
  } catch (e) {
    console.error("Erreur initialisation:", e);
  }
};

onMounted(() => {
  loadInitialData();
  loadTransactions();
});

// --- IMPORT CSV ---
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
    cleanDate = dateStr.includes('/') ? new Date(dateStr.split('/').reverse().join('-')) : new Date(dateStr);
  }

  return {
    date: cleanDate,
    description: descKey ? (row[descKey] || 'Import CSV') : 'Import CSV',
    amount: cleanAmount,
    accountId: defaultAccountId.value,
    selectedCategoryId: null
  };
};

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  isParsing.value = true;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    encoding: "ISO-8859-1",
    complete: async (results) => {
      try {
        const formatted = results.data
            .filter(row => Object.keys(row).some(k => k.toLowerCase().includes('montant')))
            .map(transformCSVRow);

        const { transactions: classified } = await $fetch('/api/transactions/classify', {
          method: 'POST',
          body: { transactions: formatted }
        });

        const { count } = await $fetch('/api/transactions/import', {
          method: 'POST',
          body: { transactions: classified }
        });

        alert(`${count} transactions importées !`);
        loadTransactions();
      } finally {
        isParsing.value = false;
        fileInput.value.value = '';
      }
    }
  });
};

// --- MODAL & CRUD ---
const openTransactionModal = () => {
  selectedTransaction.value = null;
  showTransactionModal.value = true;
};

const editTransaction = (t) => {
  selectedTransaction.value = { ...t };
  showTransactionModal.value = true;
};

const confirmDeleteTransaction = async (t) => {
  if (confirm(`Supprimer "${t.description}" ?`)) {
    await $fetch(`/api/transactions/${t.id}`, { method: 'DELETE' });
    loadTransactions();
  }
};
</script>