export type HexCoord = {
  q: number;
  r: number;
};

export type TerrainType =
  | "ocean"
  | "coast"
  | "wasteland"
  | "mutated-desert"
  | "ash-forest"
  | "mountains"
  | "caves"
  | "ruins"
  | "crater"
  | "portal";

export type WorldHex = HexCoord & {
  key: string;
  terrain: TerrainType;
  isLand: boolean;
  isCoast: boolean;
  isValidStart: boolean;
  isPortal: boolean;
  resourceHint: string;
  danger: "low" | "medium" | "high" | "extreme";
};

export type WorldMap = {
  radius: number;
  hexes: WorldHex[];
  byKey: Map<string, WorldHex>;
  portalKey: string;
  landHexCount: number;
  oceanHexCount: number;
  validStartCount: number;
};

export const WORLD_RADIUS = 100;

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function createHexKey({ q, r }: HexCoord) {
  return `${q},${r}`;
}

export function getHexDistance(a: HexCoord, b: HexCoord = { q: 0, r: 0 }) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

export function getNeighborCoords(hex: HexCoord) {
  return HEX_DIRECTIONS.map((direction) => ({
    q: hex.q + direction.q,
    r: hex.r + direction.r,
  }));
}

export function getHexesInRange(center: HexCoord, radius: number) {
  const coords: HexCoord[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius);
    const maxR = Math.min(radius, -q + radius);

    for (let r = minR; r <= maxR; r += 1) {
      coords.push({ q: center.q + q, r: center.r + r });
    }
  }

  return coords;
}

export function generateWorldMap(radius = WORLD_RADIUS): WorldMap {
  const baseHexes: Array<HexCoord & { isLand: boolean }> = [];
  const landKeys = new Set<string>();
  const worldKeys = new Set<string>();

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius);
    const maxR = Math.min(radius, -q + radius);

    for (let r = minR; r <= maxR; r += 1) {
      const coord = { q, r };
      const isLand = isFutureAustraliaLand(coord, radius);
      const key = createHexKey(coord);
      baseHexes.push({ ...coord, isLand });
      worldKeys.add(key);

      if (isLand) {
        landKeys.add(key);
      }
    }
  }

  const coastKeys = new Set(
    baseHexes
      .filter(
        (hex) =>
          hex.isLand &&
          getNeighborCoords(hex).some((neighbor) => !landKeys.has(createHexKey(neighbor))),
      )
      .map(createHexKey),
  );
  const displayKeys = new Set(landKeys);

  coastKeys.forEach((key) => {
    const [q, r] = key.split(",").map(Number);

    getHexesInRange({ q, r }, 2).forEach((coord) => {
      const rimKey = createHexKey(coord);

      if (worldKeys.has(rimKey) && !landKeys.has(rimKey)) {
        displayKeys.add(rimKey);
      }
    });
  });

  const hexes = baseHexes.filter((hex) => displayKeys.has(createHexKey(hex))).map<WorldHex>((hex) => {
    const key = createHexKey(hex);
    const neighbors = getNeighborCoords(hex);
    const isCoast = coastKeys.has(key);
    const terrain = pickTerrain(hex, isCoast, radius);
    const finalTerrain = key === "0,0" ? "portal" : terrain;
    const distanceFromPortal = getHexDistance(hex);
    const isPortal = key === "0,0";
    const hasFullCityFootprint = neighbors.every((neighbor) => landKeys.has(createHexKey(neighbor)));
    const isNearShore = getHexesInRange(hex, 2).some((coord) => coastKeys.has(createHexKey(coord)));
    const isValidStart =
      hex.isLand &&
      !isCoast &&
      isNearShore &&
      hasFullCityFootprint &&
      distanceFromPortal > 58 &&
      terrain !== "mountains";

    return {
      ...hex,
      key,
      terrain: finalTerrain,
      isCoast,
      isValidStart,
      isPortal,
      resourceHint: getResourceHint(finalTerrain),
      danger: getDanger(distanceFromPortal, finalTerrain, isValidStart),
    };
  });

  return {
    radius,
    hexes,
    byKey: new Map(hexes.map((hex) => [hex.key, hex])),
    portalKey: "0,0",
    landHexCount: hexes.filter((hex) => hex.isLand).length,
    oceanHexCount: hexes.filter((hex) => !hex.isLand).length,
    validStartCount: hexes.filter((hex) => hex.isValidStart).length,
  };
}

