<script setup>
import { ref } from 'vue'
import gameStore from '../stores/gameStore.js'

const isExpanded = ref(false)
</script>

<template>
  <div v-if="gameStore.turnHistory.length > 0">
    <!-- Toggle Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="log-toggle w-100 d-flex align-items-center justify-content-between"
    >
      <div class="d-flex align-items-center gap-2">
        <span class="log-icon">📋</span>
        <span class="log-title fw-medium">Turn History</span>
        <span class="count-badge log-count-badge">
          {{ gameStore.turnHistory.length }}
        </span>
      </div>
      <span
        class="log-chevron"
        :class="{ 'log-chevron--expanded': isExpanded }"
      >▼</span>
    </button>

    <!-- Log Entries -->
    <div v-show="isExpanded" class="log-entries-container mt-2 fade-in">
      <div class="d-flex flex-column gap-2 p-1">
        <div
          v-for="entry in [...gameStore.turnHistory].reverse()"
          :key="entry.turnNumber"
          class="log-entry"
        >
          <!-- Turn Number -->
          <p class="log-turn-number mb-2 text-uppercase fw-medium">
            Turn {{ entry.turnNumber }}
          </p>

          <!-- Narrative Summary -->
          <p class="log-narrative mb-3 fw-light">
            {{ entry.narrative.length > 180 ? entry.narrative.substring(0, 180) + '...' : entry.narrative }}
          </p>

          <!-- Choice Made -->
          <div class="choice-made">
            <p class="log-choice-text mb-2">
              {{ entry.chosenChoice.text }}
            </p>
            <p v-if="entry.chosenChoice.customInput" class="log-custom-input mb-2 fst-italic">
              <span class="fw-medium">Custom: </span>{{ entry.chosenChoice.customInput }}
            </p>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-toggle {
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.log-toggle:hover {
  border-color: var(--color-border-light);
  background: var(--color-surface-light);
}

.count-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 500;
}

.log-entry {
  padding: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.choice-made {
  padding: 10px 12px;
  background: var(--color-deep);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.log-icon {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.log-title {
  color: var(--color-text-dim);
  font-size: 0.8rem;
  letter-spacing: 0.03em;
}

.log-count-badge {
  background: var(--color-surface-light);
  color: var(--color-text-muted);
}

.log-chevron {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  display: inline-block;
}

.log-chevron--expanded {
  transform: rotate(180deg);
}

.log-entries-container {
  max-height: 480px;
  overflow-y: auto;
}

.log-turn-number {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.log-narrative {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-dim);
}

.log-choice-text {
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--color-text);
}

.log-custom-input {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}
</style>
