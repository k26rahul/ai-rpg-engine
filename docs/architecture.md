# AI RPG Engine — Architecture Blueprint

> **Scope:** Minimum Viable Product (MVP) — a fully text-based, turn-based RPG powered by Google Gemini AI, built with Vue.js.

---

## 1. High-Level Vision

The AI RPG Engine is a **framework for creating text-based RPG games** where the story, characters, and world are defined once in a schema-less JSON configuration, and the **AI drives the narrative forward** through a turn-based loop. The player controls **one character**; every other character is played by the AI.

```
┌─────────────────────────────────────────────────────┐
│                    USER (Browser)                    │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Game Setup  │→ │  Gameplay   │→ │  Game Log   │ │
│  │  (JSON in)   │  │  (Turn Loop)│  │  (History)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                │                │         │
└─────────┼────────────────┼────────────────┼─────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────┐
│                   ENGINE CORE                        │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  Config   │  │  Game State  │  │  AI Service   │ │
│  │  Parser   │  │  Manager     │  │  (Gemini)     │ │
│  └──────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 2. Core Domain Objects

These are the fundamental entities the engine understands. They are **not rigidly typed** — the user can attach any properties they want via the schema-less JSON. The engine only requires a small set of fields to function.

### 2.1 Character

Represents any person/entity in the story.

| Required Field   | Type     | Description                                                        |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `id`             | `string` | Unique identifier (e.g. `"hero"`, `"detective"`)                   |
| `name`           | `string` | Display name                                                       |
| `isPlayer`       | `bool`   | `true` for exactly one character — the one the user controls       |
| `stats`          | `object` | Key-value pairs of numeric stats (e.g. `{ "health": 100, "trust": 50 }`) |

Everything else — appearance, personality, backstory, decision-making style — is **free-form**. The user writes whatever they want, and it gets forwarded to the AI as context.

```json
{
  "id": "detective",
  "name": "Inspector Mira",
  "isPlayer": false,
  "stats": { "suspicion": 30, "trust": 60 },
  "personality": "Sharp, analytical, slow to trust but fiercely loyal once convinced.",
  "backstory": "Grew up on the streets, worked her way through the academy..."
}
```

### 2.2 Location

Represents a place where scenes can happen.

| Required Field | Type     | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `id`           | `string` | Unique identifier (e.g. `"old_house"`)      |
| `name`         | `string` | Display name                                |

Optional / free-form: description, atmosphere, items present, environmental hazards — anything the user wants, forwarded as AI context.

```json
{
  "id": "old_house",
  "name": "The Old House on Maple Street",
  "description": "A creaking Victorian house. Dust covers every surface...",
  "items": ["rusty key", "torn letter"]
}
```

### 2.3 Scene (Starting Scenario)

The initial narrative setup — what's happening when the game begins.

| Required Field      | Type       | Description                                              |
| ------------------- | ---------- | -------------------------------------------------------- |
| `description`       | `string`   | The opening narrative / situation                        |
| `locationId`        | `string`   | Where the scene starts                                   |
| `presentCharacters` | `string[]` | IDs of characters present at the start                   |

```json
{
  "description": "A storm rages outside. You and Inspector Mira are trapped inside the old house. She paces nervously, glancing at the locked door...",
  "locationId": "old_house",
  "presentCharacters": ["hero", "detective"]
}
```

### 2.4 Rules (Optional, Free-Form)

Any game rules, stat behaviors, win/lose conditions, or narrative constraints the user wants to define. This is **pure text/JSON context** passed to the AI.

```json
{
  "statRules": {
    "trust": {
      "range": [0, 100],
      "effect": "When trust reaches 0, the detective turns hostile. Above 80, she reveals a secret."
    }
  },
  "tone": "Dark mystery with moments of dark humor",
  "constraints": "Never break the fourth wall. Keep dialogue realistic."
}
```

---

## 3. Game Configuration (Input JSON)

The entire game is defined in a **single JSON object** that the user provides. This is the only input the engine needs to start a game.

```json
{
  "title": "The Locked Room",
  "characters": [ ... ],
  "locations": [ ... ],
  "scene": { ... },
  "rules": { ... }
}
```

> **Key design decision:** The JSON is **schema-less by intention.** The engine extracts the required fields listed above, and **passes everything else verbatim** as context to the AI. This means the user can add any depth of world-building without the engine needing to understand it.

---

## 4. The Turn Loop (Core Game Mechanic)

This is the heart of the engine. Every turn follows this cycle:

```
┌──────────────────────────────────────────────────────┐
│                     TURN LOOP                        │
│                                                      │
│  1. AI generates narrative + 3 choices               │
│          ↓                                           │
│  2. UI displays story text + choices to player       │
│          ↓                                           │
│  3. Player selects a choice                          │
│          ↓                                           │
│  4. Engine records choice & updates stats            │
│          ↓                                           │
│  5. Choice is sent to AI as next turn context        │
│          ↓                                           │
│  (back to step 1)                                    │
└──────────────────────────────────────────────────────┘
```

### 4.1 AI Response Structure

Every AI response must follow a **strict JSON schema** so the engine can parse it reliably:

```json
{
  "narrative": "Inspector Mira slams her hand on the table. 'We need to talk about what happened upstairs,' she says, her eyes narrowing...",
  "choices": [
    {
      "id": 1,
      "text": "Tell her everything you saw in the attic.",
      "tone": "honest",
      "statChanges": { "trust": +15, "suspicion": -10 }
    },
    {
      "id": 2,
      "text": "Deflect — ask her what SHE was doing during the blackout.",
      "tone": "evasive",
      "statChanges": { "trust": -5, "suspicion": +20 }
    },
    {
      "id": 3,
      "text": "Stay silent and observe her body language.",
      "tone": "cautious",
      "statChanges": { "suspicion": +5 }
    }
  ],
  "stateUpdates": {
    "characters": {
      "detective": {
        "stats": { "suspicion": 35 }
      }
    },
    "currentLocationId": "old_house"
  }
}
```

### 4.2 What the AI Receives Each Turn

The AI is provided with a **system prompt** (once, at the start) plus a growing **chat history** that accumulates turn by turn.

**System Prompt** contains:
- Complete game configuration JSON (characters, locations, scene, rules)
- Output format instructions (the strict JSON schema above)
- Role instructions: "You are the game master. You control all characters except the player character."
- Behavioral rules from the user's config

**Each User Turn** (sent as user message in the chat):
```json
{
  "choiceId": 1,
  "choiceText": "Tell her everything you saw in the attic."
}
```

**Each AI Turn** (AI's response):
The structured JSON with narrative + new choices + state updates.

> **This is essentially a chat conversation** — the Gemini chat/multi-turn API handles context accumulation automatically.

---

## 5. Tech Stack & Project Structure

### 5.1 Stack

| Layer      | Technology             | Notes                                      |
| ---------- | ---------------------- | ------------------------------------------ |
| Framework  | Vue.js 3 (Composition API) | No TypeScript, plain JavaScript         |
| Styling    | Tailwind CSS           | Minimal usage — only where needed          |
| State      | Vue reactive stores    | No Vuex/Pinia — simple `reactive()` stores |
| AI         | Google Gemini API      | Via `@google/generative-ai` SDK            |
| Build      | Vite                   | Default Vue tooling                        |

### 5.2 Directory Structure

```
ai-rpg-engine/
├── index.html
├── .env                        # VITE_GEMINI_API_KEY=...
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # App entry point
│   ├── App.vue                 # Root component — layout + view routing
│   │
│   ├── stores/                 # Reactive state (no library)
│   │   └── gameStore.js        # All game state in one reactive store
│   │
│   ├── services/               # Business logic, AI communication
│   │   ├── aiService.js        # Gemini API wrapper, prompt construction, response parsing
│   │   └── gameEngine.js       # Turn loop orchestration, stat updates, validation
│   │
│   ├── components/             # UI components
│   │   ├── GameSetup.vue       # JSON input / paste area + "Start Game" button
│   │   ├── GamePlay.vue        # Main game screen — narrative + choices
│   │   ├── NarrativeDisplay.vue# Renders the story text for the current turn
│   │   ├── ChoicePanel.vue     # Renders the 3 choices as interactive cards
│   │   ├── StatsPanel.vue      # Displays character stats (live-updating)
│   │   └── GameLog.vue         # Scrollable history of all past turns
│   │
│   └── utils/
│       └── configParser.js     # Extracts required fields from the user's JSON
│
├── rough-idea.md               # Original brainstorm
└── architecture.md             # This document
```

---

## 6. Detailed Module Design

### 6.1 `stores/gameStore.js` — Reactive Game State

A single reactive object that holds all game state. Every component reads from this store, and only the game engine writes to it.

```
gameStore = reactive({
  // --- Setup Phase ---
  phase: 'setup' | 'playing',     // Current app phase
  rawConfig: null,                  // The original JSON the user pasted

  // --- Parsed Config ---
  config: {
    title: '',
    characters: [],                 // Array of character objects
    locations: [],                  // Array of location objects
    scene: {},                      // Starting scene
    rules: {},                      // Free-form rules
  },

  // --- Live Game State ---
  playerCharacterId: null,          // ID of the player's character
  currentLocationId: null,          // Where the action is happening
  characterStats: {},               // { characterId: { statName: value } }

  // --- Current Turn ---
  currentNarrative: '',             // Latest AI-generated narrative text
  currentChoices: [],               // Array of 3 choice objects
  isAiThinking: false,              // Loading state while waiting for AI

  // --- History ---
  turnHistory: [],                  // Array of { narrative, chosenOption, statSnapshot }
  turnCount: 0,
})
```

### 6.2 `services/aiService.js` — Gemini AI Communication

This module is the **sole interface** with the Gemini API.

**Responsibilities:**
1. Initialize the Gemini chat session with the system prompt
2. Send the player's choice as a user message each turn
3. Parse the AI's JSON response
4. Handle errors (malformed responses, API failures)

**Key Design Decisions:**
- Uses Gemini's **multi-turn chat** mode (`startChat()`), which automatically maintains conversation history — no need to manually manage message arrays.
- The system prompt is built once from the game config and injected at chat creation.
- JSON mode is enforced via the `responseMimeType: "application/json"` config option, so the AI is constrained to return valid JSON.

```
Functions:
  initChat(gameConfig)        → Creates chat session with system prompt
  sendChoice(choiceId, text)  → Sends player choice, returns parsed AI response
  buildSystemPrompt(config)   → Constructs the system prompt from game config
  parseAiResponse(raw)        → Validates and extracts structured data from AI output
