<script setup>
import { computed } from 'vue'
import gameStore from '../stores/gameStore.js'

const characterList = computed(() => {
  return gameStore.config.characters.map(char => ({
    ...char,
    stats: gameStore.characterStats[char.id] || {},
    isPlayer: char.id === gameStore.playerCharacterId,
  }))
})

function getStatColor(statName) {
  const name = statName.toLowerCase()
  if (name.includes('health') || name.includes('hp')) return 'var(--color-success)'
  if (name.includes('trust') || name.includes('loyalty')) return 'var(--color-frost)'
  if (name.includes('suspicion') || name.includes('danger')) return 'var(--color-ember)'
  if (name.includes('courage') || name.includes('strength')) return 'var(--color-gold)'
  if (name.includes('magic') || name.includes('mana')) return 'var(--color-arcane-glow)'
  return 'var(--color-text-dim)'
}

function getStatPercent(value) {
  return Math.max(0, Math.min(100, value))
}

const currentLocation = computed(() => {
  const loc = gameStore.config.locations.find(l => l.id === gameStore.currentLocationId)
  return loc ? loc.name : gameStore.currentLocationId
})
</script>

<template>
  <div class="d-flex flex-column gap-4">
    <!-- Location -->
    <div class="location-card d-flex align-items-center gap-3">
      <div class="location-dot flex-shrink-0" style="background: var(--color-gold);"></div>
      <div class="min-w-0">
        <p class="mb-1 text-uppercase fw-medium" style="font-size: 0.62rem; letter-spacing: 0.12em; color: var(--color-text-muted);">Location</p>
        <p class="mb-0 fw-medium text-truncate" style="color: var(--color-text); font-family: var(--font-heading); font-size: 0.875rem;">
          {{ currentLocation }}
        </p>
      </div>
    </div>

    <!-- Characters & Stats -->
    <div class="d-flex flex-column gap-4">
      <div
        v-for="char in characterList"
        :key="char.id"
        class="char-card"
        :style="{
          background: char.isPlayer ? 'rgba(201, 168, 76, 0.04)' : 'var(--color-surface)',
          border: `1px solid ${char.isPlayer ? 'rgba(201, 168, 76, 0.15)' : 'var(--color-border)'}`,
        }"
      >
        <!-- Character Header -->
        <div class="d-flex align-items-center gap-3 mb-3">
          <div
            class="char-icon flex-shrink-0 d-flex align-items-center justify-content-center rounded-2"
            :style="{
              background: char.isPlayer ? 'rgba(201, 168, 76, 0.12)' : 'var(--color-surface-light)',
              color: char.isPlayer ? 'var(--color-gold)' : 'var(--color-text-muted)',
            }"
          >
            {{ char.isPlayer ? '★' : '◎' }}
          </div>
          <div>
            <p
              class="mb-0 fw-semibold"
              style="font-size: 0.875rem; line-height: 1.2;"
              :style="{ color: char.isPlayer ? 'var(--color-gold-glow)' : 'var(--color-text)' }"
            >
              {{ char.name }}
            </p>
            <p class="mb-0" style="font-size: 0.62rem; color: var(--color-text-muted); margin-top: 2px;">
              {{ char.isPlayer ? 'Player' : 'NPC' }}
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="d-flex flex-column gap-3">
          <div
            v-for="(value, statName) in char.stats"
            :key="statName"
            class="stat-change-enter-active"
          >
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="text-capitalize" style="font-size: 0.8rem; color: var(--color-text-dim);">{{ statName }}</span>
              <span class="fw-medium" style="font-family: monospace; font-size: 0.8rem;" :style="{ color: getStatColor(statName) }">
                {{ value }}<span style="font-size: 0.65rem; opacity: 0.4;">/100</span>
              </span>
            </div>
            <div class="stat-track rounded-pill overflow-hidden" style="background: var(--color-deep);">
              <div
                class="stat-fill rounded-pill"
                :style="{
                  width: `${getStatPercent(value)}%`,
                  background: `linear-gradient(90deg, ${getStatColor(statName)}60, ${getStatColor(statName)})`,
                  transition: 'width 0.7s ease-out',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-card {
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.location-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 5px var(--color-gold);
}

.char-card {
  padding: 16px;
  border-radius: var(--radius-md);
}

.char-icon {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.stat-track {
  height: 4px;
}

.stat-fill {
  height: 100%;
}
</style>
