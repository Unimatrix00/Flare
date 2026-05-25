import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type LandingScreenProps = {
  onStart: () => void;
};

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Panel intensity="strong" className="relative max-w-5xl overflow-hidden p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.5em] text-orange-200">
              Season 01 / Australia
            </p>
            <h1 className="max-w-3xl text-5xl font-black uppercase tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
              FLARE:
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-orange-200">
                Earthfall
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Reclaim Earth. Rebuild humanity. Choose your future.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="mb-8 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Crash telemetry</span>
                <span className="text-orange-200">unstable</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Orbital contact</span>
                <span className="text-red-200">lost</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Surface grid</span>
                <span className="text-cyan-200">partial</span>
              </div>
            </div>
            <GameButton onClick={onStart} className="w-full">
              Start Prototype
            </GameButton>
          </div>
        </div>
      </Panel>
    </main>
  );
}
