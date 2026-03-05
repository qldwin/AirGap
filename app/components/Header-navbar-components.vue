<template>
  <div>
    <header
        class="fixed inset-x-0 top-0 mx-auto w-full max-w-6xl z-50 bg-white dark:bg-neutral-900 border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-lg transition-colors duration-300">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-semibold text-primary-600 dark:text-primary-400">AirGap</NuxtLink>
          </div>

          <nav aria-label="naviguation bar for mobile AirGap" class="hidden md:flex items-center space-x-20">
            <NuxtLink to="/" class="nav-link" active-class="nav-link-active">Tableau de bord</NuxtLink>
            <NuxtLink to="/transactions" class="nav-link" active-class="nav-link-active">Transactions</NuxtLink>
            <NuxtLink to="/budget" class="nav-link" active-class="nav-link-active">Budgets</NuxtLink>
            <NuxtLink to="/about" class="nav-link" active-class="nav-link-active">À propos</NuxtLink>
          </nav>

          <div class="flex items-center space-x-2">

            <button
                class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                @click="toggleTheme">
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

            <div class="hidden md:flex items-center space-x-2">
              <template v-if="loggedIn">
                <div class="relative">
                  <button
                      class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      @click="toggleDropdown">
                    <span class="text-sm text-neutral-700 dark:text-neutral-300">{{
                        user?.name || 'Utilisateur'
                      }}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-neutral-700 dark:text-neutral-300 transition-transform"
                        :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  <div
                      v-if="isDropdownOpen"
                      class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800">
                    <NuxtLink
                        to="/profile"
                        class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        @click="isDropdownOpen = false">Mon profil
                    </NuxtLink>
                    <NuxtLink
                        to="/settings"
                        class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        @click="isDropdownOpen = false">Paramètres
                    </NuxtLink>
                    <button
                        class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        @click="logout">Déconnexion
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav
        aria-label="naviguation menu for mobile version of AirGap"
        class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div class="flex justify-around items-center h-16 pb-2">
        <NuxtLink
            to="/"
            class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
        >
          <Home class="w-5 h-5 mb-1"/>
          <span class="text-[10px] uppercase tracking-wider">Accueil</span>
        </NuxtLink>
        <NuxtLink
            to="/transactions"
            class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
        >
          <ArrowRightLeft class="w-5 h-5 mb-1"/>
          <span class="text-[10px] uppercase tracking-wider">Transactions</span>
        </NuxtLink>
        <NuxtLink
            to="/budget"
            class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
        >
          <PieChart class="w-5 h-5 mb-1"/>
          <span class="text-[10px] uppercase tracking-wider">Budgets</span>
        </NuxtLink>
        <NuxtLink
            to="/profile"
            class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium"
        >
          <User class="w-5 h-5 mb-1"/>
          <span class="text-[10px] uppercase tracking-wider">Profil</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import {ref, watch, onMounted, onUnmounted} from 'vue';
import {Home, ArrowRightLeft, PieChart, User} from 'lucide-vue-next'

const {loggedIn, user, clear: clearSession} = useUserSession();
const isDarkTheme = ref(false);
const isDropdownOpen = ref(false);

const closeDropdown = (event) => {
  if (isDropdownOpen.value && !event.target.closest('.relative')) {
    isDropdownOpen.value = false;
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

async function logout() {
  await clearSession()
  await navigateTo('/login')
}

onMounted(() => {
  isDarkTheme.value = document.documentElement.classList.contains('dark');
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

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

watch(() => globalThis.location?.href, () => {
  isDropdownOpen.value = false;
});
</script>

<style scoped>
@reference "@/assets/css/styles.css";

.nav-link {
  @apply px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:bg-neutral-800 transition-colors;
}

.nav-link-active {
  @apply text-primary-600 dark:text-primary-400 font-medium;
}

.mobile-nav-link {
  @apply block px-3 py-3 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors;
}

.mobile-nav-link-active {
  @apply bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400 font-medium;
}
</style>