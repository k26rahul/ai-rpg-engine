/**
 * configParser.js
 *
 * Extracts the minimum required fields from the user's schema-less JSON.
 * Everything else is preserved as-is for the AI context.
 */

/**
 * @param {string} rawJson — The raw JSON string pasted by the user
 * @returns {object} — Structured config object
 * @throws {Error} — If required fields are missing or JSON is invalid
 */
export function parseConfig(rawJson) {
  let parsed

  // 1. Parse JSON
  try {
    parsed = JSON.parse(rawJson)
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`)
  }

  // 2. Validate required top-level fields
  if (!parsed.characters || !Array.isArray(parsed.characters) || parsed.characters.length === 0) {
    throw new Error('Missing or empty "characters" array in game config.')
  }

  if (!parsed.locations || !Array.isArray(parsed.locations) || parsed.locations.length === 0) {
    throw new Error('Missing or empty "locations" array in game config.')
  }

  if (!parsed.scene || typeof parsed.scene !== 'object') {
    throw new Error('Missing "scene" object in game config.')
  }

  // 3. Validate characters have required fields
  for (const char of parsed.characters) {
    if (!char.id) throw new Error(`Character missing "id" field: ${JSON.stringify(char)}`)
    if (!char.name) throw new Error(`Character "${char.id}" missing "name" field.`)
  }

  // 4. Find the player character
  const playerCharacter = parsed.characters.find(c => c.isPlayer === true)
  if (!playerCharacter) {
    throw new Error('No character with "isPlayer": true found. Exactly one character must be the player.')
  }

  const multiplePlayerChars = parsed.characters.filter(c => c.isPlayer === true)
  if (multiplePlayerChars.length > 1) {
    throw new Error('Multiple characters have "isPlayer": true. Only one character can be the player.')
  }

  // 5. Validate scene
  if (!parsed.scene.description) {
    throw new Error('Scene missing "description" field.')
  }
  if (!parsed.scene.locationId) {
    throw new Error('Scene missing "locationId" field.')
  }
  if (!parsed.scene.presentCharacters || !Array.isArray(parsed.scene.presentCharacters)) {
    throw new Error('Scene missing "presentCharacters" array.')
  }

  // 6. Validate locations have required fields
  for (const loc of parsed.locations) {
    if (!loc.id) throw new Error(`Location missing "id" field: ${JSON.stringify(loc)}`)
    if (!loc.name) throw new Error(`Location "${loc.id}" missing "name" field.`)
  }

  // 7. Validate scene references exist
  const locationIds = parsed.locations.map(l => l.id)
  if (!locationIds.includes(parsed.scene.locationId)) {
    throw new Error(`Scene references unknown location: "${parsed.scene.locationId}"`)
  }

  const characterIds = parsed.characters.map(c => c.id)
  for (const charId of parsed.scene.presentCharacters) {
    if (!characterIds.includes(charId)) {
      throw new Error(`Scene references unknown character: "${charId}"`)
    }
  }

  // 8. Build the structured config
  return {
    title: parsed.title || 'Untitled RPG',
    characters: parsed.characters,
    locations: parsed.locations,
    scene: parsed.scene,
    rules: parsed.rules || {},
    playerCharacterId: playerCharacter.id,
    // Keep the full raw object for AI context — it may contain extra fields
    fullConfig: parsed,
  }
}
