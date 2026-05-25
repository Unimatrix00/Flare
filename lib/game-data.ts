import { resourceById, startingResources, type ResourceAmount, type ResourceId } from "./game/resources";
import { specialistDefinitions, type SpecialistId } from "./game/specialists";

export type ResourceKey = ResourceId;

export type ResourceMap = ResourceAmount;

export type { SpecialistId };

export type FactionId = "moon-faction" | "earth-survivors" | "rebel-fleet";

export type Faction = {
  id: FactionId;
  name: string;
  description: string;
  bonus: string;
  signal: string;
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

export const factions: Faction[] = [
  {
    id: "moon-faction",
    name: "Moon Faction",
    description:
      "Orbital returnees with precision systems, cold discipline, and fragments of pre-fall protocols.",
    bonus: "+10 starting Energy from surviving lunar cells.",
    signal: "LUNAR COMMAND",
  },
  {
    id: "earth-survivors",
    name: "Earth Survivors",
    description:
      "Ground-born communities hardened by dust storms, scavenger wars, and the long silence after Earthfall.",
    bonus: "+10 starting Food from local survival caches.",
    signal: "OUTBACK GRID",
  },
  {
    id: "rebel-fleet",
    name: "Rebel Fleet",
    description:
      "A fractured armada of defectors and smugglers who trust speed, improvisation, and black-box tech.",
    bonus: "+10 starting Alloy from extra salvage pods.",
    signal: "FREE WAKE",
  },
];

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
