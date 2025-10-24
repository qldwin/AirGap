<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Paramètres</h1>

        <button class="btn btn-outline text-sm px-3 py-1" @click="navigateTo('/dashboard')">
          Retour au tableau de bord
        </button>
      </div>

      <div class="card p-8 text-center">
        <svg
xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-neutral-400 mb-4" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Fonctionnalité en développement</h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          Les paramètres du compte seront bientôt disponibles. Revenez plus tard !
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated']
});
</script> 