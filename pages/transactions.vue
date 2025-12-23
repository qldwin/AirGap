<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Transactions</h1>

        <div class="flex items-center space-x-3">
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

    <TransactionModal
        v-model="showTransactionModal"
        :transaction="selectedTransaction"
        @transaction-added="onTransactionSaved"
        @transaction-updated="onTransactionSaved"
    />
  </div>
</template>

<script setup>
// --- CONFIGURATION ---
definePageMeta({
  middleware: ['authenticated']
});

// CONSTANTES (Doivent correspondre à la BDD)
const TYPE_INCOME = 1;
const TYPE_EXPENSE = 2;

// --- ÉTAT ---
const transactions = ref([]);
const loading = ref(true);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// --- LOGIQUE MÉTIER (Couleurs & Signes) ---

// Vérifie si c'est un revenu en se basant sur l'ID de la BDD
const isIncome = (t) => {
  return t.typeTransactionsId === TYPE_INCOME;
};

const getTransactionClass = (t) => {
  return isIncome(t)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
};

const getTransactionSign = (t) => {
  return isIncome(t) ? '+' : '-';
};

// --- CHARGEMENT ---
const loadTransactions = async () => {
  try {
    loading.value = true;

    // Appel API
    const response = await $fetch('/api/transactions');

    // MAPPING :
    // L'API renvoie "category" sous forme d'objet { id:..., name:... }
    // Le template s'attend à afficher {{ transaction.category }} comme du texte.
    // On transforme donc les données ici pour simplifier le template.
    transactions.value = (response.transactions || []).map(t => ({
      ...t,
      // Si category est un objet, on prend son nom, sinon 'Aucune'
      category: t.category?.name || '',
      // On s'assure que les chiffres sont bien des types Number
      amount: Number(t.amount),
      typeTransactionsId: Number(t.typeTransactionsId)
    }));

  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error);
  } finally {
    loading.value = false;
  }
};

// --- ACTIONS MODAL ---
const openTransactionModal = () => {
  selectedTransaction.value = null; // Mode Création
  showTransactionModal.value = true;
};

const editTransaction = (transaction) => {
  // On passe une copie de l'objet pour éviter de modifier le tableau en direct avant la sauvegarde
  selectedTransaction.value = { ...transaction };
  showTransactionModal.value = true;
};

// --- ACTIONS CRUD ---

// Appelé après Ajout OU Modification
const onTransactionSaved = () => {
  // On recharge la liste complète depuis le serveur.
  // POURQUOI ? Car l'API, lors d'une création, renvoie souvent l'objet brut sans le nom de la catégorie (JOIN).
  // Recharger assure que le tableau affiche bien le nom de la catégorie et les bonnes couleurs.
  loadTransactions();
  showTransactionModal.value = false;
};

const confirmDeleteTransaction = async (transaction) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.description}" ?`)) {
    try {
      await $fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' });

      // Mise à jour locale pour éviter un rechargement complet
      transactions.value = transactions.value.filter(t => t.id !== transaction.id);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Impossible de supprimer la transaction.");
    }
  }
};

// --- FORMATTERS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// --- INITIALISATION ---
onMounted(() => {
  loadTransactions();
});
</script>