```

### 6.3 `services/gameEngine.js` — Turn Loop Orchestration

The **orchestrator** that ties everything together.

```
Functions:
  startGame(rawJson)
    1. Parse JSON via configParser
    2. Initialize gameStore with parsed config
    3. Initialize AI chat session via aiService
    4. Request first turn from AI (no player choice yet)
    5. Set phase to 'playing'

  submitChoice(choiceId)
    1. Find chosen option from currentChoices
    2. Apply stat changes from the choice to gameStore
    3. Save current turn to turnHistory
    4. Set isAiThinking = true
    5. Send choice to AI via aiService
    6. Parse AI response → update currentNarrative, currentChoices
    7. Apply any stateUpdates from AI response
    8. Increment turnCount
    9. Set isAiThinking = false
```

### 6.4 `utils/configParser.js` — Configuration Extraction

Extracts the minimum required fields from the user's schema-less JSON. Everything else is preserved as-is for the AI context.

```
Functions:
  parseConfig(rawJson)
    → Validates required fields exist (characters, locations, scene)
    → Identifies the player character (isPlayer: true)
    → Returns a structured config object
    → Throws clear errors if required data is missing
```

---

## 7. Component Design

### 7.1 `App.vue`

Simple conditional rendering based on `gameStore.phase`:
- `phase === 'setup'` → Show `<GameSetup />`
- `phase === 'playing'` → Show `<GamePlay />`

### 7.2 `GameSetup.vue`

- A large `<textarea>` where the user pastes their game configuration JSON
- A "Start Game" button
- Validation feedback (shows errors if JSON is malformed or missing required fields)
- On submit → calls `gameEngine.startGame(json)`

### 7.3 `GamePlay.vue`

The main game screen. Layouts the three sub-components:

```
┌─────────────────────────────────────────┐
│             Game Title                  │
├────────────────────────┬────────────────┤
│                        │                │
│   NarrativeDisplay     │   StatsPanel   │
│   (scrollable area     │   (character   │
│    showing current     │    stats)      │
│    story text)         │                │
│                        │                │
├────────────────────────┴────────────────┤
│              ChoicePanel                │
│   ┌──────┐  ┌──────┐  ┌──────┐        │
│   │  #1  │  │  #2  │  │  #3  │        │
│   └──────┘  └──────┘  └──────┘        │
├─────────────────────────────────────────┤
│              GameLog                    │
│   (collapsible history of past turns)  │
└─────────────────────────────────────────┘
```

### 7.4 `NarrativeDisplay.vue`

- Receives `gameStore.currentNarrative`
- Renders the narrative text with appropriate typography
- Shows a loading/typing indicator when `gameStore.isAiThinking` is `true`

### 7.5 `ChoicePanel.vue`

- Receives `gameStore.currentChoices`
- Renders each choice as a card showing:
  - Choice text
  - Tone tag (e.g., "honest", "evasive", "cautious")
  - Stat impact preview (e.g., "Trust +15, Suspicion -10")
- Disabled while `isAiThinking` is `true`
- On click → calls `gameEngine.submitChoice(choiceId)`

### 7.6 `StatsPanel.vue`

- Reads `gameStore.characterStats` for all characters
- Displays stat bars / values grouped by character
- Highlights recent changes (e.g., flash green for increase, red for decrease)

### 7.7 `GameLog.vue`

- Reads `gameStore.turnHistory`
- Renders a scrollable list of past turns
- Each entry shows: turn number, narrative summary, choice made, stat changes
- Collapsible to save screen space

---

## 8. AI Prompt Design

The system prompt is the most critical piece of the engine. It must instruct Gemini precisely.

### 8.1 System Prompt Template

```
You are the Game Master of a text-based RPG called "{title}".

