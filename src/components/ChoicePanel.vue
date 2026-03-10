<script setup>
import { ref } from 'vue'
import gameStore from '../stores/gameStore.js'
import { submitChoice, redoLastChoice, processMindRead } from '../services/gameEngine.js'

const customInput = ref('')
const mindReadInput = ref('')

const toneColors = {
  honest: 'var(--color-success)',
  bold: 'var(--color-gold)',
  cautious: 'var(--color-frost)',
  evasive: 'var(--color-warning)',
  deceptive: 'var(--color-danger)',
  aggressive: 'var(--color-ember)',
  neutral: 'var(--color-text-dim)',
  diplomatic: 'var(--color-arcane-glow)',
  compassionate: 'var(--color-success)',
  curious: 'var(--color-frost)',
  defiant: 'var(--color-ember)',
}

function getToneColor(tone) {
  return toneColors[tone?.toLowerCase()] || 'var(--color-text-dim)'
}



async function handleChoice(choiceId) {
  if (gameStore.isAiThinking) return
  try {
    await submitChoice(choiceId, customInput.value)
    customInput.value = ''
  } catch (e) {
    console.error('Failed to submit choice:', e)
  }
}

async function handleRedo() {
  if (gameStore.isAiThinking) return
  try {
    await redoLastChoice()
  } catch (e) {
    console.error('Failed to redo:', e)
  }
}

async function handleMindRead() {
  if (gameStore.isAiThinking || !mindReadInput.value.trim()) return
  try {
    await processMindRead(mindReadInput.value.trim())
    mindReadInput.value = ''
  } catch (e) {
    console.error('Failed to read mind:', e)
  }
}
</script>

