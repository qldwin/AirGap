<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 dark:bg-neutral-900/60 backdrop-blur-sm" @click="closeModal"/>
    <Card class="w-full max-w-md mx-auto relative bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-500 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</CardTitle>
      </CardHeader>

      <form class="space-y-4" @submit.prevent="submitForm">
        <CardContent>
          <Field>
            <FieldLabel>Nom de la catégorie</FieldLabel>
            <Input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-1 focus:ring-button-3 transition-colors"
                placeholder="Ex: Alimentation"
                required
            />
          </Field>
          <Field class="mt-3">
            <FieldLabel>Type de catégorie</FieldLabel>
            <Select v-model="form.type">

              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type de catégorie" />
              </SelectTrigger>

              <SelectContent class="dark:bg-neutral-700 bg-white cursor-pointer">
                <SelectItem class="hover:dark:bg-neutral-600 hover:bg-neutral-400 cursor-pointer" value="revenu">Revenu</SelectItem>
                <SelectItem class="hover:dark:bg-neutral-600 hover:bg-neutral-400 cursor-pointer" value="depense">Dépense</SelectItem>
              </SelectContent>

            </Select>
          </Field>
        </CardContent>
        <CardFooter class="gap-2">
          <Button
              type="button"
              class="w-full cursor-pointer border-primary-50 text-neutral-700 dark:text-neutral-300 bg-neutral-500 dark:bg-neutral-700 hover:dark:bg-neutral-600 hover:bg-neutral-400 transition-colors"
              @click="closeModal"
          >
            Annuler
          </Button>

          <Button
              type="submit"
              class="w-full cursor-pointer text-primary-50 bg-primary-500 hover:bg-primary-600 transition-colors"
              :disabled="isLoading"
          >
            <span v-if="isLoading">En cours...</span>
            <span v-else>{{ isEditing ? 'Enregistrer' : 'Ajouter' }}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>

  </div>
</template>
<script setup>
import {computed, ref} from "vue";
import {SelectContent} from "~/components/ui/select/index.js";

const isLoading = ref(false);

// --- PROPS & EMITS ---
const props = defineProps({
  modelValue: Boolean,
  category: {
    type: Object,
    default: null
  }
});
const emits = defineEmits(['update:modelValue', 'category-added', 'category-updated']);

// --- STATE ---
const form = ref({
  name: '',
  type: 'depense',
});

const submitForm = async () => {
  try {
    isLoading.value = true;

    const payload = {
      name: form.value.name,
      typeTransaction: form.value.type,
    };

    if (isEditing.value) {
      await $fetch(`/api/categories/${props.category.id}`, {
        method: 'PATCH',
        body: payload
      });
      emits('category-updated');
    } else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: payload
      });
      emits('category-added');
    }
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire :', error);
  } finally {
    closeModal();
    isLoading.value = false;
  }
}

const isEditing = computed(() => {
  return !!props.category;
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});

const closeModal = () => {
  isOpen.value = false;
};

watch(
    () => props.category,
    (newCategory) => {
      if (newCategory) {
        form.value.name = newCategory.name;
        form.value.type = newCategory.typeTransaction === 'revenu' ? 'revenu' : 'depense';
      } else {
        form.value.name = '';
        form.value.type = 'depense';
      }
    },
    { immediate: true }
);
</script>