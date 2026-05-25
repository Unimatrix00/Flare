import type { DroneAction, Faction, ResourceKey, ResourceMap, Specialist } from "@/lib/game-data";
import { droneActions, resourceLabels } from "@/lib/game-data";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type BaseStatus = {
  name: string;
  condition: string;
  integrity: number;
  security: number;
};

type ColonyDashboardProps = {
  faction: Faction;
  specialists: Specialist[];
  resources: ResourceMap;
  baseStatus: BaseStatus;
  siteProgress: number;
  activityLog: string[];
  buildCost: Pick<ResourceMap, "wreckage" | "energy">;
  onRunDroneAction: (action: DroneAction) => void;
  onBuildBase: () => void;
  onReset: () => void;
};

const resourceKeys: ResourceKey[] = ["wreckage", "energy", "food", "data"];

function canAfford(resources: ResourceMap, effects: Partial<ResourceMap>) {
  return Object.entries(effects).every(([key, value]) => {
    const resourceKey = key as ResourceKey;
    return resources[resourceKey] + (value ?? 0) >= 0;
  });
}

export function ColonyDashboard({
  faction,
  specialists,
  resources,
  baseStatus,
  siteProgress,
  activityLog,
  buildCost,
  onRunDroneAction,
  onBuildBase,
  onReset,
}: ColonyDashboardProps) {
  const canBuildBase =
    resources.wreckage >= buildCost.wreckage && resources.energy >= buildCost.energy;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-200">
            Colony command
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] text-white sm:text-6xl">
            Earthfall dashboard
          </h2>
        </div>
        <GameButton variant="ghost" onClick={onReset}>
          Restart run
        </GameButton>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Panel className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">
              Selected faction
            </p>
            <h3 className="mt-4 text-3xl font-black uppercase text-white">{faction.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{faction.description}</p>
            <div className="mt-5 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100">
              {faction.bonus}
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">
              Selected specialists
            </p>
            <div className="mt-5 grid gap-3">
              {specialists.map((specialist) => (
                <div
                  key={specialist.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold uppercase text-white">{specialist.name}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-orange-200">
                      {specialist.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{specialist.bonus}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Panel intensity="strong" className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">
                Base status
              </p>
              <h3 className="mt-4 text-2xl font-black uppercase text-white">{baseStatus.name}</h3>
              <p className="mt-2 text-sm text-slate-300">{baseStatus.condition}</p>
              <div className="mt-6 space-y-4">
                <StatusBar label="Integrity" value={baseStatus.integrity} color="cyan" />
                <StatusBar label="Security" value={baseStatus.security} color="orange" />
              </div>
              <GameButton
                className="mt-6 w-full"
                disabled={!canBuildBase}
                onClick={onBuildBase}
                variant={baseStatus.name === "Starter Base" ? "ghost" : "secondary"}
              >
                {baseStatus.name === "Starter Base"
                  ? "Base online"
                  : `Build starter base (${buildCost.wreckage}W / ${buildCost.energy}E)`}
              </GameButton>
            </Panel>

            <Panel className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">
                Resources
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {resourceKeys.map((key) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {resourceLabels[key]}
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">{resources[key]}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel className="p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">
                  Drone actions
                </p>
                <h3 className="mt-3 text-2xl font-black uppercase text-white">
                  Crash perimeter operations
                </h3>
              </div>
              <span className="text-sm text-slate-400">Energy is consumed by active sorties.</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {droneActions.map((action) => (
                <button
                  key={action.id}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-cyan-200/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  disabled={!canAfford(resources, action.effects)}
                  onClick={() => onRunDroneAction(action)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-black uppercase text-white">{action.label}</h4>
                    <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                      {formatEffects(action.effects)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{action.description}</p>
                </button>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">
                Nearby exploration site
              </p>
              <h3 className="mt-4 text-2xl font-black uppercase text-white">
                Broken Satellite Relay
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                A collapsed uplink tower still pulses beyond the ridge. Scouting raises signal
                clarity and unlocks fragments of the old-world map.
              </p>
              <div className="mt-5">
                <StatusBar label="Signal clarity" value={siteProgress} color="cyan" />
              </div>
            </Panel>

            <Panel className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">
                Mission log
              </p>
              <div className="mt-5 space-y-3">
                {activityLog.map((entry) => (
                  <div
                    key={entry}
                    className="border-l border-cyan-200/40 bg-cyan-300/5 px-4 py-2 text-sm text-slate-300"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "orange";
}) {
  const safeValue = Math.max(0, Math.min(value, 100));
  const barColor = color === "cyan" ? "bg-cyan-300" : "bg-orange-300";

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barColor} shadow-[0_0_18px_rgba(78,199,255,0.5)]`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function formatEffects(effects: Partial<ResourceMap>) {
  return Object.entries(effects)
    .map(([key, value]) => {
      const sign = value && value > 0 ? "+" : "";
      return `${sign}${value} ${resourceLabels[key as ResourceKey][0]}`;
    })
    .join(" / ");
}