<template>
  <div v-if="gameStore.currentChoices.length > 0" class="choices-enter-active">
    <!-- Section Header -->
    <div class="d-flex align-items-center gap-3 mt-5 mb-4">
      <span class="text-uppercase small fw-medium" style="color: var(--color-text-muted); font-size: 0.7rem; letter-spacing: 0.12em;">Choose an action</span>
      <div class="flex-grow-1" style="height: 1px; background: var(--color-border);"></div>
      <!-- Redo Button (appears after the first choice has been made) -->
      <button
        v-if="gameStore.lastChosenChoice"
        @click="handleRedo"
        :disabled="gameStore.isAiThinking"
        class="redo-btn d-flex align-items-center gap-2 flex-shrink-0"
        title="Not happy with this direction? Ask the AI to try again with the same choice."
      >
        <!-- Retry icon -->
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
        </svg>
        Redo
      </button>
    </div>

    <!-- Choice List -->
    <div class="d-flex flex-column gap-3 pb-4">
      <button
        v-for="choice in gameStore.currentChoices"
        :key="choice.id"
        @click="handleChoice(choice.id)"
        :disabled="gameStore.isAiThinking"
        class="choice-btn text-start d-flex align-items-start gap-3 w-100"
      >
        <!-- Number Badge -->
        <div
          class="choice-badge flex-shrink-0 d-flex align-items-center justify-content-center rounded-2 fw-semibold"
          :style="{
            background: `${getToneColor(choice.tone)}18`,
            color: getToneColor(choice.tone),
          }"
          style="width: 28px; height: 28px; font-size: 0.75rem; margin-top: 2px;"
        >
          {{ choice.id }}
        </div>

        <div class="flex-grow-1 min-w-0">
          <!-- Choice Text -->
          <p class="mb-2" style="color: var(--color-text); font-weight: 400; font-size: 0.95rem; line-height: 1.6;">
            {{ choice.text }}
          </p>

          <!-- Tone + Stat Changes -->
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Tone Badge -->
            <span
              class="badge-pill"
              :style="{
                background: `${getToneColor(choice.tone)}18`,
                color: getToneColor(choice.tone),
              }"
            >
              {{ choice.tone }}
            </span>


          </div>
        </div>
      </button>
    </div>

    <!-- Mind Read Section -->
    <div class="mind-read-wrapper mb-4">
      <label class="text-uppercase small fw-medium mb-2 d-block" style="color: var(--color-arcane-glow, #cda4ff); font-size: 0.7rem; letter-spacing: 0.12em;">
        Mystic Ability: Read Mind
      </label>
      <div class="d-flex gap-2">
        <textarea
          v-model="mindReadInput"
          placeholder="e.g. What are they hiding in their pockets?"
          class="custom-input flex-grow-1"
          style="min-height: 44px; padding: 8px 16px; resize: vertical;"
          rows="1"
          :disabled="gameStore.isAiThinking"
        ></textarea>
        <button
          @click="handleMindRead"
          :disabled="gameStore.isAiThinking || !mindReadInput.trim()"
          class="mind-read-btn flex-shrink-0"
          title="Peer into the character's thoughts..."
        >
          Hack Mind
        </button>
      </div>
      
      <!-- Mind Read Results -->
      <div v-if="gameStore.currentMindReads && gameStore.currentMindReads.length > 0" class="mt-3 d-flex flex-column gap-2">
        <div v-for="(read, index) in gameStore.currentMindReads" :key="index" class="mind-read-result p-3 rounded-2">
          <p class="mb-1" style="font-size: 0.75rem; color: var(--color-text-muted);">
            <span class="fw-medium">You asked:</span> "{{ read.query }}"
          </p>
          <p class="mb-0 fst-italic" style="color: var(--color-arcane-glow, #cda4ff); font-size: 0.9rem; line-height: 1.5;">
            "{{ read.response }}"
          </p>
        </div>
      </div>
    </div>

    <!-- Custom Input -->
    <div class="custom-input-wrapper mb-4">
      <label class="text-uppercase small fw-medium mb-2 d-block" style="color: var(--color-text-muted); font-size: 0.7rem; letter-spacing: 0.12em;">
        Optional: Add custom instructions or dialogue to your choice
      </label>
      <textarea
        v-model="customInput"
        placeholder="Type your own dialogue, actions, or specific instructions for the AI to include with the selected choice..."
        class="custom-input w-100"
        rows="2"
        :disabled="gameStore.isAiThinking"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.choice-btn {
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  min-height: 56px;
}

.choice-btn:hover:not(:disabled) {
  border-color: var(--color-border-light);
  background: var(--color-surface-light);
  transform: translateY(-1px);
}

.choice-btn:active:not(:disabled) {
  transform: translateY(0);
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.redo-btn {
  padding: 4px 10px;
  background: rgba(250, 190, 80, 0.08);
  border: 1px solid rgba(250, 190, 80, 0.2);
  border-radius: 6px;
  color: var(--color-gold, #fabe50);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.redo-btn:hover:not(:disabled) {
  background: rgba(250, 190, 80, 0.16);
  border-color: rgba(250, 190, 80, 0.4);
  transform: translateY(-1px);
}

.redo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.custom-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 12px 16px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s, background 0.2s;
}

.custom-input:focus {
  outline: none;
  border-color: var(--color-border-light);
  background: var(--color-surface-light);
}

.custom-input::placeholder {
  color: var(--color-text-dim);
}

.custom-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mind-read-btn {
  padding: 0 20px;
  background: rgba(147, 112, 219, 0.15);
  border: 1px solid rgba(147, 112, 219, 0.4);
  color: var(--color-arcane-glow, #cda4ff);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.mind-read-btn:hover:not(:disabled) {
  background: rgba(147, 112, 219, 0.25);
  border-color: var(--color-arcane-glow, #cda4ff);
  transform: translateY(-1px);
}

.mind-read-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.mind-read-result {
  background: rgba(147, 112, 219, 0.05);
  border-left: 3px solid var(--color-arcane-glow, #cda4ff);
}
</style>
