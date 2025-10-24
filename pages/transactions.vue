<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Transactions</h1>

        <div class="flex items-center space-x-3">
          <button
              class="btn btn-primary text-sm px-4 py-2 flex items-center"
              @click="showTransactionModal = true"
          >
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle transaction
          </button>
          <button class="btn btn-outline text-sm px-3 py-1" @click="navigateTo('/dashboard')">
            Retour au tableau de bord
          </button>
        </div>
      </div>

      <div class="card">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="transactions.length === 0" class="py-8 text-center text-neutral-500">
          <p>Aucune transaction</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800">
              <th class="text-left py-2 px-4 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Date</th>
              <th class="text-left py-2 px-4 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Description
              </th>
              <th class="text-right py-2 px-4 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Montant</th>
              <th class="text-right py-2 px-4 text-neutral-700 dark:text-neutral-300 text-sm font-medium">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
v-for="transaction in transactions" :key="transaction.id"
                class="border-b border-neutral-200 dark:border-neutral-800">
              <td class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{{
                  formatDate(transaction.date)
                }}
              </td>
              <td class="py-3 px-4 text-sm text-neutral-800 dark:text-neutral-200">
                {{ transaction.description }}
                <span
v-if="transaction.category"
                      class="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {{ transaction.category }}
                  </span>
              </td>
              <td
class="py-3 px-4 text-sm text-right font-medium"
                  :class="transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ transaction.type === 'income' ? '+' : '-' }} {{ formatCurrency(transaction.amount) }}
              </td>
              <td class="py-3 px-4 text-right">
                <button
class="text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 mr-2"
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
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TransactionModal
v-model="showTransactionModal" :transaction="selectedTransaction"
                      @transaction-added="onTransactionAdded" @transaction-updated="onTransactionUpdated"/>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated']
});
// const toast = useToast();

// État pour les transactions
const transactions = ref([]);
const loading = ref(true);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// Charger les transactions de l'utilisateur
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');
    transactions.value = response.transactions || [];
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error);
    // toast.error('Erreur lors du chargement des transactions');
  } finally {
    loading.value = false;
  }
};

// Ouvrir le modal de nouvelle transaction
const openTransactionModal = () => {
  selectedTransaction.value = null;
  showTransactionModal.value = true;
};

// Ouvrir le modal d'édition de transaction
const editTransaction = (transaction) => {
  selectedTransaction.value = transaction;
  showTransactionModal.value = true;
};

// Confirmer la suppression d'une transaction
const confirmDeleteTransaction = (transaction) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.description}" ?`)) {
    deleteTransaction(transaction.id);
  }
};

// Supprimer une transaction
const deleteTransaction = async (id) => {
  try {
    await $fetch(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
    transactions.value = transactions.value.filter(t => t.id !== id);
    // toast.success('Transaction supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la transaction:', error);
    // toast.error('Erreur lors de la suppression de la transaction');
  }
};

// Événement après ajout d'une transaction
const onTransactionAdded = (transaction) => {
  transaction.amount = Number(transaction.amount);
  transaction.date = new Date(transaction.date).toISOString();
  transactions.value = [transaction, ...transactions.value];
  showTransactionModal.value = false;
};

// Événement après mise à jour d'une transaction
const onTransactionUpdated = (updatedTransaction) => {
  const index = transactions.value.findIndex(t => t.id === updatedTransaction.id);
  if (index !== -1) {
    transactions.value[index] = updatedTransaction;
  }
};

// Formatter les montants en euros
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Formatter les dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Vérifier l'authentification et charger les données au chargement de la page
onMounted(async () => {
  await loadTransactions();
});
</script> 