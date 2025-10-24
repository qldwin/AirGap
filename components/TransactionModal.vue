<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="closeModal"></div>
    <div class="bg-white dark:bg-neutral-800 shadow-xl rounded-lg w-full max-w-md mx-auto z-50 relative">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
          {{ isEditing ? 'Modifier la transaction' : 'Nouvelle transaction' }}
        </h2>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label for="description" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
            <input 
              type="text" 
              id="description" 
              v-model="form.description" 
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="Salaire, courses, loyer..."
              required
            />
          </div>
          
          <div>
            <label for="amount" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant</label>
            <div class="relative">
              <input 
                type="number" 
                id="amount" 
                v-model.number="form.amount" 
                class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors pr-10"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">€</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Type</label>
            <div class="flex gap-3">
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="form.type" 
                  value="income" 
                  class="mr-2"
                />
                <span class="text-green-600 dark:text-green-400">Revenu</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="radio" 
                  v-model="form.type" 
                  value="expense" 
                  class="mr-2"
                />
                <span class="text-red-600 dark:text-red-400">Dépense</span>
              </label>
            </div>
          </div>
          
          <div>
            <label for="category" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie</label>
            <select 
              id="category" 
              v-model="form.category" 
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <option value="" disabled>Sélectionner une catégorie</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div>
            <label for="date" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date</label>
            <input 
              type="date" 
              id="date" 
              v-model="form.date" 
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              required
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              @click="closeModal" 
              class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              :disabled="isLoading"
            >
              <span v-if="isLoading">En cours...</span>
              <span v-else>{{ isEditing ? 'Enregistrer' : 'Ajouter' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Catégories prédéfinies
const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Logement',
  'Transport',
  'Loisirs',
  'Santé',
  'Éducation',
  'Shopping',
  'Factures',
  'Autres'
];

const INCOME_CATEGORIES = [
  'Salaire',
  'Freelance',
  'Dividendes',
  'Cadeaux',
  'Remboursements',
  'Ventes',
  'Autres'
];

const props = defineProps({
  modelValue: Boolean,
  transaction: {
    type: Object,
    default: null
  }
});

const emits = defineEmits(['update:modelValue', 'transaction-added', 'transaction-updated']);
//const emits = defineEmits(['update:modelValue', 'add', 'update']);

const isLoading = ref(false);
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});

const isEditing = computed(() => !!props.transaction);

const today = new Date().toISOString().split('T')[0];

const form = ref({
  description: '',
  amount: '',
  type: 'expense',
  category: '',
  date: today
});

// Catégories disponibles en fonction du type de transaction
const availableCategories = computed(() => {
  return form.value.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
});

// Réinitialiser le formulaire quand le modal s'ouvre
watch(
    () => props.transaction,
    (newTransaction) => {
      if (newTransaction) {
        form.value = {
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: newTransaction.type,
          category: newTransaction.category || '',
          date: newTransaction.date.split('T')[0]
        };
      }
    },
    { immediate: true }
);

watch(() => isOpen.value, (open) => {
  if (open && !props.transaction) {
    form.value = {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: today
    };
  }
});

// Fermer le modal
const closeModal = () => {
  isOpen.value = false;
};

// Soumettre le formulaire
const submitForm = async () => {
  try {
    isLoading.value = true;
    console.log('Date brute envoyée depuis le form:', form.value.date);
    const payload = {
      description: form.value.description,
      amount: Number(form.value.amount),
      type: form.value.type,
      category: form.value.category || undefined,
      //date: new Date(form.value.date).toISOString()
      date: form.value.date ? new Date(form.value.date).toISOString() : new Date().toISOString()
    };

    let response;

    if (isEditing.value) {
      // Mettre à jour une transaction existante
      response = await $fetch(`/api/transactions/${props.transaction.id}`, {
        method: 'PUT',
        body: payload
      });
      emits('transaction-updated', response.transaction[0]);
      // toast.success('Transaction modifiée avec succès');
    } else {
      // Créer une nouvelle transaction
      response = await $fetch('/api/transactions/create', {
        method: 'POST',
        body: payload
      });
      console.log('Réponse API création transaction :', response);

      emits('transaction-added', response.transaction);
      console.log('Émission depuis le modal :', response.transaction);
      // toast.success('Transaction ajoutée avec succès');
    }

    closeModal();
  } catch (error) {
    console.error('Erreur:', error);
    // toast.error(error.data?.statusMessage || 'Erreur lors de l\'enregistrement de la transaction');
  } finally {
    isLoading.value = false;
  }
};
</script> 