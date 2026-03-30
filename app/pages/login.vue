<template>
  <div class="flex justify-center py-12">
    <Card class="card w-full max-w-md">
      <CardHeader>
        <div>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>Accédez à votre tableau de bord</CardDescription>
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
                class="w-full px-3 py-2 dark:border-button-1 focus:outline-none focus:ring-1 focus:ring-button-3 transition-colors"
                placeholder="••••••••"
            />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col">
          <Button
              type="submit"
              class="w-full cursor-pointer text-primary-50 bg-primary-500 hover:bg-primary-600 focus:ring-primary-300 transition-colors"
          >
            Se connecter
          </Button>
          <Separator class="mt-5 mb-4 dark:bg-primary-50 bg-neutral-900" />
          <div class="flex items-center">
            <p>Pas encore de compte ?</p>
            <Button class="text-primary-500 hover:underline">
              <NuxtLink to="/register">
                Créer un compte
              </NuxtLink>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

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
