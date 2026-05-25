"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BaseManagementScreen,
  type BuildingAssignments,
  type BuildingLevels,
  type ProductionLogEntry,
} from "@/components/BaseManagementScreen";
import { FactionSelection } from "@/components/FactionSelection";
import { LoginScreen } from "@/components/LoginScreen";
import { MapStartScreen } from "@/components/MapStartScreen";
import { SpecialistSelection } from "@/components/SpecialistSelection";
import { buildingDefinitions, buildingLevelRuleByLevel, startingBuildingIds, type BuildingId } from "@/lib/game/buildings";
import { calculateBuildingOutput, getWorkerDroneCountForBaseLevel } from "@/lib/game/economy";
import type { Faction, ResourceMap, Specialist, SpecialistId } from "@/lib/game-data";
import { specialists, startingResources } from "@/lib/game-data";
import { tileById } from "@/lib/tile-data";
import type { WorldHex } from "@/lib/world-map";

type Screen = "login" | "faction" | "specialists" | "crash-location" | "base" | "world-map";

type DashboardState = {
  assignments: BuildingAssignments;
  baseLevel: number;
  buildingLevels: BuildingLevels;
  productionCycle: number;
  productionLog?: ProductionLogEntry;
  resources: ResourceMap;
};

const factionResourceBonus: Record<Faction["id"], Partial<ResourceMap>> = {
  selene_directorate: {
    energy: 10,
    data: 10,
  },
  ares_compact: {
    alloy: 10,
  },
  free_orbit_coalition: {
    blueprints: 1,
  },
};

const baseBuildingLevels: BuildingLevels = {
  command_core: 1,
  foundry: 1,
  power_core: 1,
  research_lab: 1,
  drone_yard: 1,
  hydroponics: 1,
  hero_quarters: 1,
};

const dashboardStorageKey = "flare-earthfall-dashboard-v1";
const commandCoreLevelTwoCost: Partial<ResourceMap> = {
  alloy: 500,
  energy: 200,
  data: 100,
};

function createInitialDashboardState(): DashboardState {
  return {
    assignments: {},
    baseLevel: 1,
    buildingLevels: baseBuildingLevels,
    productionCycle: 0,
    resources: startingResources,
  };
}

