<template>
  <div class="py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">Profil utilisateur</h1>

      <div class="card mb-8">
        <div v-if="error" class="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
          {{ error }}
        </div>
        <div v-if="success" class="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm mb-4">
          {{ success }}
        </div>

        <form class="space-y-6" @submit.prevent="handleUpdate">
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <div class="w-full md:w-1/2">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <input
                  id="name"
                  type="text"
                  v-model="form.name"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                Nom
              </label>
            </div>

            <div class="w-full md:w-1/2">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <input
                  type="email"
                  readonly
                  disabled
                  class="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 rounded-lg text-neutral-500"
                  :value="user?.email"
              >
                Email
              </label>
              <p class="mt-1 text-xs text-neutral-500">L'email ne peut pas être modifié</p>
            </div>
          </div>

          <div class="border-t border-neutral-200 dark:border-neutral-800 pt-6 mb-6">
            <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Changer de mot de passe</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <input
                    v-model="form.currentPassword"
                    type="password"
                    class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Requis pour changer le mot de passe"
                >
                  Mot de passe actuel
                </label>
              </div>

              <div class="flex flex-col md:flex-row gap-4">
                <div class="w-full md:w-1/2">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  <input
                      v-model="form.newPassword"
                      type="password"
                      class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Min. 8 caractères"
                  >
                    Nouveau mot de passe
                  </label>
                </div>

                <div class="w-full md:w-1/2">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  <input
                      v-model="form.confirmPassword"
                      type="password"
                      class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      :class="{'border-red-500': form.newPassword !== form.confirmPassword && form.confirmPassword}"
                  >
                    Confirmer
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button type="button" class="btn btn-outline" @click="resetForm">
              Annuler
            </button>
            <button
                type="submit"
                class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!isFormValid || isLoading"
            >
              <span v-if="isLoading">Chargement...</span>
              <span v-else>Enregistrer les changements</span>
            </button>
          </div>
        </form>
      </div>

      <div class="card border-red-200 dark:border-red-800 p-6 border rounded-lg">
        <h3 class="text-lg font-medium text-red-600 mb-4">Zone de danger</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">Attention, cette action est irréversible.</p>
        <button
            class="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            @click="deleteAccount"
            :disabled="isLoading"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

// Récupération de la session et de la fonction pour vider la session (clear)
const { user, clear } = useUserSession()

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Initialisation du formulaire avec les données existantes
// On utilise watchEffect pour réagir si "user" met du temps à charger
watchEffect(() => {
  if (user.value) {
    form.value.name = user.value.name || ''
  }
})

// Logique de validation (CORRIGÉE)
const isFormValid = computed(() => {
  const { currentPassword, newPassword, confirmPassword } = form.value

  // Si on essaie de changer le mot de passe
  if (currentPassword || newPassword || confirmPassword) {
    return (
        !!currentPassword &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword
    )
  }

  // Si on ne change rien (ou juste le nom plus tard)
  return false
})

const resetForm = () => {
  error.value = ''
  success.value = ''
  form.value.currentPassword = ''
  form.value.newPassword = ''
  form.value.confirmPassword = ''
  if (user.value) form.value.name = user.value.name || ''
}

// Mise à jour du profil
async function handleUpdate() {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    // 1. Mise à jour du mot de passe (si les champs sont remplis)
    if (form.value.newPassword) {
      await $fetch('/api/user/password', {
        method: 'PATCH',
        body: {
          currentPassword: form.value.currentPassword,
          newPassword: form.value.newPassword,
          confirmPassword: form.value.confirmPassword // Indispensable pour Zod !
        },
      })
      success.value = 'Mot de passe mis à jour avec succès !'

      // On vide les champs de mot de passe après succès
      form.value.currentPassword = ''
      form.value.newPassword = ''
      form.value.confirmPassword = ''
    }

    // Note : Si vous voulez mettre à jour le NOM, il faudra créer
    // un endpoint PATCH /api/user/profile et l'appeler ici.

  } catch (err: any) {
    console.error(err)
    error.value = err.data?.message || 'Une erreur est survenue.'
  } finally {
    isLoading.value = false
  }
}

// Suppression du compte
async function deleteAccount() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? C'est irréversible.")) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Appel sur la bonne route avec la méthode DELETE
    await $fetch('/api/user/account', {
      method: 'DELETE'
    })

    // 1. Vider la session côté client
    await clear()

    // 2. Rediriger
    await navigateTo('/login')

  } catch (err: any) {
    error.value = err.data?.message || "Erreur lors de la suppression"
    isLoading.value = false
  }
}
</script>