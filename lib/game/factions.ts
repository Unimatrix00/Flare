export type FactionId = "selene_directorate" | "ares_compact" | "free_orbit_coalition";

export type FactionBonus = {
  id: string;
  description: string;
  percent: number;
};

export type FactionDefinition = {
  id: FactionId;
  displayName: string;
  shortName: string;
  origin: "Moon" | "Mars" | "Scattered space stations";
  theme: string;
  story: string;
  gameplayIdentity: string[];
  bonuses: FactionBonus[];
  shortDescription: string;
  signal: string;
};

export const factionDefinitions: FactionDefinition[] = [
  {
    id: "selene_directorate",
    displayName: "Selene Directorate",
    shortName: "Selene",
    origin: "Moon",
    theme: "Cold, organized, efficient, high-tech, controlled.",
    story:
      "The Selene Directorate rose from the surviving lunar cities after Earth went dark. Built on rationing, automation, strict command, and advanced systems, Selene believes Earth can only be rebuilt through order. Their commanders return to Earth with superior scanning systems, disciplined logistics, and a cold belief that chaos must never be allowed to rule humanity again.",
    gameplayIdentity: [
      "Energy efficiency",
      "Data research",
      "Stable production",
      "Strong specialist assignment",
    ],
    bonuses: [
      { id: "energy_generation", description: "+10% Energy generation", percent: 10 },
      { id: "data_production", description: "+10% Data production", percent: 10 },
      {
        id: "correct_specialist_output",
        description: "+10% building output when the correct specialist is assigned",
        percent: 10,
      },
    ],
    shortDescription:
      "The Selene Directorate values control, efficiency, and advanced systems. Best for players who want strong research, reliable energy, and stable colony growth.",
    signal: "SELENE COMMAND",
  },
  {
    id: "ares_compact",
    displayName: "Ares Compact",
    shortName: "Ares",
    origin: "Mars",
    theme: "Industrial, militarized, harsh, practical, expansion-focused.",
    story:
      "The Ares Compact was forged in the mines, factories, and military habitats of Mars. They survived through discipline, industry, and force. Ares commanders return to Earth not to gently rebuild it, but to secure territory, extract resources, and establish dominance before their rivals do.",
    gameplayIdentity: [
      "Alloy production",
      "Unit production",
      "Heavy drones",
      "Combat readiness",
    ],
    bonuses: [
      { id: "alloy_production", description: "+10% Alloy production", percent: 10 },
      {
        id: "combat_drone_speed",
        description: "+10% Combat Drone production speed",
        percent: 10,
      },
      {
        id: "heavy_drone_speed",
        description: "+10% Heavy Drone production speed",
        percent: 10,
      },
    ],
    shortDescription:
      "The Ares Compact values strength, industry, and expansion. Best for players who want powerful production, stronger combat drones, and aggressive colony growth.",
    signal: "ARES INDUSTRIAL",
  },
  {
    id: "free_orbit_coalition",
    displayName: "Free Orbit Coalition",
    shortName: "Free Orbit",
    origin: "Scattered space stations",
    theme: "Mobile, improvised, rebellious, scavenger-tech, adaptive.",
    story:
      "The Free Orbit Coalition formed from scattered stations, broken habitats, smuggler docks, abandoned fleet fragments, and refugees who rejected both Selene control and Ares militarism. Their technology is patched together, but their people are fast, clever, and difficult to predict. They return to Earth looking for freedom, forgotten tech, and a future that belongs to no empire.",
    gameplayIdentity: [
      "Scouting",
      "Salvage",
      "Blueprint discovery",
      "Fast drone missions",
      "Risk/reward exploration",
    ],
    bonuses: [
      {
        id: "scout_drone_speed",
        description: "+10% Scout Drone mission speed",
        percent: 10,
      },
      { id: "exploration_rewards", description: "+10% exploration rewards", percent: 10 },
      {
        id: "blueprint_discovery",
        description: "+10% chance to discover Blueprints from ruins, caves, and orbital craters",
        percent: 10,
      },
    ],
    shortDescription:
      "The Free Orbit Coalition values freedom, mobility, and scavenged technology. Best for players who want faster exploration, better blueprint discovery, and flexible play.",
    signal: "FREE ORBIT",
  },
];

export const factionById = Object.fromEntries(
  factionDefinitions.map((faction) => [faction.id, faction]),
) as Record<FactionId, FactionDefinition>;
