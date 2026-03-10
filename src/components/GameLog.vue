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
        <span style="color: var(--color-text-muted); font-size: 0.8rem;">📋</span>
        <span class="fw-medium" style="color: var(--color-text-dim); font-size: 0.8rem; letter-spacing: 0.03em;">Turn History</span>
        <span
          class="count-badge"
          style="background: var(--color-surface-light); color: var(--color-text-muted);"
        >
          {{ gameStore.turnHistory.length }}
        </span>
      </div>
      <span
        style="font-size: 0.6rem; color: var(--color-text-muted); transition: transform 0.2s;"
        :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }"
      >▼</span>
    </button>

    <!-- Log Entries -->
    <div v-show="isExpanded" class="mt-2 fade-in" style="max-height: 480px; overflow-y: auto;">
      <div class="d-flex flex-column gap-2 p-1">
        <div
          v-for="entry in [...gameStore.turnHistory].reverse()"
          :key="entry.turnNumber"
          class="log-entry"
        >
          <!-- Turn Number -->
          <p class="mb-2 text-uppercase fw-medium" style="font-size: 0.65rem; letter-spacing: 0.12em; color: var(--color-text-muted);">
            Turn {{ entry.turnNumber }}
          </p>

          <!-- Narrative Summary -->
          <p class="mb-3 fw-light" style="font-size: 0.875rem; line-height: 1.6; color: var(--color-text-dim);">
            {{ entry.narrative.length > 180 ? entry.narrative.substring(0, 180) + '...' : entry.narrative }}
          </p>

          <!-- Choice Made -->
          <div class="choice-made">
            <p class="mb-2" style="font-size: 0.8rem; line-height: 1.55; color: var(--color-text);">
              {{ entry.chosenChoice.text }}
            </p>
            <div class="d-flex flex-wrap gap-1">
              <span
                v-for="(value, stat) in (entry.chosenChoice.statChanges || {})" :key="stat"
                class="stat-badge"
                :style="{
                  background: value > 0 ? 'rgba(48, 201, 138, 0.1)' : 'rgba(242, 106, 106, 0.1)',
                  color: value > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }"
              >
                {{ stat }} {{ value > 0 ? '+' : '' }}{{ value }}
              </span>
            </div>
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

.stat-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 500;
}
</style>
