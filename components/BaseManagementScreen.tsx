"use client";

import { useEffect, useState } from "react";
import {
  buildingDefinitions,
  buildingLevelRuleByLevel,
  startingBuildingIds,
  type BuildingDefinition,
  type BuildingId,
} from "@/lib/game/buildings";
import {
  calculateBuildingOutput,
  getDroneBonusPercent,
  getHeroBonusPercent,
  getWorkerDroneCountForBaseLevel,
} from "@/lib/game/economy";
import type { ResourceAmount, ResourceId } from "@/lib/game/resources";
import { canScoutMoveTo, type ScoutMapState, type ScoutMapTile } from "@/lib/game/scouting";
import { resourceLabels } from "@/lib/game-data";
import type { Specialist, SpecialistId } from "@/lib/game-data";
import { specialistById } from "@/lib/game/specialists";
import { tileById } from "@/lib/tile-data";
import type { WorldHex } from "@/lib/world-map";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

export type BuildingAssignment = {
  droneCount: number;
  specialistId?: SpecialistId;
};

export type BuildingAssignments = Partial<Record<BuildingId, BuildingAssignment>>;

export type BuildingLevels = Partial<Record<BuildingId, 1 | 2 | 3>>;

export type ProductionLogEntry = {
  cycle: number;
  lines: string[];
};

type BaseManagementScreenProps = {
  commanderName: string;
  factionName: string;
  factionBonus: string;
  specialists: Specialist[];
  crashSite: WorldHex;
  baseLevel: number;
  resources: ResourceAmount;
  buildingLevels: BuildingLevels;
  assignments: BuildingAssignments;
  productionLog?: ProductionLogEntry;
  onAddDrone: (buildingId: BuildingId) => void;
  onAssignSpecialist: (buildingId: BuildingId, specialistId?: SpecialistId) => void;
  onOpenMap: () => void;
  onRemoveDrone: (buildingId: BuildingId) => void;
  onReset: () => void;
  onRunProduction: () => void;
  onScoutMove: (destinationTileId: string) => void;
  onUpgradeCommandCore: () => void;
  scouting: ScoutMapState;
};

const dashboardResourceKeys: ResourceId[] = ["energy", "alloy", "data", "food"];
const commandCoreLevelTwoCost: Partial<ResourceAmount> = {
  alloy: 500,
  energy: 200,
  data: 100,
};

