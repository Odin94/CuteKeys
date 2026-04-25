import { motion } from "motion/react";
import type { KeyCombo } from "@/types/hotkey";
import { toDisplayString } from "@/lib/hotkey-utils";

type HotkeyDisplayProps = {
  combo: KeyCombo;
  variant?: "reveal" | "hint";
  /** Optional preceding chord steps. Rendered before the main combo with " then " separators. */
  prefix?: KeyCombo[];
  /** Index of the current step the user is on (0 = first prefix step). */
  activeStep?: number;
};

const ComboParts = ({
  combo,
  variant,
  active,
}: {
  combo: KeyCombo;
  variant: "reveal" | "hint";
  active: boolean;
}) => {
  const parts = toDisplayString(combo).split("+");
  return (
    <span className="flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          <kbd
            className={`
              font-mono font-semibold px-3 py-2 rounded-xl border-2 text-sm shadow-sm transition-opacity
              ${
                variant === "reveal"
                  ? "bg-white dark:bg-[#3A3550] border-[#F43F5E] text-[#F43F5E] shadow-[#F43F5E]/20"
                  : "bg-[#FFF5EB] dark:bg-[#4A4560] border-[#F5E6D8] dark:border-[#5A5570] text-[#3E2723] dark:text-[#F8F8F2]"
              }
              ${active ? "" : "opacity-50"}
            `}
          >
            {part}
          </kbd>
          {i < parts.length - 1 && (
            <span className="text-[#8D6E63] dark:text-[#B0BEC5] font-bold text-lg">+</span>
          )}
        </span>
      ))}
    </span>
  );
};

export const HotkeyDisplay = ({
  combo,
  variant = "reveal",
  prefix,
  activeStep,
}: HotkeyDisplayProps) => {
  const allSteps: KeyCombo[] = [...(prefix ?? []), combo];
  const showProgress = typeof activeStep === "number" && allSteps.length > 1;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
      className="flex items-center gap-2 justify-center flex-wrap"
    >
      {allSteps.map((step, idx) => (
        <span key={idx} className="flex items-center gap-2">
          <ComboParts
            combo={step}
            variant={variant}
            active={!showProgress || idx >= (activeStep ?? 0)}
          />
          {idx < allSteps.length - 1 ? (
            <span className="text-[#8D6E63] dark:text-[#B0BEC5] text-xs uppercase tracking-wide font-semibold">
              then
            </span>
          ) : null}
        </span>
      ))}
    </motion.div>
  );
};