== WORLD ==
{Full JSON of locations, stringified}

== CHARACTERS ==
{Full JSON of characters, stringified}
The player controls the character with id "{playerCharacterId}". You control ALL other characters.

== STARTING SCENE ==
{Full scene JSON, stringified}

== RULES ==
{Full rules JSON, stringified}

== YOUR JOB ==
Each turn, you must:
1. Write a narrative paragraph continuing the story. Write from a second-person perspective ("You see...", "You hear..."). Include dialogue and actions of non-player characters. React to the player's previous choice.
2. Present exactly 3 choices for the player. Each choice must have:
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
    { "id": 3, "text": "string", "tone": "string", "statChanges": {} }
  ],
  "stateUpdates": {
    "characters": { "<characterId>": { "stats": {} } },
    "currentLocationId": "string or null"
  }
}

Do not include any text outside the JSON object.
```

### 8.2 First Turn

For the very first turn, the engine sends a simple user message:

```json
{ "action": "start_game" }
```

The AI uses the scene description from the system prompt to generate the opening narrative and first set of choices.

### 8.3 Subsequent Turns

```json
{
  "choiceId": 2,
  "choiceText": "Deflect — ask her what SHE was doing during the blackout."
}
```

---

## 9. Data Flow (End to End)

```
User pastes JSON config
       │
       ▼
