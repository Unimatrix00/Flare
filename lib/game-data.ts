import { factionDefinitions, type FactionId } from "./game/factions";
import { resourceById, startingResources, type ResourceAmount, type ResourceId } from "./game/resources";
import { specialistDefinitions, type SpecialistId } from "./game/specialists";

export type ResourceKey = ResourceId;

export type ResourceMap = ResourceAmount;

export type { FactionId };
export type { SpecialistId };

export type Faction = {
  id: FactionId;
  name: string;
  shortName: string;
  origin: string;
  description: string;
  bonus: string;
  signal: string;
  story: string;
  gameplayIdentity: string[];
};

export type Specialist = {
  id: SpecialistId;
  name: string;
  role: string;
  bonus: string;
};

export type DroneAction = {
  id: string;
  label: string;
  description: string;
  effects: Partial<ResourceMap>;
};

export const factions: Faction[] = factionDefinitions.map((faction) => ({
  id: faction.id,
  name: faction.displayName,
  shortName: faction.shortName,
  origin: faction.origin,
  description: faction.shortDescription,
  bonus: faction.bonuses.map((bonus) => bonus.description).join(" / "),
  signal: faction.signal,
  story: faction.story,
  gameplayIdentity: faction.gameplayIdentity,
}));

export const specialists: Specialist[] = specialistDefinitions.map((specialist) => ({
  id: specialist.id,
  name: specialist.displayName,
  role: specialist.role,
  bonus: `${specialist.description} Correct building assignment: +${specialist.correctBuildingBonusPercent}% output.`,
}));

export { startingResources };

export const droneActions: DroneAction[] = [
  {
    id: "salvage",
    label: "Salvage wreckage",
    description: "Strip hull plates, cabling, and still-warm reactor shielding from the crash scar.",
    effects: {
      alloy: 18,
      energy: -4,
    },
  },
  {
    id: "scout",
    label: "Scout nearby area",
    description: "Send a scout drone over the red dust perimeter toward broken city lights.",
    effects: {
      energy: -6,
      data: 9,
    },
  },
  {
    id: "food",
    label: "Gather food",
    description: "Locate sealed rations, water bladders, and hardy greenhouse seed stock.",
    effects: {
      food: 14,
      energy: -3,
    },
  },
  {
    id: "data",
    label: "Recover old-world data",
    description: "Patch into buried fiber lines and recover fragments from a pre-collapse archive.",
    effects: {
      data: 12,
      energy: -5,
    },
  },
];

export const resourceLabels: Record<ResourceKey, string> = Object.fromEntries(
  Object.entries(resourceById).map(([id, resource]) => [id, resource.displayName]),
) as Record<ResourceKey, string>;
