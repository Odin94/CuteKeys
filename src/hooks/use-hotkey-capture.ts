import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import type { RawHotkey } from "@tanstack/react-hotkeys";
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

const keyComboToTanStackHotkey = (combo: KeyCombo): RawHotkey => ({
  key: combo.key,
  mod: combo.modifiers.includes("primary"),
  ctrl: combo.modifiers.includes("ctrl"),
  shift: combo.modifiers.includes("shift"),
  alt: combo.modifiers.includes("alt"),
  meta: combo.modifiers.includes("meta"),
});

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

  const currentExpectedStep = expectedSteps?.[chordStep] ?? null;
  const tanStackHotkey = useMemo(
    () => keyComboToTanStackHotkey(currentExpectedStep ?? { modifiers: [], key: "Unidentified" }),
    [currentExpectedStep],
  );

  const resetChordProgress = useCallback(() => {
    stepIndexRef.current = 0;
    setChordStep(0);
  }, []);

  const handleMatchedStep = useCallback(
    (now: number) => {
      const steps = expectedSteps;
      if (!steps || steps.length === 0) return;

      const isLast = stepIndexRef.current === steps.length - 1;
      if (isLast) {
        resetChordProgress();
        lastMatchTime.current = now;
        onMatch();
        return;
      }

      stepIndexRef.current += 1;
      lastStepTimeRef.current = now;
      setChordStep(stepIndexRef.current);
    },
    [expectedSteps, onMatch, resetChordProgress],
  );

  // Reset chord progress when the expected chord changes.
  useEffect(() => {
    resetChordProgress();
  }, [expectedSteps, resetChordProgress]);

  useHotkey(
    tanStackHotkey,
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      if (now - lastMatchTime.current < 100) return;

      stagedRef.current = [];
      setStagedModifiers([]);
      handleMatchedStep(now);
    },
    {
      enabled: enabled && currentExpectedStep !== null,
      preventDefault: true,
      stopPropagation: true,
      ignoreInputs: false,
    },
  );

  useEffect(() => {
    if (!enabled) {
      stagedRef.current = [];
      setStagedModifiers([]);
      resetChordProgress();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      if (isBareModifier(e)) {
        e.preventDefault();
        e.stopPropagation();

        const mod = keyToModifier(e.key);
        if (mod && !stagedRef.current.includes(mod)) {
          const next = [...stagedRef.current, mod];
          stagedRef.current = next;
          stageTimeRef.current = now;
          setStagedModifiers(next);
        }
        return;
      }

      // Clear stale staged modifiers.
      if (now - stageTimeRef.current > STAGE_WINDOW_MS) {
        stagedRef.current = [];
        setStagedModifiers([]);
      }

      // Debounce: ignore presses within 100ms of last match.
      if (now - lastMatchTime.current < 100) {
        stagedRef.current = [];
        setStagedModifiers([]);
        return;
      }

      // Reset partial chord progress if user took too long between steps.
      if (stepIndexRef.current > 0 && now - lastStepTimeRef.current > STEP_WINDOW_MS) {
        resetChordProgress();
      }

      const pressed = eventToKeyCombo(e);

      // Merge simultaneously-held modifiers with sequentially-staged modifiers.
      // This lets users press e.g. Ctrl, then Shift, then T separately when the
      // browser would intercept the simultaneous Ctrl+Shift+T combo.
      const hadStagedModifiers = stagedRef.current.length > 0;
      const effectiveMods = [...new Set([...pressed.modifiers, ...stagedRef.current])];
      const effectiveCombo: KeyCombo = { modifiers: effectiveMods, key: pressed.key };

      stagedRef.current = [];
      setStagedModifiers([]);

      const steps = expectedSteps;
      if (!steps || steps.length === 0) {
        e.preventDefault();
        e.stopPropagation();
        onMismatch(pressed);
        return;
      }

      const expectedAtStep = steps[stepIndexRef.current];
      if (keyCombosMatch(effectiveCombo, expectedAtStep)) {
        if (!hadStagedModifiers) return;

        e.preventDefault();
        e.stopPropagation();
        handleMatchedStep(now);
      } else {
        e.preventDefault();
        e.stopPropagation();
        resetChordProgress();
        onMismatch(pressed);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      stagedRef.current = [];
      setStagedModifiers([]);
    };
  }, [enabled, expectedSteps, handleMatchedStep, onMismatch, resetChordProgress]);

  return { stagedModifiers, chordStep };
};
