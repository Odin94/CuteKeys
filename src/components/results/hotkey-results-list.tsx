import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import type { HotkeyAttempt } from "@/types/session";
import type { HotkeyEntry } from "@/types/hotkey";
import { chordToDisplayString, getChordSteps } from "@/lib/hotkey-utils";

type HotkeyResultsListProps = {
  attempts: HotkeyAttempt[];
  hotkeys: HotkeyEntry[];
};

export const HotkeyResultsList = ({ attempts, hotkeys }: HotkeyResultsListProps) => {
  const hotkeyMap = Object.fromEntries(hotkeys.map((h) => [h.id, h]));

  return (
    <div className="flex flex-col gap-2">
      {attempts.map((attempt, i) => {
        const hotkey = hotkeyMap[attempt.hotkeyId];
        if (!hotkey) return null;

        return (
          <motion.div
            key={attempt.hotkeyId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between bg-white dark:bg-[#4A4560] rounded-xl border border-[#F5E6D8] dark:border-[#5A5570] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  attempt.correct
                    ? "bg-[#F0FDF4] dark:bg-[#2A4A3A]"
                    : "bg-[#FFF1F2] dark:bg-[#4A2A35]"
                }`}
              >
                {attempt.correct ? (
                  <Check className="h-4 w-4 text-[#22C55E]" />
                ) : (
                  <X className="h-4 w-4 text-[#F43F5E]" />
                )}
              </div>
              <div>
                <p className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] text-sm">
                  {hotkey.label}
                </p>
                <kbd className="font-mono text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                  {chordToDisplayString(getChordSteps(hotkey))}
                </kbd>
              </div>
            </div>

            <div className="text-right">
              {attempt.correct && attempt.responseTimeMs !== null ? (
                <>
                  <p className="font-bold text-[#22C55E] text-sm">+{attempt.points}</p>
                  <p className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                    {(attempt.responseTimeMs / 1000).toFixed(2)}s
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#FB923C] font-semibold">Timeout</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
