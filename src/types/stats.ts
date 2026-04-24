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
}

export interface AppStats {
  hotkeyPerformance: Record<string, HotkeyPerformance>;
  leaderboard: LeaderboardEntry[];
}

export interface StorageData {
  version: 2;
  stats: Record<string, AppStats>;
  settings: UserSettings;
  hotkeyOverrides: Record<string, AppHotkeyOverrides>;
}
