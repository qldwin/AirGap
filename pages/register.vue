<template>
  <div class="flex justify-center items-center py-12">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Créer un compte</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">Rejoignez Finantia pour gérer vos finances</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleRegister">

        <div>
          <label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
          <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="Votre nom"
          >
        </div>

        <div>
          <label
              for="reg-email"
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
          <input
              id="reg-email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="votre@email.com"
          >
        </div>

        <div>
          <label for="reg-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mot de
            passe</label>
          <input
              id="reg-password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="8 caractères minimum"
              minlength="8"
          >
        </div>

        <div>
          <label for="confirm-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirmer
            le mot de passe</label>
          <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="Confirmer votre mot de passe"
          >
        </div>

        <button
            type="submit"
            class="w-full btn btn-primary flex justify-center">
          <span>Créer un compte</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Vous avez déjà un compte?
          <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">Se
            connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

async function handleRegister() {
  $fetch('/api/auth/register', {
    method: 'POST',
    body: form,
  })
      .then(() => {
        navigateTo('/login');
      })
      .catch((error) => {
        error.value = error.response.data.message || 'Une erreur est survenue';
      });
}
</script> 