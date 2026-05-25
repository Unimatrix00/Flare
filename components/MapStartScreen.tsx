"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";
import {
  createHexKey,
  generateWorldMap,
  getHexesInRange,
  getNeighborCoords,
  type HexCoord,
  type TerrainType,
  type WorldHex,
} from "@/lib/world-map";

type MapStartScreenProps = {
  onContinue: (site: WorldHex) => void;
};

type Camera = {
  x: number;
  y: number;
  zoom: number;
};

type DragState = {
  startX: number;
  startY: number;
  camera: Camera;
  moved: boolean;
};

const HEX_SIZE = 7;
const MIN_ZOOM = 0.42;
const MAX_ZOOM = 2.1;
const terrainColors: Record<TerrainType, string> = {
  ocean: "#092033",
  coast: "#b8844c",
  wasteland: "#645244",
  "mutated-desert": "#8f3f28",
  "ash-forest": "#325c4a",
  mountains: "#5d6470",
  caves: "#34313d",
  ruins: "#7c6a46",
  crater: "#7f2d38",
  portal: "#9b5cf6",
};

const terrainLabels: Record<TerrainType, string> = {
  ocean: "Ocean",
  coast: "Coast",
  wasteland: "Wasteland",
  "mutated-desert": "Mutated desert",
  "ash-forest": "Ash forest",
  mountains: "Mountains",
  caves: "Caves",
  ruins: "Ruins",
  crater: "Crater scar",
  portal: "FLARE Gate",
};

const baseSectors = [
  "Material fabricator",
  "Research lab",
  "Biofuel generator",
  "Drone bay",
  "Defense walls",
  "Workshop",
];

