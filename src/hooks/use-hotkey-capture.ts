import { useEffect, useRef, useState } from "react";
import type { KeyCombo, ModifierKey } from "@/types/hotkey";
import { eventToKeyCombo, isBareModifier, keyCombosMatch } from "@/lib/hotkey-utils";

const STAGE_WINDOW_MS = 3000;
/** Max time a user has between steps of a multi-step chord before progress resets. */
const STEP_WINDOW_MS = 1500;

const keyToModifier = (key: string): ModifierKey | null => {
  switch (key) {
    case "Control":
      return "ctrl";
    case "Shift":
      return "shift";
    case "Alt":
      return "alt";
    case "Meta":
      return "meta";
    default:
      return null;
  }
};

type UseHotkeyCaptureOptions = {
  /** Full ordered chord. Length 1 = single combo, >1 = multi-step. Null = nothing expected. */
  expectedSteps: KeyCombo[] | null;
  enabled: boolean;
  onMatch: () => void;
  onMismatch: (pressed: KeyCombo) => void;
};

export const useHotkeyCapture = ({
  expectedSteps,
  enabled,
  onMatch,
  onMismatch,
}: UseHotkeyCaptureOptions) => {
  const lastMatchTime = useRef<number>(0);
  const [stagedModifiers, setStagedModifiers] = useState<ModifierKey[]>([]);
  const stagedRef = useRef<ModifierKey[]>([]);
  const stageTimeRef = useRef<number>(0);
  const stepIndexRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);
  const [chordStep, setChordStep] = useState<number>(0);

  // Reset chord progress when the expected chord changes.
  useEffect(() => {
    stepIndexRef.current = 0;
    setChordStep(0);
  }, [expectedSteps]);

  useEffect(() => {
    if (!enabled) {
      stagedRef.current = [];
      setStagedModifiers([]);
      stepIndexRef.current = 0;
      setChordStep(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      if (isBareModifier(e)) {
        const mod = keyToModifier(e.key);
        if (mod && !stagedRef.current.includes(mod)) {
          const next = [...stagedRef.current, mod];
          stagedRef.current = next;
          stageTimeRef.current = now;
          setStagedModifiers(next);
        }
        return;
      }

      // Clear stale staged modifiers
      if (now - stageTimeRef.current > STAGE_WINDOW_MS) {
        stagedRef.current = [];
      }

      // Debounce: ignore presses within 100ms of last match
      if (now - lastMatchTime.current < 100) {
        stagedRef.current = [];
        setStagedModifiers([]);
        return;
      }

      // Reset partial chord progress if user took too long between steps.
      if (
        stepIndexRef.current > 0 &&
        now - lastStepTimeRef.current > STEP_WINDOW_MS
      ) {
        stepIndexRef.current = 0;
        setChordStep(0);
      }

      const pressed = eventToKeyCombo(e);

      // Merge simultaneously-held modifiers with sequentially-staged modifiers.
      const effectiveMods = [...new Set([...pressed.modifiers, ...stagedRef.current])];
      const effectiveCombo: KeyCombo = { modifiers: effectiveMods, key: pressed.key };

      stagedRef.current = [];
      setStagedModifiers([]);

      const steps = expectedSteps;
      if (!steps || steps.length === 0) {
        onMismatch(pressed);
        return;
      }

      const expectedAtStep = steps[stepIndexRef.current];
      if (keyCombosMatch(effectiveCombo, expectedAtStep)) {
        const isLast = stepIndexRef.current === steps.length - 1;
        if (isLast) {
          stepIndexRef.current = 0;
          setChordStep(0);
          lastMatchTime.current = now;
          onMatch();
        } else {
          stepIndexRef.current += 1;
          lastStepTimeRef.current = now;
          setChordStep(stepIndexRef.current);
        }
      } else {
        // Mismatch — reset chord progress.
        if (stepIndexRef.current > 0) {
          stepIndexRef.current = 0;
          setChordStep(0);
        }
        onMismatch(pressed);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      stagedRef.current = [];
      setStagedModifiers([]);
    };
  }, [enabled, expectedSteps, onMatch, onMismatch]);

  return { stagedModifiers, chordStep };
};
