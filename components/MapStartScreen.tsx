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
const resourceReadout = [
  { label: "Wreckage", value: "24", tone: "text-orange-100" },
  { label: "Energy", value: "30", tone: "text-cyan-100" },
  { label: "Food", value: "20", tone: "text-emerald-100" },
  { label: "Data", value: "4", tone: "text-violet-100" },
];
const navItems = ["Map", "Base", "Alliance", "Chat", "Missions", "Reports"];
const allianceSignals = [
  "Alliance beacon: not joined",
  "Portal project is dormant",
  "Raids unlock at base level 10",
];
const chatMessages = [
  { channel: "World", text: "Coastal survivors are marking safe landing corridors." },
  { channel: "Alliance", text: "Join or create an alliance after command alignment." },
  { channel: "System", text: "Central portal requires server-wide construction." },
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
  const [isMapReady, setIsMapReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Choose any glowing start hex within two hexes of the sea.",
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
    setIsMapReady(true);
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
          ? "Starts must be within two hexes of the sea and reserve a full 7-hex city footprint."
          : "The ocean rim is capped at two hexes for performance. Pick land near the shore.",
      );
      return;
    }

    setSelectedKey(hex.key);
    setCamera((current) => {
      const point = axialToPixel(hex);

      return { x: point.x, y: point.y, zoom: Math.max(current.zoom, 1.08) };
    });
    setStatusMessage("Crash site locked. Six surrounding city hexes are reserved.");
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
    <main className="flex min-h-screen w-full flex-col gap-4 overflow-hidden px-3 py-3 lg:px-4">
      <CommandHud
        landHexCount={worldMap.landHexCount}
        oceanHexCount={worldMap.oceanHexCount}
        renderedHexCount={worldMap.hexes.length}
        startCount={worldMap.validStartCount}
      />

      <div className="grid flex-1 gap-4 lg:grid-cols-[76px_minmax(0,1fr)_390px]">
        <nav className="grid grid-cols-3 gap-2 lg:flex lg:flex-col" aria-label="Main game menu">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase tracking-[0.2em] transition ${
                item === "Map"
                  ? "border-cyan-200/60 bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(78,199,255,0.3)]"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-200/40 hover:bg-cyan-300/10"
              } lg:min-h-20 lg:[writing-mode:vertical-rl]`}
            >
              {item}
            </button>
          ))}
        </nav>

        <Panel intensity="strong" className="min-h-[620px] overflow-hidden p-0">
          <div ref={containerRef} className="relative h-[calc(100vh-128px)] min-h-[620px] w-full">
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
            {!isMapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <div className="rounded-3xl border border-cyan-200/30 bg-cyan-300/10 px-6 py-4 text-center shadow-[0_0_40px_rgba(78,199,255,0.18)]">
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-100">
                    Scanning Future Australia
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Building shore map and fog grid.</p>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-slate-300 backdrop-blur">
              <p className="font-bold uppercase tracking-[0.24em] text-cyan-100">Fog enabled</p>
              <p className="mt-1 max-w-xs">
                Drag to pan. Scroll to zoom. Glowing hexes within two hexes of the sea are valid starts.
              </p>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 grid gap-2 text-xs uppercase tracking-[0.18em] text-slate-300 sm:grid-cols-4">
              <MapBadge label="Map radius" value={`${worldMap.radius}`} />
              <MapBadge label="Rendered" value={`${worldMap.hexes.length}`} />
              <MapBadge label="Starts" value={`${worldMap.validStartCount}`} />
              <MapBadge label="Ocean rim" value="2 hex cap" />
            </div>
          </div>
        </Panel>

        <aside className="flex max-h-[calc(100vh-128px)] flex-col gap-4 overflow-y-auto pr-1">
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
                    Hex {selectedHex.q}:{selectedHex.r}
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
                    Future Australia is the main map. The interior stays dark until your core base lands.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <GameButton
                className={`flex-1 ${selectedHex ? "ring-2 ring-cyan-100/60 ring-offset-2 ring-offset-slate-950" : ""}`}
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
                  setStatusMessage("Choose any glowing start hex within two hexes of the sea.");
                  setCamera({ x: 0, y: 0, zoom: 0.58 });
                }}
              >
                Reset
              </GameButton>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
                Alliance
              </p>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Pending
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {allianceSignals.map((signal) => (
                <p key={signal} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  {signal}
                </p>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-200">Chat</p>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
              >
                Open
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {chatMessages.map((message) => (
                <p key={`${message.channel}-${message.text}`} className="rounded-xl bg-black/25 px-3 py-2 text-slate-300">
                  <span className="mr-2 font-bold text-cyan-100">[{message.channel}]</span>
                  {message.text}
                </p>
              ))}
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

function CommandHud({
  landHexCount,
  oceanHexCount,
  renderedHexCount,
  startCount,
}: {
  landHexCount: number;
  oceanHexCount: number;
  renderedHexCount: number;
  startCount: number;
}) {
  return (
    <header className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_18px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.4fr)_minmax(280px,0.7fr)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/40 bg-cyan-300/10 text-lg font-black text-cyan-100">
          F
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-200">
            Future Australia / Server 01
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-[-0.04em] text-white">
            World map
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {resourceReadout.map((resource) => (
          <div key={resource.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
              {resource.label}
            </p>
            <p className={`mt-1 text-xl font-black ${resource.tone}`}>{resource.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        <MapBadge label="Land" value={`${landHexCount}`} />
        <MapBadge label="Ocean" value={`${oceanHexCount}`} />
        <MapBadge label="Rendered" value={`${renderedHexCount}`} />
        <MapBadge label="Starts" value={`${startCount}`} />
      </div>
    </header>
  );
}

function MapBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
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
