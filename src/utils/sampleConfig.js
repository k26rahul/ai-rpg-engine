export const sampleConfig = {
  title: "The Locked Room",
  characters: [
    {
      id: "hero",
      name: "You",
      isPlayer: true,
      stats: { health: 100, trust: 50, courage: 60 },
      personality: "A resourceful stranger who woke up in this house with no memory of how they got here."
    },
    {
      id: "detective",
      name: "Inspector Mira",
      isPlayer: false,
      stats: { suspicion: 30, trust: 60 },
      personality: "Sharp, analytical, slow to trust but fiercely loyal once convinced.",
      backstory: "Grew up on the streets, worked her way through the academy. Has seen too much to be easily surprised.",
      decisionStyle: "Weighs evidence carefully. Trusts actions over words."
    }
  ],
  locations: [
    {
      id: "old_house",
      name: "The Old House on Maple Street",
      description: "A creaking Victorian house. Dust covers every surface. The windows are boarded up, and the only door is locked from the outside. A single oil lamp flickers on the table.",
      items: ["rusty key", "torn letter", "oil lamp", "dusty bookshelf"]
    }
  ],
  scene: {
    description: "A storm rages outside. You and Inspector Mira are trapped inside the old house. She paces nervously, glancing at the locked door. Lightning illuminates the room in brief flashes. You notice scratches on the floor near the bookshelf, as if something heavy was dragged recently.",
    locationId: "old_house",
    presentCharacters: ["hero", "detective"]
  },
  rules: {
    statRules: {
      trust: {
        range: [0, 100],
        effect: "When trust reaches 0, Inspector Mira turns hostile and refuses to cooperate. Above 80, she reveals a critical secret about the house."
      },
      suspicion: {
        range: [0, 100],
        effect: "When suspicion reaches 80+, Mira begins investigating YOU. At 100, she accuses you directly."
      },
      courage: {
        range: [0, 100],
        effect: "Below 20, certain bold options become unavailable. Above 80, you can attempt dangerous feats."
      }
    },
    tone: "Dark mystery with moments of dark humor",
    constraints: "Never break the fourth wall. Keep dialogue realistic and atmospheric. The house should feel alive and menacing."
  }
};
