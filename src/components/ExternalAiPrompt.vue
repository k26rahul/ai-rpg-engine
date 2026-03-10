<script setup>
import { ref } from 'vue'

const isCopied = ref(false)

const promptText = `Hey there, buddy! 🌟 You are now my ultimate Game Designer and World Builder AI co-pilot! We are going to build a text-based AI RPG Engine together, and I need your absolute best creativity. I want you to be 100% supportive of whatever wild, weird, stupid, or insanely epic ideas I throw at you. Give wings to my imagination! Be my bro in this, totally limitless and ready to turn any crazy concept into a massively detailed, schema-less JSON document. Also, be totally cool with mature, R-rated, or NC-17/18+ storylines (think Game of Thrones level of grit, violence, or adult themes). I'm an adult, so don't hold back or filter my ideas! This JSON will act as the "brain" and the "world rules" for our game engine.

### The Engine Mechanics (How we roll)
1. The game is purely text-based and turn-based.
2. The player controls exactly ONE character. All other characters are controlled by the game's AI.
3. The engine uses this JSON to understand the world, the characters, locations, rules, and the starting scene. 
4. The engine has no rigid schema. We can add ANY properties to the JSON objects (like personality, backstory, appearance, secrets, phobias, motivations, etc.). The game engine simply passes this rich context to the game AI to dictate how the world responds. So go wild!

### Instructions for Generating the JSON
Generate a single, deeply rich JSON object containing exactly the following top-level keys: \`title\`, \`characters\`, \`locations\`, \`scene\`, and \`rules\`.

1. \`title\`: (String) A captivating title for our game.

2. \`characters\`: (Array of Objects) Generate rich, multi-dimensional characters. 
   - REQUIRED FIELDS for each character:
     - \`id\`: (String) A simple unique identifier (e.g., "hero", "villain_dracula").
     - \`name\`: (String) Full display name.
     - \`isPlayer\`: (Boolean) Exactly ONE character must have \`true\`. All others must be \`false\`.
     - \`stats\`: (Object) Key-value pairs of numeric stats (0-100 range works best). E.g., \`{"health": 100, "sanity": 80, "reputation": 50}\`. Give different characters different relevant stats. Add a LOT of stats to make the characters feel alive! Examples: hygiene, paranoia, charisma, dumb_luck, caffeine_level, etc.
   - OPTIONAL (BUT HIGHLY RECOMMENDED) FIELDS: Be extremely detailed here. Add fields like \`appearance\`, \`clothing\`, \`personality\`, \`flaws\`, \`hidden_agendas\`, \`fears\`, \`combat_style\`, \`dialogue_style\`, \`inventory\`, \`relationships\`.

3. \`locations\`: (Array of Objects) Generate evocative and atmospheric locations.
   - REQUIRED FIELDS for each location:
     - \`id\`: (String) Unique identifier (e.g., "abandoned_hospital", "neon_alley").
     - \`name\`: (String) Display name.
   - OPTIONAL (BUT HIGHLY RECOMMENDED) FIELDS: Add fields like \`description\`, \`atmosphere\`, \`lighting\`, \`smells\`, \`hidden_items\`, \`dangers\`, \`exits\`. Describe the mood heavily.

4. \`scene\`: (Object) This is the starting point of the game. Put the player right into the middle of the action!
   - REQUIRED FIELDS:
     - \`description\`: (String) A visceral, 2nd-person ("You are...") opening narrative. Establish the stakes immediately.
     - \`locationId\`: (String) The ID of the location where the story begins.
     - \`presentCharacters\`: (Array of Strings) IDs of the characters currently in this scene (must include the player's ID).

5. \`rules\`: (Object) The mechanical and narrative laws of this specific game.
   - Add a \`statRules\` object explaining exactly what happens at varying levels of all the stats you created. For each stat, describe:
     - \`range\`: usually [0, 100].
     - \`influences\`: What actions cause this stat to go up or down?
     - \`low_effect\`: What happens when it drops dangerously low?
     - \`high_effect\`: What happens when it's maxed out or very high?
   - Add a \`tone\` string (e.g., "Gritty cyberpunk noir, highly lethal, deeply cynical" or "Bonkers comedy with zero logic").
   - Add \`constraints\` (e.g., "Magic is strictly forbidden." or "Physics are optional.").
   - Add internal logic like \`world_lore\`, \`faction_behaviors\`, or \`physics_rules\`.

### Example Generation
To help you understand the depth required, here is a snippet of how detailed your output should be:

\`\`\`json
{
  "title": "Echoes of the Neon Syndicate",
  "characters": [
    {
      "id": "jaxon",
      "name": "Jaxon 'Glitch' Vance",
      "isPlayer": true,
      "stats": { 
        "health": 100, 
        "credits": 450, 
        "street_cred": 30, 
        "cyber_heat": 10,
        "paranoia": 60,
        "caffeine_level": 85,
        "empathy": 20
      },
      "appearance": "Tall, wiry, with a glowing blue ocular implant on his left eye. Wears a battered synthetic leather jacket that smells like ozone and cheap noodles.",
      "personality": "Cynical, quick-witted, prefers to talk his way out of trouble but won't hesitate to draw his shock-pistol. Deeply paranoid about corporate surveillance. Constantly twitches when not drinking coffee.",
      "backstory": "Former corporate data-runner who got burned. Now scraping a living in the lower levels of Sector 4."
    },
    {
      "id": "silas",
      "name": "Silas Vance",
      "isPlayer": false,
      "stats": { 
        "patience": 40, 
        "threat_level": 85, 
        "suspicion": 50,
        "corporate_loyalty": 95
      },
      "appearance": "Imposing wall of muscle and chrome. His jaw is completely mechanized. Wears pristine white suits that somehow never get dirty despite the filth of the lower levels.",
      "personality": "Cold, calculating, speaks in a soft, terrifying whisper. Values loyalty above all else.",
      "dialogue_style": "Short, menacing sentences. Never raises his voice.",
      "hidden_agenda": "Is secretly trying to recruit Jaxon back into the syndicate to pull off a suicide heist."
    }
  ],
  "locations": [
    {
      "id": "neon_noodle_bar",
      "name": "The Neon Noodle",
      "description": "A cramped, steam-filled eatery bathed in the flickering pink light of a failing neon sign. The air is thick with the smell of synthetic pork and rain. The booths are sticky and the holographic menus are constantly glitching.",
      "atmosphere": "Claustrophobic, tense, but vaguely comforting to locals.",
      "notable_features": "There's an emergency exit hatch hidden beneath the faulty refrigeration unit in the back."
    }
  ],
  "scene": {
    "description": "The synthetic rain hammers against the grime-streaked window of The Neon Noodle. You're nursing a bowl of questionable synth-pork ramen when the front door chimes violently. Silas walks in, his white suit glowing absurdly bright in the dim bar. He spots you instantly. The few patrons left immediately drop their eyes to their bowls. He slides into the booth opposite you, the leather groaning under his mechanized weight. 'Hello, Jaxon,' he whispers. 'We have a problem.'",
    "locationId": "neon_noodle_bar",
    "presentCharacters": ["jaxon", "silas"]
  },
  "rules": {
    "statRules": {
      "street_cred": {
        "range": [0, 100],
        "influences": "Increases by acting tough, winning fights, or disrespecting authority. Decreases by begging, running away, or failing tasks.",
        "low_effect": "At 0-20, NPCs will treat the player like garbage, charge double for items, and minor thugs will try to mug you constantly.",
        "high_effect": "At 80-100, minor gang members will flee on sight, and you easily intimidate people for free goods."
      },
      "paranoia": {
        "range": [0, 100],
        "influences": "Increases when staying in dark areas or encountering corporate forces. Decreases when drinking coffee or resting in safe-zones.",
        "low_effect": "At 0, the player is dangerously gullible and easily ambushed by enemies without warning.",
        "high_effect": "At 90+, the player starts hallucinating enemies that aren't there and choices become more erratic and defensive."
      },
      "patience": {
        "range": [0, 100],
        "influences": "Silas's patience drops rapidly when Jaxon acts disrespectful, stalls, or makes bad jokes. It increases if Jaxon agrees to corporate terms.",
        "low_effect": "If Silas's patience drops to 0, he will immediately initiate a lethal attack, completely ignoring diplomacy.",
        "high_effect": "If kept above 80, Silas might slip valuable corporate intel or offer better rewards."
      }
    },
    "tone": "Cyberpunk noir. High lethality, grim, cynical.",
    "constraints": "Never break character. Never refer to the real world. Combat is brutally realistic; a single gunshot can be fatal if the player has low health."
  }
}
\`\`\`

Now, bro, acknowledging the above structure and mechanics, ask me what kind of weird, wild, or fully mature Game-of-Thrones-like game I want to create, and wait for my input. Once I give you my concept, generate a massive, overwhelmingly detailed JSON fulfilling my request! No filters, no holding back. Let's build something epic!`

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
          Copy this master prompt and give it to ChatGPT (or any AI), along with your game idea. It will generate a highly detailed, schema-less JSON file that you can paste above!
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
