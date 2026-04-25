import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Maximize2, TriangleAlert } from "lucide-react";
import { appsById } from "@/data/apps";
import { HotkeySetCard } from "@/components/setup/hotkey-set-card";
import { Button } from "@/components/ui/button";
import { getAppStats, getHotkeyOverrides, saveHotkeyOverrides } from "@/lib/storage";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { chordHasBrowserReserved } from "@/lib/browser-shortcuts";
import { getChordSteps } from "@/lib/hotkey-utils";
import { isFocusModeSupported } from "@/hooks/use-keyboard-lock";
import { getTrainableHotkeys, setHasOverrides } from "@/lib/hotkey-overrides";
import type { HotkeySetOverrides } from "@/types/hotkey";
import { ZedKeymapImportButton } from "@/components/setup/zed-keymap-import-button";

export const SetSelectionPage = () => {
  const { appId } = useParams({ from: "/app/$appId/" });
  const app = appsById[appId]!;
  const navigate = useNavigate();
  const stats = getAppStats(appId);
  const focusModeSupported = isFocusModeSupported();
  const [overrides, setOverrides] = useState(() => getHotkeyOverrides(appId));

  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());

  const updateSetOverrides = (setId: string, nextSetOverrides: HotkeySetOverrides) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (Object.keys(nextSetOverrides).length === 0) {
        delete next[setId];
      } else {
        next[setId] = nextSetOverrides;
      }
      saveHotkeyOverrides(appId, next);
      return next;
    });
  };

  const toggleSet = (setId: string) => {
    setSelectedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) next.delete(setId);
      else next.add(setId);
      return next;
    });
  };

  const totalHotkeys = app.sets
    .filter((s) => selectedSetIds.has(s.id))
    .reduce((sum, s) => sum + getTrainableHotkeys(s, overrides, stats).length, 0);

  const anySetHasConflicts = app.sets.some((s) =>
    getTrainableHotkeys(s, overrides, stats).some((h) => chordHasBrowserReserved(getChordSteps(h))),
  );

  const startTraining = () => {
    if (totalHotkeys === 0) return;
    const sets = Array.from(selectedSetIds).join(",");
    navigate({ to: "/app/$appId/train", params: { appId }, search: { sets } });
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-[#8D6E63] dark:text-[#B0BEC5]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl text-[#3E2723] dark:text-[#F8F8F2]">
              {app.name}
            </h1>
            <p className="text-[#8D6E63] dark:text-[#B0BEC5] text-sm">
              Pick the hotkey sets you want to practice
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {appId === "zed" ? (
              <ZedKeymapImportButton
                app={app}
                currentOverrides={overrides}
                onImported={(next) => {
                  setOverrides(next);
                  saveHotkeyOverrides(appId, next);
                }}
              />
            ) : null}
            <Link to="/app/$appId/dashboard" params={{ appId }}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5]"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {anySetHasConflicts ? (
          <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              {focusModeSupported ? (
                <>
                  <span className="font-semibold">Some shortcuts are browser-reserved</span>
                  <span className="text-amber-700/80 dark:text-amber-400/80 text-xs">
                    Sets marked with <strong>browser</strong> contain hotkeys your browser may
                    intercept. Use the <Maximize2 className="inline w-3 h-3 mx-0.5" />
                    <strong>Focus mode</strong> button during training to fully capture them.
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Some shortcuts are browser-reserved</span>
                  <span className="text-amber-700/80 dark:text-amber-400/80 text-xs">
                    Sets marked with <strong>browser</strong> contain hotkeys your browser may
                    intercept. You can still practice them by pressing the modifier keys one by one,
                    then the final key (sequential input).
                  </span>
                </>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pb-28">
          {app.sets.map((set, i) => (
            <HotkeySetCard
              key={set.id}
              set={set}
              overrides={overrides[set.id]}
              selected={selectedSetIds.has(set.id)}
              onToggle={() => toggleSet(set.id)}
              onSaveOverrides={(setOverrides) => updateSetOverrides(set.id, setOverrides)}
              accentColor={app.accentColor}
              trainableHotkeyCount={getTrainableHotkeys(set, overrides, stats).length}
              hasOverrides={setHasOverrides(set, overrides)}
              index={i}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedSetIds.size > 0 ? (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <button
                onClick={startTraining}
                disabled={totalHotkeys === 0}
                className="flex items-center gap-3 bg-[#F43F5E] hover:bg-[#E11D48] disabled:bg-[#F8B4C0] disabled:shadow-none disabled:cursor-not-allowed text-white font-display font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#F43F5E]/30 transition-colors"
              >
                <Play className="h-5 w-5 fill-white" />
                Start Training
                <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">
                  {totalHotkeys} hotkeys
                </span>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};
