<script setup>
import gameStore from '../stores/gameStore.js'
</script>

<template>
  <div class="w-100 narrative-enter-active position-relative">
    
    <!-- Narrative Text -->
    <div class="pb-3" :style="{ opacity: gameStore.isAiThinking ? 0.5 : 1, transition: 'opacity 0.3s' }">
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

    <!-- Loading State Overlay -->
    <div v-if="gameStore.isAiThinking" class="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center gap-3 fade-in mt-2 p-3 rounded-3" style="background: var(--color-surface); border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 10;">
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
      <p class="small mb-0 fw-medium" style="color: var(--color-text); letter-spacing: 0.05em;">Thinking...</p>
    </div>
  </div>
</template>
