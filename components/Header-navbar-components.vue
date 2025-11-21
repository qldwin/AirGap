<template>
  <header
      class="fixed w-full top-0 left-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-semibold text-primary-600 dark:text-primary-400">Finantia</NuxtLink>
        </div>

        <!-- Navigation -->
<!--        <nav class="hidden md:flex items-center space-x-1">-->
<!--          <NuxtLink-->
<!--              to="/"-->
<!--              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"-->
<!--              active-class="text-primary-600 dark:text-primary-400 font-medium"-->
<!--          >-->
<!--            Accueil-->
<!--          </NuxtLink>-->

          <NuxtLink
              to="/dashboard"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Tableau de bord
          </NuxtLink>

        <NuxtLink
              to="/transactions"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Transactions
          </NuxtLink>

          <NuxtLink
              to="/budget"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Budgets
          </NuxtLink>

          <NuxtLink
              to="/about"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            À propos
          </NuxtLink>
        <div class="flex items-center space-x-3">
          <!-- Boutons d'authentification -->
          <div v-if="loggedIn" class="relative">
            <button
                class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                @click="toggleDropdown"
            >
              <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ user?.name || 'Utilisateur' }}</span>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-neutral-700 dark:text-neutral-300 transition-transform"
                  :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <div
                v-if="isDropdownOpen"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800"
            >
              <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="isDropdownOpen = false"
              >
                Mon profil
              </NuxtLink>
              <button
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="logout"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <NuxtLink
              v-if="!loggedIn"
              to="/register"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Créer un compte
          </NuxtLink>
          <NuxtLink
              v-if="!loggedIn"
              to="/login"
              class="px-3 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Se connecter
          </NuxtLink>

          <!-- Theme switcher -->
          <button
              class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Changer de thème"
              @click="toggleTheme"
          >
            <svg
                v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
              <path
                  fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clip-rule="evenodd"/>
            </svg>
            <svg
                v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-700 dark:text-neutral-300"
                viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>

        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const {loggedIn, user, clear: clearSession} = useUserSession();
// État du thème
const isDarkTheme = ref(false);

// États du menu
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

// Fermer le dropdown quand on clique ailleurs
const closeDropdown = (event) => {
  if (isDropdownOpen.value && !event.target.closest('.relative')) {
    isDropdownOpen.value = false;
  }
};

// Toggle pour le dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// // Fonction de déconnexion
async function logout() {
  await clearSession()
  await navigateTo('/login')
}

onMounted(() => {
  // Initialisation du thème
  isDarkTheme.value = document.documentElement.classList.contains('dark');

  // Ajouter l'écouteur pour fermer le dropdown
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  // Nettoyer l'écouteur
  document.removeEventListener('click', closeDropdown);
});

// Fonction pour changer de thème
function toggleTheme() {
  const html = document.documentElement;

  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    isDarkTheme.value = false;
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    isDarkTheme.value = true;
    localStorage.setItem('theme', 'dark');
  }
}

// Fermer le menu mobile et le dropdown quand on change de route
watch(() => window.location.href, () => {
  isMobileMenuOpen.value = false;
  isDropdownOpen.value = false;
});
</script>