<script setup>
import { ref, onMounted } from 'vue'
import { startGame, resumeGame } from '../services/gameEngine.js'
import { loadApiKey, saveApiKey, hasSavedGame, loadGameState } from '../services/storageService.js'
import gameStore from '../stores/gameStore.js'
import ExternalAiPrompt from './ExternalAiPrompt.vue'
import { sampleConfig as sampleConfigData } from '../utils/sampleConfig.js'

const jsonInput = ref('')
const apiKeyInput = ref('')
const isStarting = ref(false)
const isResuming = ref(false)
const hasSave = ref(false)
const savedGameInfo = ref(null)

// Sample config for quick testing
const sampleConfig = JSON.stringify(sampleConfigData, null, 2)

onMounted(() => {
  const savedKey = loadApiKey()
  if (savedKey) {
    apiKeyInput.value = savedKey
    gameStore.apiKey = savedKey
  }

  hasSave.value = hasSavedGame()
  if (hasSave.value) {
    const state = loadGameState()
    if (state && state.config) {
      savedGameInfo.value = {
        title: state.config.title || 'Untitled RPG',
        turnCount: state.turnCount || 0
      }
    }
  }
})

function updateApiKey() {
  gameStore.apiKey = apiKeyInput.value.trim()
  saveApiKey(gameStore.apiKey)
}

function loadSample() {
  jsonInput.value = sampleConfig
}

async function handleStart() {
  updateApiKey()
  if (!apiKeyInput.value.trim()) {
    gameStore.error = "Please enter a Gemini API key to continue."
    return
  }
  if (!jsonInput.value.trim()) return

  isStarting.value = true
  gameStore.error = null
  try {
    await startGame(jsonInput.value)
  } catch (e) {
    console.error('Failed to start game:', e)
  } finally {
    isStarting.value = false
  }
}

async function handleResume() {
  updateApiKey()
  if (!apiKeyInput.value.trim()) {
    gameStore.error = "Please enter a Gemini API key to continue."
    return
  }

  isResuming.value = true
  gameStore.error = null
  try {
    await resumeGame()
  } catch (e) {
    console.error('Failed to resume game:', e)
  } finally {
    isResuming.value = false
  }
}
</script>