export function MapStartScreen({ onContinue }: MapStartScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const worldMap = useMemo(() => generateWorldMap(), []);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 640 });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 0.58 });
  const [selectedKey, setSelectedKey] = useState<string>();
  const [hoveredKey, setHoveredKey] = useState<string>();
  const [statusMessage, setStatusMessage] = useState(
    "Choose a glowing coastal hex for the first crash camp.",
  );

  const selectedHex = selectedKey ? worldMap.byKey.get(selectedKey) : undefined;
  const reservedKeys = useMemo(() => {
    if (!selectedHex) {
      return new Set<string>();
    }

    return new Set([
      selectedHex.key,
      ...getNeighborCoords(selectedHex)
        .map(createHexKey)
        .filter((key) => worldMap.byKey.get(key)?.isLand),
    ]);
  }, [selectedHex, worldMap.byKey]);
  const revealedKeys = useMemo(() => {
    const revealed = new Set<string>();

    getHexesInRange({ q: 0, r: 0 }, 2).forEach((coord) => revealed.add(createHexKey(coord)));

    if (!selectedHex) {
      worldMap.hexes.forEach((hex) => {
        if (hex.isValidStart) {
          revealed.add(hex.key);
        }
      });
      return revealed;
    }

    getHexesInRange(selectedHex, 6).forEach((coord) => revealed.add(createHexKey(coord)));
    reservedKeys.forEach((key) => revealed.add(key));

    return revealed;
  }, [reservedKeys, selectedHex, worldMap.hexes]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setCanvasSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(420, entry.contentRect.height),
      });
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    drawMap(context, canvasSize, camera, worldMap.hexes, {
      hoveredKey,
      reservedKeys,
      revealedKeys,
      selectedKey,
    });
  }, [camera, canvasSize, hoveredKey, reservedKeys, revealedKeys, selectedKey, worldMap.hexes]);

  function getHexFromPointer(clientX: number, clientY: number) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const worldX = (screenX - canvasSize.width / 2) / camera.zoom + camera.x;
    const worldY = (screenY - canvasSize.height / 2) / camera.zoom + camera.y;
    const coord = pixelToAxial(worldX, worldY);

    return worldMap.byKey.get(createHexKey(coord));
  }

  function handleHexClick(hex: WorldHex | undefined) {
    if (!hex) {
      setStatusMessage("That signal is outside the active server map.");
      return;
    }

    if (selectedHex && hex.key === selectedHex.key) {
      setStatusMessage("Core base selected. Six internal build sectors are ready for planning.");
      return;
    }

    if (reservedKeys.has(hex.key)) {
      setStatusMessage("Reserved future city hex: unlocks as the base levels past 10.");
      return;
    }

    if (!hex.isValidStart) {
      setStatusMessage(
        hex.isLand
          ? "Inland tiles are locked for the start. Pick a glowing shore hex."
          : "Ocean tiles are a boundary for now. Pick a coastal landing zone.",
      );
      return;
    }

    setSelectedKey(hex.key);
    setCamera((current) => {
      const point = axialToPixel(hex);

      return { x: point.x, y: point.y, zoom: Math.max(current.zoom, 1.08) };
    });
    setStatusMessage("Crash site locked. The core base reserves its six surrounding expansion hexes.");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      camera,
      moved: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;

    if (!drag) {
      setHoveredKey(getHexFromPointer(event.clientX, event.clientY)?.key);
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      drag.moved = true;
    }

    setCamera({
      ...drag.camera,
      x: drag.camera.x - deltaX / drag.camera.zoom,
      y: drag.camera.y - deltaY / drag.camera.zoom,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;

    dragRef.current = undefined;

    if (!drag?.moved) {
      handleHexClick(getHexFromPointer(event.clientX, event.clientY));
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();

    const zoomChange = event.deltaY > 0 ? 0.88 : 1.12;
    setCamera((current) => ({
      ...current,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom * zoomChange)),
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-5 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-orange-200">
            Future Australia / Server 01
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl">
            Choose your crash site
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Start on the shore, push inland through fog, and build toward the central FLARE Gate.
          </p>
        </div>
        <div className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 sm:grid-cols-3">
          <Metric label="Map radius" value={`${worldMap.radius}`} />
          <Metric label="Coastal starts" value={`${worldMap.validStartCount}`} />
          <Metric label="Max city" value="7 hexes" />
        </div>
      </div>

      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel intensity="strong" className="min-h-[620px] overflow-hidden p-0">
          <div ref={containerRef} className="relative h-[62vh] min-h-[620px] w-full">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            />
            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-slate-300 backdrop-blur">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-100">Fog enabled</p>
              <p className="mt-1 max-w-xs">Drag to pan. Scroll to zoom. Glowing shore hexes are valid starts.</p>
            </div>
          </div>
        </Panel>

        <aside className="flex flex-col gap-4">
          <Panel className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              Landing command
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">{statusMessage}</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              {selectedHex ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Selected hex</p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-white">
                    Shore {selectedHex.q}:{selectedHex.r}
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Info label="Terrain" value={terrainLabels[selectedHex.terrain]} />
                    <Info label="Danger" value={selectedHex.danger} />
                    <Info label="Signal" value={selectedHex.resourceHint} />
                    <Info label="Reserved" value={`${reservedKeys.size} hexes`} />
                  </dl>
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">No base placed</p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-white">Coastline scan active</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    The interior stays dark until the core base lands and starts revealing nearby hexes.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <GameButton
                className="flex-1"
                disabled={!selectedHex}
                onClick={() => selectedHex && onContinue(selectedHex)}
              >
                Confirm crash site
              </GameButton>
              <GameButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedKey(undefined);
                  setStatusMessage("Choose a glowing coastal hex for the first crash camp.");
                  setCamera({ x: 0, y: 0, zoom: 0.58 });
                }}
              >
                Reset
              </GameButton>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
              Core base sectors
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr] lg:grid-cols-1 xl:grid-cols-[140px_1fr]">
              <BaseSectorIcon active={Boolean(selectedHex)} />
              <div className="grid gap-2 text-sm text-slate-300">
                {baseSectors.map((sector, index) => (
                  <div
                    key={sector}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-100">
                      {index + 1}
                    </span>
                    {sector}
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">
              City growth rule
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Levels 1-10: core hex only.</p>
              <p>Every 5 levels after 10: unlock one connected city hex.</p>
              <p>Level 40: full 7-hex footprint. Level 50: max city upgrades.</p>
            </div>
          </Panel>
        </aside>
      </div>
    </main>
  );
}

function drawMap(
  context: CanvasRenderingContext2D,
  size: { width: number; height: number },
  camera: Camera,
  hexes: WorldHex[],
  state: {
    hoveredKey?: string;
    reservedKeys: Set<string>;
    revealedKeys: Set<string>;
    selectedKey?: string;
  },
) {
  const pixelRatio = window.devicePixelRatio || 1;
  const canvas = context.canvas;

  canvas.width = Math.floor(size.width * pixelRatio);
  canvas.height = Math.floor(size.height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, size.width, size.height);

  const gradient = context.createRadialGradient(size.width / 2, size.height / 2, 50, size.width / 2, size.height / 2, size.width);
  gradient.addColorStop(0, "#101827");
  gradient.addColorStop(1, "#030712");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size.width, size.height);

  for (const hex of hexes) {
    const point = axialToPixel(hex);
    const screenX = (point.x - camera.x) * camera.zoom + size.width / 2;
    const screenY = (point.y - camera.y) * camera.zoom + size.height / 2;
    const drawSize = HEX_SIZE * camera.zoom;

    if (
      screenX < -drawSize ||
      screenX > size.width + drawSize ||
      screenY < -drawSize ||
      screenY > size.height + drawSize
    ) {
      continue;
    }

    const isKnown = state.revealedKeys.has(hex.key);
    const isSelected = hex.key === state.selectedKey;
    const isReserved = state.reservedKeys.has(hex.key);
    const isHovered = hex.key === state.hoveredKey;
    const color = isKnown || !hex.isLand ? terrainColors[hex.terrain] : "#07111d";

    drawHex(context, screenX, screenY, Math.max(2.2, drawSize - 0.45), color);

    if (!isKnown && hex.isLand) {
      context.fillStyle = "rgba(2, 6, 23, 0.72)";
      drawHex(context, screenX, screenY, Math.max(2.2, drawSize - 0.45), context.fillStyle);
    }

    if (hex.isValidStart && !state.selectedKey) {
      strokeHex(context, screenX, screenY, drawSize - 0.2, "rgba(125, 211, 252, 0.85)", 1.3);
    }

    if (isReserved && !isSelected) {
      strokeHex(context, screenX, screenY, drawSize - 0.1, "rgba(251, 146, 60, 0.92)", 1.7);
    }

    if (isSelected) {
      strokeHex(context, screenX, screenY, drawSize + 1.8, "rgba(34, 211, 238, 1)", 3);
      drawHex(context, screenX, screenY, drawSize * 0.46, "rgba(34, 211, 238, 0.95)");
    } else if (hex.isPortal) {
      strokeHex(context, screenX, screenY, drawSize + 1.6, "rgba(216, 180, 254, 0.95)", 2.4);
    } else if (isHovered && (hex.isValidStart || isReserved)) {
      strokeHex(context, screenX, screenY, drawSize + 1.2, "rgba(255, 255, 255, 0.9)", 2);
    }
  }

  drawMapLabel(context, "FLARE GATE", axialToScreen({ q: 0, r: 0 }, camera, size), "#e9d5ff");

  if (state.selectedKey) {
    const [q, r] = state.selectedKey.split(",").map(Number);
    drawMapLabel(context, "CORE BASE", axialToScreen({ q, r }, camera, size), "#cffafe");
  }
}

function drawHex(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillStyle: string | CanvasGradient,
) {
  const points = getHexPoints(x, y, radius);

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.closePath();
  context.fillStyle = fillStyle;
  context.fill();
}

function strokeHex(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strokeStyle: string,
  lineWidth: number,
) {
  const points = getHexPoints(x, y, radius);

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.closePath();
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.stroke();
}

function getHexPoints(x: number, y: number, radius: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);

    return {
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle),
    };
  });
}

