export type HexCoord = {
  q: number;
  r: number;
};

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

export function getAdjacentCoords(coord: HexCoord) {
  return HEX_DIRECTIONS.map((direction) => ({
    q: coord.q + direction.q,
    r: coord.r + direction.r,
  }));
}

export function areCoordsAdjacent(a: HexCoord, b: HexCoord) {
  return getAdjacentCoords(a).some((coord) => coord.q === b.q && coord.r === b.r);
}

export function getHexDistance(a: HexCoord, b: HexCoord = { q: 0, r: 0 }) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;

  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
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
