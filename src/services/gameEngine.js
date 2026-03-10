/**
 * gameEngine.js
 *
 * Orchestrates the turn loop: ties the config parser, game store, and AI service together.
 */

import gameStore, { resetStore } from '../stores/gameStore.js'
import { parseConfig } from '../utils/configParser.js'
import { initChat, resumeChat, sendChoice } from '../services/aiService.js'
import { saveGameState, loadGameState, clearGameState } from '../services/storageService.js'

/**
 * Start a new game from the raw JSON config
 * @param {string} rawJson — The raw JSON string pasted by the user
 */
export async function startGame(rawJson) {
  try {
    gameStore.error = null
    gameStore.isAiThinking = true

    // 1. Parse and validate config
    const config = parseConfig(rawJson)

    // 2. Initialize the store
    gameStore.rawConfig = rawJson
    gameStore.config = config
    gameStore.playerCharacterId = config.playerCharacterId
    gameStore.currentLocationId = config.scene.locationId

    // 3. Initialize character stats from config
    const stats = {}
    for (const char of config.characters) {
      if (char.stats && typeof char.stats === 'object') {
        stats[char.id] = { ...char.stats }
      } else {
        stats[char.id] = {}
      }
    }
    gameStore.characterStats = stats

    // 4. Initialize AI chat session
    await initChat(config, gameStore.apiKey)

    // 5. Request first turn from AI
    const responseInfo = await sendChoice({ action: 'start_game' })
    const response = responseInfo.parsed

    // Save chat history for resume
    gameStore.chatHistory.push({ role: 'user', parts: [{ text: responseInfo.rawUserMessage }] })
    gameStore.chatHistory.push({ role: 'model', parts: [{ text: responseInfo.rawModelResponse }] })

    // 6. Update store with AI response
    gameStore.currentNarrative = response.narrative
    gameStore.currentChoices = response.choices
    applyStateUpdates(response.stateUpdates)

    // 7. Switch to playing phase
    gameStore.phase = 'playing'
    gameStore.turnCount = 1
    gameStore.isAiThinking = false

    // 8. Auto-save
    saveGameState(gameStore)
  } catch (error) {
    gameStore.isAiThinking = false
    gameStore.error = error.message
    throw error
  }
}

/**
 * Resume a game from saved localStorage state
 */
export async function resumeGame() {
  try {
    const state = loadGameState()
    if (!state) throw new Error('No saved game found.')

    gameStore.error = null
    gameStore.isAiThinking = true

    // 1. Restore store state
    gameStore.rawConfig = state.rawConfig
    gameStore.config = state.config
    gameStore.playerCharacterId = state.playerCharacterId
    gameStore.currentLocationId = state.currentLocationId
    gameStore.characterStats = state.characterStats
    gameStore.currentNarrative = state.currentNarrative
    gameStore.currentChoices = state.currentChoices
    gameStore.turnHistory = state.turnHistory
    gameStore.turnCount = state.turnCount
    gameStore.chatHistory = state.chatHistory

    // 2. Resume AI chat session with history
    await resumeChat(gameStore.config, gameStore.apiKey, gameStore.chatHistory)

    // 3. Switch to playing phase
    gameStore.phase = 'playing'
    gameStore.isAiThinking = false
  } catch (error) {
    gameStore.isAiThinking = false
    gameStore.error = error.message
    throw error
  }
}

/**
 * Submit the player's choice and advance the turn
 * @param {number} choiceId — The ID of the chosen option
 * @param {string} customInput — Optional custom dialogue or action
 */
export async function submitChoice(choiceId, customInput = '') {
  try {
    gameStore.error = null

    // 1. Find the chosen option
    const chosenChoice = gameStore.currentChoices.find(c => c.id === choiceId)
    if (!chosenChoice) {
      throw new Error(`Choice with id ${choiceId} not found.`)
    }

    // 2. Apply stat changes from the chosen option to the PLAYER
    if (chosenChoice.statChanges) {
      const playerId = gameStore.playerCharacterId
      if (!gameStore.characterStats[playerId]) {
        gameStore.characterStats[playerId] = {}
      }
      for (const [stat, delta] of Object.entries(chosenChoice.statChanges)) {
        const currentVal = gameStore.characterStats[playerId][stat] || 0
        gameStore.characterStats[playerId][stat] = currentVal + delta
      }
    }

    // 3. Save current turn to history
    gameStore.turnHistory.push({
      turnNumber: gameStore.turnCount,
      narrative: gameStore.currentNarrative,
      chosenChoice: {
        id: chosenChoice.id,
        text: chosenChoice.text,
        tone: chosenChoice.tone,
        statChanges: chosenChoice.statChanges,
        customInput: customInput,
      },
      statSnapshot: JSON.parse(JSON.stringify(gameStore.characterStats)),
      // Save chat history length before this turn so we can roll back
      chatHistoryLengthBefore: gameStore.chatHistory.length,
    })

    // 4. Set loading state
    gameStore.isAiThinking = true
    // Remember this choice so the player can redo it
    gameStore.lastChosenChoice = {
      id: chosenChoice.id,
      text: chosenChoice.text,
      tone: chosenChoice.tone,
      statChanges: chosenChoice.statChanges,
      customInput: customInput,
    }

    // 5. Send choice to AI
    const responseInfo = await sendChoice({
      choiceId: chosenChoice.id,
      choiceText: chosenChoice.text,
      customInput: customInput,
    })
    const response = responseInfo.parsed

    // Save chat history for resume
    gameStore.chatHistory.push({ role: 'user', parts: [{ text: responseInfo.rawUserMessage }] })
    gameStore.chatHistory.push({ role: 'model', parts: [{ text: responseInfo.rawModelResponse }] })

    // 6. Update store with new AI response
    gameStore.currentNarrative = response.narrative
    gameStore.currentChoices = response.choices

    // 7. Apply state updates from AI
    applyStateUpdates(response.stateUpdates)

    // 8. Increment turn count
    gameStore.turnCount++
    gameStore.isAiThinking = false

    // 9. Auto-save
    saveGameState(gameStore)
  } catch (error) {
    gameStore.isAiThinking = false
    gameStore.error = error.message
    throw error
  }
}

