<script setup>
import gameStore from '../stores/gameStore.js'
</script>

<template>
  <div class="w-100 narrative-enter-active">
    <!-- Loading State -->
    <div v-if="gameStore.isAiThinking" class="py-5 d-flex flex-column align-items-center gap-3 fade-in" style="padding-top: 5rem; padding-bottom: 5rem;">
      <div class="d-flex gap-2 align-items-center">
        <span
          v-for="i in 3" :key="i"
          class="rounded-circle"
          style="width: 8px; height: 8px; display: inline-block;"
          :style="{
            background: 'var(--color-arcane-glow)',
            animation: `typing-dot 1.4s ease-in-out ${(i - 1) * 0.2}s infinite`,
          }"
        ></span>
      </div>
      <p class="small mb-0" style="color: var(--color-text-muted); letter-spacing: 0.05em;">Thinking...</p>
    </div>

    <!-- Narrative Text -->
    <div v-else class="pb-3">
      <p
        class="mb-0 whitespace-pre-line"
        style="
          font-family: var(--font-body);
          color: var(--color-text);
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          line-height: 1.85;
          font-weight: 300;
          white-space: pre-line;
        "
      >
        {{ gameStore.currentNarrative }}
      </p>
    </div>
  </div>
</template>