configParser.parseConfig()
       │ Extracts characters, locations, scene, rules, playerCharacterId
       ▼
gameStore is initialized
       │
       ▼
aiService.initChat()
       │ Builds system prompt from full config
       │ Creates Gemini chat session
       ▼
aiService.sendChoice({ action: "start_game" })
       │
       ▼
Gemini returns JSON ─────────────────────────────┐
       │                                          │
       ▼                                          │
gameEngine parses response                        │
       │ Updates gameStore:                       │
       │   - currentNarrative                     │
       │   - currentChoices                       │
       │   - characterStats (if stateUpdates)     │
       ▼                                          │
UI renders narrative + choices                    │
       │                                          │
       ▼                                          │
User clicks a choice                              │
       │                                          │
       ▼                                          │
gameEngine.submitChoice()                         │
       │ Applies stat changes                     │
       │ Archives turn to history                 │
       │ Sends choice to AI                       │
       ▼                                          │
Gemini returns JSON ◄────────────────────────────┘
       │
      (loop continues)
```

---

## 10. Error Handling Strategy

| Scenario                        | Handling                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| Invalid JSON pasted by user     | Show clear validation error, highlight what's missing                 |
| Missing required config fields  | Show specific error: "Character with `isPlayer: true` not found"     |
| Gemini returns malformed JSON   | Retry once; if still invalid, show error + offer "Retry Turn" button |
| Gemini API rate limit / failure | Show friendly error, offer retry with exponential backoff             |
| Network disconnection           | Detect and show reconnection prompt                                   |

---

## 11. MVP Scope Boundaries

### ✅ In Scope (MVP)

- Paste-in JSON game configuration
- Single player character + AI-controlled characters
- Turn-based text gameplay with 3 choices per turn
- Character stats that update based on choices
- Turn history / game log
- Gemini AI integration with structured JSON responses
- Basic error handling and loading states
- Clean, minimal UI with Tailwind

### ❌ Out of Scope (Future)

- Visual elements (images, maps, character portraits)
- Audio / background music
- Multiple simultaneous locations
- Inventory system
- Save / load game state
- Game configuration builder UI (use ChatGPT externally for now)
- Multiple player characters
- Combat system
- Multiplayer
- Deployment / hosting

---

## 12. MVP Test Scenario

To validate the engine works, use this minimal two-character setup:

**Characters:** A player ("You") and one NPC ("Inspector Mira") in a single location ("The Old House"). Both have `trust` and `suspicion` stats. The scenario is a locked-room mystery where the two must figure out an escape while navigating trust dynamics.

This is the simplest possible test: two characters, one location, two stats, pure dialogue-driven gameplay. If this works, the engine works.