function isFutureAustraliaLand(coord: HexCoord, radius: number) {
  const { x, y } = getNormalizedPoint(coord, radius);
  const roughness = valueNoise(coord.q, coord.r) * 0.06;
  const mainland =
    ((x + 0.04) / 0.75) ** 2 + ((y - 0.01) / 0.58) ** 2 < 1 + roughness;
  const westernPlate =
    ((x + 0.46) / 0.28) ** 2 + ((y - 0.02) / 0.46) ** 2 < 1 + roughness;
  const eastCoast =
    ((x - 0.39) / 0.27) ** 2 + ((y + 0.01) / 0.5) ** 2 < 1 + roughness;
  const topEnd =
    ((x + 0.08) / 0.42) ** 2 + ((y + 0.57) / 0.18) ** 2 < 1 + roughness;
  const capeYork =
    ((x - 0.29) / 0.13) ** 2 + ((y + 0.66) / 0.28) ** 2 < 1 + roughness;
  const southEast =
    ((x - 0.34) / 0.2) ** 2 + ((y - 0.52) / 0.18) ** 2 < 1 + roughness;
  const tasmania =
    ((x - 0.35) / 0.11) ** 2 + ((y - 0.83) / 0.07) ** 2 < 1 + roughness;
  const gulfOfCarpentaria =
    ((x - 0.12) / 0.23) ** 2 + ((y + 0.49) / 0.16) ** 2 < 1;
  const greatAustralianBight =
    ((x + 0.04) / 0.36) ** 2 + ((y - 0.61) / 0.13) ** 2 < 1;
  const sharkBayBite =
    ((x + 0.63) / 0.13) ** 2 + ((y + 0.04) / 0.2) ** 2 < 1;
  const northWestShelf =
    x < -0.55 && y < -0.26;

  return (
    mainland ||
    westernPlate ||
    eastCoast ||
    topEnd ||
    capeYork ||
    southEast ||
    tasmania
  ) && !gulfOfCarpentaria && !greatAustralianBight && !sharkBayBite && !northWestShelf;
}

function pickTerrain(hex: HexCoord & { isLand: boolean }, isCoast: boolean, radius: number): TerrainType {
  if (!hex.isLand) {
    return "ocean";
  }

  const { x, y } = getNormalizedPoint(hex, radius);
  const distanceFromPortal = getHexDistance(hex);
  const noise = valueNoise(hex.q * 2 + 19, hex.r * 2 - 7);
  const eastRange = x > 0.28 && y > -0.36 && y < 0.6;
  const westRange = x < -0.44 && y > -0.2 && y < 0.5;

  if (distanceFromPortal < 7) {
    return "crater";
  }

  if (isCoast) {
    return "coast";
  }

  if ((eastRange || westRange) && noise > -0.3) {
    return noise > 0.42 ? "caves" : "mountains";
  }

  if ((x > 0.18 && y < 0.18 && noise > -0.28) || (x < -0.15 && y < -0.42 && noise > 0.05)) {
    return "ash-forest";
  }

  if (distanceFromPortal < 34 || (x < -0.1 && y > -0.1 && noise < 0.25)) {
    return noise > 0.52 ? "crater" : "mutated-desert";
  }

  if ((x > 0.34 && y > -0.12 && y < 0.44 && noise > 0.28) || (x < -0.22 && y > 0.42 && noise > 0.18)) {
    return "ruins";
  }

  return "wasteland";
}

function getResourceHint(terrain: TerrainType) {
  const hints: Record<TerrainType, string> = {
    ocean: "Ocean barrier",
    coast: "Food, scrap, safe landing",
    wasteland: "Balanced expansion ground",
    "mutated-desert": "Rare minerals, radiation",
    "ash-forest": "Biomass and ambush cover",
    mountains: "Ore and defensive ridges",
    caves: "Hidden salvage and monsters",
    ruins: "Data vaults and old-world parts",
    crater: "Alien tech, extreme hazard",
    portal: "Server portal construction site",
  };

  return hints[terrain];
}

function getDanger(distanceFromPortal: number, terrain: TerrainType, isValidStart: boolean): WorldHex["danger"] {
  if (isValidStart || terrain === "coast") {
    return "low";
  }

  if (terrain === "portal" || terrain === "crater") {
    return "extreme";
  }

  if (distanceFromPortal < 36 || terrain === "caves" || terrain === "mutated-desert") {
    return "high";
  }

  if (terrain === "mountains" || terrain === "ruins") {
    return "medium";
  }

  return "low";
}

function getNormalizedPoint({ q, r }: HexCoord, radius: number) {
  const x = Math.sqrt(3) * (q + r / 2) / (Math.sqrt(3) * radius);
  const y = (1.5 * r) / (1.5 * radius);

  return { x, y };
}

function valueNoise(q: number, r: number) {
  const raw = Math.sin(q * 12.9898 + r * 78.233 + q * r * 0.017) * 43758.5453;

  return (raw - Math.floor(raw)) * 2 - 1;
}
