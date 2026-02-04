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

  const savedTheme = localStorage.getItem('theme')
  const html = document.documentElement
  
  if (savedTheme) {
    if (savedTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  } else {
    const isDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
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
