import { useState, useCallback } from 'react'
import { getAppStats, toggleExcludeHotkey, updatePerformance } from '@/lib/storage'
import type { AppStats } from '@/types/stats'
import type { HotkeyAttempt } from '@/types/session'

export function useStats(appId: string) {
  const [stats, setStats] = useState<AppStats>(() => getAppStats(appId))

  const refresh = useCallback(() => {
    setStats(getAppStats(appId))
  }, [appId])

  const saveAttempts = useCallback(
    (attempts: HotkeyAttempt[]) => {
      updatePerformance(appId, attempts)
      refresh()
    },
    [appId, refresh]
  )

  const toggleExclude = useCallback(
    (hotkeyId: string) => {
      toggleExcludeHotkey(appId, hotkeyId)
      refresh()
    },
    [appId, refresh]
  )

  return { stats, saveAttempts, toggleExclude, refresh }
}
