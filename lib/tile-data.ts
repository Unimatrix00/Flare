export type RiskLevel = "low" | "medium" | "high" | "extreme";

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
  mainResources: string[];
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
    shortDescription: "Starting base, drone bay, and first shelter.",
    purpose: "Starter base",
    mainResources: ["Shelter", "Drone bay", "Command core"],
    riskLevel: "low",
    movementCost: 1,
    canBuildBase: true,
    canExplore: false,
    storyHook: "The first sealed habitat rises from the wreckage of the return craft.",
  },
  {
    id: "ocean",
    displayName: "Dead Ocean",
    shortDescription: "Storm-choked ocean barrier that blocks normal movement.",
    purpose: "Boundary",
    mainResources: [],
    riskLevel: "extreme",
    movementCost: 99,
    canBuildBase: false,
    canExplore: false,
    storyHook: "Black water and orbital tides keep ground forces pinned to the continent.",
  },
  {
    id: "coast",
    displayName: "Salvage Coast",
    shortDescription: "Washed-up wreckage, food caches, and landing corridors.",
    purpose: "Food and scrap",
    mainResources: ["Food", "Wreckage"],
    riskLevel: "low",
    movementCost: 1,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Return pods break apart along the shore, leaving supplies in the surf line.",
  },
  {
    id: "wasteland",
    displayName: "Broken Wasteland",
    shortDescription: "Balanced starter terrain with open routes and scattered salvage.",
    purpose: "Balanced",
    mainResources: ["Wreckage", "Food"],
    riskLevel: "low",
    movementCost: 1,
    canBuildBase: true,
    canExplore: true,
    storyHook: "The old roads are gone, but the dust flats still carry convoy tracks.",
  },
  {
    id: "mutated_desert",
    displayName: "Mutated Desert",
    shortDescription: "Radiation-scarred desert with rare minerals and harsh exposure.",
    purpose: "Rare minerals",
    mainResources: ["Minerals", "Wreckage"],
    riskLevel: "high",
    movementCost: 2,
    canBuildBase: true,
    canExplore: true,
    storyHook: "The red center glows at night where pre-collapse extraction sites burned open.",
  },
  {
    id: "ash_forest",
    displayName: "Ash Forest",
    shortDescription: "Burned and regrown forest offering biomass, cover, and ambush risk.",
    purpose: "Biomass cover",
    mainResources: ["Biomass", "Food"],
    riskLevel: "medium",
    movementCost: 2,
    canBuildBase: true,
    canExplore: true,
    storyHook: "New growth climbs through the charcoal skeletons of old firestorms.",
  },
  {
    id: "mountains",
    displayName: "Iron Ridges",
    shortDescription: "Ore-rich ridges with strong defensive value and slow routes.",
    purpose: "Ore ridges",
    mainResources: ["Ore", "Stone"],
    riskLevel: "medium",
    movementCost: 3,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Hard rock still shields buried industrial lines from the worst of Earthfall.",
  },
  {
    id: "caves",
    displayName: "Subsurface Caverns",
    shortDescription: "Underground pockets with hidden salvage and unstable passages.",
    purpose: "Hidden salvage",
    mainResources: ["Wreckage", "Minerals"],
    riskLevel: "high",
    movementCost: 3,
    canBuildBase: true,
    canExplore: true,
    storyHook: "Drone scans find sealed service tunnels beneath collapsed mining towns.",
  },
  {
    id: "ruins",
    displayName: "Old-World Ruins",
    shortDescription: "Collapsed cities with data vaults, lore, and recoverable systems.",
    purpose: "Data vaults",
    mainResources: ["Data", "Wreckage"],
    riskLevel: "medium",
    movementCost: 2,
    canBuildBase: true,
    canExplore: true,
    storyHook: "The silent city grids still answer to fragments of forgotten credentials.",
  },
  {
    id: "crater",
    displayName: "Orbital Impact Crater",
    shortDescription: "Impact scar with orbital debris and dangerous anomalies.",
    purpose: "Orbital debris",
    mainResources: ["Rare tech", "Data"],
    riskLevel: "extreme",
    movementCost: 4,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Something fell from orbit here, leaving forbidden pre-collapse systems exposed.",
  },
  {
    id: "broken_satellite_relay",
    displayName: "Broken Satellite Relay",
    shortDescription: "Damaged relay for scouting, map vision, data, and faction messages.",
    purpose: "Map vision",
    mainResources: ["Data", "Signal"],
    riskLevel: "medium",
    movementCost: 2,
    canBuildBase: false,
    canExplore: true,
    storyHook: "The relay still catches broken orbital traffic when the dust clears.",
  },
  {
    id: "flare_gate_site",
    displayName: "FLARE Gate Site",
    shortDescription: "Late-game server objective and seasonal war structure.",
    purpose: "Server objective",
    mainResources: ["Server progress", "Alliance score"],
    riskLevel: "extreme",
    movementCost: 5,
    canBuildBase: false,
    canExplore: true,
    storyHook: "Every faction wants the central gate online before rival servers breach through.",
  },
];

export const tileById: Record<TileId, TileDefinition> = Object.fromEntries(
  tileDefinitions.map((tile) => [tile.id, tile]),
) as Record<TileId, TileDefinition>;
