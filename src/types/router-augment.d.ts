import type { TrainingSessionState } from './session'

declare module '@tanstack/history' {
  interface HistoryState {
    session?: TrainingSessionState
    entryId?: string
  }
}