function drawMapLabel(
  context: CanvasRenderingContext2D,
  label: string,
  point: { x: number; y: number },
  color: string,
) {
  context.save();
  context.font = "700 11px sans-serif";
  context.textAlign = "center";
  context.fillStyle = "rgba(2, 6, 23, 0.7)";
  context.fillRect(point.x - 46, point.y - 30, 92, 18);
  context.fillStyle = color;
  context.fillText(label, point.x, point.y - 17);
  context.restore();
}

function axialToPixel({ q, r }: HexCoord) {
  return {
    x: HEX_SIZE * Math.sqrt(3) * (q + r / 2),
    y: HEX_SIZE * 1.5 * r,
  };
}

function axialToScreen(coord: HexCoord, camera: Camera, size: { width: number; height: number }) {
  const point = axialToPixel(coord);

  return {
    x: (point.x - camera.x) * camera.zoom + size.width / 2,
    y: (point.y - camera.y) * camera.zoom + size.height / 2,
  };
}

function pixelToAxial(x: number, y: number) {
  const q = (Math.sqrt(3) / 3 * x - y / 3) / HEX_SIZE;
  const r = (2 / 3 * y) / HEX_SIZE;

  return roundAxial(q, r);
}

function roundAxial(q: number, r: number): HexCoord {
  let cubeQ = Math.round(q);
  let cubeR = Math.round(r);
  const cubeS = Math.round(-q - r);
  const qDiff = Math.abs(cubeQ - q);
  const rDiff = Math.abs(cubeR - r);
  const sDiff = Math.abs(cubeS + q + r);

  if (qDiff > rDiff && qDiff > sDiff) {
    cubeQ = -cubeR - cubeS;
  } else if (rDiff > sDiff) {
    cubeR = -cubeQ - cubeS;
  }

  return { q: cubeQ, r: cubeR };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p>{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold capitalize text-slate-100">{value}</dd>
    </div>
  );
}

function BaseSectorIcon({ active }: { active: boolean }) {
  const center = { x: 70, y: 70 };
  const radius = 58;
  const points = getHexPoints(center.x, center.y, radius);

  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36">
      {points.map((point, index) => {
        const next = points[(index + 1) % points.length];

        return (
          <polygon
            key={`${point.x}-${point.y}`}
            points={`${center.x},${center.y} ${point.x},${point.y} ${next.x},${next.y}`}
            className={`stroke-slate-950/80 stroke-[2] ${
              active ? "fill-cyan-300/80" : "fill-white/10"
            }`}
            opacity={active ? 0.45 + index * 0.07 : 0.55}
          />
        );
      })}
      <polygon
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        className="fill-transparent stroke-white/80 stroke-[3]"
      />
      <circle cx={center.x} cy={center.y} r="10" className={active ? "fill-orange-200" : "fill-slate-600"} />
    </svg>
  );
}
