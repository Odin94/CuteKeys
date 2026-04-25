import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Settings2, Sparkles, TriangleAlert } from "lucide-react";
import type { HotkeySet, HotkeySetOverrides } from "@/types/hotkey";
import { chordToDisplayString, getChordSteps } from "@/lib/hotkey-utils";
import { chordHasBrowserReserved } from "@/lib/browser-shortcuts";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { HotkeySetSettingsDialog } from "./hotkey-set-settings-dialog";
import { applyOverridesToSet } from "@/lib/hotkey-overrides";

type HotkeySetCardProps = {
  set: HotkeySet;
  overrides?: HotkeySetOverrides;
  selected: boolean;
  onToggle: () => void;
  onSaveOverrides: (overrides: HotkeySetOverrides) => void;
  accentColor: string;
  trainableHotkeyCount: number;
  hasOverrides: boolean;
  index?: number;
};

export const HotkeySetCard = ({
  set,
  overrides,
  selected,
  onToggle,
  onSaveOverrides,
  accentColor,
  trainableHotkeyCount,
  hasOverrides,
  index = 0,
}: HotkeySetCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displaySet = applyOverridesToSet(set, { [set.id]: overrides ?? {} });

  const reservedIds = new Set(
    displaySet.hotkeys.filter((h) => chordHasBrowserReserved(getChordSteps(h))).map((h) => h.id),
  );
  const hasConflicts = reservedIds.size > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.3, type: "spring", bounce: 0.3 }}
      >
        <motion.div
          layout
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "rounded-2xl border-2 transition-colors overflow-hidden",
            selected
              ? "border-[#F43F5E] bg-[#FFF1F2] dark:bg-[#4A3E56]"
              : "border-[#F5E6D8] dark:border-[#5A5570] bg-white dark:bg-[#3A3550]",
          )}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => e.key === "Enter" && onToggle()}
            className="w-full p-5 flex items-center gap-4 text-left cursor-pointer"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                selected ? "bg-[#F43F5E]" : "bg-[#FFF5EB] dark:bg-[#4A4560]",
              )}
              style={selected ? {} : { backgroundColor: `${accentColor}18` }}
            >
              {selected ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <span className="text-lg">{setIcon(set.icon)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-[#3E2723] dark:text-[#F8F8F2]">
                  {set.name}
                </h3>
                {hasOverrides ? (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#FFF1F2] dark:bg-[#5A425E] text-[#F43F5E] dark:text-[#FFB8D1] border border-[#F8B4C0]/60 dark:border-[#71576B]">
                    <Sparkles className="w-2.5 h-2.5" />
                    custom
                  </span>
                ) : null}
                {hasConflicts ? (
                  <span
                    title="Some hotkeys in this set may be intercepted by your browser"
                    className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#FFF5EB] dark:bg-[#4A4560] text-[#8D6E63] dark:text-[#B0BEC5] border border-[#F5E6D8] dark:border-[#5A5570]"
                  >
                    <TriangleAlert className="w-2.5 h-2.5 opacity-70" />
                    browser
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] truncate">
                {set.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsOpen(true);
                }}
                className="rounded-xl border border-[#F5E6D8] dark:border-[#5A5570] bg-white/70 dark:bg-[#413C58] p-2 text-[#8D6E63] dark:text-[#B0BEC5] hover:text-[#3E2723] dark:hover:text-[#F8F8F2] transition-colors cursor-pointer"
                aria-label={`Customize ${set.name}`}
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                {trainableHotkeyCount}/{set.hotkeys.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="text-[#8D6E63] dark:text-[#B0BEC5] hover:text-[#3E2723] dark:hover:text-[#F8F8F2] transition-colors p-1 cursor-pointer"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-[#F5E6D8] dark:border-[#5A5570] pt-3 flex flex-col gap-2">
                  {displaySet.hotkeys.map((hotkey) => {
                    const enabled = overrides?.[hotkey.id]?.enabled ?? true;

                    return (
                      <div
                        key={hotkey.id}
                        className={cn(
                          "flex items-center justify-between text-sm gap-2",
                          enabled ? "" : "opacity-55",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#8D6E63] dark:text-[#B0BEC5]">{hotkey.label}</span>
                          {!enabled ? (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#F43F5E] dark:text-[#FFB8D1]">
                              off
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {reservedIds.has(hotkey.id) ? (
                            <TriangleAlert
                              className="w-3 h-3 text-[#8D6E63] dark:text-[#B0BEC5] opacity-60"
                              aria-label="May be intercepted by browser"
                            />
                          ) : null}
                          <kbd className="font-mono text-xs px-2 py-1 rounded-lg bg-[#FFF5EB] dark:bg-[#4A4560] border border-[#F5E6D8] dark:border-[#5A5570] text-[#3E2723] dark:text-[#F8F8F2]">
                            {chordToDisplayString(getChordSteps(hotkey))}
                          </kbd>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <HotkeySetSettingsDialog
        open={settingsOpen}
        set={set}
        overrides={overrides}
        onOpenChange={setSettingsOpen}
        onSave={onSaveOverrides}
      />
    </>
  );
};

const setIcon = (icon: string): string => {
  const map: Record<string, string> = {
    Compass: "🧭",
    Search: "🔍",
    Pencil: "✏️",
    LayoutGrid: "⊞",
    PanelLeft: "▣",
    ArrowUpDown: "↕️",
  };
  return map[icon] ?? "📂";
};