export function BaseManagementScreen({
  commanderName,
  factionName,
  factionBonus,
  specialists,
  crashSite,
  baseLevel,
  resources,
  buildingLevels,
  assignments,
  productionLog,
  onAddDrone,
  onAssignSpecialist,
  onOpenMap,
  onRemoveDrone,
  onReset,
  onRunProduction,
  onScoutMove,
  onUpgradeCommandCore,
  scouting,
}: BaseManagementScreenProps) {
  const [now, setNow] = useState(() => Date.now());
  const totalWorkerDrones = getWorkerDroneCountForBaseLevel(baseLevel);
  const assignedWorkerDrones = Object.values(assignments).reduce(
    (total, assignment) => total + (assignment?.droneCount ?? 0),
    0,
  );
  const availableWorkerDrones = Math.max(0, totalWorkerDrones - assignedWorkerDrones);
  const assignedSpecialistIds = new Set(
    Object.values(assignments)
      .map((assignment) => assignment?.specialistId)
      .filter(Boolean),
  );
  const canUpgradeCommandCore =
    (buildingLevels.command_core ?? 1) === 1 &&
    (resources.alloy ?? 0) >= (commandCoreLevelTwoCost.alloy ?? 0) &&
    (resources.energy ?? 0) >= (commandCoreLevelTwoCost.energy ?? 0) &&
    (resources.data ?? 0) >= (commandCoreLevelTwoCost.data ?? 0);
  const productionTotals = getProductionTotals({ assignments, buildingLevels, baseLevel });
  const scoutArrivesInSeconds =
    scouting.scout.status === "moving" && scouting.scout.movementEndsAt
      ? Math.max(0, Math.ceil((scouting.scout.movementEndsAt - now) / 1000))
      : null;

  useEffect(() => {
    if (scouting.scout.status !== "moving") {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 250);

    return () => window.clearInterval(interval);
  }, [scouting.scout.status]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-5 lg:px-6">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-200">
            Colony dashboard / Economy loop
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl">
            Command core level {baseLevel}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Commander {commanderName} controls {getFactionArticle(factionName)} {factionName} base at hex{" "}
            {crashSite.q}:{crashSite.r}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <GameButton onClick={onOpenMap}>World map</GameButton>
          <GameButton variant="ghost" onClick={onReset}>
            Restart FTUE
          </GameButton>
        </div>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel intensity="strong" className="p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="Faction" value={factionName} />
            <Stat label="Crash terrain" value={tileById[crashSite.terrain].displayName} />
            <Stat label="Worker drones" value={`${availableWorkerDrones}/${totalWorkerDrones} free`} />
            <Stat label="Specialists" value={specialists.map((specialist) => specialist.name).join(", ")} />
          </div>
          <p className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm font-semibold leading-6 text-cyan-100">
            {factionBonus}
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
                Command Core upgrade
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {(buildingLevels.command_core ?? 1) >= 2
                  ? "Level 2 is online. Your colony has 2 additional Worker Drones for building assignments."
                  : "Level 2 costs 500 Alloy, 200 Energy, and 100 Data. Upgrade grants +2 Worker Drones."}
              </p>
            </div>
            <GameButton
              disabled={!canUpgradeCommandCore}
              onClick={onUpgradeCommandCore}
              variant={(buildingLevels.command_core ?? 1) >= 2 ? "ghost" : "secondary"}
            >
              {(buildingLevels.command_core ?? 1) >= 2 ? "Level 2 online" : "Upgrade Command Core"}
            </GameButton>
          </div>
        </Panel>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[0.55fr_1.45fr]">
        <div className="space-y-4">
          <ScoutPanel
            arrivesInSeconds={scoutArrivesInSeconds}
            onScoutMove={onScoutMove}
            scouting={scouting}
          />

          <Panel className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              Resources
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {dashboardResourceKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {resourceLabels[key]}
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">{Math.floor(resources[key])}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
                  Production cycle
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Adds each building&apos;s calculated hourly output once. Bonuses are additive.
                </p>
              </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Current output / cycle
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {dashboardResourceKeys.map((key) => (
                  <span key={key} className="font-semibold text-slate-100">
                    +{productionTotals[key] ?? 0} {resourceLabels[key]}
                  </span>
                ))}
              </div>
            </div>
              <GameButton onClick={onRunProduction}>Run Production Cycle</GameButton>
            </div>
            {productionLog && (
              <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm text-cyan-100">
                <p className="font-bold uppercase tracking-[0.2em]">Cycle {productionLog.cycle}</p>
                <div className="mt-3 space-y-2">
                  {productionLog.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 2xl:grid-cols-2">
          {buildingDefinitions
            .filter(
              (building) =>
                building.unlocksAtBaseLevel <= baseLevel && startingBuildingIds.includes(building.id),
            )
            .map((building) => (
              <BuildingCard
                key={building.id}
                assignment={assignments[building.id]}
                availableWorkerDrones={availableWorkerDrones}
                building={building}
                buildingLevel={buildingLevels[building.id] ?? 1}
                onAddDrone={onAddDrone}
                onAssignSpecialist={onAssignSpecialist}
                onRemoveDrone={onRemoveDrone}
                selectedSpecialistIds={assignedSpecialistIds}
                specialists={specialists}
              />
            ))}
        </div>
      </div>
    </main>
  );
}

function ScoutPanel({
  arrivesInSeconds,
  onScoutMove,
  scouting,
}: {
  arrivesInSeconds: number | null;
  onScoutMove: (destinationTileId: string) => void;
  scouting: ScoutMapState;
}) {
  return (
    <Panel intensity="strong" className="p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              Scout map
            </p>
            <h2 className="mt-3 text-2xl font-black uppercase text-white">
              {scouting.scout.displayName}
            </h2>
          </div>
          <span className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
            {scouting.scout.status === "moving" ? `Arrives in ${arrivesInSeconds}s` : "Idle"}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-300">
          Move one adjacent hex at a time. Movement takes 5 seconds for this prototype.
        </p>

        <ScoutHexMap onScoutMove={onScoutMove} scouting={scouting} />

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Scout log</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {scouting.scoutLog.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ScoutHexMap({
  onScoutMove,
  scouting,
}: {
  onScoutMove: (destinationTileId: string) => void;
  scouting: ScoutMapState;
}) {
  const points = scouting.tiles.map((tile) => ({
    tile,
    x: 180 * (tile.q + tile.r / 2),
    y: 168 * tile.r,
  }));
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return (
    <div className="h-[720px] overflow-auto rounded-3xl border border-white/10 bg-slate-950/80">
      <div
        className="relative"
        style={{
          height: maxY - minY + 260,
          width: maxX - minX + 300,
        }}
      >
        {points.map(({ tile, x, y }) => (
          <ScoutTileCard
            key={tile.id}
            canMove={canScoutMoveTo(tile, scouting.scout)}
            isMoving={scouting.scout.status === "moving"}
            onScoutMove={onScoutMove}
            tile={tile}
            x={x - minX + 96}
            y={y - minY + 48}
          />
        ))}
      </div>
    </div>
  );
}

function ScoutTileCard({
  canMove,
  isMoving,
  onScoutMove,
  tile,
  x,
  y,
}: {
  canMove: boolean;
  isMoving: boolean;
  onScoutMove: (destinationTileId: string) => void;
  tile: ScoutMapTile;
  x: number;
  y: number;
}) {
  const tileResources = tile.mainResources.map((resourceId) => resourceLabels[resourceId]).join(", ");
  const stateLabel = tile.isExplored ? "Explored" : tile.isRevealed ? "Revealed" : "Signal unclear";

  return (
    <div
      className={`absolute flex h-[150px] w-[160px] flex-col justify-between rounded-2xl border p-3 text-center text-[0.72rem] shadow-lg ${
        tile.isRevealed
          ? tile.isExplored
            ? "border-cyan-200/50 bg-cyan-300/15 text-slate-100"
            : "border-orange-200/35 bg-orange-300/10 text-slate-200"
          : "border-white/5 bg-black/50 text-slate-500"
      }`}
      style={{
        left: x,
        top: y,
        zIndex: canMove ? 20 : tile.hasScout ? 15 : tile.isRevealed ? 5 : 1,
      }}
    >
      <div>
        <p className="font-black uppercase leading-tight">
          {tile.isRevealed ? tile.displayName : "Unknown"}
        </p>
        <p className="mt-1 uppercase tracking-[0.12em]">{stateLabel}</p>
      </div>
      {tile.isRevealed && (
        <div className="leading-tight">
          <p>Risk: {tile.riskLevel}</p>
          <p>{tileResources || "No early resources"}</p>
        </div>
      )}
      {tile.hasBase && <p className="font-black text-cyan-100">BASE</p>}
      {tile.hasScout && <p className="font-black text-orange-100">SCOUT</p>}
      {canMove && (
        <button
          className="relative z-30 rounded-full bg-cyan-300 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-slate-950 disabled:opacity-40"
          disabled={isMoving}
          onClick={() => onScoutMove(tile.id)}
          type="button"
        >
          Move Scout Here
        </button>
      )}
    </div>
  );
}

function getProductionTotals({
  assignments,
  baseLevel,
  buildingLevels,
}: {
  assignments: BuildingAssignments;
  baseLevel: number;
  buildingLevels: BuildingLevels;
}) {
  return buildingDefinitions.reduce<Partial<Record<ResourceId, number>>>((totals, building) => {
    if (
      building.unlocksAtBaseLevel > baseLevel ||
      !startingBuildingIds.includes(building.id) ||
      !building.baseOutputPerHour
    ) {
      return totals;
    }

    const assignment = assignments[building.id];
    const output = calculateBuildingOutput({
      buildingId: building.id,
      buildingLevel: buildingLevels[building.id] ?? 1,
      baseOutputPerHour: building.baseOutputPerHour,
      assignedWorkerDrones: assignment?.droneCount ?? 0,
      assignedSpecialistId: assignment?.specialistId,
    });

    Object.entries(output).forEach(([resourceId, amount]) => {
      const key = resourceId as ResourceId;
      totals[key] = (totals[key] ?? 0) + (amount ?? 0);
    });

    return totals;
  }, {});
}

function getFactionArticle(factionName: string) {
  return /^[aeiou]/i.test(factionName) ? "an" : "a";
}

function BuildingCard({
  assignment,
  availableWorkerDrones,
  building,
  buildingLevel,
  onAddDrone,
  onAssignSpecialist,
  onRemoveDrone,
  selectedSpecialistIds,
  specialists,
}: {
  assignment?: BuildingAssignment;
  availableWorkerDrones: number;
  building: BuildingDefinition;
  buildingLevel: 1 | 2 | 3;
  onAddDrone: (buildingId: BuildingId) => void;
  onAssignSpecialist: (buildingId: BuildingId, specialistId?: SpecialistId) => void;
  onRemoveDrone: (buildingId: BuildingId) => void;
  selectedSpecialistIds: Set<SpecialistId | undefined>;
  specialists: Specialist[];
}) {
  const droneCount = assignment?.droneCount ?? 0;
  const assignedSpecialistId = assignment?.specialistId;
  const assignedSpecialist = assignedSpecialistId ? specialistById[assignedSpecialistId] : undefined;
  const droneSlots = buildingLevelRuleByLevel[buildingLevel].droneSlots;
  const baseOutput = building.baseOutputPerHour ?? {};
  const finalOutput = calculateBuildingOutput({
    buildingId: building.id,
    buildingLevel,
    baseOutputPerHour: baseOutput,
    assignedWorkerDrones: droneCount,
    assignedSpecialistId,
  });
  const droneBonus = getDroneBonusPercent(droneCount, buildingLevel);
  const heroBonus = getHeroBonusPercent({ buildingId: building.id, specialistId: assignedSpecialistId });
  const isCorrectSpecialist = assignedSpecialist?.bestBuildingIds.includes(building.id) ?? false;

  return (
    <Panel intensity={building.id === "command_core" ? "strong" : "soft"} className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
            Level {buildingLevel}
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase text-white">{building.displayName}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          {droneCount}/{droneSlots} drones
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{building.purpose}</p>

      <div className="mt-4 grid gap-3">
        <OutputPanel label="Base output" output={baseOutput} />
        <OutputPanel label="Final output" output={finalOutput} highlight />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Worker drones
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">+{droneBonus}% output</p>
          </div>
          <div className="flex gap-2">
            <GameButton
              disabled={droneCount === 0}
              onClick={() => onRemoveDrone(building.id)}
              variant="ghost"
            >
              - Drone
            </GameButton>
            <GameButton
              disabled={availableWorkerDrones <= 0 || droneCount >= droneSlots}
              onClick={() => onAddDrone(building.id)}
              variant="secondary"
            >
              + Drone
            </GameButton>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Assigned specialist
          </span>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm font-semibold text-white outline-none"
            onChange={(event) => onAssignSpecialist(building.id, event.target.value as SpecialistId || undefined)}
            value={assignedSpecialistId ?? ""}
          >
            <option value="">No specialist (+0%)</option>
            {specialists.map((specialist) => (
              <option
                key={specialist.id}
                disabled={selectedSpecialistIds.has(specialist.id) && specialist.id !== assignedSpecialistId}
                value={specialist.id}
              >
                {specialist.name}
              </option>
            ))}
          </select>
        </label>
        <p className={`mt-3 text-sm font-semibold ${isCorrectSpecialist ? "text-cyan-100" : assignedSpecialist ? "text-orange-100" : "text-slate-400"}`}>
          {assignedSpecialist
            ? `${assignedSpecialist.displayName}: +${heroBonus}% ${isCorrectSpecialist ? "correct specialist" : "general assignment"}`
            : "No specialist assigned"}
        </p>
      </div>
    </Panel>
  );
}

function OutputPanel({
  highlight = false,
  label,
  output,
}: {
  highlight?: boolean;
  label: string;
  output: Partial<Record<ResourceId, number>>;
}) {
  const entries = Object.entries(output);

  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-cyan-200/25 bg-cyan-300/10" : "border-white/10 bg-white/[0.03]"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 space-y-1 text-sm font-semibold text-white">
        {entries.length ? (
          entries.map(([resourceId, amount]) => (
            <p key={resourceId}>
              {amount} {resourceLabels[resourceId as ResourceId]}/cycle
            </p>
          ))
        ) : (
          <p className="text-slate-500">No passive output</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
