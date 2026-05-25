"use client";

import { useState } from "react";
import { GameButton } from "./ui/GameButton";
import { Panel } from "./ui/Panel";

type LoginScreenProps = {
  onLogin: (commanderName: string) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [commanderName, setCommanderName] = useState("");
  const normalizedName = commanderName.trim();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-orange-200">
            FLARE network
          </p>
          <h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em] text-white sm:text-7xl">
            Earthfall command
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Log in as a commander, align your faction, select three specialists, and choose the
            shore hex where the first base will be built.
          </p>
        </div>

        <Panel intensity="strong" className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200">
            Commander login
          </p>
          <label className="mt-6 block">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Commander name
            </span>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-lg font-bold text-white outline-none transition focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/20"
              maxLength={24}
              onChange={(event) => setCommanderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && normalizedName) {
                  onLogin(normalizedName);
                }
              }}
              placeholder="Commander"
              value={commanderName}
            />
          </label>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
            Prototype login is local only. Real account auth can replace this screen later.
          </div>

          <GameButton
            className="mt-6 w-full"
            disabled={!normalizedName}
            onClick={() => onLogin(normalizedName)}
          >
            Enter server
          </GameButton>
        </Panel>
      </div>
    </main>
  );
}
