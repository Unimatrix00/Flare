"use client";

import { useMemo, useState } from "react";
import { BaseManagementScreen } from "@/components/BaseManagementScreen";
import { FactionSelection } from "@/components/FactionSelection";
import { LoginScreen } from "@/components/LoginScreen";
import { MapStartScreen } from "@/components/MapStartScreen";
import { SpecialistSelection } from "@/components/SpecialistSelection";
import type { BaseSection, ConstructionState } from "@/lib/base-data";
import type { Faction, ResourceMap, Specialist, SpecialistId } from "@/lib/game-data";
import { specialists, startingResources } from "@/lib/game-data";
import type { WorldHex } from "@/lib/world-map";

type Screen = "login" | "faction" | "specialists" | "crash-location" | "base";

const factionResourceBonus: Record<Faction["id"], Partial<ResourceMap>> = {
  "moon-faction": {
    energy: 10,
  },
  "earth-survivors": {
    food: 10,
  },
  "rebel-fleet": {
    wreckage: 10,
  },
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("login");
  const [commanderName, setCommanderName] = useState("");
  const [selectedCrashSite, setSelectedCrashSite] = useState<WorldHex>();
  const [selectedFaction, setSelectedFaction] = useState<Faction>();
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<SpecialistId[]>([]);
  const [resources, setResources] = useState<ResourceMap>(startingResources);
  const [construction, setConstruction] = useState<ConstructionState>({});

  const selectedSpecialists = useMemo(
    () => specialists.filter((specialist) => selectedSpecialistIds.includes(specialist.id)),
    [selectedSpecialistIds],
  );

  function login(name: string) {
    setCommanderName(name);
    setScreen("faction");
  }

  function toggleSpecialist(specialist: Specialist) {
    setSelectedSpecialistIds((current) => {
      if (current.includes(specialist.id)) {
        return current.filter((id) => id !== specialist.id);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, specialist.id];
    });
  }

  function buildBaseAt(site: WorldHex) {
    if (!selectedFaction || selectedSpecialistIds.length !== 3) {
      return;
    }

    setSelectedCrashSite(site);
    setResources(applyFactionBonus(selectedFaction));
    setConstruction({});
    setScreen("base");
  }

  function startConstruction(section: BaseSection) {
    setConstruction((current) => {
      if (current[section.id]) {
        return current;
      }

      return {
        ...current,
        [section.id]: {
          startedAt: Date.now(),
          durationMs: section.buildHours * 60 * 60 * 1000,
        },
      };
    });
  }

  function resetFtue() {
    setScreen("login");
    setCommanderName("");
    setSelectedCrashSite(undefined);
    setSelectedFaction(undefined);
    setSelectedSpecialistIds([]);
    setResources(startingResources);
    setConstruction({});
  }

  if (screen === "login") {
    return <LoginScreen onLogin={login} />;
  }

  if (screen === "faction") {
    return (
      <FactionSelection
        selectedFactionId={selectedFaction?.id}
        onSelect={setSelectedFaction}
        onContinue={() => setScreen("specialists")}
      />
    );
  }

  if (screen === "specialists") {
    return (
      <SpecialistSelection
        selectedSpecialistIds={selectedSpecialistIds}
        onToggle={toggleSpecialist}
        onBack={() => setScreen("faction")}
        onContinue={() => setScreen("crash-location")}
      />
    );
  }

  if (screen === "crash-location") {
    return <MapStartScreen onContinue={buildBaseAt} />;
  }

  if (!selectedFaction || !selectedCrashSite) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <BaseManagementScreen
      commanderName={commanderName || "Commander"}
      construction={construction}
      crashSite={selectedCrashSite}
      faction={selectedFaction}
      onReset={resetFtue}
      onStartConstruction={startConstruction}
      resources={resources}
      specialists={selectedSpecialists}
    />
  );
}

function applyFactionBonus(faction: Faction) {
  const nextResources = { ...startingResources };

  Object.entries(factionResourceBonus[faction.id]).forEach(([key, value]) => {
    const resourceKey = key as keyof ResourceMap;
    nextResources[resourceKey] += value ?? 0;
  });

  return nextResources;
}
