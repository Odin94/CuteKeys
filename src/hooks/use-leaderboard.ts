import { useState, useCallback } from 'react'
import { getAppStats, addLeaderboardEntry } from '@/lib/storage'
import type { LeaderboardEntry } from '@/types/stats'

export function useLeaderboard(appId: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    () => getAppStats(appId).leaderboard
  )

  const addEntry = useCallback(
    (entry: LeaderboardEntry) => {
      addLeaderboardEntry(appId, entry)
      setLeaderboard(getAppStats(appId).leaderboard)
    },
    [appId]
  )

  const refresh = useCallback(() => {
    setLeaderboard(getAppStats(appId).leaderboard)
  }, [appId])

  return { leaderboard, addEntry, refresh }
}
