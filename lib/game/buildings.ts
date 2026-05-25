import type { ResourceAmount, ResourceId } from "./resources";
import type { SpecialistId } from "./specialists";

export type BuildingId =
  | "command_core"
  | "foundry"
  | "power_core"
  | "research_lab"
  | "drone_yard"
  | "hydroponics"
  | "hero_quarters"
  | "defense_hub"
  | "salvage_yard";

export type BuildingDefinition = {
  id: BuildingId;
  displayName: string;
  purpose: string;
  baseOutputPerHour?: Partial<Record<ResourceId, number>>;
  heroSlots: number;
  preferredSpecialistIds: SpecialistId[];
  unlocksAtBaseLevel: number;
};

export type BuildingLevelRule = {
  level: 1 | 2 | 3;
  droneSlots: number;
  upgradeCost: Partial<ResourceAmount>;
  buildTimeHours: number;
};

export const WORKER_DRONE_OUTPUT_BONUS_PERCENT = 5;

export const buildingLevelRules: BuildingLevelRule[] = [
  {
    level: 1,
    droneSlots: 3,
    upgradeCost: {},
    buildTimeHours: 0,
  },
  {
    level: 2,
    droneSlots: 6,
    upgradeCost: { alloy: 300, energy: 80, data: 50 },
    buildTimeHours: 3,
  },
  {
    level: 3,
    droneSlots: 10,
    upgradeCost: { alloy: 800, energy: 200, data: 250 },
    buildTimeHours: 8,
  },
];

export const buildingDefinitions: BuildingDefinition[] = [
  {
    id: "command_core",
    displayName: "Command Core",
    purpose: "Base level, storage, colony control, and expansion unlocks.",
    heroSlots: 1,
    preferredSpecialistIds: ["engineer", "commander"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "foundry",
    displayName: "Foundry",
    purpose: "Alloy production, material processing, and repairs.",
    baseOutputPerHour: { alloy: 100 },
    heroSlots: 1,
    preferredSpecialistIds: ["engineer", "scavenger"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "power_core",
    displayName: "Power Core",
    purpose: "Energy generation, energy storage, and future shields.",
    baseOutputPerHour: { energy: 100 },
    heroSlots: 1,
    preferredSpecialistIds: ["engineer"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "research_lab",
    displayName: "Research Lab",
    purpose: "Data production, research, and tech tier unlocks.",
    baseOutputPerHour: { data: 100 },
    heroSlots: 1,
    preferredSpecialistIds: ["researcher"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "drone_yard",
    displayName: "Drone Yard",
    purpose: "Builds drones, unlocks higher-tier drones, and controls drone production.",
    heroSlots: 1,
    preferredSpecialistIds: ["pilot", "engineer", "commander"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "hydroponics",
    displayName: "Hydroponics / Life Support",
    purpose: "Food production, hero support, colony stability, and trade stock.",
    baseOutputPerHour: { food: 100 },
    heroSlots: 1,
    preferredSpecialistIds: ["medic"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "hero_quarters",
    displayName: "Hero Quarters",
    purpose: "Specialist assignment, training, recovery, and advancement.",
    heroSlots: 1,
    preferredSpecialistIds: ["medic", "commander"],
    unlocksAtBaseLevel: 1,
  },
  {
    id: "defense_hub",
    displayName: "Defense Hub",
    purpose: "Defense systems, shield coordination, and raid preparation.",
    heroSlots: 1,
    preferredSpecialistIds: ["commander"],
    unlocksAtBaseLevel: 2,
  },
  {
    id: "salvage_yard",
    displayName: "Salvage Yard",
    purpose: "Processes field salvage and improves blueprint discovery from wreckage.",
    baseOutputPerHour: { alloy: 75 },
    heroSlots: 1,
    preferredSpecialistIds: ["scavenger"],
    unlocksAtBaseLevel: 2,
  },
];

export const buildingById = Object.fromEntries(
  buildingDefinitions.map((building) => [building.id, building]),
) as Record<BuildingId, BuildingDefinition>;

export const buildingLevelRuleByLevel = Object.fromEntries(
  buildingLevelRules.map((rule) => [rule.level, rule]),
) as Record<BuildingLevelRule["level"], BuildingLevelRule>;
