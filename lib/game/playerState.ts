import type { BuildingId } from "./buildings";
import { getWorkerDroneCountForBaseLevel } from "./economy";
import { startingResources } from "./resources";
import type { SpecialistId } from "./specialists";
import type { BlueprintId, ResearchId, UnitId } from "./units";

export type StartingPlayerEconomyState = {
  baseLevel: number;
  resources: typeof startingResources;
  unitCounts: Partial<Record<UnitId, number>>;
  selectedSpecialistIds: SpecialistId[];
  unlockedBlueprintIds: BlueprintId[];
  completedResearchIds: ResearchId[];
  buildingLevels: Partial<Record<BuildingId, number>>;
};

export const startingPlayerState: StartingPlayerEconomyState = {
  baseLevel: 1,
  resources: startingResources,
  unitCounts: {
    worker_drone: getWorkerDroneCountForBaseLevel(1),
    scout_drone: 0,
    combat_drone: 0,
  },
  selectedSpecialistIds: [],
  unlockedBlueprintIds: ["worker_drone", "scout_drone", "combat_drone"],
  completedResearchIds: ["tier_1_drone_systems"],
  buildingLevels: {
    command_core: 1,
    foundry: 1,
    power_core: 1,
    research_lab: 1,
    drone_yard: 1,
    hydroponics: 1,
    hero_quarters: 1,
  },
};
