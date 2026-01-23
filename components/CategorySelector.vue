<template>
  <div class="relative w-full" ref="containerRef">
    <button
        type="button"
        @click.stop="toggleDropdown"
        class="relative w-full cursor-pointer rounded-md bg-white dark:bg-neutral-700 py-1.5 pl-3 pr-8 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-600 sm:text-xs sm:leading-6 min-h-[32px]"
    >
      <span class="block truncate">
        {{ selectedCategoryName || placeholder }}
      </span>
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
        </svg>
      </span>
    </button>

    <div v-if="isOpen" class="absolute z-[9999] mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-md bg-white dark:bg-neutral-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">

      <div class="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-2 border-b border-gray-100 dark:border-gray-700">
        <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-neutral-900 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none dark:text-gray-200"
            placeholder="Chercher..."
            @click.stop
        >
      </div>

      <div v-if="filteredCategories.length === 0" class="px-4 py-2 text-gray-500 text-xs italic">
        Aucune catégorie trouvée
      </div>

      <div v-else>
        <div v-if="filteredIncome.length > 0" class="px-2 py-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 mt-1">
          Revenus
        </div>
        <div
            v-for="cat in filteredIncome"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-900 dark:text-gray-200 text-xs"
            :class="{'bg-primary-50 dark:bg-primary-900/20 font-medium': modelValue === cat.id}"
        >
          {{ cat.name }}
        </div>

        <div v-if="filteredExpense.length > 0" class="px-2 py-1 text-[10px] uppercase font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 mt-1 border-t border-gray-100 dark:border-gray-700">
          Dépenses
        </div>
        <div
            v-for="cat in filteredExpense"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-900 dark:text-gray-200 text-xs"
            :class="{'bg-primary-50 dark:bg-primary-900/20 font-medium': modelValue === cat.id}"
        >
          {{ cat.name }}
        </div>
      </div>
    </div>

    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-[9998] cursor-default"></div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  categories: { type: Array, required: true },
  placeholder: { type: String, default: '-- Choisir --' }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref(null);

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    await nextTick();
    if(searchInputRef.value) searchInputRef.value.focus();
  }
};

const selectCategory = (id) => {
  emit('update:modelValue', id);
  isOpen.value = false;
};

const selectedCategoryName = computed(() => {
  if (!props.modelValue) return null;
  const found = props.categories.find(c => c.id === props.modelValue);
  return found ? found.name : null;
});

const allFiltered = computed(() => {
  if (!searchQuery.value) return props.categories;
  const q = searchQuery.value.toLowerCase();
  return props.categories.filter(c => c.name.toLowerCase().includes(q));
});

const filteredIncome = computed(() => allFiltered.value.filter(c => c.typeId === 1));
const filteredExpense = computed(() => allFiltered.value.filter(c => c.typeId === 2));
const filteredCategories = computed(() => allFiltered.value);
</script>