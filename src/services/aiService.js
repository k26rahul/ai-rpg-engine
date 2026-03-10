/**
 * aiService.js
 *
 * Sole interface with the Google Gemini API.
 * Manages chat session, prompt construction, and response parsing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null
let chatSession = null

/**
 * Build the system prompt from the game configuration
 */
function buildSystemPrompt(config) {
  return `You are the Game Master of a text-based RPG called "${config.title}".

== WORLD ==
${JSON.stringify(config.locations, null, 2)}

== CHARACTERS ==
${JSON.stringify(config.characters, null, 2)}
The player controls the character with id "${config.playerCharacterId}". You control ALL other characters.

== STARTING SCENE ==
${JSON.stringify(config.scene, null, 2)}

== RULES ==
${JSON.stringify(config.rules, null, 2)}

== YOUR JOB ==
Each turn, you must:
1. Write a narrative paragraph continuing the story. Write from a second-person perspective ("You see...", "You hear..."). Include dialogue and actions of non-player characters. React to the player's previous choice.
2. Present exactly 5 choices for the player. Each choice must have:
   - A short text describing the action
   - A "tone" label (one word: e.g., bold, cautious, deceptive, honest, aggressive)
   - "statChanges": an object showing how the PLAYER's stats would change if they pick this option
3. Provide "stateUpdates" if any non-player character stats should change, or if the location changes.

== OUTPUT FORMAT ==
You MUST respond with ONLY a valid JSON object in this exact format:
{
  "narrative": "string",
  "choices": [
    { "id": 1, "text": "string", "tone": "string", "statChanges": {} },
    { "id": 2, "text": "string", "tone": "string", "statChanges": {} },
    { "id": 3, "text": "string", "tone": "string", "statChanges": {} },
    { "id": 4, "text": "string", "tone": "string", "statChanges": {} },
    { "id": 5, "text": "string", "tone": "string", "statChanges": {} }
  ],
  "stateUpdates": {
    "characters": { "<characterId>": { "stats": {} } },
    "currentLocationId": "string or null"
  }
}

Do not include any text outside the JSON object.`
}

/**
 * Create a Gemini model instance with the given config and API key.
 */
function createModel(apiKey, config) {
  genAI = new GoogleGenerativeAI(apiKey)

  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
    systemInstruction: buildSystemPrompt(config),
  })
}

/**
 * Initialize a fresh Gemini chat session with the system prompt.
 * @param {object} config — Parsed game configuration
 * @param {string} apiKey — User-provided API key
 */
export async function initChat(config, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Gemini API key.')
  }

  const model = createModel(apiKey, config)
  chatSession = model.startChat()
}

/**
 * Resume a chat session by replaying previous chat history.
 * This re-establishes the AI's context from a saved game.
 * @param {object} config — Parsed game configuration
 * @param {string} apiKey — User-provided API key
 * @param {Array} history — Array of { role, parts } messages to replay
 */
export async function resumeChat(config, apiKey, history) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Gemini API key.')
  }

  const model = createModel(apiKey, config)

  // Start the chat with the saved history so the AI has full context
  chatSession = model.startChat({ history })
}

/**
 * Send a message to the AI and get a parsed response.
 * @param {object} payload — The message to send
 * @returns {object} — Parsed AI response with narrative, choices, stateUpdates
 */
export async function sendChoice(payload) {
  if (!chatSession) {
    throw new Error('Chat session not initialized. Call initChat() first.')
  }

  try {
    const messageText = JSON.stringify(payload)
    const result = await chatSession.sendMessage(messageText)
    const responseText = result.response.text()
    return {
      parsed: parseAiResponse(responseText),
      rawUserMessage: messageText,
      rawModelResponse: responseText,
    }
  } catch (error) {
    // Provide user-friendly messages for common API errors
    const msg = error.message || ''

    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('API quota exceeded. Your Gemini API key has hit its rate limit. Please wait a minute and try again, or upgrade your API plan.')
    }
    if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
      throw new Error('Invalid API key. Please check that your Gemini API key is correct.')
    }
    if (msg.includes('404')) {
      throw new Error('Gemini model not found. The model "gemini-2.5-flash" may not be available for your API key.')
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.')
    }

    throw error
  }
}

/**
 * Parse and validate the AI's JSON response
 */
function parseAiResponse(rawText) {
  let parsed

  try {
    parsed = JSON.parse(rawText)
  } catch (e) {
    throw new Error(`AI returned invalid JSON: ${e.message}\n\nRaw response: ${rawText}`)
  }

  // Validate structure
  if (!parsed.narrative || typeof parsed.narrative !== 'string') {
    throw new Error('AI response missing "narrative" field.')
  }

  if (!parsed.choices || !Array.isArray(parsed.choices) || parsed.choices.length === 0) {
    throw new Error('AI response missing "choices" array.')
  }

  // Ensure each choice has required fields
  for (const choice of parsed.choices) {
    if (!choice.id) choice.id = parsed.choices.indexOf(choice) + 1
    if (!choice.text) throw new Error(`Choice ${choice.id} missing "text" field.`)
    if (!choice.tone) choice.tone = 'neutral'
    if (!choice.statChanges) choice.statChanges = {}
  }

  // Ensure stateUpdates exists
  if (!parsed.stateUpdates) {
    parsed.stateUpdates = { characters: {}, currentLocationId: null }
  }

  return parsed
}
