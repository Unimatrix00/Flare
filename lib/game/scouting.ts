import { areCoordsAdjacent, createHexKey, getAdjacentCoords, getHexDistance, getHexesInRange, type HexCoord } from "./hex";
import { tileById, type RiskLevel, type TileId } from "./tiles";
import type { ResourceId } from "./resources";

export type ScoutStatus = "idle" | "moving";

export type ScoutUnit = {
  id: "scout_001";
  type: "scout_drone";
  displayName: "Scout Drone I";
  tier: 1;
  position: HexCoord;
  status: ScoutStatus;
  destination: HexCoord | null;
  movementStartedAt: number | null;
  movementEndsAt: number | null;
};

export type ScoutMapTile = {
  id: string;
  q: number;
  r: number;
  tileType: TileId;
  displayName: string;
  riskLevel: RiskLevel;
  mainResources: ResourceId[];
  isRevealed: boolean;
  isExplored: boolean;
  hasBase: boolean;
  hasScout: boolean;
};

export type ScoutMapState = {
  scout: ScoutUnit;
  scoutLog: string[];
  tiles: ScoutMapTile[];
};

export const SCOUT_MOVE_DURATION_MS = 5000;

const relativeTileTypes: Record<string, TileId> = {
  "0,0": "crash_site",
  "1,0": "wasteland",
  "1,-1": "coast",
  "0,-1": "ruins",
  "-1,0": "ash_forest",
  "-1,1": "mutated_desert",
  "0,1": "caves",
  "2,0": "wasteland",
  "2,-1": "coast",
  "2,-2": "broken_satellite_relay",
  "1,-2": "crater",
  "0,-2": "ruins",
  "-1,-1": "mountains",
  "-2,0": "ash_forest",
  "-2,1": "mutated_desert",
  "-2,2": "caves",
  "-1,2": "broken_satellite_relay",
  "0,2": "wasteland",
  "1,1": "coast",
};

export function getTileAtCoord(tiles: ScoutMapTile[], q: number, r: number) {
  return tiles.find((tile) => tile.q === q && tile.r === r);
}

export function createInitialScoutMapState(crashSite: HexCoord): ScoutMapState {
  const tiles = getHexesInRange(crashSite, 2).map<ScoutMapTile>((coord) => {
    const relativeCoord = {
      q: coord.q - crashSite.q,
      r: coord.r - crashSite.r,
    };
    const tileType = relativeTileTypes[createHexKey(relativeCoord)] ?? "wasteland";
    const definition = tileById[tileType];
    const distanceFromCrashSite = getHexDistance(coord, crashSite);
    const isCrashSite = distanceFromCrashSite === 0;

    return {
      id: createHexKey(coord),
      q: coord.q,
      r: coord.r,
      tileType,
      displayName: definition.displayName,
      riskLevel: definition.riskLevel,
      mainResources: definition.mainResources,
      isRevealed: distanceFromCrashSite <= 1,
      isExplored: isCrashSite,
      hasBase: isCrashSite,
      hasScout: isCrashSite,
    };
  });

  return {
    scout: {
      id: "scout_001",
      type: "scout_drone",
      displayName: "Scout Drone I",
      tier: 1,
      position: crashSite,
      status: "idle",
      destination: null,
      movementStartedAt: null,
      movementEndsAt: null,
    },
    scoutLog: ["Scout Drone deployed."],
    tiles,
  };
}

export function canScoutMoveTo(tile: ScoutMapTile, scout: ScoutUnit) {
  return (
    scout.status === "idle" &&
    tile.isRevealed &&
    tileById[tile.tileType].canExplore &&
    areCoordsAdjacent(scout.position, tile)
  );
}

export function startScoutMove(state: ScoutMapState, destinationTileId: string, now = Date.now()): ScoutMapState {
  const destinationTile = state.tiles.find((tile) => tile.id === destinationTileId);

  if (!destinationTile || !canScoutMoveTo(destinationTile, state.scout)) {
    return state;
  }

  return {
    ...state,
    scout: {
      ...state.scout,
      status: "moving",
      destination: { q: destinationTile.q, r: destinationTile.r },
      movementStartedAt: now,
      movementEndsAt: now + SCOUT_MOVE_DURATION_MS,
    },
    scoutLog: [`Scout moving to ${destinationTile.displayName}.`, ...state.scoutLog].slice(0, 5),
  };
}

export function completeScoutMove(state: ScoutMapState, now = Date.now()): ScoutMapState {
  const { destination, movementEndsAt } = state.scout;

  if (state.scout.status !== "moving" || !destination || !movementEndsAt || now < movementEndsAt) {
    return state;
  }

  const destinationTile = getTileAtCoord(state.tiles, destination.q, destination.r);

  if (!destinationTile) {
    return {
      ...state,
      scout: {
        ...state.scout,
        status: "idle",
        destination: null,
        movementStartedAt: null,
        movementEndsAt: null,
      },
    };
  }

  const updatedTiles = revealAdjacentTiles(
    state.tiles.map((tile) => ({
      ...tile,
      hasScout: tile.id === destinationTile.id,
      isRevealed: tile.id === destinationTile.id ? true : tile.isRevealed,
      isExplored: tile.id === destinationTile.id ? true : tile.isExplored,
    })),
    destinationTile,
  );

  return {
    ...state,
    scout: {
      ...state.scout,
      position: destination,
      status: "idle",
      destination: null,
      movementStartedAt: null,
      movementEndsAt: null,
    },
    scoutLog: [getArrivalMessage(destinationTile), ...state.scoutLog].slice(0, 5),
    tiles: updatedTiles,
  };
}

export function revealAdjacentTiles(tiles: ScoutMapTile[], centerTile: HexCoord) {
  const adjacentKeys = new Set(getAdjacentCoords(centerTile).map(createHexKey));

  return tiles.map((tile) => ({
    ...tile,
    isRevealed: tile.isRevealed || adjacentKeys.has(tile.id),
  }));
}

function getArrivalMessage(tile: ScoutMapTile) {
  if (tile.tileType === "broken_satellite_relay") {
    return "Old-world signal detected.";
  }

  if (tile.tileType === "crater") {
    return "Orbital debris signature found.";
  }

  if (tile.riskLevel === "high" || tile.riskLevel === "very_high") {
    return "Unstable zone revealed.";
  }

  return "New terrain scanned.";
}
