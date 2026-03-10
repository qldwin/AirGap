<template>
  <div class="flex justify-center py-12">
    <Card class="card w-full max-w-md">
      <CardHeader class="flex justify-between">
        <div>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>Accédez à votre tableau de bord</CardDescription>
        </div>
        <div>
          <Button as-child variant="link" class="hover:underline">
            <NuxtLink to="/register">
              S'enregistrer
            </NuxtLink>
          </Button>
        </div>
      </CardHeader>

      <form @submit.prevent="handleLogin">
        <CardContent class="space-y-6">
        <div>
          <Label for="email" class="block mb-1">Email</Label>
          <Input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="votre@email.com"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <Label for="password" class="block">Mot de
              passe</Label>
          </div>
          <Input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-2 focus:ring-button-3 transition-colors"
              placeholder="••••••••"
          />
        </div>
        </CardContent>

        <CardFooter>
          <Button
              type="submit"
              class="w-full btn btn-primary flex justify-center cursor-pointer dark:hover:bg-button-2 bg-button-3 hover:bg-button-4 text-white dark:bg-white dark:text-black"
          >
            Se connecter
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {CardDescription, Card, CardContent, CardHeader, CardTitle, CardFooter} from "~/components/ui/card";
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

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
