import { storageDataSchema } from "@/types/schemas";
import type {
  StorageData,
  AppStats,
  HotkeyPerformance,
  LeaderboardEntry,
  ChallengeRun,
} from "@/types/stats";
import type { HotkeyAttempt } from "@/types/session";
import type { AppHotkeyOverrides } from "@/types/hotkey";

const STORAGE_KEY = "cutekey-data";
const MAX_LEADERBOARD = 20;

const ADJECTIVES = [
  "Cozy",
  "Plucky",
  "Snappy",
  "Mellow",
  "Zippy",
  "Sunny",
  "Breezy",
  "Witty",
  "Gentle",
  "Bouncy",
];
const ANIMALS = [
  "Otter",
  "Penguin",
  "Fox",
  "Capybara",
  "Hedgehog",
  "Quokka",
  "Axolotl",
  "Narwhal",
  "Lemur",
  "Moth",
];

function generateUserId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateUserName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${adj}${animal}${suffix}`;
}

export function defaultStorage(): StorageData {
  return {
    version: 2,
    stats: {},
    settings: {
      countdownSeconds: 3,
      soundEnabled: true,
      modifierDisplay: "auto",
      userId: generateUserId(),
      userName: generateUserName(),
    },
    hotkeyOverrides: {},
  };
}

function defaultAppStats(): AppStats {
  return { hotkeyPerformance: {}, leaderboard: [], challengeRuns: [] };
}

function normalizeStorageData(data: ReturnType<typeof storageDataSchema.parse>): StorageData {
  // Backfill identity for users who were on a pre-leaderboard storage version.
  const settings = {
    ...data.settings,
    userId: data.settings.userId || generateUserId(),
    userName: data.settings.userName || generateUserName(),
  };
  // Ensure every per-app stats bucket has the new challengeRuns field.
  const stats: Record<string, AppStats> = {};
  for (const [appId, app] of Object.entries(data.stats)) {
    stats[appId] = {
      hotkeyPerformance: app.hotkeyPerformance,
      leaderboard: app.leaderboard,
      challengeRuns: app.challengeRuns ?? [],
    };
  }
  return {
    version: 2,
    stats,
    settings,
    hotkeyOverrides: data.hotkeyOverrides ?? {},
  };
}

export function loadStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw);
    const result = storageDataSchema.safeParse(parsed);
    if (result.success) return normalizeStorageData(result.data);
    return defaultStorage();
  } catch {
    return defaultStorage();
  }
}

export function saveStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAppStats(appId: string): AppStats {
  const data = loadStorage();
  return data.stats[appId] ?? defaultAppStats();
}

export function addChallengeRun(appId: string, run: ChallengeRun): void {
  const data = loadStorage();
  if (!data.stats[appId]) {
    data.stats[appId] = defaultAppStats();
  }
  data.stats[appId].challengeRuns.push(run);
  // Keep newest first; clients sort however they like.
  data.stats[appId].challengeRuns.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  saveStorage(data);
}

export function getChallengeRuns(appId: string): ChallengeRun[] {
  return getAppStats(appId).challengeRuns;
}

/** The user's personal-best run for this app — the canonical "overall score". */
export function getBestChallengeRun(appId: string, userId?: string): ChallengeRun | null {
  const runs = getChallengeRuns(appId).filter((r) => (userId ? r.userId === userId : true));
  if (runs.length === 0) return null;
  return runs.reduce((best, r) => (r.score > best.score ? r : best));
}

export function updatePerformance(appId: string, attempts: HotkeyAttempt[]): void {
  const data = loadStorage();
  if (!data.stats[appId]) {
    data.stats[appId] = defaultAppStats();
  }
  const perf = data.stats[appId].hotkeyPerformance;

  for (const attempt of attempts) {
    const existing: HotkeyPerformance = perf[attempt.hotkeyId] ?? {
      hotkeyId: attempt.hotkeyId,
      totalAttempts: 0,
      correctAttempts: 0,
      avgResponseTimeMs: 0,
      bestResponseTimeMs: Infinity,
      excluded: false,
      lastPracticed: new Date().toISOString(),
    };

    existing.totalAttempts++;
    if (attempt.correct) {
      existing.correctAttempts++;
      const rt = attempt.responseTimeMs ?? 0;
      existing.avgResponseTimeMs =
        (existing.avgResponseTimeMs * (existing.correctAttempts - 1) + rt) /
        existing.correctAttempts;
      if (rt < existing.bestResponseTimeMs) existing.bestResponseTimeMs = rt;
    }
    existing.lastPracticed = new Date().toISOString();
    if (existing.bestResponseTimeMs === Infinity) existing.bestResponseTimeMs = 0;
    perf[attempt.hotkeyId] = existing;
  }

  saveStorage(data);
}

export function addLeaderboardEntry(appId: string, entry: LeaderboardEntry): void {
  const data = loadStorage();
  if (!data.stats[appId]) {
    data.stats[appId] = defaultAppStats();
  }
  const lb = data.stats[appId].leaderboard;
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  data.stats[appId].leaderboard = lb.slice(0, MAX_LEADERBOARD);
  saveStorage(data);
}

export function toggleExcludeHotkey(appId: string, hotkeyId: string): void {
  const data = loadStorage();
  if (!data.stats[appId]) {
    data.stats[appId] = defaultAppStats();
  }
  const perf = data.stats[appId].hotkeyPerformance;
  if (perf[hotkeyId]) {
    perf[hotkeyId].excluded = !perf[hotkeyId].excluded;
  } else {
    perf[hotkeyId] = {
      hotkeyId,
      totalAttempts: 0,
      correctAttempts: 0,
      avgResponseTimeMs: 0,
      bestResponseTimeMs: 0,
      excluded: true,
      lastPracticed: new Date().toISOString(),
    };
  }
  saveStorage(data);
}

export function getSettings() {
  return loadStorage().settings;
}

export function getCurrentUser(): { userId: string; userName: string } {
  const settings = getSettings();
  return { userId: settings.userId, userName: settings.userName };
}

export function getHotkeyOverrides(appId: string): AppHotkeyOverrides {
  return loadStorage().hotkeyOverrides[appId] ?? {};
}

export function saveHotkeyOverrides(appId: string, overrides: AppHotkeyOverrides): void {
  const data = loadStorage();
  data.hotkeyOverrides[appId] = overrides;
  saveStorage(data);
}

export function saveSettings(settings: StorageData["settings"]): void {
  const data = loadStorage();
  data.settings = settings;
  saveStorage(data);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
