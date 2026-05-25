import type { Specialist, SpecialistId } from "@/lib/game-data";
import { specialists } from "@/lib/game-data";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type SpecialistSelectionProps = {
  selectedSpecialistIds: SpecialistId[];
  onToggle: (specialist: Specialist) => void;
  onBack: () => void;
  onContinue: () => void;
};

const requiredSpecialists = 3;

export function SpecialistSelection({
  selectedSpecialistIds,
  onToggle,
  onBack,
  onContinue,
}: SpecialistSelectionProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-orange-200">
            Crew manifest
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] text-white sm:text-6xl">
            Select 3 specialists
          </h2>
          <p className="mt-4 text-slate-300">
            Exactly three survivors can leave the wreck before the dust front hits.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-100">
          {selectedSpecialistIds.length}/{requiredSpecialists} locked
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {specialists.map((specialist) => {
          const isSelected = selectedSpecialistIds.includes(specialist.id);
          const isDisabled =
            !isSelected && selectedSpecialistIds.length >= requiredSpecialists;

          return (
            <button
              key={specialist.id}
              className="group text-left disabled:cursor-not-allowed"
              disabled={isDisabled}
              onClick={() => onToggle(specialist)}
              type="button"
            >
              <Panel
                intensity={isSelected ? "strong" : "soft"}
                className={`h-full p-5 transition duration-200 ${
                  isDisabled ? "opacity-45" : "group-hover:-translate-y-1 group-hover:border-orange-200/40"
                } ${isSelected ? "ring-2 ring-orange-200/50" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">
                      {specialist.role}
                    </p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-white">
                      {specialist.name}
                    </h3>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      isSelected
                        ? "border-orange-200 bg-orange-300 shadow-[0_0_18px_rgba(255,138,61,0.75)]"
                        : "border-white/20"
                    }`}
                  />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-300">
                  {specialist.bonus}
                </p>
              </Panel>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
        <GameButton variant="ghost" onClick={onBack}>
          Back
        </GameButton>
        <GameButton
          disabled={selectedSpecialistIds.length !== requiredSpecialists}
          onClick={onContinue}
        >
          Choose crash location
        </GameButton>
      </div>
    </main>
  );
}
