import type { BuildingId } from "./buildings";

export type SpecialistId =
  | "engineer"
  | "researcher"
  | "pilot"
  | "commander"
  | "medic"
  | "scavenger";

export type SpecialistProgression = "base" | "upgraded" | "elite";

export type SpecialistDefinition = {
  id: SpecialistId;
  displayName: string;
  role: string;
  description: string;
  bestBuildingIds: BuildingId[];
  generalBonusPercent: number;
  correctBuildingBonusPercent: number;
  upgradedCorrectBuildingBonusPercent: number;
  eliteCorrectBuildingBonusPercent: number;
};

export const specialistDefinitions: SpecialistDefinition[] = [
  {
    id: "engineer",
    displayName: "Engineer",
    role: "Building / Repairs / Alloy",
    description: "Improves construction speed, repairs, and alloy production.",
    bestBuildingIds: ["foundry", "drone_yard", "command_core"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
  {
    id: "researcher",
    displayName: "Researcher",
    role: "Data / Research / Tech",
    description: "Improves data recovery, research, and old-world system decoding.",
    bestBuildingIds: ["research_lab"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
  {
    id: "pilot",
    displayName: "Pilot",
    role: "Drones / Scouting / Speed",
    description: "Improves drone production, scouting efficiency, and mission speed.",
    bestBuildingIds: ["drone_yard"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
  {
    id: "commander",
    displayName: "Commander",
    role: "Combat / Defense / Raids",
    description: "Improves combat drones, defense preparation, and command coordination.",
    bestBuildingIds: ["defense_hub", "drone_yard", "command_core"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
  {
    id: "medic",
    displayName: "Medic",
    role: "Recovery / Food / Heroes",
    description: "Improves specialist recovery, advancement, food efficiency, and morale.",
    bestBuildingIds: ["hero_quarters", "hydroponics"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
  {
    id: "scavenger",
    displayName: "Scavenger",
    role: "Salvage / Alloy / Blueprints",
    description: "Improves salvage yield, alloy recovery, and blueprint discovery.",
    bestBuildingIds: ["foundry", "salvage_yard"],
    generalBonusPercent: 20,
    correctBuildingBonusPercent: 50,
    upgradedCorrectBuildingBonusPercent: 75,
    eliteCorrectBuildingBonusPercent: 100,
  },
];

export const specialistById = Object.fromEntries(
  specialistDefinitions.map((specialist) => [specialist.id, specialist]),
) as Record<SpecialistId, SpecialistDefinition>;
