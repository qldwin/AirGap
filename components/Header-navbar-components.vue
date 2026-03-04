<template>
  <header class="fixed inset-x-0 top-0 mx-auto w-full max-w-6xl z-50 bg-white dark:bg-neutral-900 border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-lg transition-colors duration-300">    <div class="px-4 sm:px-6 lg:px-8">
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

          <button class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" @click="toggleTheme">
            <svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>

          <div class="hidden md:flex items-center space-x-2">
            <template v-if="loggedIn">
              <div class="relative">
                <button class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" @click="toggleDropdown">
                  <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ user?.name || 'Utilisateur' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-700 dark:text-neutral-300 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800">
                  <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" @click="isDropdownOpen = false">Mon profil</NuxtLink>
                  <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" @click="isDropdownOpen = false">Paramètres</NuxtLink>
                  <button class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" @click="logout">Déconnexion</button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/register" class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Créer un compte</NuxtLink>
              <NuxtLink to="/login" class="px-3 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors">Se connecter</NuxtLink>
            </template>
          </div>

          <div class="md:hidden flex items-center">
            <Sheet v-model:open="isMobileMenuOpen">
              <SheetTrigger as-child>
                <button class="p-2 -mr-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <MenuIcon class="h-6 w-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" class="w-[300px] sm:w-[400px] bg-white dark:bg-neutral-900 p-0 flex flex-col">
                <div class="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <span class="text-xl font-semibold text-primary-600 dark:text-primary-400">AirGap</span>
                </div>

                <div class="flex-1 overflow-y-auto py-4">
                  <nav aria-label="naviguation bar for desktop AirGap" class="flex flex-col space-y-1 px-4">
                    <NuxtLink to="/" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMobileMenuOpen = false">Tableau de bord</NuxtLink>
                    <NuxtLink to="/transactions" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMobileMenuOpen = false">Transactions</NuxtLink>
                    <NuxtLink to="/budget" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMobileMenuOpen = false">Budgets</NuxtLink>
                    <NuxtLink to="/about" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMobileMenuOpen = false">À propos</NuxtLink>
                  </nav>

                  <div class="mt-8 px-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                    <template v-if="loggedIn">
                      <div class="px-3 py-2 text-sm text-neutral-500 mb-2">Connecté en tant que {{ user?.name }}</div>
                      <NuxtLink to="/profile" class="mobile-nav-link" @click="isMobileMenuOpen = false">Mon profil</NuxtLink>
                      <NuxtLink to="/settings" class="mobile-nav-link" @click="isMobileMenuOpen = false">Paramètres</NuxtLink>
                      <button class="w-full text-left mobile-nav-link text-red-600 dark:text-red-400 mt-2" @click="logout(); isMobileMenuOpen = false">Déconnexion</button>
                    </template>
                    <template v-else>
                      <NuxtLink to="/login" class="block w-full text-center py-2 px-4 bg-primary-500 text-white rounded-md mb-3" @click="isMobileMenuOpen = false">Se connecter</NuxtLink>
                      <NuxtLink to="/register" class="block w-full text-center py-2 px-4 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300" @click="isMobileMenuOpen = false">Créer un compte</NuxtLink>
                    </template>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Menu as MenuIcon } from 'lucide-vue-next';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const {loggedIn, user, clear: clearSession} = useUserSession();
const isDarkTheme = ref(false);
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

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
  isMobileMenuOpen.value = false;
  isDropdownOpen.value = false;
});
</script>

<style scoped>
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