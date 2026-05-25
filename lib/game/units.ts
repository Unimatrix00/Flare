import type { BuildingId } from "./buildings";
import type { ResourceAmount } from "./resources";

export type UnitId =
  | "worker_drone"
  | "scout_drone"
  | "combat_drone"
  | "heavy_drone"
  | "flying_drone"
  | "artillery_drone";

export type UnitTier = 1 | 2 | 3;

export type BlueprintId =
  | "worker_drone"
  | "scout_drone"
  | "combat_drone"
  | "heavy_drone"
  | "flying_drone"
  | "artillery_drone"
  | "advanced_foundry";

export type ResearchId =
  | "tier_1_drone_systems"
  | "tier_2_combat_systems"
  | "tier_2_scouting_systems"
  | "tier_2_heavy_frames"
  | "tier_3_drone_warfare"
  | "tier_3_orbital_targeting";

export type UnitRequirement = {
  buildingId: BuildingId;
  buildingLevel: number;
  researchId: ResearchId;
  blueprintId: BlueprintId;
};

export type UnitDefinition = {
  id: UnitId;
  displayName: string;
  role: string;
  tier: UnitTier;
  description: string;
  requirements: UnitRequirement;
  alloyCost: number;
  energyCost: number;
  buildTimeMinutes: number;
};

export type ResearchDefinition = {
  id: ResearchId;
  displayName: string;
  tier: UnitTier;
  dataCost: number;
  prerequisiteResearchIds: ResearchId[];
};

export const researchDefinitions: ResearchDefinition[] = [
  {
    id: "tier_1_drone_systems",
    displayName: "Tier 1 Drone Systems",
    tier: 1,
    dataCost: 0,
    prerequisiteResearchIds: [],
  },
  {
    id: "tier_2_combat_systems",
    displayName: "Tier 2 Combat Systems",
    tier: 2,
    dataCost: 200,
    prerequisiteResearchIds: ["tier_1_drone_systems"],
  },
  {
    id: "tier_2_scouting_systems",
    displayName: "Tier 2 Scouting Systems",
    tier: 2,
    dataCost: 180,
    prerequisiteResearchIds: ["tier_1_drone_systems"],
  },
  {
    id: "tier_2_heavy_frames",
    displayName: "Tier 2 Heavy Frames",
    tier: 2,
    dataCost: 240,
    prerequisiteResearchIds: ["tier_1_drone_systems"],
  },
  {
    id: "tier_3_drone_warfare",
    displayName: "Tier 3 Drone Warfare",
    tier: 3,
    dataCost: 700,
    prerequisiteResearchIds: ["tier_2_combat_systems", "tier_2_heavy_frames"],
  },
  {
    id: "tier_3_orbital_targeting",
    displayName: "Tier 3 Orbital Targeting",
    tier: 3,
    dataCost: 900,
    prerequisiteResearchIds: ["tier_3_drone_warfare"],
  },
];

export const unitDefinitions: UnitDefinition[] = [
  {
    id: "worker_drone",
    displayName: "Worker Drone",
    role: "Building / Gathering / Repairs",
    tier: 1,
    description: "Automated workforce used for construction, gathering, repairs, and building assignment.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 1,
      researchId: "tier_1_drone_systems",
      blueprintId: "worker_drone",
    },
    alloyCost: 40,
    energyCost: 10,
    buildTimeMinutes: 15,
  },
  {
    id: "scout_drone",
    displayName: "Scout Drone",
    role: "Vision / Danger Detection / Discovery",
    tier: 1,
    description: "Reveals tiles, detects danger, and finds ruins, relays, data, and blueprints.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 1,
      researchId: "tier_1_drone_systems",
      blueprintId: "scout_drone",
    },
    alloyCost: 55,
    energyCost: 20,
    buildTimeMinutes: 20,
  },
  {
    id: "combat_drone",
    displayName: "Combat Drone",
    role: "Basic Combat / Defense",
    tier: 1,
    description: "Basic fighting unit for early defense and PvE combat.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 1,
      researchId: "tier_1_drone_systems",
      blueprintId: "combat_drone",
    },
    alloyCost: 75,
    energyCost: 25,
    buildTimeMinutes: 30,
  },
  {
    id: "heavy_drone",
    displayName: "Heavy Drone",
    role: "Tank / Defense Breaker",
    tier: 2,
    description: "Armored drone for stronger combat encounters and defensive line breaking.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 2,
      researchId: "tier_2_heavy_frames",
      blueprintId: "heavy_drone",
    },
    alloyCost: 180,
    energyCost: 60,
    buildTimeMinutes: 90,
  },
  {
    id: "flying_drone",
    displayName: "Flying Drone",
    role: "Fast Scouting / Terrain Bypass",
    tier: 2,
    description: "Fast exploration drone that ignores some terrain penalties.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 2,
      researchId: "tier_2_scouting_systems",
      blueprintId: "flying_drone",
    },
    alloyCost: 150,
    energyCost: 90,
    buildTimeMinutes: 75,
  },
  {
    id: "artillery_drone",
    displayName: "Artillery Drone",
    role: "Long-Range Siege / Late Pressure",
    tier: 3,
    description: "Long-range siege drone for late-game landmark conflict and pressure.",
    requirements: {
      buildingId: "drone_yard",
      buildingLevel: 3,
      researchId: "tier_3_orbital_targeting",
      blueprintId: "artillery_drone",
    },
    alloyCost: 500,
    energyCost: 240,
    buildTimeMinutes: 240,
  },
];

export function canProduceUnit({
  buildingLevels,
  resources,
  unlockedBlueprintIds,
  completedResearchIds,
  unit,
}: {
  buildingLevels: Partial<Record<BuildingId, number>>;
  resources: Partial<ResourceAmount>;
  unlockedBlueprintIds: BlueprintId[];
  completedResearchIds: ResearchId[];
  unit: UnitDefinition;
}) {
  return (
    (buildingLevels[unit.requirements.buildingId] ?? 0) >= unit.requirements.buildingLevel &&
    completedResearchIds.includes(unit.requirements.researchId) &&
    unlockedBlueprintIds.includes(unit.requirements.blueprintId) &&
    (resources.alloy ?? 0) >= unit.alloyCost &&
    (resources.energy ?? 0) >= unit.energyCost
  );
}
