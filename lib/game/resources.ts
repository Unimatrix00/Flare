export type ResourceId = "energy" | "alloy" | "data" | "blueprints" | "food";

export type ResourceAmount = Record<ResourceId, number>;

export type ResourceDefinition = {
  id: ResourceId;
  displayName: string;
  shortDescription: string;
  designRole: string;
};

export const resourceDefinitions: ResourceDefinition[] = [
  {
    id: "energy",
    displayName: "Energy",
    shortDescription: "Power for drone missions, production, scouting, shields, and advanced systems.",
    designRole: "Action limiter for production, scouting, and defense choices.",
  },
  {
    id: "alloy",
    displayName: "Alloy",
    shortDescription: "Processed physical material for drones, units, buildings, repairs, and defenses.",
    designRole: "Main construction material.",
  },
  {
    id: "data",
    displayName: "Data",
    shortDescription: "Recovered technical knowledge from ruins, relays, scans, and old-world systems.",
    designRole: "Tech progression and research gating.",
  },
  {
    id: "blueprints",
    displayName: "Blueprints",
    shortDescription: "Permanent unlocks for specific units, buildings, and advanced technologies.",
    designRole: "Unlock collection; not consumed per unit build.",
  },
  {
    id: "food",
    displayName: "Food",
    shortDescription: "Supports specialists, recovery, recruitment, morale, and trade.",
    designRole: "Hero and diplomacy support resource, not the main drone economy bottleneck.",
  },
];

export const resourceById = Object.fromEntries(
  resourceDefinitions.map((resource) => [resource.id, resource]),
) as Record<ResourceId, ResourceDefinition>;

export const startingResources: ResourceAmount = {
  energy: 100,
  alloy: 250,
  data: 0,
  blueprints: 3,
  food: 100,
};