/**
 * Redo the last choice: roll back the turn and ask AI again with the same choice.
 * Can be called as many times as the player wants.
 */
export async function redoLastChoice() {
  try {
    gameStore.error = null

    // 1. Pop the last turn from history
    const lastTurn = gameStore.turnHistory.pop()
    if (!lastTurn) throw new Error('Nothing to redo.')

    // 2. Restore narrative and choices to what they were before the choice was submitted
    gameStore.currentNarrative = lastTurn.narrative
    // Choices are gone after a pick — we'll get fresh ones from the AI answer below

    // 3. Restore character stats to the snapshot taken BEFORE that turn's stat changes
    //    The snapshot in the turn BEFORE last (or the initial state) is what we want.
    //    Actually lastTurn.statSnapshot is the snapshot AFTER applying the choice's statChanges.
    //    We need the snapshot from before: revert by inverting statChanges.
    const playerId = gameStore.playerCharacterId
    if (lastTurn.chosenChoice.statChanges) {
      for (const [stat, delta] of Object.entries(lastTurn.chosenChoice.statChanges)) {
        if (gameStore.characterStats[playerId]) {
          gameStore.characterStats[playerId][stat] =
            (gameStore.characterStats[playerId][stat] || 0) - delta
        }
      }
    }

    // 4. Roll back chat history to before this turn was sent
    const targetLen = lastTurn.chatHistoryLengthBefore ?? gameStore.chatHistory.length - 2
    gameStore.chatHistory = gameStore.chatHistory.slice(0, targetLen)

    // 5. Re-initialize AI chat with the rolled-back history
    const { resumeChat, sendChoice } = await import('./aiService.js')
    await resumeChat(gameStore.config, gameStore.apiKey, gameStore.chatHistory)

    // 6. Set loading state
    gameStore.isAiThinking = true
    gameStore.currentChoices = []

    // 7. Re-send the exact same choice to get a different continuation
    const responseInfo = await sendChoice({
      choiceId: lastTurn.chosenChoice.id,
      choiceText: lastTurn.chosenChoice.text,
      customInput: lastTurn.chosenChoice.customInput,
    })
    const response = responseInfo.parsed

    // 8. Save new exchange into chat history
    gameStore.chatHistory.push({ role: 'user', parts: [{ text: responseInfo.rawUserMessage }] })
    gameStore.chatHistory.push({ role: 'model', parts: [{ text: responseInfo.rawModelResponse }] })

    // Re-push turn to history with the new narrative
    gameStore.turnHistory.push({
      turnNumber: lastTurn.turnNumber,
      narrative: lastTurn.narrative,
      chosenChoice: lastTurn.chosenChoice,
      statSnapshot: JSON.parse(JSON.stringify(gameStore.characterStats)),
      chatHistoryLengthBefore: targetLen,
    })

    // 9. Apply stat changes again (we reverted them above, now re-apply)
    if (lastTurn.chosenChoice.statChanges) {
      for (const [stat, delta] of Object.entries(lastTurn.chosenChoice.statChanges)) {
        if (!gameStore.characterStats[playerId]) gameStore.characterStats[playerId] = {}
        gameStore.characterStats[playerId][stat] =
          (gameStore.characterStats[playerId][stat] || 0) + delta
      }
    }

    // 10. Update store with fresh AI response
    gameStore.currentNarrative = response.narrative
    gameStore.currentChoices = response.choices
    applyStateUpdates(response.stateUpdates)

    gameStore.isAiThinking = false

    // 11. Auto-save
    saveGameState(gameStore)
  } catch (error) {
    gameStore.isAiThinking = false
    gameStore.error = error.message
    throw error
  }
}

/**
 * Apply state updates from the AI response (NPC stat changes, location changes)
 */
function applyStateUpdates(stateUpdates) {
  if (!stateUpdates) return

  // Update NPC character stats
  if (stateUpdates.characters) {
    for (const [charId, updates] of Object.entries(stateUpdates.characters)) {
      if (updates.stats) {
        if (!gameStore.characterStats[charId]) {
          gameStore.characterStats[charId] = {}
        }
        for (const [stat, value] of Object.entries(updates.stats)) {
          gameStore.characterStats[charId][stat] = value
        }
      }
    }
  }

  // Update current location
  if (stateUpdates.currentLocationId) {
    gameStore.currentLocationId = stateUpdates.currentLocationId
  }
}

/**
 * Reset the game and return to setup
 */
export function quitGame() {
  clearGameState()
  resetStore()
}
