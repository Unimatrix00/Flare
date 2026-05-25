export type BaseSectionId =
  | "material-fabricator"
  | "research-lab"
  | "biofuel-generator"
  | "drone-bay"
  | "defense-walls"
  | "workshop";

export type BaseSection = {
  id: BaseSectionId;
  name: string;
  role: string;
  description: string;
  buildHours: number;
};

export type ConstructionTask = {
  startedAt: number;
  durationMs: number;
};

export type ConstructionState = Partial<Record<BaseSectionId, ConstructionTask>>;

export const TRAVEL_MINUTES_PER_HEX = 30;

export const baseSections: BaseSection[] = [
  {
    id: "material-fabricator",
    name: "Material Fabricator",
    role: "Industry",
    description: "Turns salvage and raw ore into alloy plates, conduits, and expansion frames.",
    buildHours: 1,
  },
  {
    id: "research-lab",
    name: "Research Lab",
    role: "Science",
    description: "Analyzes FLARE anomalies, old-world data, and specialist upgrades.",
    buildHours: 3,
  },
  {
    id: "biofuel-generator",
    name: "Biofuel Generator",
    role: "Energy",
    description: "Converts biomass and waste into reliable starter power for the core hex.",
    buildHours: 2,
  },
  {
    id: "drone-bay",
    name: "Drone Bay",
    role: "Logistics",
    description: "Repairs scout drones and unlocks longer map movement queues.",
    buildHours: 1.5,
  },
  {
    id: "defense-walls",
    name: "Defense Walls",
    role: "Security",
    description: "Raises the first ring of barriers around the crash core.",
    buildHours: 3,
  },
  {
    id: "workshop",
    name: "Workshop",
    role: "Crafting",
    description: "Builds tools, replacement parts, and early construction modules.",
    buildHours: 1,
  },
];

export function formatDuration(durationMs: number) {
  const totalMinutes = Math.ceil(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
