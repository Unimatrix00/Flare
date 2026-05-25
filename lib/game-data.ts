export type ResourceKey = "wreckage" | "energy" | "food" | "data";

export type ResourceMap = Record<ResourceKey, number>;

export type FactionId = "moon-faction" | "earth-survivors" | "rebel-fleet";

export type Faction = {
  id: FactionId;
  name: string;
  description: string;
  bonus: string;
  signal: string;
};

export type SpecialistId =
  | "scientist"
  | "engineer"
  | "pilot"
  | "soldier"
  | "medic"
  | "scavenger";

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
      "Orbital returnees with precision systems, cold discipline, and fragments of pre-fall command doctrine.",
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
    bonus: "+10 starting Wreckage from extra salvage pods.",
    signal: "FREE WAKE",
  },
];

export const specialists: Specialist[] = [
  {
    id: "scientist",
    name: "Scientist",
    role: "Analysis",
    bonus: "+2 Data from research and relay recovery.",
  },
  {
    id: "engineer",
    name: "Engineer",
    role: "Construction",
    bonus: "Starter base upgrades cost 5 less Wreckage.",
  },
  {
    id: "pilot",
    name: "Pilot",
    role: "Drone Ops",
    bonus: "Drone actions cost 1 less Energy.",
  },
  {
    id: "soldier",
    name: "Soldier",
    role: "Security",
    bonus: "Exploration raises base security.",
  },
  {
    id: "medic",
    name: "Medic",
    role: "Recovery",
    bonus: "+2 Food when gathering supplies.",
  },
  {
    id: "scavenger",
    name: "Scavenger",
    role: "Salvage",
    bonus: "+3 Wreckage from salvage runs.",
  },
];

export const startingResources: ResourceMap = {
  wreckage: 24,
  energy: 30,
  food: 20,
  data: 4,
};

export const droneActions: DroneAction[] = [
  {
    id: "salvage",
    label: "Salvage wreckage",
    description: "Strip hull plates, cabling, and still-warm reactor shielding from the crash scar.",
    effects: {
      wreckage: 18,
      energy: -4,
    },
  },
  {
    id: "scout",
    label: "Scout nearby area",
    description: "Send a low-flight drone over the red dust perimeter toward broken city lights.",
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

export const resourceLabels: Record<ResourceKey, string> = {
  wreckage: "Wreckage",
  energy: "Energy",
  food: "Food",
  data: "Data",
};
