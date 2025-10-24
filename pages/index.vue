<template>
  <div class="py-8">
    <div v-if="user">
      <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
        Bonjour, {{ user?.name || 'Utilisateur' }}
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <h3 class="text-lg font-medium">Solde total</h3>
          <p class="text-3xl font-bold text-green-600">{{ formatCurrency(balance) }}</p>
        </div>
        <div class="card">
          <h3 class="text-lg font-medium">Investissements</h3>
          <p class="text-3xl font-bold text-blue-600">{{ formatCurrency(investments) }}</p>
        </div>
        <div class="card">
          <h3 class="text-lg font-medium">Revenus mensuels</h3>
          <p class="text-3xl font-bold text-purple-600">{{ formatCurrency(monthlyIncome) }}</p>
        </div>
      </div>

      <button class="btn btn-primary" @click="navigateTo('/dashboard')">Accéder au tableau de bord</button>
    </div>

    <div v-else>
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-3 text-neutral-900 dark:text-neutral-50">
          Bienvenue sur <span class="text-primary-600 dark:text-primary-400">Finantia</span>
        </h1>
        <p class="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
          Votre solution pour gérer vos finances personnelles en toute simplicité
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      </div>

      <div class="text-center">
        <button class="btn btn-primary" @click="navigateTo('/register')">Commencer maintenant</button>
        <button class="btn btn-outline ml-3" @click="navigateTo('/about')">En savoir plus</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {user} = useUserSession();

const transactions = ref<Transaction[]>([])

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const balance = computed(() =>
    transactions.value.reduce((total: any, t: any) => {
      const amount = Number(t.amount) || 0
      return total + (t.type === 'income' ? amount : -amount)
    }, 0)
)

const monthlyIncome = computed(() =>
    transactions.value
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + Number(t.amount), 0)
);

const investments = ref(0)

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
</script>