<template>
  <div class="setup-page d-flex flex-column align-items-center justify-content-start overflow-y-auto">
    <div class="setup-content fade-in-up d-flex flex-column gap-4">

      <!-- Header -->
      <div class="text-center pt-2">
        <h1 class="setup-heading mb-2">AI RPG Engine</h1>
        <p class="setup-subheading mb-0">
          Configure a game world in JSON and start playing.
        </p>
      </div>

      <!-- API Key -->
      <div class="d-flex flex-column gap-2">
        <label class="field-label">Gemini API Key</label>
        <div class="position-relative">
          <input
            type="password"
            v-model="apiKeyInput"
            @blur="updateApiKey"
            placeholder="AIza..."
            class="game-input w-100"
          />
          <div
            v-if="apiKeyInput.trim()"
            class="connected-badge position-absolute"
          >
            Connected
          </div>
        </div>
        <p class="api-hint mb-0">
          Get a key from
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            class="api-link"
          >Google AI Studio</a>.
          Stored only in your browser's local storage.
        </p>
      </div>

      <!-- Resume Card -->
      <div
        v-if="hasSave && savedGameInfo"
        class="resume-card d-flex flex-column flex-sm-row align-items-sm-center gap-3"
      >
        <div class="flex-grow-1 min-w-0">
          <p class="resume-save-label mb-1 text-uppercase">Saved game</p>
          <p class="resume-title mb-1 fw-semibold text-truncate">{{ savedGameInfo.title }}</p>
          <p class="resume-turn mb-0">Turn {{ savedGameInfo.turnCount }}</p>
        </div>
        <button
          @click="handleResume"
          :disabled="isResuming || isStarting || !apiKeyInput.trim()"
          class="resume-btn d-flex align-items-center justify-content-center gap-2"
        >
          <span v-if="isResuming" class="spin spin-sm"></span>
          <span>{{ isResuming ? 'Loading...' : 'Resume' }}</span>
        </button>
      </div>

      <!-- JSON Editor -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between">
          <label class="field-label">
            {{ hasSave ? 'Start a New Game' : 'Game Config' }}
          </label>
          <button @click="loadSample" class="sample-btn">Load sample</button>
        </div>

        <div class="editor-wrap">
          <!-- Editor top bar -->
          <div class="editor-topbar">
            <span class="editor-filename">world.json</span>
          </div>

          <textarea
            v-model="jsonInput"
            placeholder='{
  "title": "My Adventure",
  "characters": [...],
  "locations": [...],
  "scene": {...}
}'
            class="json-editor w-100"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="gameStore.error"
        class="error-banner fade-in"
      >
        <span class="fw-semibold">Error: </span>
        <span class="fw-light">{{ gameStore.error }}</span>
      </div>

      <!-- Start Button -->
      <button
        @click="handleStart"
        :disabled="isStarting || isResuming || !jsonInput.trim()"
        class="start-btn w-100 d-flex align-items-center justify-content-center gap-2"
        :class="{ 'disabled': isStarting || isResuming || !jsonInput.trim() }"
      >
        <span v-if="isStarting" class="spin"></span>
        <span>{{ isStarting ? 'Starting...' : (hasSave ? 'Start New Game' : 'Start Game') }}</span>
      </button>

      <!-- External AI Prompt Generator -->
      <ExternalAiPrompt :sampleConfig="sampleConfig" />

      <!-- Footer -->
      <p class="footer-text text-center mb-0 mt-3">
        Powered by Google Gemini AI
      </p>

    </div>
  </div>
</template>

<style scoped>
.setup-page {
  min-height: 100vh;
  width: 100%;
  padding: 3rem max(1rem, env(safe-area-inset-left)) 4rem;
}

.setup-content {
  width: 100%;
  max-width: 560px;
}

.setup-heading {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.field-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  margin-bottom: 0;
}

.game-input {
  padding: 14px 16px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  display: block;
}

.game-input:focus {
  border-color: var(--color-arcane-dim);
}

.connected-badge {
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 500;
  background: rgba(48, 201, 138, 0.12);
  color: var(--color-success);
}

.api-link {
  color: var(--color-text-dim);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.api-link:hover {
  color: var(--color-arcane-glow);
}

.resume-card {
  padding: 18px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-arcane-dim);
  border-radius: var(--radius-md);
}

.resume-btn {
  padding: 10px 24px;
  background: var(--color-arcane);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
}

.resume-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.resume-btn:not(:disabled):hover {
  background: var(--color-arcane-glow);
}

.sample-btn {
  background: transparent;
  border: none;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: color 0.2s, background 0.2s;
}

.sample-btn:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.editor-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.editor-topbar {
  padding: 8px 16px;
  background: var(--color-surface-light);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 6px;
}

.json-editor {
  width: 100%;
  height: 288px;
  padding: 16px;
  background: transparent;
  color: var(--color-text);
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.65;
  resize: none;
  border: none;
  outline: none;
}

@media (min-width: 576px) {
  .json-editor { height: 384px; }
}

.json-editor::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.error-banner {
  padding: 12px 16px;
  background: rgba(208, 90, 66, 0.07);
  border: 1px solid rgba(208, 90, 66, 0.2);
  color: var(--color-ember);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.start-btn {
  padding: 14px;
  background: var(--color-surface-light);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
}

.start-btn:not(.disabled):hover {
  border-color: var(--color-border-light);
  background: var(--color-surface);
}

.start-btn.disabled,
.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.setup-subheading {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.api-hint {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.resume-save-label {
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.resume-title {
  font-size: 0.875rem;
  color: var(--color-text);
}

.resume-turn {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.editor-filename {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--color-text-muted);
}

.footer-text {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
</style>
