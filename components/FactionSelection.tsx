import type { Faction, FactionId } from "@/lib/game-data";
import { factions } from "@/lib/game-data";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type FactionSelectionProps = {
  selectedFactionId?: FactionId;
  onSelect: (faction: Faction) => void;
  onContinue: () => void;
};

export function FactionSelection({
  selectedFactionId,
  onSelect,
  onContinue,
}: FactionSelectionProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-200">
          Command alignment
        </p>
        <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] text-white sm:text-6xl">
          Choose your faction
        </h2>
        <p className="mt-4 text-slate-300">
          Your survivors need doctrine before they can build a future. Pick one faction for this run.
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:auto-rows-fr lg:grid-cols-3">
        {factions.map((faction) => {
          const isSelected = faction.id === selectedFactionId;

          return (
            <button
              key={faction.id}
              onClick={() => onSelect(faction)}
              className="group flex h-full text-left"
              type="button"
            >
              <Panel
                intensity={isSelected ? "strong" : "soft"}
                className={`flex h-full w-full flex-col p-6 transition duration-200 group-hover:border-cyan-200/45 ${
                  isSelected ? "ring-2 ring-cyan-200/60" : ""
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-200">
                  {faction.signal} / {faction.origin}
                </p>
                <h3 className="mt-5 text-2xl font-black uppercase text-white">
                  {faction.name}
                </h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                  {faction.gameplayIdentity.join(" / ")}
                </p>
                <p className="mt-4 min-h-24 text-sm leading-6 text-slate-300">
                  {faction.description}
                </p>
                <div className="mt-auto min-h-36 space-y-2 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-xs font-semibold leading-5 text-cyan-100">
                  {faction.bonus.split(" / ").map((bonus) => (
                    <p key={bonus}>{bonus}</p>
                  ))}
                </div>
              </Panel>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <GameButton disabled={!selectedFactionId} onClick={onContinue}>
          Confirm faction
        </GameButton>
      </div>
    </main>
  );
}
