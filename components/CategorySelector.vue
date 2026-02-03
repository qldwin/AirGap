<template>
  <div ref="containerRef" class="relative w-full font-sans">
    <button
        type="button"
        class="group relative w-full flex items-center justify-between rounded-xl bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm transition-all duration-200 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:ring-4 hover:ring-primary-500/10 focus:outline-none shadow-sm"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isOpen }"
        @click.stop="toggleDropdown"
    >
      <span class="truncate flex items-center gap-2" :class="selectedCategoryName ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'">
        <div v-if="selectedCategory" :class="selectedCategory.typeId === 1 ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"/>
        {{ selectedCategoryName || placeholder }}
      </span>
      <ChevronDownIcon class="h-4 w-4 text-neutral-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div
          v-if="isOpen"
          class="absolute z-[9999] mt-2 max-h-72 w-full overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-black/5 border border-neutral-200 dark:border-neutral-800 flex flex-col"
      >
        <div class="relative border-b border-neutral-100 dark:border-neutral-800 p-2">
          <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="w-full rounded-lg bg-neutral-50 dark:bg-neutral-800 pl-8 pr-4 py-2 text-sm focus:outline-none dark:text-neutral-200"
              placeholder="Rechercher une catégorie..."
              @click.stop
          >
        </div>

        <div class="overflow-y-auto custom-scrollbar flex-1 py-1">
          <div v-if="filteredCategories.length === 0" class="px-4 py-8 text-center">
            <p class="text-neutral-400 text-sm">Aucun résultat trouvé</p>
          </div>

          <div v-else>
            <div v-if="filteredIncome.length > 0">
              <div class="px-4 py-2 text-[11px] font-bold tracking-wider text-neutral-400 uppercase">Revenus</div>
              <div
                  v-for="cat in filteredIncome"
                  :key="cat.id"
                  class="group mx-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors"
                  :class="modelValue === cat.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                  @click="selectCategory(cat.id)"
              >
                <span>{{ cat.name }}</span>
                <CheckIcon v-if="modelValue === cat.id" class="h-4 w-4" />
              </div>
            </div>

            <div v-if="filteredExpense.length > 0" class="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div class="px-4 py-2 text-[11px] font-bold tracking-wider text-neutral-400 uppercase">Dépenses</div>
              <div
                  v-for="cat in filteredExpense"
                  :key="cat.id"
                  class="group mx-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors"
                  :class="modelValue === cat.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                  @click="selectCategory(cat.id)"
              >
                <span>{{ cat.name }}</span>
                <CheckIcon v-if="modelValue === cat.id" class="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="isOpen" class="fixed inset-0 z-[9998]" @click="isOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const ChevronDownIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M19 9l-7 7-7-7" })]);
const SearchIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })]);
const CheckIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M5 13l4 4L19 7" })]);

const selectedCategory = computed(() => props.categories.find(c => c.id === props.modelValue));

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
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
</style>