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

const AUSTRALIA_OUTLINE = [
  { x: -0.78, y: 0.3 },
  { x: -0.86, y: 0.16 },
  { x: -0.82, y: 0.02 },
  { x: -0.88, y: -0.12 },
  { x: -0.78, y: -0.25 },
  { x: -0.66, y: -0.34 },
  { x: -0.58, y: -0.43 },
  { x: -0.47, y: -0.48 },
  { x: -0.36, y: -0.58 },
  { x: -0.27, y: -0.48 },
  { x: -0.16, y: -0.5 },
  { x: -0.1, y: -0.62 },
  { x: 0.1, y: -0.57 },
  { x: 0.04, y: -0.45 },
  { x: 0.24, y: -0.37 },
  { x: 0.31, y: -0.53 },
  { x: 0.35, y: -0.76 },
  { x: 0.42, y: -0.61 },
  { x: 0.47, y: -0.69 },
  { x: 0.51, y: -0.48 },
  { x: 0.58, y: -0.35 },
  { x: 0.62, y: -0.2 },
  { x: 0.72, y: -0.07 },
  { x: 0.8, y: 0.08 },
  { x: 0.82, y: 0.24 },
  { x: 0.76, y: 0.41 },
  { x: 0.66, y: 0.56 },
  { x: 0.53, y: 0.67 },
  { x: 0.39, y: 0.73 },
  { x: 0.3, y: 0.62 },
  { x: 0.23, y: 0.68 },
  { x: 0.12, y: 0.63 },
  { x: 0.07, y: 0.51 },
  { x: -0.03, y: 0.45 },
  { x: -0.14, y: 0.38 },
  { x: -0.26, y: 0.33 },
  { x: -0.4, y: 0.37 },
  { x: -0.52, y: 0.47 },
  { x: -0.63, y: 0.56 },
  { x: -0.75, y: 0.54 },
  { x: -0.83, y: 0.45 },
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
    const isWithinStartBand = getHexesInRange(hex, 2).some((coord) => coastKeys.has(createHexKey(coord)));
    const isValidStart =
      hex.isLand &&
      !isCoast &&
      isWithinStartBand &&
      hasFullCityFootprint;

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
  const inside = isPointInPolygon({ x, y }, AUSTRALIA_OUTLINE);
  const edgeDistance = getDistanceToOutline({ x, y }, AUSTRALIA_OUTLINE);
  const coastlineNoise = valueNoise(coord.q * 5 + 3, coord.r * 5 - 11);

  if (inside) {
    return edgeDistance > 0.02 || coastlineNoise > -0.5;
  }

  return edgeDistance < 0.018 && coastlineNoise > 0.58;
}

function isPointInPolygon(point: { x: number; y: number }, polygon: Array<{ x: number; y: number }>) {
  let isInside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function getDistanceToOutline(point: { x: number; y: number }, polygon: Array<{ x: number; y: number }>) {
  return polygon.reduce((closest, currentPoint, index) => {
    const nextPoint = polygon[(index + 1) % polygon.length];
    return Math.min(closest, getDistanceToSegment(point, currentPoint, nextPoint));
  }, Number.POSITIVE_INFINITY);
}

function getDistanceToSegment(
  point: { x: number; y: number },
  segmentStart: { x: number; y: number },
  segmentEnd: { x: number; y: number },
) {
  const deltaX = segmentEnd.x - segmentStart.x;
  const deltaY = segmentEnd.y - segmentStart.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const ratio = lengthSquared
    ? Math.max(
        0,
        Math.min(
          1,
          ((point.x - segmentStart.x) * deltaX + (point.y - segmentStart.y) * deltaY) / lengthSquared,
        ),
      )
    : 0;
  const projectionX = segmentStart.x + ratio * deltaX;
  const projectionY = segmentStart.y + ratio * deltaY;

  return Math.hypot(point.x - projectionX, point.y - projectionY);
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
    coast: "Food and scrap",
    wasteland: "Balanced expansion",
    "mutated-desert": "Rare minerals",
    "ash-forest": "Biomass cover",
    mountains: "Ore ridges",
    caves: "Hidden salvage",
    ruins: "Data vaults",
    crater: "Alien tech",
    portal: "Portal construction",
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
