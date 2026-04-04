import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { appsById } from '@/data/apps'
import { TrainingView } from '@/components/training/training-view'
import type { TrainingSessionState } from '@/types/session'
import { updatePerformance, addLeaderboardEntry } from '@/lib/storage'
import type { LeaderboardEntry } from '@/types/stats'

export const TrainPage = () => {
  const { appId } = useParams({ from: '/app/$appId/train' })
  const { sets } = useSearch({ from: '/app/$appId/train' })
  const navigate = useNavigate()
  const app = appsById[appId]!

  const selectedSetIds = sets ? sets.split(',').filter(Boolean) : app.sets.map((s) => s.id)

  const handleFinish = (state: TrainingSessionState) => {
    updatePerformance(appId, state.attempts)

    const correct = state.attempts.filter((a) => a.correct).length
    const accuracy = state.attempts.length > 0 ? correct / state.attempts.length : 0
    const avgTime =
      state.attempts.filter((a) => a.responseTimeMs !== null).reduce((s, a) => s + (a.responseTimeMs ?? 0), 0) /
      Math.max(1, state.attempts.filter((a) => a.responseTimeMs !== null).length)

    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
      appId,
      setIds: state.selectedSetIds,
      score: state.score,
      totalHotkeys: state.attempts.length,
      correctCount: correct,
      accuracy,
      avgResponseTimeMs: avgTime,
      bestStreak: state.bestStreak,
    }
    addLeaderboardEntry(appId, entry)

    navigate({
      to: '/app/$appId/results',
      params: { appId },
      state: { session: state, entryId: entry.id },
    })
  }

  return (
    <TrainingView
      app={app}
      selectedSetIds={selectedSetIds}
      onFinish={handleFinish}
    />
  )
}
