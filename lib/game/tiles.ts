import type { ResourceId } from "./resources";

export type RiskLevel = "low" | "medium" | "high" | "very_high" | "barrier";

export type TileDefinition = {
  id:
    | "crash_site"
    | "ocean"
    | "coast"
    | "wasteland"
    | "mutated_desert"
    | "ash_forest"
    | "mountains"
    | "caves"
    | "ruins"
    | "crater"
    | "broken_satellite_relay"
    | "flare_gate_site";
  displayName: string;
  shortDescription: string;
  purpose: string;
  mainResources: ResourceId[];
  riskLevel: RiskLevel;
  movementCost: number;
  canBuildBase: boolean;
  canExplore: boolean;
  storyHook: string;
};

export type TileId = TileDefinition["id"];

export const tileDefinitions: TileDefinition[] = [
  {
    id: "crash_site",
    displayName: "Crash Site",
    shortDescription: "Starting base, drone bay, first shelter, and initial salvage.",
    purpose: "Starting base and first shelter.",
    mainResources: ["alloy", "energy", "blueprints"],
    riskLevel: "low",
    movementCost: 1,
    canBuildBase: true,
    canExplore: true,
    storyHook: "The first sealed shelter rises around the return craft wreckage.",
  },
  {
    id: "ocean",
    displayName: "Dead Ocean",
    shortDescription: "Storms, flooded ruins, and water too dangerous for normal movement.",
    purpose: "Natural barrier and future travel route.",
    mainResources: [],
    riskLevel: "barrier",
    movementCost: 99,
    canBuildBase: false,
    canExplore: false,
    storyHook: "Black water and orbital tides pin ground colonies to the continent.",
  },
  {
    id: "coast",
    displayName: "Salvage Coast",
    shortDescription: "Food, washed-up wreckage, old ports, and crashed orbital debris.",
    purpose: "Starter shore resources and landing corridors.",
    mainResources: ["food", "alloy"],
    riskLevel: "medium",
    movementCost: 1,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Return pods and old port ruins scatter usable supplies across the surf line.",
  },
  {
    id: "wasteland",
    displayName: "Broken Wasteland",
    shortDescription: "Balanced starter terrain with basic resources and early expansion routes.",
    purpose: "Balanced expansion terrain.",
    mainResources: ["alloy", "energy", "data"],
    riskLevel: "low",
    movementCost: 1,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Old roads are gone, but drone tracks still cross the dust flats.",
  },
  {
    id: "mutated_desert",
    displayName: "Mutated Desert",
    shortDescription: "Dangerous desert with rare minerals, radiation, and heat storms.",
    purpose: "High-risk energy and rare material zone.",
    mainResources: ["energy", "alloy"],
    riskLevel: "high",
    movementCost: 2,
    canBuildBase: true,
    canExplore: true,
    storyHook: "The red center still glows where pre-collapse extractors burned open.",
  },
  {
    id: "ash_forest",
    displayName: "Ash Forest",
    shortDescription: "Burned and regrown forest with biomass, cover, and ambush terrain.",
    purpose: "Food and biomass support.",
    mainResources: ["food"],
    riskLevel: "medium",
    movementCost: 2,
    canBuildBase: true,
    canExplore: true,
    storyHook: "New growth climbs through charcoal skeletons left by old firestorms.",
  },
  {
    id: "mountains",
    displayName: "Iron Ridges",
    shortDescription: "Ore, defense, high ground, and slow movement.",
    purpose: "Alloy source and defensive terrain.",
    mainResources: ["alloy"],
    riskLevel: "medium",
    movementCost: 3,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Hard ridges protect buried industrial lines from the worst of Earthfall.",
  },
  {
    id: "caves",
    displayName: "Subsurface Caverns",
    shortDescription: "Hidden salvage, underground caches, and old military tunnels.",
    purpose: "Exploration site for alloy and hidden blueprints.",
    mainResources: ["alloy", "blueprints"],
    riskLevel: "high",
    movementCost: 3,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Drone scans find sealed service tunnels beneath collapsed military roads.",
  },
  {
    id: "ruins",
    displayName: "Old-World Ruins",
    shortDescription: "Collapsed cities, research labs, abandoned infrastructure, and lore.",
    purpose: "Data and blueprint exploration site.",
    mainResources: ["data", "blueprints"],
    riskLevel: "high",
    movementCost: 2,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Silent city grids still answer to fragments of forgotten credentials.",
  },
  {
    id: "crater",
    displayName: "Orbital Impact Crater",
    shortDescription: "Orbital debris, forbidden pre-collapse technology, and dangerous anomalies.",
    purpose: "High-risk rare tech exploration site.",
    mainResources: ["data", "energy"],
    riskLevel: "very_high",
    movementCost: 4,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Something fell from orbit here, exposing forbidden pre-collapse systems.",
  },
  {
    id: "broken_satellite_relay",
    displayName: "Broken Satellite Relay",
    shortDescription: "Data, map vision, scouting, faction messages, and early story objectives.",
    purpose: "Map vision and data objective.",
    mainResources: ["data"],
    riskLevel: "medium",
    movementCost: 2,
    canBuildBase: false,
    canExplore: true,
    storyHook: "The relay still catches broken orbital traffic when the dust clears.",
  },
  {
    id: "flare_gate_site",
    displayName: "FLARE Gate Site",
    shortDescription: "Late-game seasonal objective for faction conflict and gate construction.",
    purpose: "Rare late-game server objective.",
    mainResources: ["blueprints", "data"],
    riskLevel: "very_high",
    movementCost: 5,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Every faction wants the central gate online before rival worlds breach through.",
  },
];

export const tileById = Object.fromEntries(
  tileDefinitions.map((tile) => [tile.id, tile]),
) as Record<TileId, TileDefinition>;
