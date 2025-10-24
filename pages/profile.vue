<template>
  <div class="py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">Profil utilisateur</h1>

      <div class="card mb-8">
        <div
v-if="error"
             class="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
          {{ error }}
        </div>

        <div
v-if="success"
             class="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm mb-4">
          {{ success }}
        </div>

        <form class="space-y-6" @submit.prevent="updateProfile">
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <div class="w-full md:w-1/2">
              <label
for="name"
                     class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
              <input
                  id="name"
                  type="text"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  :value="user.name"
              >
            </div>

            <div class="w-full md:w-1/2">
              <label
for="email"
                     class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
              <input
                  id="email"
                  type="email"
                  readonly
                  class="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400"
                  :value="user.email"
                  disabled
              >
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">L'email ne peut pas être modifié</p>
            </div>
          </div>

          <div class="border-t border-neutral-200 dark:border-neutral-800 pt-6 mb-6">
            <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Changer de mot de passe</h3>

            <div class="space-y-4">
              <div>
                <label
for="current-password"
                       class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mot de passe
                  actuel</label>
                <input
                    id="current-password"
                    v-model="form.currentPassword"
                    type="password"
                    class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Laissez vide pour ne pas changer"
                >
              </div>

              <div class="flex flex-col md:flex-row gap-4">
                <div class="w-full md:w-1/2">
                  <label
for="new-password"
                         class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nouveau mot de
                    passe</label>
                  <input
                      id="new-password"
                      v-model="form.newPassword"
                      type="password"
                      class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      placeholder="Min. 8 caractères"
                      minlength="8"
                  >
                </div>

                <div class="w-full md:w-1/2">
                  <label
for="confirm-password"
                         class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirmer le
                    nouveau mot de passe</label>
                  <input
                      id="confirm-password"
                      v-model="form.confirmPassword"
                      type="password"
                      class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      placeholder="Confirmez votre mot de passe"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button
                type="button"
                class="btn btn-outline"
                @click="loadUserData"
            >
              Annuler
            </button>
            <button
                type="submit"
                class="btn btn-primary"
            >
              <span>Enregistrer les changements</span>
            </button>
          </div>
        </form>
      </div>

      <div class="card border-red-200 dark:border-red-800">
        <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-4">Zone de danger</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">Attention, cette action est irréversible et supprimera
          définitivement votre compte.</p>
        <button
            class="px-4 py-2 bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            @click="confirmDeleteAccount"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated'],
})

const toast = useToast();
const {session, user} = useUserSession();
const form = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const error = ref('');
const success = ref('');

// Vérifier si le formulaire est valide
computed(() => {
  // Si l'utilisateur veut changer de mot de passe
  if (form.value.currentPassword || form.value.newPassword || form.value.confirmPassword) {
    return (
        form.value.currentPassword &&
        form.value.newPassword &&
        form.value.newPassword === form.value.confirmPassword &&
        form.value.newPassword.length >= 8
    );
  }

  // Si seulement le nom est modifié
  return form.value.name.length >= 2;
});
// Charger les données de l'utilisateur
const loadUserData = async () => {
  try {
    if (user) {
      form.value.name = '';
      form.value.email = '';
      form.value.currentPassword = '';
      form.value.newPassword = '';
      form.value.confirmPassword = '';
    }
  } catch (err) {
    error.value = "Erreur lors du chargement des données";
    console.error(err);
  }
};

// Mettre à jour le profil
async function updateProfile() {
  error.value = ''
  success.value = ''

  // Validation simple côté client
  if (
    form.value.currentPassword &&
    (!form.value.newPassword ||
      form.value.newPassword !== form.value.confirmPassword)
  ) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  try {
    // Envoi de la requête PATCH
    const res = await $fetch('/api/auth/user', {
      method: 'PATCH',
      body: {
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      },
    })

    success.value = res.message || 'Profil mis à jour avec succès !'

    // Réinitialiser les champs sensibles
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
  } catch (err) {
    console.error(err)
    error.value =
      err.data?.message ||
      err.statusMessage ||
      'Erreur lors de la mise à jour du mot de passe'
  }
}

// Confirmer la suppression du compte
async function confirmDeleteAccount() {
  if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
    try {
      error.value = '';
      isLoading.value = true;

      // Appeler l'API de suppression de compte
      await $fetch('/api/auth/delete-account', {
        method: 'POST'
      });

      // Déconnecter l'utilisateur et rediriger vers la page d'accueil
      await navigateTo('/');

      // Afficher un message de confirmation
      toast.success('Votre compte a été supprimé avec succès');
    } catch (err) {
      error.value = err.statusMessage || "Erreur lors de la suppression du compte";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }
}

// Charger les données au montage du composant
onMounted(() => {
  loadUserData();
});
</script> 