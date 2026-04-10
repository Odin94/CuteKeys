import type { HotkeyEntry, KeyCombo } from './hotkey'

export type TrainingPhase =
  | 'prompt'   // Countdown running, waiting for keypress
  | 'success'  // Correct keypress, celebration playing
  | 'timeout'  // Timer expired, showing correct key, waiting for user to press it
  | 'timeoutSuccess' // Correct keypress after timeout, showing success message before advancing
  | 'reveal'   // Showing after-screenshot before advancing
  | 'skipped'  // Showing a neutral skip message before advancing
  | 'finished' // Session complete

export interface HotkeyAttempt {
  hotkeyId: string
  correct: boolean
  responseTimeMs: number | null // null if timeout
  pressedKeys: KeyCombo | null  // null if no press
  points: number
}

export interface TrainingSessionState {
  appId: string
  selectedSetIds: string[]
  queue: HotkeyEntry[]
  currentIndex: number
  phase: TrainingPhase
  remainingMs: number
  totalTimeMs: number
  attempts: HotkeyAttempt[]
  score: number
  streak: number
  bestStreak: number
}

export type SessionAction =
  | { type: 'START_SESSION'; appId: string; selectedSetIds: string[]; queue: HotkeyEntry[]; totalTimeMs: number }
  | { type: 'TICK'; remainingMs: number }
  | { type: 'CORRECT_PRESS'; responseTimeMs: number; pressedKeys: KeyCombo }
  | { type: 'TIMEOUT' }
  | { type: 'CORRECT_PRESS_DURING_TIMEOUT'; pressedKeys: KeyCombo }
  | { type: 'SKIP_DURING_TIMEOUT' }
  | { type: 'ADVANCE' }
