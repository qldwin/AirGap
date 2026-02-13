<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="closeModal"/>

    <div class="bg-white dark:bg-neutral-800 shadow-xl rounded-lg w-full max-w-md mx-auto z-50 relative">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
          {{ isEditing ? 'Modifier la transaction' : 'Nouvelle transaction' }}
        </h2>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div>
            <label for="description" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
            <input
                id="description"
                v-model="form.description"
                type="text"
                class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Ex: Salaire, Courses Leclerc, Loyer..."
                required
            >
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant</label>
            <div class="relative">
              <input
                  id="amount"
                  v-model.number="form.amount"
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
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <div class="flex gap-3 mt-1">
              <label class="flex items-center cursor-pointer">
                <input
                    v-model="form.type"
                    type="radio"
                    value="income"
                    class="mr-2"
                >
                <span class="text-green-600 dark:text-green-400 font-medium">Revenu</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                    v-model="form.type"
                    type="radio"
                    value="expense"
                    class="mr-2"
                >
                <span class="text-red-600 dark:text-red-400 font-medium">Dépense</span>
              </label>
            </div>
            </label>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie</label>
            <select
                id="category"
                v-model="form.categoryId"
                class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                :disabled="isLoadingCategories"
                required
            >
              <option :value="null" disabled>Sélectionner une catégorie</option>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>

            <p v-if="filteredCategories.length === 0 && !isLoadingCategories" class="text-xs text-orange-500 mt-1">
              Aucune catégorie trouvée pour ce type.
            </p>
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date</label>
            <input
                id="date"
                v-model="form.date"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                required
            >
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700 mt-4">
            <button
                type="button"
                class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                @click="closeModal"
            >
              Annuler
            </button>
            <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
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
import { ref, onMounted, computed, watch } from 'vue';

// --- PROPS & EMITS ---
const props = defineProps({
  modelValue: Boolean,
  transaction: {
    type: Object,
    default: null
  }
});
const emits = defineEmits(['update:modelValue', 'transaction-added', 'transaction-updated']);

// --- STATE ---
const isLoading = ref(false);
const isLoadingCategories = ref(true);
const allCategories = ref([]);
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});
const isEditing = computed(() => !!props.transaction);
const today = new Date().toISOString().split('T')[0];
const form = ref({
  description: '',
  amount: '',
  type: 'depense',
  categoryId: null,
  date: today
});

// --- API : CHARGEMENT CATÉGORIES ---
onMounted(async () => {
  try {
    isLoadingCategories.value = true;
    const response = await $fetch('/api/categories');
    allCategories.value = response.categories || [];
  } catch (e) {
    console.error("Erreur lors du chargement des catégories:", e);
  } finally {
    isLoadingCategories.value = false;
  }
});

// --- COMPUTED : FILTRAGE ---
const filteredCategories = computed(() => {
  const currentEnum = form.value.type === 'income' ? 'revenu' : 'depense';
  return allCategories.value.filter(c => {
    return c.typeTransaction === currentEnum;
  });
});

// --- WATCHERS ---

watch(() => form.value.type, (newType, oldType) => {
  if (oldType && !props.transaction) {
    form.value.categoryId = null;
  } else if (oldType && props.transaction) {
    const initialType = props.transaction.typeTransaction === 'revenu' ? 'income' : 'expense';
    if (newType !== initialType) {
      form.value.categoryId = null;
    }
  }
});

watch(
    () => props.transaction,
    (newTransaction) => {
      if (newTransaction) {
        const formType = newTransaction.typeTransaction === 'revenu' ? 'income' : 'expense';
        let formattedDate = today;
        if (newTransaction.date) {
          formattedDate = new Date(newTransaction.date).toISOString().split('T')[0];
        }
        form.value = {
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: formType,
          categoryId: newTransaction.categoryId || null,
          date: formattedDate
        };
      }
    },
    { immediate: true }
);

// --- SUBMIT ---
const submitForm = async () => {
  try {
    isLoading.value = true;

    const typeValue = form.value.type === 'income' ? 'revenu' : 'depense';
    const payload = {
      description: form.value.description,
      amount: Number(form.value.amount),
      date: form.value.date,
      typeTransaction: typeValue,
      categoryId: form.value.categoryId,
      accountId: null
    };

    let response;

    if (isEditing.value) {
      response = await $fetch(`/api/transactions/${props.transaction.id}`, {
        method: 'PATCH',
        body: payload
      });
      emits('transaction-updated', response.transaction || response);
    } else {
      response = await $fetch('/api/transactions', {
        method: 'POST',
        body: payload
      });
      emits('transaction-added', response.transaction || response);
    }
    closeModal();
  } catch (error) {
    console.error('Erreur:', error);
    const message = error.response?._data?.statusMessage || error.message || "Erreur d'enregistrement";
    alert("Erreur : " + message);
  } finally {
    isLoading.value = false;
  }
};

// --- ACTIONS ---
const closeModal = () => {
  isOpen.value = false;
}
</script>