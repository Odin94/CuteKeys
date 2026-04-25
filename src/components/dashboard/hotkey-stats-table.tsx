import { motion } from "motion/react";
import { EyeOff, Eye } from "lucide-react";
import type { HotkeyEntry } from "@/types/hotkey";
import type { HotkeyPerformance } from "@/types/stats";
import { chordToDisplayString, getChordSteps } from "@/lib/hotkey-utils";
import { Button } from "@/components/ui/button";

type HotkeyStatsTableProps = {
  hotkeys: HotkeyEntry[];
  performance: Record<string, HotkeyPerformance>;
  onToggleExclude: (hotkeyId: string) => void;
};

export const HotkeyStatsTable = ({
  hotkeys,
  performance,
  onToggleExclude,
}: HotkeyStatsTableProps) => (
  <div className="flex flex-col gap-2">
    {hotkeys.map((hotkey, i) => {
      const perf = performance[hotkey.id];
      const accuracy = perf
        ? perf.totalAttempts > 0
          ? perf.correctAttempts / perf.totalAttempts
          : null
        : null;
      const excluded = perf?.excluded ?? false;

      return (
        <motion.div
          key={hotkey.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            excluded
              ? "opacity-50 bg-[#F5E6D8]/40 dark:bg-[#5A5570]/20 border-[#F5E6D8] dark:border-[#5A5570]"
              : "bg-white dark:bg-[#3A3550] border-[#F5E6D8] dark:border-[#5A5570]"
          }`}
        >
          <div
            className="w-2 h-10 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                accuracy === null
                  ? "#F5E6D8"
                  : accuracy >= 0.8
                    ? "#22C55E"
                    : accuracy >= 0.5
                      ? "#FB923C"
                      : "#F43F5E",
            }}
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] text-sm">
              {hotkey.label}
            </p>
            <kbd className="font-mono text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
              {chordToDisplayString(getChordSteps(hotkey))}
            </kbd>
          </div>

          <div className="text-right text-sm min-w-[80px]">
            {perf && perf.totalAttempts > 0 ? (
              <>
                <p className="font-bold text-[#3E2723] dark:text-[#F8F8F2]">
                  {Math.round((accuracy ?? 0) * 100)}%
                </p>
                <p className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                  {perf.totalAttempts} tries
                </p>
              </>
            ) : (
              <p className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">No data</p>
            )}
          </div>

          {perf && perf.avgResponseTimeMs > 0 && (
            <div className="text-right text-sm min-w-[50px]">
              <p className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                {(perf.avgResponseTimeMs / 1000).toFixed(1)}s
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleExclude(hotkey.id)}
            className="h-8 w-8 rounded-lg flex-shrink-0"
            title={excluded ? "Include this hotkey" : "Exclude from practice"}
          >
            {excluded ? (
              <Eye className="h-4 w-4 text-[#8D6E63] dark:text-[#B0BEC5]" />
            ) : (
              <EyeOff className="h-4 w-4 text-[#8D6E63] dark:text-[#B0BEC5]" />
            )}
          </Button>
        </motion.div>
      );
    })}
  </div>
);
