<template>
  <div class="py-8 px-4">
    <div class="max-w-4xl mx-auto">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Catégories</h1>

        <Button
            class="cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
            @click="openCategorieModal"
        >
          <PlusIcon class="h-4 w-4 mr-2 stroke-[3]"/>
          Nouvelle catégorie
        </Button>
      </div>

      <Card class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="categories.length === 0" class="text-center py-12 text-neutral-500 dark:text-neutral-400">
          <p>Aucune catégorie trouvée. Créez votre première catégorie !</p>
        </div>

        <div v-else class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div v-for="category in categories" :key="category.id"
               class="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">

            <div class="flex items-center gap-3">
              <span class="font-medium text-neutral-900 dark:text-neutral-100">
                {{ category.name }}
              </span>
              <span
                  class="text-xs px-2 py-0.5 rounded-full border"
                  :class="category.typeTransaction === 'revenu'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'"
              >
                {{ category.typeTransaction === 'revenu' ? 'Revenu' : 'Dépense' }}
              </span>
            </div>

            <div class="flex items-center space-x-1">
              <Button
                  variant="ghost"
                  class="cursor-pointer p-2 h-auto text-neutral-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-md"
                  @click="editCategorie(category)">
                <span class="sr-only">Modifier</span>
                <SquarePen class="h-4 w-4"/>
              </Button>

              <Button
                  variant="ghost"
                  class="cursor-pointer p-2 h-auto text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-md"
                  @click="confirmDeleteCategorie(category)">
                <span class="sr-only">Supprimer</span>
                <TrashIcon class="h-4 w-4"/>
              </Button>
            </div>

          </div>
        </div>
      </Card>
    </div>

    <CategorieModal
        v-model="showCategorieModal"
        :category="selectedCategorie"
        @category-added="onCategorieSaved"
        @category-updated="onCategorieSaved"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PlusIcon, SquarePen, TrashIcon } from "lucide-vue-next";
import CategorieModal from '~/components/CategorieModal.vue';

definePageMeta({
  middleware: ['authenticated']
});

// --- ÉTATS ---
const loading = ref(true);
const categories = ref([]);
const showCategorieModal = ref(false);
const selectedCategorie = ref(null);

// --- CHARGEMENT DES DONNÉES ---
const loadCategories = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/categories');
    categories.value = response.categories || response || [];
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCategories();
});

// --- ACTIONS MODAL ---
const openCategorieModal = () => {
  selectedCategorie.value = null;
  showCategorieModal.value = true;
};

const editCategorie = (category) => {
  selectedCategorie.value = { ...category };
  showCategorieModal.value = true;
};

const onCategorieSaved = () => {
  loadCategories();
  showCategorieModal.value = false;
};

// --- SUPPRESSION ---
const confirmDeleteCategorie = async (category) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) return;

  try {
    await $fetch(`/api/categories/${category.id}`, { method: 'DELETE' });

    categories.value = categories.value.filter(c => c.id !== category.id);
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    alert("Impossible de supprimer cette catégorie. Elle est peut-être utilisée par des transactions.");
  }
};
</script>