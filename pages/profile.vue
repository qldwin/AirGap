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
                Nom
                <input
                    id="name"
                    type="text"
                    v-model="form.name"
                    class="w-full mt-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </label>
            </div>

            <div class="w-full md:w-1/2">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
                <input
                    type="email"
                    readonly
                    disabled
                    class="w-full mt-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 rounded-lg text-neutral-500"
                    :value="user?.email"
                >
              </label>
              <p class="mt-1 text-xs text-neutral-500">L'email ne peut pas être modifié</p>
            </div>
          </div>

          <div class="border-t border-neutral-200 dark:border-neutral-800 pt-6 mb-6">
            <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Changer de mot de passe</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Mot de passe actuel
                  <input
                      v-model="form.currentPassword"
                      type="password"
                      class="w-full mt-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Requis pour changer le mot de passe"
                  >
                </label>
              </div>

              <div class="flex flex-col md:flex-row gap-4">
                <div class="w-full md:w-1/2">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nouveau mot de passe
                    <input
                        v-model="form.newPassword"
                        type="password"
                        class="w-full mt-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Min. 8 caractères"
                    >
                  </label>
                </div>

                <div class="w-full md:w-1/2">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Confirmer
                    <input
                        v-model="form.confirmPassword"
                        type="password"
                        class="w-full mt-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        :class="{'border-red-500': form.newPassword !== form.confirmPassword && form.confirmPassword}"
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button type="button" class="btn btn-outline px-4 py-2 border rounded hover:bg-gray-100" @click="resetForm">
              Annuler
            </button>
            <button
                type="submit"
                class="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!isFormValid || isLoading"
            >
              <span v-if="isLoading">Chargement...</span>
              <span v-else>Enregistrer les changements</span>
            </button>
          </div>
        </form>
      </div>

      <div class="card border-red-200 dark:border-red-800 p-6 border rounded-lg bg-red-50 dark:bg-red-900/10">
        <h3 class="text-lg font-medium text-red-600 mb-4">Zone de danger</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">Attention, la suppression est définitive.</p>
        <button
            class="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
            @click="showDeleteModal = true"
            :disabled="isLoading"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-700">
        <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">Confirmation requise</h3>
        <p class="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
          Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel pour confirmer la suppression définitive de votre compte.
        </p>

        <div class="mb-4">
          <input
              v-model="passwordForDeletion"
              type="password"
              placeholder="Votre mot de passe"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none dark:bg-neutral-800 dark:border-neutral-600"
              @keyup.enter="confirmDeleteAccount"
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Annuler
          </button>
          <button
              @click="confirmDeleteAccount"
              :disabled="isLoading || !passwordForDeletion"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="isLoading">Suppression...</span>
            <span v-else>Confirmer la suppression</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

const { user, clear } = useUserSession()

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const showDeleteModal = ref(false)
const passwordForDeletion = ref('')

const form = ref({
  name: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watchEffect(() => {
  if (user.value) {
    form.value.name = user.value.name || ''
  }
})

const isFormValid = computed(() => {
  const { currentPassword, newPassword, confirmPassword } = form.value
  if (currentPassword || newPassword || confirmPassword) {
    return (
        !!currentPassword &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword
    )
  }
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

async function handleUpdate() {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    if (form.value.newPassword) {
      await $fetch('/api/user/password', {
        method: 'PATCH',
        body: {
          currentPassword: form.value.currentPassword,
          newPassword: form.value.newPassword,
          confirmPassword: form.value.confirmPassword
        },
      })
      success.value = 'Mot de passe mis à jour avec succès !'
      form.value.currentPassword = ''
      form.value.newPassword = ''
      form.value.confirmPassword = ''
    }
  } catch (err: any) {
    console.error(err)
    error.value = err.data?.message || 'Une erreur est survenue.'
  } finally {
    isLoading.value = false
  }
}

async function confirmDeleteAccount() {
  if (!passwordForDeletion.value) return

  isLoading.value = true
  error.value = ''

  try {
    await $fetch('/api/user/account', {
      method: 'DELETE',
      body: {
        password: passwordForDeletion.value
      }
    })

    showDeleteModal.value = false
    await clear()
    await navigateTo('/login')

  } catch (err: any) {

    alert(err.data?.message || "Mot de passe incorrect ou erreur serveur")
    passwordForDeletion.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>