<template>
  <Listbox v-model="selectedId" as="div" class="w-full">

    <div ref="triggerRef" class="relative">
      <ListboxButton
          class="group relative w-full flex items-center justify-between rounded-xl bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 focus:outline-none shadow-sm ui-open:ring-2 ui-open:ring-primary-500 ui-open:border-primary-500 transition-all"
          @click="updatePosition"
      >
        <span class="truncate flex items-center gap-2" :class="selectedCategoryName ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'">
          <div v-if="selectedCategory" :class="selectedCategory.typeId === 1 ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"/>
          {{ selectedCategoryName || placeholder }}
        </span>
        <ChevronDownIcon class="h-4 w-4 text-neutral-400 ui-open:rotate-180 transition-transform" />
      </ListboxButton>
    </div>

    <Teleport to="body">
      <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
      >
        <ListboxOptions
            class="fixed z-[9999] mt-2 max-h-72 overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none"
            :style="dropdownStyles"
        >
          <div class="relative border-b border-neutral-100 dark:border-neutral-800 p-2">
            <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
                v-model="searchQuery"
                type="text"
                class="w-full rounded-lg bg-neutral-50 dark:bg-neutral-800 pl-8 pr-4 py-2 text-sm focus:outline-none dark:text-neutral-200"
                placeholder="Rechercher..."
                @keydown.stop
            >
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
      </Transition>
    </Teleport>
  </Listbox>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  categories: { type: Array, required: true },
  placeholder: { type: String, default: '-- Choisir --' }
});

const emit = defineEmits(['update:modelValue']);

// --- LOGIQUE DE POSITIONNEMENT---
const triggerRef = ref(null);
const dropdownStyles = ref({});

const updatePosition = async () => {
  await nextTick();

  if (triggerRef.value) {
    const btn = triggerRef.value.querySelector('button');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      dropdownStyles.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      };
    }
  }
};

// --- LOGIQUE MÉTIER ---
const selectedId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

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