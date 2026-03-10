/**
 * storageService.js
 *
 * Manages all localStorage operations for API key and game state persistence.
 */

const STORAGE_KEYS = {
  API_KEY: 'rpg-engine-api-key',
  GAME_STATE: 'rpg-engine-game-state',
}

// ── API Key ──────────────────────────────────────────────

export function saveApiKey(key) {
  localStorage.setItem(STORAGE_KEYS.API_KEY, key)
}

export function loadApiKey() {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || ''
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEYS.API_KEY)
}

// ── Game State ───────────────────────────────────────────

/**
 * Save the full game state to localStorage.
 * @param {object} store — The reactive game store
 */
export function saveGameState(store) {
  const state = {
    rawConfig: store.rawConfig,
    config: store.config,
    playerCharacterId: store.playerCharacterId,
    currentLocationId: store.currentLocationId,
    characterStats: store.characterStats,
    currentNarrative: store.currentNarrative,
    currentChoices: store.currentChoices,
    turnHistory: store.turnHistory,
    turnCount: store.turnCount,
    chatHistory: store.chatHistory,
    savedAt: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save game state to localStorage:', e.message)
  }
}

/**
 * Load game state from localStorage.
 * @returns {object|null} — The saved state, or null if none exists
 */
export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load game state from localStorage:', e.message)
    return null
  }
}

/**
 * Check if a saved game exists.
 * @returns {boolean}
 */
export function hasSavedGame() {
  return localStorage.getItem(STORAGE_KEYS.GAME_STATE) !== null
}

/**
 * Clear saved game state from localStorage.
 */
export function clearGameState() {
  localStorage.removeItem(STORAGE_KEYS.GAME_STATE)
}
