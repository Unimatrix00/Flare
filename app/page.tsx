"use client";

import { useMemo, useState } from "react";
import { ColonyDashboard } from "@/components/ColonyDashboard";
import { FactionSelection } from "@/components/FactionSelection";
import { LandingScreen } from "@/components/LandingScreen";
import { SpecialistSelection } from "@/components/SpecialistSelection";
import type {
  DroneAction,
  Faction,
  ResourceKey,
  ResourceMap,
  Specialist,
  SpecialistId,
} from "@/lib/game-data";
import { specialists, startingResources } from "@/lib/game-data";

type Screen = "landing" | "faction" | "specialists" | "dashboard";

type BaseStatus = {
  name: string;
  condition: string;
  integrity: number;
  security: number;
};

const initialBaseStatus: BaseStatus = {
  name: "Crash Camp",
  condition: "Exposed wreckage perimeter. Shelter is improvised and the dust front is moving in.",
  integrity: 38,
  security: 18,
};

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
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedFaction, setSelectedFaction] = useState<Faction>();
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<SpecialistId[]>([]);
  const [resources, setResources] = useState<ResourceMap>(startingResources);
  const [baseStatus, setBaseStatus] = useState<BaseStatus>(initialBaseStatus);
  const [siteProgress, setSiteProgress] = useState(0);
  const [activityLog, setActivityLog] = useState<string[]>([
    "Emergency beacon cycling. Awaiting command input.",
  ]);

  const selectedSpecialists = useMemo(
    () => specialists.filter((specialist) => selectedSpecialistIds.includes(specialist.id)),
    [selectedSpecialistIds],
  );

  const hasSpecialist = (id: SpecialistId) => selectedSpecialistIds.includes(id);

  const buildCost = {
    wreckage: hasSpecialist("engineer") ? 25 : 30,
    energy: 8,
  };

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

  function initializeColony() {
    if (!selectedFaction || selectedSpecialistIds.length !== 3) {
      return;
    }

    const factionBonus = factionResourceBonus[selectedFaction.id];
    const nextResources = { ...startingResources };

    Object.entries(factionBonus).forEach(([key, value]) => {
      const resourceKey = key as ResourceKey;
      nextResources[resourceKey] += value ?? 0;
    });

    setResources(nextResources);
    setBaseStatus(initialBaseStatus);
    setSiteProgress(0);
    setActivityLog([
      `${selectedFaction.name} command profile loaded.`,
      `${selectedSpecialists.map((specialist) => specialist.name).join(", ")} assigned to crash recovery.`,
    ]);
    setScreen("dashboard");
  }

  function runDroneAction(action: DroneAction) {
    const effects = applySpecialistBonuses(action);

    setResources((current) => {
      if (!canAfford(current, effects)) {
        return current;
      }

      const nextResources = { ...current };
      Object.entries(effects).forEach(([key, value]) => {
        const resourceKey = key as ResourceKey;
        nextResources[resourceKey] += value ?? 0;
      });
      return nextResources;
    });

    if (action.id === "scout") {
      setSiteProgress((current) => Math.min(100, current + 25));
      setBaseStatus((current) => ({
        ...current,
        security: Math.min(100, current.security + (hasSpecialist("soldier") ? 4 : 1)),
      }));
    }

    pushLog(`${action.label} completed: ${formatEffects(effects)}.`);
  }

  function buildStarterBase() {
    if (baseStatus.name === "Starter Base") {
      return;
    }

    setResources((current) => {
      if (current.wreckage < buildCost.wreckage || current.energy < buildCost.energy) {
        return current;
      }

      return {
        ...current,
        wreckage: current.wreckage - buildCost.wreckage,
        energy: current.energy - buildCost.energy,
      };
    });
    setBaseStatus({
      name: "Starter Base",
      condition: "A sealed habitat core, drone bay, and sensor mast are online.",
      integrity: 74,
      security: Math.min(100, baseStatus.security + 12),
    });
    pushLog("Starter Base constructed. Habitat pressure is holding.");
  }

  function resetRun() {
    setScreen("landing");
    setSelectedFaction(undefined);
    setSelectedSpecialistIds([]);
    setResources(startingResources);
    setBaseStatus(initialBaseStatus);
    setSiteProgress(0);
    setActivityLog(["Emergency beacon cycling. Awaiting command input."]);
  }

  function applySpecialistBonuses(action: DroneAction) {
    const effects = { ...action.effects };

    if (hasSpecialist("pilot") && effects.energy && effects.energy < 0) {
      effects.energy += 1;
    }

    if (action.id === "salvage" && hasSpecialist("scavenger")) {
      effects.wreckage = (effects.wreckage ?? 0) + 3;
    }

    if ((action.id === "data" || action.id === "scout") && hasSpecialist("scientist")) {
      effects.data = (effects.data ?? 0) + 2;
    }

    if (action.id === "food" && hasSpecialist("medic")) {
      effects.food = (effects.food ?? 0) + 2;
    }

    return effects;
  }

  function pushLog(entry: string) {
    setActivityLog((current) => [entry, ...current].slice(0, 5));
  }

  if (screen === "landing") {
    return <LandingScreen onStart={() => setScreen("faction")} />;
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
        onContinue={initializeColony}
      />
    );
  }

  if (!selectedFaction) {
    return <LandingScreen onStart={() => setScreen("faction")} />;
  }

  return (
    <ColonyDashboard
      faction={selectedFaction}
      specialists={selectedSpecialists}
      resources={resources}
      baseStatus={baseStatus}
      siteProgress={siteProgress}
      activityLog={activityLog}
      buildCost={buildCost}
      onRunDroneAction={runDroneAction}
      onBuildBase={buildStarterBase}
      onReset={resetRun}
    />
  );
}

function canAfford(resources: ResourceMap, effects: Partial<ResourceMap>) {
  return Object.entries(effects).every(([key, value]) => {
    const resourceKey = key as ResourceKey;
    return resources[resourceKey] + (value ?? 0) >= 0;
  });
}

function formatEffects(effects: Partial<ResourceMap>) {
  return Object.entries(effects)
    .map(([key, value]) => `${value && value > 0 ? "+" : ""}${value} ${key}`)
    .join(", ");
}