function loadStoredDashboardState() {
  if (typeof window === "undefined") {
    return createInitialDashboardState();
  }

  const savedDashboard = window.localStorage.getItem(dashboardStorageKey);

  if (!savedDashboard) {
    return createInitialDashboardState();
  }

  try {
    return JSON.parse(savedDashboard) as DashboardState;
  } catch {
    window.localStorage.removeItem(dashboardStorageKey);
    return createInitialDashboardState();
  }
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("login");
  const [commanderName, setCommanderName] = useState("");
  const [selectedCrashSite, setSelectedCrashSite] = useState<WorldHex>();
  const [selectedFaction, setSelectedFaction] = useState<Faction>();
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<SpecialistId[]>([]);
  const [dashboard, setDashboard] = useState<DashboardState>(loadStoredDashboardState);

  const selectedSpecialists = useMemo(
    () => specialists.filter((specialist) => selectedSpecialistIds.includes(specialist.id)),
    [selectedSpecialistIds],
  );

  useEffect(() => {
    if (screen === "base" || screen === "world-map") {
      window.localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboard));
    }
  }, [dashboard, screen]);

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

    setSelectedCrashSite({
      ...site,
      terrain: "crash_site",
      isCoast: false,
      isFlareGate: false,
      resourceHint: tileById.crash_site.purpose,
      danger: tileById.crash_site.riskLevel,
    });
    setDashboard({
      assignments: {},
      baseLevel: 1,
      buildingLevels: baseBuildingLevels,
      productionCycle: 0,
      productionLog: {
        cycle: 0,
        lines: ["Starter base built instantly. Assign drones and specialists, then run production."],
      },
      resources: applyFactionBonus(selectedFaction),
    });
    setScreen("base");
  }

  function addDrone(buildingId: BuildingId) {
    setDashboard((current) => {
      const assignedDrones = Object.values(current.assignments).reduce(
        (total, assignment) => total + (assignment?.droneCount ?? 0),
        0,
      );
      const availableDrones = getWorkerDroneCountForBaseLevel(current.baseLevel) - assignedDrones;
      const buildingLevel = current.buildingLevels[buildingId] ?? 1;
      const maxSlots = buildingLevelRuleByLevel[buildingLevel].droneSlots;
      const currentAssignment = current.assignments[buildingId] ?? { droneCount: 0 };

      if (availableDrones <= 0 || currentAssignment.droneCount >= maxSlots) {
        return current;
      }

      return {
        ...current,
        assignments: {
          ...current.assignments,
          [buildingId]: {
            ...currentAssignment,
            droneCount: currentAssignment.droneCount + 1,
          },
        },
      };
    });
  }

  function removeDrone(buildingId: BuildingId) {
    setDashboard((current) => {
      const currentAssignment = current.assignments[buildingId] ?? { droneCount: 0 };

      if (currentAssignment.droneCount <= 0) {
        return current;
      }

      return {
        ...current,
        assignments: {
          ...current.assignments,
          [buildingId]: {
            ...currentAssignment,
            droneCount: currentAssignment.droneCount - 1,
          },
        },
      };
    });
  }

  function assignSpecialist(buildingId: BuildingId, specialistId?: SpecialistId) {
    setDashboard((current) => {
      const nextAssignments = { ...current.assignments };

      Object.entries(nextAssignments).forEach(([assignedBuildingId, assignment]) => {
        if (assignment?.specialistId === specialistId && assignedBuildingId !== buildingId) {
          nextAssignments[assignedBuildingId as BuildingId] = {
            ...assignment,
            specialistId: undefined,
          };
        }
      });

      nextAssignments[buildingId] = {
        droneCount: nextAssignments[buildingId]?.droneCount ?? 0,
        specialistId,
      };

      return {
        ...current,
        assignments: nextAssignments,
      };
    });
  }

  function runProductionCycle() {
    setDashboard((current) => {
      const nextResources = { ...current.resources };
      const lines: string[] = [];

      buildingDefinitions.forEach((building) => {
        if (
          building.unlocksAtBaseLevel > current.baseLevel ||
          !startingBuildingIds.includes(building.id) ||
          !building.baseOutputPerHour
        ) {
          return;
        }

        const assignment = current.assignments[building.id];
        const output = calculateBuildingOutput({
          buildingId: building.id,
          buildingLevel: current.buildingLevels[building.id] ?? 1,
          baseOutputPerHour: building.baseOutputPerHour,
          assignedWorkerDrones: assignment?.droneCount ?? 0,
          assignedSpecialistId: assignment?.specialistId,
        });

        Object.entries(output).forEach(([resourceId, amount]) => {
          const key = resourceId as keyof ResourceMap;
          nextResources[key] += amount ?? 0;

          if (amount) {
            lines.push(`${building.displayName}: +${amount} ${resourceId}`);
          }
        });
      });

      const nextCycle = current.productionCycle + 1;

      return {
        ...current,
        productionCycle: nextCycle,
        productionLog: {
          cycle: nextCycle,
          lines: lines.length ? lines : ["No passive production buildings are active."],
        },
        resources: nextResources,
      };
    });
  }

  function upgradeCommandCore() {
    setDashboard((current) => {
      if ((current.buildingLevels.command_core ?? 1) >= 2) {
        return current;
      }

      if (
        current.resources.alloy < (commandCoreLevelTwoCost.alloy ?? 0) ||
        current.resources.energy < (commandCoreLevelTwoCost.energy ?? 0) ||
        current.resources.data < (commandCoreLevelTwoCost.data ?? 0)
      ) {
        return current;
      }

      return {
        ...current,
        baseLevel: 2,
        buildingLevels: {
          ...current.buildingLevels,
          command_core: 2,
        },
        productionLog: {
          cycle: current.productionCycle,
          lines: ["Command Core upgraded to Level 2. +2 Worker Drones are now available."],
        },
        resources: {
          ...current.resources,
          alloy: current.resources.alloy - (commandCoreLevelTwoCost.alloy ?? 0),
          energy: current.resources.energy - (commandCoreLevelTwoCost.energy ?? 0),
          data: current.resources.data - (commandCoreLevelTwoCost.data ?? 0),
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
    setDashboard(createInitialDashboardState());
    window.localStorage.removeItem(dashboardStorageKey);
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

  if (screen === "world-map" && selectedCrashSite) {
    return (
      <MapStartScreen
        existingBaseSite={selectedCrashSite}
        onBackToBase={() => setScreen("base")}
      />
    );
  }

  if (!selectedFaction || !selectedCrashSite) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <BaseManagementScreen
      commanderName={commanderName || "Commander"}
      assignments={dashboard.assignments}
      baseLevel={dashboard.baseLevel}
      buildingLevels={dashboard.buildingLevels}
      crashSite={selectedCrashSite}
      factionBonus={selectedFaction.bonus}
      factionName={selectedFaction.name}
      onAddDrone={addDrone}
      onAssignSpecialist={assignSpecialist}
      onOpenMap={() => setScreen("world-map")}
      onRemoveDrone={removeDrone}
      onReset={resetFtue}
      onRunProduction={runProductionCycle}
      onUpgradeCommandCore={upgradeCommandCore}
      productionLog={dashboard.productionLog}
      resources={dashboard.resources}
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
