"use client";

import { useEffect, useMemo, useState } from "react";
import type { BaseSection, BaseSectionId, ConstructionState } from "@/lib/base-data";
import { TRAVEL_MINUTES_PER_HEX, baseSections, formatDuration } from "@/lib/base-data";
import type { Faction, ResourceMap, Specialist } from "@/lib/game-data";
import { resourceLabels } from "@/lib/game-data";
import { tileById } from "@/lib/tile-data";
import { getHexDistance, type WorldHex } from "@/lib/world-map";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type BaseManagementScreenProps = {
  commanderName: string;
  faction: Faction;
  specialists: Specialist[];
  crashSite: WorldHex;
  resources: ResourceMap;
  construction: ConstructionState;
  onOpenMap: () => void;
  onStartConstruction: (section: BaseSection) => void;
  onReset: () => void;
};

const resourceKeys = ["energy", "alloy", "data", "blueprints", "food"] as const;

export function BaseManagementScreen({
  commanderName,
  faction,
  specialists,
  crashSite,
  resources,
  construction,
  onOpenMap,
  onStartConstruction,
  onReset,
}: BaseManagementScreenProps) {
  const [now, setNow] = useState(() => Date.now());
  const gateDistance = getHexDistance(crashSite, { q: 0, r: 0 });
  const gateTravelMinutes = gateDistance * TRAVEL_MINUTES_PER_HEX;
  const completedSections = useMemo(
    () =>
      baseSections.filter((section) => {
        const task = construction[section.id];
        return task && now - task.startedAt >= task.durationMs;
      }).length,
    [construction, now],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-5 lg:px-6">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-200">
            Base tab / tutorial active
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl">
            Starter base online
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {commanderName}, your core hex at {crashSite.q}:{crashSite.r} was built instantly.
            Improve the six base sections next.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <GameButton onClick={onOpenMap}>World map</GameButton>
          <GameButton variant="ghost" onClick={onReset}>
            Restart FTUE
          </GameButton>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-5">
          <Panel intensity="strong" className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-200">
              Tutorial objective
            </p>
            <h2 className="mt-4 text-2xl font-black uppercase text-white">
              Upgrade one starter section
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The starter base is instant. Every section improvement uses real-time construction
              timers like Last War: Survival.
            </p>
            <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100">
              {completedSections}/6 sections improved
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200">
              Commander setup
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <InfoRow label="Faction" value={faction.name} />
              <InfoRow label="Crash hex" value={`${crashSite.q}:${crashSite.r}`} />
              <InfoRow label="Terrain" value={tileById[crashSite.terrain].displayName} />
              <InfoRow label="Specialists" value={specialists.map((specialist) => specialist.name).join(", ")} />
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-200">
              Time rules
            </p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
              <p>Base core: instant when the player confirms the crash site.</p>
              <p>Base sections: real-time timers from 1h to 3h.</p>
              <p>Map movement: {TRAVEL_MINUTES_PER_HEX}m per hex.</p>
              <p>
                Distance to FLARE Gate: {gateDistance} hexes / {formatDuration(gateTravelMinutes * 60000)} travel.
              </p>
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200">
              Resources
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {resourceKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {resourceLabels[key]}
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">{resources[key]}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {baseSections.map((section, index) => (
            <BaseSectionCard
              key={section.id}
              index={index}
              now={now}
              onStartConstruction={onStartConstruction}
              section={section}
              task={construction[section.id]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function BaseSectionCard({
  index,
  now,
  onStartConstruction,
  section,
  task,
}: {
  index: number;
  now: number;
  onStartConstruction: (section: BaseSection) => void;
  section: BaseSection;
  task?: ConstructionState[BaseSectionId];
}) {
  const durationMs = section.buildHours * 60 * 60 * 1000;
  const elapsedMs = task ? now - task.startedAt : 0;
  const remainingMs = Math.max(0, (task?.durationMs ?? durationMs) - elapsedMs);
  const progress = task ? Math.min(100, Math.round((elapsedMs / task.durationMs) * 100)) : 0;
  const isComplete = Boolean(task && remainingMs === 0);
  const isBuilding = Boolean(task && remainingMs > 0);

  return (
    <Panel intensity={index === 0 ? "strong" : "soft"} className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{section.role}</p>
          <h3 className="mt-3 text-2xl font-black uppercase text-white">{section.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          Slot {index + 1}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{section.description}</p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          <span>{isComplete ? "Complete" : isBuilding ? "Building" : "Upgrade time"}</span>
          <span>{isBuilding ? formatDuration(remainingMs) : formatDuration(durationMs)}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(78,199,255,0.45)]"
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      </div>

      <GameButton
        className="mt-5 w-full"
        disabled={Boolean(task)}
        onClick={() => onStartConstruction(section)}
        variant={isComplete ? "ghost" : "secondary"}
      >
        {isComplete ? "Level 2 ready" : isBuilding ? "Construction active" : `Start ${formatDuration(durationMs)}`}
      </GameButton>
    </Panel>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 font-semibold capitalize text-slate-100">{value}</p>
    </div>
  );
}
