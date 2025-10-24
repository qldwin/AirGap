<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Tableau de bord</h1>
      </div>

      <!-- Résumé financier -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
            class="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <h3 class="text-lg font-medium text-primary-700 dark:text-primary-300 mb-1">Solde total</h3>
          <p class="text-3xl font-bold text-primary-800 dark:text-primary-200">{{ formatCurrency(balance) }}</p>
          <div
v-if="balanceChange !== null" class="mt-2 text-sm"
               :class="balanceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            <span>{{ formatPercent(balanceChange) }}</span> par rapport au mois dernier
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">Revenus (ce mois-ci)</h3>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(monthlyIncome) }}</p>
          <div v-if="incomeChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="incomeChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatPercent(incomeChange) }}
            </span> par rapport au mois dernier
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">Dépenses (ce mois-ci)</h3>
          <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(monthlyExpense) }}</p>
          <div v-if="expenseChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="expenseChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatPercent(expenseChange) }}
            </span> par rapport au mois dernier
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
            class="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-4 text-center"
            @click="showTransactionModal = true"
        >
          <div class="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mb-3">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <span class="text-neutral-900 dark:text-neutral-50 font-medium">Nouvelle transaction</span>
        </button>

        <button
class="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-4 text-center"
                @click="openAddBudgetModal()">
          <div class="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mb-3">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <span class="text-neutral-900 dark:text-neutral-50 font-medium">Nouveau budget</span>
        </button>

        <button
class="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-4 text-center"
                @click="navigateTo('/reports')">
          <div class="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mb-3">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <span class="text-neutral-900 dark:text-neutral-50 font-medium">Voir les rapports</span>
        </button>

        <button
class="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-4 text-center"
                @click="navigateTo('/settings')">
          <div class="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mb-3">
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="text-neutral-900 dark:text-neutral-50 font-medium">Paramètres</span>
        </button>
      </div>

      <!-- Transactions récentes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-50">Transactions récentes</h2>
          <button
class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  @click="navigateTo('/transactions')">Voir tout
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="transactions.length === 0" class="py-8 text-center text-neutral-500">
          <p>Aucune transaction récente</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800">
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Date</th>
              <th class="text-left py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Description
              </th>
              <th class="text-right py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Montant</th>
              <th class="text-right py-2 px-2 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
v-for="transaction in transactions.slice(0, 5)" :key="transaction.id"
                class="border-b border-neutral-200 dark:border-neutral-800">
              <td class="py-3 px-2 text-sm text-neutral-600 dark:text-neutral-400">{{ formatDate(transaction.date) }}
              </td>
              <td class="py-3 px-2 text-sm text-neutral-800 dark:text-neutral-200">
                {{ transaction.description }}
                <span
v-if="transaction.category"
                      class="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {{ transaction.category }}
                  </span>
              </td>
              <td
class="py-3 px-2 text-sm text-right font-medium"
                  :class="transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ transaction.type === 'income' ? '+' : '-' }} {{ formatCurrency(transaction.amount) }}
              </td>
              <td class="py-3 px-2 text-right">
                <div class="flex justify-end space-x-2">
                  <button
class="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
                          @click="editTransaction(transaction)">
                    <span class="sr-only">Modifier</span>
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
class="text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                          @click="confirmDeleteTransaction(transaction)">
                    <span class="sr-only">Supprimer</span>
                    <svg
xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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

    <!-- Modals -->
    <TransactionModal
        v-model="showTransactionModal"
        :transaction="selectedTransaction"
        @transaction-added="onTransactionAdded"
        @transaction-updated="onTransactionUpdated"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated']
});

// ==== STATE ====
const transactions = ref([]);
const loading = ref(true);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// ==== HELPERS ====
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const getPreviousMonth = (year, month) => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

const { year: prevYear, month: prevMonth } = getPreviousMonth(currentYear, currentMonth);

const parseDate = (dateString) => {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
};

