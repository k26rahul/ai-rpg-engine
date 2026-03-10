/**
 * gameStore.js
 *
 * Single reactive store holding all game state.
 * Only the game engine writes to this store; components read from it.
 */

import { reactive } from 'vue'

const gameStore = reactive({
  // --- Setup Phase ---
  phase: 'setup', // 'setup' | 'playing'
  rawConfig: null, // The original JSON string the user pasted
  error: null, // Error message to display

  // --- API Key ---
  apiKey: '', // User-provided Gemini API key

  // --- Parsed Config ---
  config: {
    title: '',
    characters: [],
    locations: [],
    scene: {},
    rules: {},
    playerCharacterId: null,
    fullConfig: null,
  },

  // --- Live Game State ---
  playerCharacterId: null,
  currentLocationId: null,
  characterStats: {}, // { characterId: { statName: value } }

  // --- Current Turn ---
  currentNarrative: '',
  currentChoices: [],
  currentMindReads: [], // Array of { query, response } for the current turn
  isAiThinking: false,
  lastChosenChoice: null, // { id, text, tone, statChanges } — used for redo

  // --- History ---
  turnHistory: [], // Array of { turnNumber, narrative, chosenChoice, statSnapshot }
  turnCount: 0,

  // --- Chat History (for AI context replay on resume) ---
  chatHistory: [], // Array of { role: 'user'|'model', parts: [{ text }] }
})

/**
 * Reset the store to initial state
 */
export function resetStore() {
  gameStore.phase = 'setup'
  gameStore.rawConfig = null
  gameStore.error = null
  // apiKey is intentionally NOT reset — keep it across sessions
  gameStore.config = {
    title: '',
    characters: [],
    locations: [],
    scene: {},
    rules: {},
    playerCharacterId: null,
    fullConfig: null,
  }
  gameStore.playerCharacterId = null
  gameStore.currentLocationId = null
  gameStore.characterStats = {}
  gameStore.currentNarrative = ''
  gameStore.currentChoices = []
  gameStore.currentMindReads = []
  gameStore.isAiThinking = false
  gameStore.lastChosenChoice = null
  gameStore.turnHistory = []
  gameStore.turnCount = 0
  gameStore.chatHistory = []
}

export default gameStore
