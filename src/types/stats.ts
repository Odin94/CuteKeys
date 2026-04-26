import type { AppHotkeyOverrides } from "./hotkey";

export interface HotkeyPerformance {
  hotkeyId: string;
  totalAttempts: number;
  correctAttempts: number;
  avgResponseTimeMs: number;
  bestResponseTimeMs: number;
  excluded: boolean;
  lastPracticed: string; // ISO date
}

export interface LeaderboardEntry {
  id: string; // uuid
  date: string; // ISO date
  appId: string;
  setIds: string[];
  score: number;
  totalHotkeys: number;
  correctCount: number;
  accuracy: number; // 0-1
  avgResponseTimeMs: number;
  bestStreak: number;
}

export interface UserSettings {
  countdownSeconds: number; // Default 3
  soundEnabled: boolean;
  modifierDisplay: "auto" | "ctrl" | "cmd";
  /** Stable per-user id used to namespace leaderboard entries (designed for future cloud sync). */
  userId: string;
  /** Display name shown on the leaderboard. */
  userName: string;
}

/**
 * A single Challenge Mode run — running through every hotkey for an app once.
 * The best run becomes the user's "overall score" for that app and will be
 * sync'd to a global leaderboard in the future.
 */
export interface ChallengeRun {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO date
  appId: string;
  score: number;
  totalHotkeys: number;
  correctCount: number;
  accuracy: number; // 0-1
  avgResponseTimeMs: number;
  bestStreak: number;
  durationMs: number;
}

export interface AppStats {
  hotkeyPerformance: Record<string, HotkeyPerformance>;
  leaderboard: LeaderboardEntry[];
  /** Completed Challenge Mode runs — local for now, will sync globally in the future. */
  challengeRuns: ChallengeRun[];
}

export interface StorageData {
  version: 2;
  stats: Record<string, AppStats>;
  settings: UserSettings;
  hotkeyOverrides: Record<string, AppHotkeyOverrides>;
}
