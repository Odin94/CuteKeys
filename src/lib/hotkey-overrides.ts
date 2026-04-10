import type { AppDefinition, AppHotkeyOverrides, HotkeyEntry, HotkeySet } from '@/types/hotkey'
import type { AppStats } from '@/types/stats'

export function applyOverridesToSet(set: HotkeySet, overrides: AppHotkeyOverrides): HotkeySet {
  const setOverrides = overrides[set.id] ?? {}

  return {
    ...set,
    hotkeys: set.hotkeys.map((hotkey) => {
      const override = setOverrides[hotkey.id]
      return {
        ...hotkey,
        keys: override?.keys ?? hotkey.keys,
      }
    }),
  }
}

export function applyOverridesToApp(app: AppDefinition, overrides: AppHotkeyOverrides): AppDefinition {
  return {
    ...app,
    sets: app.sets.map((set) => applyOverridesToSet(set, overrides)),
  }
}

export function isHotkeyEnabled(
  appStats: AppStats,
  hotkeyId: string,
  override?: { enabled: boolean } | undefined
): boolean {
  if (override && !override.enabled) return false
  return !appStats.hotkeyPerformance[hotkeyId]?.excluded
}

export function getTrainableHotkeys(
  set: HotkeySet,
  overrides: AppHotkeyOverrides,
  appStats: AppStats
): HotkeyEntry[] {
  const setOverrides = overrides[set.id] ?? {}
  return set.hotkeys
    .map((hotkey) => {
      const override = setOverrides[hotkey.id]
      return {
        ...hotkey,
        keys: override?.keys ?? hotkey.keys,
      }
    })
    .filter((hotkey) => isHotkeyEnabled(appStats, hotkey.id, setOverrides[hotkey.id]))
}

export function setHasOverrides(set: HotkeySet, overrides: AppHotkeyOverrides): boolean {
  const setOverrides = overrides[set.id]
  if (!setOverrides) return false

  return set.hotkeys.some((hotkey) => {
    const override = setOverrides[hotkey.id]
    if (!override) return false
    return !override.enabled || override.keys !== null
  })
}

export function setHasEnabledBrowserReservedHotkeys(
  set: HotkeySet,
  overrides: AppHotkeyOverrides,
  appStats: AppStats,
  predicate: (hotkey: HotkeyEntry) => boolean
): boolean {
  return getTrainableHotkeys(set, overrides, appStats).some(predicate)
}
