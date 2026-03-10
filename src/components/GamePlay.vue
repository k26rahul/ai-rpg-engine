<script setup>
import gameStore from '../stores/gameStore.js'
import { quitGame } from '../services/gameEngine.js'
import NarrativeDisplay from './NarrativeDisplay.vue'
import ChoicePanel from './ChoicePanel.vue'
import StatsPanel from './StatsPanel.vue'
import GameLog from './GameLog.vue'
import { ref } from 'vue'

const showApiKeyModal = ref(false)
const apiKeyInput = ref(gameStore.apiKey)

function handleQuit() {
  if (confirm("Quit and clear this save? You'll start from the beginning next time.")) {
    quitGame()
  }
}

function updateApiKey() {
  gameStore.apiKey = apiKeyInput.value.trim()
  import('../services/storageService.js').then(({ saveApiKey }) => {
    saveApiKey(gameStore.apiKey)
  })
  showApiKeyModal.value = false
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100 w-100">

    <!-- Header -->
    <header class="game-header sticky-top d-flex align-items-center justify-content-between gap-3">
      <!-- Title & Turn -->
      <div class="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
        <h1 class="mb-0 text-truncate game-title">
          {{ gameStore.config.title }}
        </h1>
        <span class="turn-badge flex-shrink-0">
          Turn {{ gameStore.turnCount }}
        </span>
      </div>

      <!-- Controls -->
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <button
          @click="showApiKeyModal = true"
          class="icon-btn"
          aria-label="Settings"
          title="Settings"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button
          @click="handleQuit"
          class="icon-btn quit-btn"
          aria-label="Quit Game"
          title="Quit"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Settings Modal -->
    <div
      v-if="showApiKeyModal"
      class="modal-overlay d-flex align-items-end align-items-sm-center justify-content-center p-3 fade-in"
      @click.self="showApiKeyModal = false"
    >
      <div class="modal-card w-100 fade-in-up">
        <h3 class="modal-card-title mb-4">Settings</h3>

        <label class="field-label mb-2 d-block">Gemini API Key</label>
        <input
          type="password"
          v-model="apiKeyInput"
          class="game-input w-100 mb-4"
        />

        <div class="d-flex gap-3">
          <button
            @click="showApiKeyModal = false"
            class="modal-btn modal-btn-cancel flex-grow-1"
          >Cancel</button>
          <button
            @click="updateApiKey"
            class="modal-btn modal-btn-save flex-grow-1"
          >Save</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container-fluid px-3 px-sm-4 mt-4 mt-sm-5 pb-5">
      <div class="row g-4 g-lg-5 justify-content-center" style="max-width: 1400px; margin: 0 auto;">

        <!-- Left Column: Narrative + Choices -->
        <div class="col-12 col-lg-8">

          <!-- Error Banner -->
          <div
            v-if="gameStore.error"
            class="error-banner mb-4 fade-in"
          >
            <span class="fw-semibold">Error: </span>
            <span class="fw-light">{{ gameStore.error }}</span>
          </div>

          <NarrativeDisplay />
          <ChoicePanel />

          <!-- Stats + Log – mobile only (shown below choices) -->
          <div class="d-lg-none mt-5 d-flex flex-column gap-4">
            <StatsPanel />
            <GameLog />
          </div>
        </div>

        <!-- Right Column: Stats + Log – desktop only -->
        <div class="col-lg-4 d-none d-lg-flex flex-column gap-4">
          <StatsPanel />
          <GameLog />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.game-header {
  padding: 10px 16px;
  background: rgba(6, 8, 16, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.game-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.turn-badge {
  padding: 2px 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 0.65rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.quit-btn {
  color: var(--color-ember);
  background: rgba(208, 90, 66, 0.08);
}

.quit-btn:hover {
  background: rgba(208, 90, 66, 0.18);
  color: var(--color-ember);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(6, 8, 16, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-card {
  max-width: 360px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.modal-card-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.field-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.game-input {
  padding: 12px 16px;
  background: var(--color-deep);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.game-input:focus {
  border-color: var(--color-arcane-dim);
}

.modal-btn {
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn-cancel {
  background: var(--color-surface-light);
  color: var(--color-text-dim);
}

.modal-btn-cancel:hover {
  background: var(--color-border);
}

.modal-btn-save {
  background: var(--color-arcane);
  color: white;
  font-weight: 600;
}

.modal-btn-save:hover {
  background: var(--color-arcane-glow);
}

.error-banner {
  padding: 12px 16px;
  background: rgba(208, 90, 66, 0.07);
  border: 1px solid rgba(208, 90, 66, 0.2);
  color: var(--color-ember);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}
</style>
