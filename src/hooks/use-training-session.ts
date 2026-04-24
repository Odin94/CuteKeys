import { useReducer, useCallback } from "react";
import type { HotkeyEntry, KeyCombo } from "@/types/hotkey";
import type { TrainingSessionState, SessionAction, HotkeyAttempt } from "@/types/session";
import { calculatePoints } from "@/lib/scoring";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const initialState: TrainingSessionState = {
  appId: "",
  selectedSetIds: [],
  queue: [],
  currentIndex: 0,
  phase: "prompt",
  remainingMs: 3000,
  totalTimeMs: 3000,
  attempts: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
};

function sessionReducer(state: TrainingSessionState, action: SessionAction): TrainingSessionState {
  switch (action.type) {
    case "START_SESSION": {
      return {
        ...initialState,
        appId: action.appId,
        selectedSetIds: action.selectedSetIds,
        queue: shuffle(action.queue),
        currentIndex: 0,
        phase: "prompt",
        remainingMs: action.totalTimeMs,
        totalTimeMs: action.totalTimeMs,
      };
    }

    case "TICK": {
      return { ...state, remainingMs: action.remainingMs };
    }

    case "CORRECT_PRESS": {
      const points = calculatePoints(action.responseTimeMs, state.totalTimeMs, state.streak);
      const attempt: HotkeyAttempt = {
        hotkeyId: state.queue[state.currentIndex].id,
        correct: true,
        responseTimeMs: action.responseTimeMs,
        pressedKeys: action.pressedKeys,
        points,
      };
      const newStreak = state.streak + 1;
      return {
        ...state,
        phase: "success",
        attempts: [...state.attempts, attempt],
        score: state.score + points,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
      };
    }

    case "TIMEOUT": {
      return {
        ...state,
        phase: "timeout",
        streak: 0,
      };
    }

    case "CORRECT_PRESS_DURING_TIMEOUT": {
      const attempt: HotkeyAttempt = {
        hotkeyId: state.queue[state.currentIndex].id,
        correct: false,
        responseTimeMs: null,
        pressedKeys: action.pressedKeys,
        points: 0,
      };
      return {
        ...state,
        phase: "timeoutSuccess",
        attempts: state.attempts.some((a) => a.hotkeyId === state.queue[state.currentIndex].id)
          ? state.attempts
          : [...state.attempts, attempt],
      };
    }

    case "SKIP_DURING_TIMEOUT": {
      const attempt: HotkeyAttempt = {
        hotkeyId: state.queue[state.currentIndex].id,
        correct: false,
        responseTimeMs: null,
        pressedKeys: null,
        points: 0,
      };
      return {
        ...state,
        phase: "skipped",
        attempts: state.attempts.some((a) => a.hotkeyId === state.queue[state.currentIndex].id)
          ? state.attempts
          : [...state.attempts, attempt],
      };
    }

    case "ADVANCE": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        return { ...state, phase: "finished" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        phase: "prompt",
        remainingMs: state.totalTimeMs,
      };
    }

    default:
      return state;
  }
}

export function useTrainingSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const startSession = useCallback(
    (appId: string, selectedSetIds: string[], hotkeys: HotkeyEntry[], countdownSeconds: number) => {
      // Deduplicate by id
      const seen = new Set<string>();
      const queue = hotkeys.filter((h) => {
        if (seen.has(h.id)) return false;
        seen.add(h.id);
        return true;
      });
      dispatch({
        type: "START_SESSION",
        appId,
        selectedSetIds,
        queue,
        totalTimeMs: countdownSeconds * 1000,
      });
    },
    [],
  );

  const handleCorrectPress = useCallback((responseTimeMs: number, pressedKeys: KeyCombo) => {
    dispatch({ type: "CORRECT_PRESS", responseTimeMs, pressedKeys });
  }, []);

  const handleTimeout = useCallback(() => {
    dispatch({ type: "TIMEOUT" });
  }, []);

  const handleCorrectPressDuringTimeout = useCallback((pressedKeys: KeyCombo) => {
    dispatch({ type: "CORRECT_PRESS_DURING_TIMEOUT", pressedKeys });
  }, []);

  const handleSkipDuringTimeout = useCallback(() => {
    dispatch({ type: "SKIP_DURING_TIMEOUT" });
  }, []);

  const advance = useCallback(() => {
    dispatch({ type: "ADVANCE" });
  }, []);

  return {
    state,
    startSession,
    handleCorrectPress,
    handleTimeout,
    handleCorrectPressDuringTimeout,
    handleSkipDuringTimeout,
    advance,
  };
}
