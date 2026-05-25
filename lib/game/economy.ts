import { buildingById, buildingLevelRuleByLevel, WORKER_DRONE_OUTPUT_BONUS_PERCENT, type BuildingId } from "./buildings";
import type { ResourceId } from "./resources";
import { specialistById, type SpecialistId, type SpecialistProgression } from "./specialists";

export type BuildingOutputInput = {
  buildingId: BuildingId;
  buildingLevel: 1 | 2 | 3;
  baseOutputPerHour: Partial<Record<ResourceId, number>>;
  assignedWorkerDrones: number;
  assignedSpecialistId?: SpecialistId;
  specialistProgression?: SpecialistProgression;
  researchBonusPercent?: number;
};

export const heroAssignmentBonusRules = {
  none: 0,
  general: 20,
  correct: 50,
  upgradedCorrect: 75,
  eliteCorrect: 100,
};

export function getWorkerDroneCountForBaseLevel(baseLevel: number) {
  return 5 + Math.max(0, baseLevel - 1) * 2;
}

export function getDroneBonusPercent(assignedWorkerDrones: number, buildingLevel: 1 | 2 | 3) {
  const maxSlots = buildingLevelRuleByLevel[buildingLevel].droneSlots;
  const safeDroneCount = Math.max(0, Math.min(assignedWorkerDrones, maxSlots));

  return safeDroneCount * WORKER_DRONE_OUTPUT_BONUS_PERCENT;
}

export function getHeroBonusPercent({
  buildingId,
  specialistId,
  progression = "base",
}: {
  buildingId: BuildingId;
  specialistId?: SpecialistId;
  progression?: SpecialistProgression;
}) {
  if (!specialistId) {
    return heroAssignmentBonusRules.none;
  }

  const specialist = specialistById[specialistId];
  const isCorrectSpecialist = specialist.bestBuildingIds.includes(buildingId);

  if (!isCorrectSpecialist) {
    return specialist.generalBonusPercent;
  }

  if (progression === "elite") {
    return specialist.eliteCorrectBuildingBonusPercent;
  }

  if (progression === "upgraded") {
    return specialist.upgradedCorrectBuildingBonusPercent;
  }

  return specialist.correctBuildingBonusPercent;
}

export function calculateBuildingOutput(input: BuildingOutputInput) {
  const droneBonusPercent = getDroneBonusPercent(input.assignedWorkerDrones, input.buildingLevel);
  const heroBonusPercent = getHeroBonusPercent({
    buildingId: input.buildingId,
    specialistId: input.assignedSpecialistId,
    progression: input.specialistProgression,
  });
  const researchBonusPercent = input.researchBonusPercent ?? 0;
  const outputMultiplier =
    1 + (droneBonusPercent + heroBonusPercent + researchBonusPercent) / 100;

  return Object.fromEntries(
    Object.entries(input.baseOutputPerHour).map(([resourceId, baseOutput]) => [
      resourceId,
      Math.round((baseOutput ?? 0) * outputMultiplier),
    ]),
  ) as Partial<Record<ResourceId, number>>;
}

export function getDefaultBuildingOutput(buildingId: BuildingId) {
  return buildingById[buildingId].baseOutputPerHour ?? {};
}
