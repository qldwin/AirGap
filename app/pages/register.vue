<template>
  <div class="flex justify-center items-center py-12">
    <Card class="card w-full max-w-md">
      <CardHeader>
        <div class="mb-6">
          <CardTitle class="text-neutral-900 dark:text-neutral-50">Créer un compte</CardTitle>
          <CardDescription class="text-neutral-600 dark:text-neutral-400 mt-2">Rejoignez AirGap pour gérer vos finances</CardDescription>
        </div>
        <div>
          <Button class="hover:underline font-medium">
            <NuxtLink to="/login">Se
              connecter
            </NuxtLink>
          </Button>
        </div>
      </CardHeader>

      <form @submit.prevent="handleRegister">
        <CardContent class="space-y-5">
        <div>
          <Label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</Label>
          <Input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="Votre nom"
          />
        </div>
        <div>
          <Label
              for="reg-email"
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</Label>
          <Input
              id="reg-email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="votre@email.com"
          />
        </div>

        <div>
          <Label for="reg-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mot de
            passe</Label>
          <Input
              id="reg-password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="8 caractères minimum"
              minlength="8"
          />
        </div>

        <div>
          <Label for="confirm-password" class="block text-sm mb-1">Confirmer
            le mot de passe</Label>
          <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="Confirmer votre mot de passe"
          />
        </div>
        </CardContent>
        <CardFooter>
          <Button
              type="submit"
              class="w-full btn btn-primary flex justify-center cursor-pointer dark:hover:bg-button-2 bg-button-3 hover:bg-button-4 text-white dark:bg-white dark:text-black">
            Créer un compte
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<script setup>
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

async function handleRegister() {
  // Petite sécurité avant l'envoi
  if (form.password !== form.confirmPassword) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  await $fetch('/api/auth/register', {
    method: 'POST',
    body: {
      name: form.name,
      email: form.email,
      password: form.password
    },
  })
      .then(() => {
        navigateTo('/login');
      })
      .catch((error) => {
        const errorMessage = error.data?.message || "Une erreur est survenue lors de l'inscription";
        console.error("Détails de l'erreur:", error.data);
        alert(errorMessage);
      });
}
</script> 