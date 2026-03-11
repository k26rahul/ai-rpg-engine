<script setup>
import { ref } from 'vue'

const props = defineProps({
  sampleConfig: {
    type: String,
    default: ''
  }
})

const isCopied = ref(false)

const promptText = `Act as an expert Game Designer and Creative Consultant. Your goal is to help me design a text-based AI RPG world by generating a structured JSON document that defines the game's initial state.

### Core Mechanics
1. **Format**: The game is text-based and turn-based.
2. **Control**: The player governs one character. All other entities are AI-controlled.
3. **Context**: The engine uses JSON to understand world rules, characters, and settings. Being a schema-less system, you are encouraged to add detailed properties (e.g., personality, motivations, and history) to provide the AI with rich narrative context.

### JSON Structure Requirements
Generate a single JSON object with the following keys:

1. **title**: (String) A descriptive title for the game.
2. **characters**: (Array of Objects)
   - **Required**: "id" (unique string), "name", "isPlayer" (boolean, exactly one true), "stats" (object of numeric key-values).
   - **Recommended**: Detailed fields like "description", "personality", "inventory", and "background".
3. **locations**: (Array of Objects)
   - **Required**: "id" (unique string), "name".
   - **Recommended**: "description", "atmosphere", and "notableFeatures".
4. **scene**: (Object) The starting point.
   - **Required**: "description" (2nd-person narrative starting with "You are..."), "locationId", "presentCharacters" (array of IDs).
5. **rules**: (Object)
   - **statRules**: Describe the logic for character stats, including range and behavioral influences.
   - **tone**: The narrative style (e.g., "Classic Detective Noir" or "Intergalactic Exploration").
   - **worldLore**: General background information about the setting.

### Reference Example
To help you understand the expected depth and structure, here is a sample configuration:

\`\`\`json
${props.sampleConfig}
\`\`\`

Please acknowledge these instructions and ask me for a game concept to begin.`

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(promptText)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<template>
  <div class="prompt-container mt-5 pt-4 border-top">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h3 class="prompt-heading mb-1">Generate World JSON</h3>
        <p class="prompt-subheading mb-0">
          Copy this system prompt and provide it to an AI assistant alongside your game concept. It will generate a structured JSON world definition that you can import into the engine.
        </p>
      </div>

      <button 
        @click="copyPrompt" 
        class="copy-btn d-flex align-items-center gap-2"
        :class="{ 'copied': isCopied }"
      >
        <span v-if="!isCopied">
          <svg xmlns="http://www.w3.org/2000/0m/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
          </svg>
        </span>
        <span v-else>
          <svg xmlns="http://www.w3.org/2000/0m/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
          </svg>
        </span>
        <span>{{ isCopied ? 'Copied!' : 'Copy Prompt' }}</span>
      </button>
    </div>
    
    <div class="code-preview-scroll">
      <pre class="code-preview"><code>{{ promptText }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.prompt-container {
  border-top-color: var(--color-border) !important;
  width: 100%;
}

.prompt-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.prompt-subheading {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  max-width: 400px;
  line-height: 1.5;
}

.copy-btn {
  padding: 8px 16px;
  background: var(--color-surface-light);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-border-light);
}

.copy-btn.copied {
  background: rgba(48, 201, 138, 0.12);
  color: var(--color-success);
  border-color: rgba(48, 201, 138, 0.3);
}

.code-preview-scroll {
  max-height: 250px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.code-preview {
  margin: 0;
  padding: 16px;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--color-text-dim);
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Custom scrollbar for preview */
.code-preview-scroll::-webkit-scrollbar {
  width: 6px;
}
.code-preview-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.code-preview-scroll::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 10px;
}
</style>
