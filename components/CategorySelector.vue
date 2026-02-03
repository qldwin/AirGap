<template>
  <Listbox v-model="selectedId" as="div" class="w-full">
    <ListboxButton
        class="group relative w-full flex items-center justify-between rounded-xl bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 focus:outline-none shadow-sm ui-open:ring-2 ui-open:ring-primary-500 ui-open:border-primary-500 transition-all"
    >
      <span class="truncate flex items-center gap-2" :class="selectedCategoryName ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'">
        <div v-if="selectedCategory" :class="selectedCategory.typeId === 1 ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"/>
        {{ selectedCategoryName || placeholder }}
      </span>
      <ChevronDownIcon class="h-4 w-4 text-neutral-400 ui-open:rotate-180 transition-transform" />
    </ListboxButton>

    <ListboxOptions
        anchor="bottom start"
        class="w-[var(--button-width)] z-[9999] mt-2 max-h-72 overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none"
    >
      <div class="relative border-b border-neutral-100 dark:border-neutral-800 p-2">
        <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
            v-model="searchQuery"
            type="text"
            class="w-full rounded-lg bg-neutral-50 dark:bg-neutral-800 pl-8 pr-4 py-2 text-sm focus:outline-none dark:text-neutral-200"
            placeholder="Rechercher..."
            @keydown.stop
        />
      </div>

      <div class="overflow-y-auto custom-scrollbar max-h-60 py-1">
        <div v-if="filteredCategories.length === 0" class="px-4 py-8 text-center text-neutral-400 text-sm">
          Aucun résultat
        </div>

        <template v-else>
          <div v-if="filteredIncome.length > 0">
            <div class="px-4 py-2 text-[11px] font-bold tracking-wider text-neutral-400 uppercase">Revenus</div>
            <ListboxOption
                v-for="cat in filteredIncome"
                :key="cat.id"
                v-slot="{ active, selected }"
                :value="cat.id"
                as="template"
            >
              <ul
                  class="group mx-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors"
                  :class="active || selected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'"
              >
                <span>{{ cat.name }}</span>
                <CheckIcon v-if="selected" class="h-4 w-4" />
              </ul>
            </ListboxOption>
          </div>

          <div v-if="filteredExpense.length > 0" class="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div class="px-4 py-2 text-[11px] font-bold tracking-wider text-neutral-400 uppercase">Dépenses</div>
            <ListboxOption
                v-for="cat in filteredExpense"
                :key="cat.id"
                v-slot="{ active, selected }"
                :value="cat.id"
                as="template"
            >
              <ul
                  class="group mx-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors"
                  :class="active || selected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'"
              >
                <span>{{ cat.name }}</span>
                <CheckIcon v-if="selected" class="h-4 w-4" />
              </ul>
            </ListboxOption>
          </div>
        </template>
      </div>
    </ListboxOptions>
  </Listbox>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';

// --- ICÔNES ---
const ChevronDownIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M19 9l-7 7-7-7" })]);
const SearchIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })]);
const CheckIcon = () => h('svg', { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "M5 13l4 4L19 7" })]);

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  categories: { type: Array, required: true },
  placeholder: { type: String, default: '-- Choisir --' }
});

const emit = defineEmits(['update:modelValue']);

const selectedId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// --- LOGIQUE MÉTIER SEULEMENT ---
const searchQuery = ref('');

const selectedCategory = computed(() => props.categories.find(c => c.id === props.modelValue));
const selectedCategoryName = computed(() => selectedCategory.value?.name);

const allFiltered = computed(() => {
  if (!searchQuery.value) return props.categories;
  const q = searchQuery.value.toLowerCase();
  return props.categories.filter(c => c.name.toLowerCase().includes(q));
});

const filteredIncome = computed(() => allFiltered.value.filter(c => c.typeId === 1));
const filteredExpense = computed(() => allFiltered.value.filter(c => c.typeId === 2));
const filteredCategories = computed(() => allFiltered.value);
</script>