import { storageDataSchema } from '@/types/schemas'
import type { StorageData, AppStats, HotkeyPerformance, LeaderboardEntry } from '@/types/stats'
import type { HotkeyAttempt } from '@/types/session'
import type { AppHotkeyOverrides } from '@/types/hotkey'

const STORAGE_KEY = 'cutekey-data'
const MAX_LEADERBOARD = 20

export function defaultStorage(): StorageData {
  return {
    version: 2,
    stats: {},
    settings: {
      countdownSeconds: 3,
      soundEnabled: true,
      modifierDisplay: 'auto',
    },
    hotkeyOverrides: {},
  }
}

function normalizeStorageData(data: ReturnType<typeof storageDataSchema.parse>): StorageData {
  return {
    version: 2,
    stats: data.stats,
    settings: data.settings,
    hotkeyOverrides: data.hotkeyOverrides ?? {},
  }
}

export function loadStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStorage()
    const parsed = JSON.parse(raw)
    const result = storageDataSchema.safeParse(parsed)
    if (result.success) return normalizeStorageData(result.data)
    return defaultStorage()
  } catch {
    return defaultStorage()
  }
}

export function saveStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAppStats(appId: string): AppStats {
  const data = loadStorage()
  return data.stats[appId] ?? { hotkeyPerformance: {}, leaderboard: [] }
}

export function updatePerformance(appId: string, attempts: HotkeyAttempt[]): void {
  const data = loadStorage()
  if (!data.stats[appId]) {
    data.stats[appId] = { hotkeyPerformance: {}, leaderboard: [] }
  }
  const perf = data.stats[appId].hotkeyPerformance

  for (const attempt of attempts) {
    const existing: HotkeyPerformance = perf[attempt.hotkeyId] ?? {
      hotkeyId: attempt.hotkeyId,
      totalAttempts: 0,
      correctAttempts: 0,
      avgResponseTimeMs: 0,
      bestResponseTimeMs: Infinity,
      excluded: false,
      lastPracticed: new Date().toISOString(),
    }

    existing.totalAttempts++
    if (attempt.correct) {
      existing.correctAttempts++
      const rt = attempt.responseTimeMs ?? 0
      existing.avgResponseTimeMs =
        (existing.avgResponseTimeMs * (existing.correctAttempts - 1) + rt) /
        existing.correctAttempts
      if (rt < existing.bestResponseTimeMs) existing.bestResponseTimeMs = rt
    }
    existing.lastPracticed = new Date().toISOString()
    if (existing.bestResponseTimeMs === Infinity) existing.bestResponseTimeMs = 0
    perf[attempt.hotkeyId] = existing
  }

  saveStorage(data)
}

export function addLeaderboardEntry(appId: string, entry: LeaderboardEntry): void {
  const data = loadStorage()
  if (!data.stats[appId]) {
    data.stats[appId] = { hotkeyPerformance: {}, leaderboard: [] }
  }
  const lb = data.stats[appId].leaderboard
  lb.push(entry)
  lb.sort((a, b) => b.score - a.score)
  data.stats[appId].leaderboard = lb.slice(0, MAX_LEADERBOARD)
  saveStorage(data)
}

export function toggleExcludeHotkey(appId: string, hotkeyId: string): void {
  const data = loadStorage()
  if (!data.stats[appId]) {
    data.stats[appId] = { hotkeyPerformance: {}, leaderboard: [] }
  }
  const perf = data.stats[appId].hotkeyPerformance
  if (perf[hotkeyId]) {
    perf[hotkeyId].excluded = !perf[hotkeyId].excluded
  } else {
    perf[hotkeyId] = {
      hotkeyId,
      totalAttempts: 0,
      correctAttempts: 0,
      avgResponseTimeMs: 0,
      bestResponseTimeMs: 0,
      excluded: true,
      lastPracticed: new Date().toISOString(),
    }
  }
  saveStorage(data)
}

export function getSettings() {
  return loadStorage().settings
}

export function getHotkeyOverrides(appId: string): AppHotkeyOverrides {
  return loadStorage().hotkeyOverrides[appId] ?? {}
}

export function saveHotkeyOverrides(appId: string, overrides: AppHotkeyOverrides): void {
  const data = loadStorage()
  data.hotkeyOverrides[appId] = overrides
  saveStorage(data)
}

export function saveSettings(settings: StorageData['settings']): void {
  const data = loadStorage()
  data.settings = settings
  saveStorage(data)
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
