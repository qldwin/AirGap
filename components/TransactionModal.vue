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
                placeholder="Ex: Salaire, Courses Leclerc, Loyer..."
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
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <div class="flex gap-3 mt-1">
              <label class="flex items-center cursor-pointer">
                <input
                    type="radio"
                    v-model="form.type"
                    value="income"
                    class="mr-2"
                />
                <span class="text-green-600 dark:text-green-400 font-medium">Revenu</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                    type="radio"
                    v-model="form.type"
                    value="expense"
                    class="mr-2"
                />
                <span class="text-red-600 dark:text-red-400 font-medium">Dépense</span>
              </label>
            </div>
              Type
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
                type="date"
                id="date"
                v-model="form.date"
                class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                required
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700 mt-4">
            <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
// --- CONSTANTES ---
// Doivent correspondre exactement aux IDs dans ta table typeTransactions
const TYPE_INCOME = 1;
const TYPE_EXPENSE = 2;

// --- PROPS & EMITS ---
const props = defineProps({
  modelValue: Boolean, // Pour v-model
  transaction: {
    type: Object,
    default: null
  }
});

const emits = defineEmits(['update:modelValue', 'transaction-added', 'transaction-updated']);

// --- STATE ---
const isLoading = ref(false);
const isLoadingCategories = ref(true);
const allCategories = ref([]); // Liste brute venant de l'API

// Gestion ouverture/fermeture via v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});

const isEditing = computed(() => !!props.transaction);
const today = new Date().toISOString().split('T')[0];

const form = ref({
  description: '',
  amount: '',
  type: 'expense', // Valeur par défaut pour l'UI (boutons radio)
  categoryId: null, // ID pour la BDD
  date: today
});

// --- API : CHARGEMENT CATÉGORIES ---
onMounted(async () => {
  try {
    isLoadingCategories.value = true;
    // Appel à ton API: server/api/categories/index.get.ts
    // Elle renvoie { categories: [...] }
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
  // On traduit le type texte ('income'/'expense') en ID (1/2) pour filtrer
  const currentTypeId = form.value.type === 'income' ? TYPE_INCOME : TYPE_EXPENSE;

  // On ne garde que les catégories qui correspondent au type sélectionné
  return allCategories.value.filter(c => c.typeId === currentTypeId);
});

// --- WATCHERS ---

// 1. Reset automatique de la catégorie si on change le Type
watch(() => form.value.type, (newType, oldType) => {
  // On ne vide le champ que si l'utilisateur change manuellement le type (pas au chargement)
  if (oldType && !props.transaction) {
    form.value.categoryId = null;
  } else if (oldType && props.transaction) {
    // Si on édite et qu'on change de type, on reset aussi
    // Sauf si c'est l'initialisation du formulaire (géré ci-dessous)
    const initialType = props.transaction.typeTransactionsId === TYPE_INCOME ? 'income' : 'expense';
    if (newType !== initialType) {
      form.value.categoryId = null;
    }
  }
});

// 2. Initialisation du formulaire quand on ouvre en mode EDIT
watch(
    () => props.transaction,
    (newTransaction) => {
      if (newTransaction) {
        // Le Dashboard nous passe un objet transaction complet.
        // On récupère le type ID (BDD) pour cocher le bon radio button
        const formType = newTransaction.typeTransactionsId === TYPE_INCOME ? 'income' : 'expense';

        // On s'assure d'avoir une date valide au format YYYY-MM-DD
        let formattedDate = today;
        if (newTransaction.date) {
          formattedDate = new Date(newTransaction.date).toISOString().split('T')[0];
        }

        form.value = {
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: formType,
          // IMPORTANT : On récupère l'ID de la catégorie.
          // Si le Dashboard a mappé les données, assurez-vous que categoryId est bien présent.
          categoryId: newTransaction.categoryId || null,
          date: formattedDate
        };
      }
    },
    { immediate: true }
);

// 3. Reset du formulaire quand on ouvre en mode CRÉATION
watch(() => isOpen.value, (open) => {
  if (open && !props.transaction) {
    form.value = {
      description: '',
      amount: '',
      type: 'expense',
      categoryId: null,
      date: today
    };
  }
});

const closeModal = () => {
  isOpen.value = false;
};

// --- SUBMIT ---
const submitForm = async () => {
  try {
    isLoading.value = true;

    // 1. Préparation du Payload pour l'API
    const typeId = form.value.type === 'income' ? TYPE_INCOME : TYPE_EXPENSE;

    const payload = {
      description: form.value.description,
      amount: Number(form.value.amount),
      date: form.value.date ? new Date(form.value.date).toISOString() : new Date().toISOString(),

      // Champs relationnels
      typeTransactionsId: typeId,
      categoryId: form.value.categoryId, // Peut être null, mais idéalement requis

      accountId: 1 // TODO: À dynamiser plus tard
    };

    let response;

    // 2. Appel API (POST ou PATCH)
    if (isEditing.value) {
      // UPDATE : server/api/transactions/[id].patch.ts
      response = await $fetch(`/api/transactions/${props.transaction.id}`, {
        method: 'PATCH',
        body: payload
      });
      emits('transaction-updated', response.transaction || response);

    } else {
      // CREATE : server/api/transactions/index.post.ts
      response = await $fetch('/api/transactions', {
        method: 'POST',
        body: payload
      });
      emits('transaction-added', response.transaction || response);
    }

    closeModal();

  } catch (error) {
    console.error('Erreur:', error);
    // Affichage du message d'erreur renvoyé par l'API (ex: createError 400...)
    const message = error.response?._data?.statusMessage || error.message || "Erreur lors de l'enregistrement";
    alert("Erreur : " + message);
  } finally {
    isLoading.value = false;
  }
};
</script>