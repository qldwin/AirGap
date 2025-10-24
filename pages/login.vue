<script setup lang="ts">
const {fetch: refreshSession} = useUserSession()
const credentials = ref({
  email: '',
  password: '',
});

async function handleLogin() {
  $fetch('/api/auth/login', {
    method: 'POST',
    body: {
      email: credentials.value.email,
      password: credentials.value.password,
    }
  })
      .then(async () => {
        await refreshSession()
        await navigateTo('/')
      })
      .catch(() => alert('Bad credentials'))
}
</script>

<template>
  <div class="flex justify-center items-center py-12">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Se connecter</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">Accédez à votre tableau de bord</p>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
          <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="votre@email.com"
          >
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mot de
              passe</label>
          </div>
          <input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="••••••••"
          >
        </div>
        <button
            type="submit"
            class="w-full btn btn-primary flex justify-center"
        >
          <span>Se connecter</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Pas encore de compte?
          <NuxtLink to="/register" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">Créer un
            compte
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