// ==== COMPUTED ====
const balance = computed(() =>
    transactions.value.reduce((total, t) => {
      const amount = Number(t.amount) || 0;
      return total + (t.type === 'income' ? amount : -amount);
    }, 0)
);

const monthlyBalance = computed(() =>
  transactions.value
    .filter(t => {
      const d = parseDate(t.date);
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((total, t) => {
      const amount = Number(t.amount) || 0;
      return total + (t.type === 'income' ? amount : -amount);
    }, 0)
);

const balanceChange = computed(() => {
  const prevBalance = transactions.value
    .filter(t => {
      const d = parseDate(t.date);
      return d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    })
    .reduce((total, t) => {
      const amount = Number(t.amount) || 0;
      return total + (t.type === 'income' ? amount : -amount);
    }, 0);

  if (prevBalance === 0) return null;
  return ((monthlyBalance.value - prevBalance) / Math.abs(prevBalance)) * 100;
});


const monthlyIncome = computed(() =>
    transactions.value
        .filter(t => {
          const d = parseDate(t.date);
          return t.type === 'income' && d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
);

const previousIncome = computed(() =>
    transactions.value
        .filter(t => {
          const d = parseDate(t.date);
          return t.type === 'income' && d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
);

const monthlyExpense = computed(() =>
    transactions.value
        .filter(t => {
          const d = parseDate(t.date);
          return t.type === 'expense' && d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
);


const previousExpense = computed(() =>
    transactions.value
        .filter(t => {
          const d = parseDate(t.date);
          return t.type === 'expense' && d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
);


const incomeChange = computed(() => {
  if (previousIncome.value === 0) {
    return null;
  }
  return ((monthlyIncome.value - previousIncome.value) / Math.abs(previousIncome.value)) * 100;
});

const expenseChange = computed(() => {
  if (previousExpense.value === 0) {
    return null; // pour éviter la division par zéro
  }
  return ((monthlyExpense.value - previousExpense.value) / Math.abs(previousExpense.value)) * 100;
});

// ==== API ====
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');
    transactions.value = response.transactions || [];
  } catch (err) {
    console.error('Erreur lors du chargement des transactions:', err);
  } finally {
    loading.value = false;
  }
};

const deleteTransaction = async (id) => {
  try {
    await $fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    transactions.value = transactions.value.filter(t => t.id !== id);
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
  }
};

// ==== MODALS ====
const openTransactionModal = () => {
  selectedTransaction.value = null;
  showTransactionModal.value = true;
};

const editTransaction = (transaction) => {
  selectedTransaction.value = { ...transaction };
  showTransactionModal.value = true;
};

const confirmDeleteTransaction = (transaction) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${transaction.description}" ?`)) {
    deleteTransaction(transaction.id);
  }
};

// ==== EVENTS ====

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

const onTransactionAdded = (transactionArray) => {
  const transaction = transactionArray[0];
  if (!transaction) return;

  const newTransaction = {
    ...transaction,
    amount: Number(transaction.amount) || 0,
    date: transaction.date ? new Date(transaction.date).toISOString() : null
  };

  transactions.value = [newTransaction, ...transactions.value];
  showTransactionModal.value = false;
};

const onTransactionUpdated = (updatedTransaction) => {
  const index = transactions.value.findIndex(t => String(t.id) === String(updatedTransaction.id));
  if (index !== -1) {
    const normalized = {
      ...updatedTransaction,
      amount: Number(updatedTransaction.amount) || 0,
      date: updatedTransaction.date ? new Date(updatedTransaction.date).toISOString() : null
    };
    transactions.value.splice(index, 1, normalized);
  }
  selectedTransaction.value = null;
  showTransactionModal.value = false;
};

// ==== FORMATTERS ====
const formatCurrency = (amount) => {
  const value = Number(amount);
  return isNaN(value)
      ? '0 €'
      : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (dateString) => {
  const d = parseDate(dateString);
  return !d
      ? '-'
      : new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d);
};

const formatPercent = (value) => {
  if (value === null) return '-';
  return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
};


// ==== LIFECYCLE ====
onMounted(loadTransactions);

</script>