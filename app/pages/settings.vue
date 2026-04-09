<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Paramètres</h1>
      </div>


      <div>
        <Item variant="outline" class="border-neutral-750 shadow-xl">
          <ItemContent class="flex flex-row w-full items-center justify-between">
            <div>
              <ItemTitle>Gestion des catégories</ItemTitle>
              <ItemDescription>Ajoutez, supprimez ou modifiez vos catégories.</ItemDescription>
            </div>
            <div>
              <ItemActions class="flex-row-reverse">
                <Button variant="outline" size="sm" class="cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
                        @click="openCategorieModal"
                >
                  Gérer les catégories
                </Button>
              </ItemActions>
            </div>
          </ItemContent>
        </Item>
      </div>

    </div>
  </div>
</template>

<script setup>
import {Item} from "~/components/ui/item/index.js";

definePageMeta({
  middleware: ['authenticated']
});

const openCategorieModal = () => {
  selectedCategorie.value = null;
  showCategorieModal.value = true;
};

const editTransaction = (transaction) => {
  selectedTransaction.value = {...transaction};
  showTransactionModal.value = true;
};

const onTransactionSaved = () => {
  loadTransactions();
  showTransactionModal.value = false;
};

</script>