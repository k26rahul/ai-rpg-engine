<script setup>
import { onMounted } from 'vue'
import { loadApiKey } from './services/storageService.js'
import gameStore from './stores/gameStore.js'
import GameSetup from './components/GameSetup.vue'
import GamePlay from './components/GamePlay.vue'

onMounted(() => {
  // Try to pre-load API key into store on app mount
  const savedKey = loadApiKey()
  if (savedKey) {
    gameStore.apiKey = savedKey
  }
})
</script>

<template>
  <main class="flex-fill d-flex flex-column w-100">
    <Transition name="narrative" mode="out-in">
      <GameSetup v-if="gameStore.phase === 'setup'" />
      <GamePlay v-else-if="gameStore.phase === 'playing'" />
    </Transition>
  </main>
</template>
