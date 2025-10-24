<template>
  <div class="app">
    <NuxtRouteAnnouncer/>
    <Header-navbar-components/>
    <main class="max-w-7xl mx-auto">
      <NuxtPage/>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'


onMounted(async () => {
  // Vérifie d'abord les préférences sauvegardées dans localStorage
  const savedTheme = localStorage.getItem('theme')
  const html = document.documentElement
  
  if (savedTheme) {
    // Utilise le thème sauvegardé par l'utilisateur
    if (savedTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  } else {
    // Sinon, utilise la préférence du système
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  // Écoute les changements de préférence du système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Ne change automatiquement que si l'utilisateur n'a pas défini manuellement un thème
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  })
})
</script>
