import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowLeft, Zap } from 'lucide-react'
import { appsById } from '@/data/apps'
import { useStats } from '@/hooks/use-stats'
import { HotkeyStatsTable } from '@/components/dashboard/hotkey-stats-table'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/app/$appId/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { appId } = Route.useParams()
  const navigate = useNavigate()
  const app = appsById[appId]!
  const { stats, toggleExclude } = useStats(appId)
  const allHotkeys = app.sets.flatMap((s) => s.hotkeys)

  // Find hotkeys with <70% accuracy and at least 1 attempt
  const weakHotkeys = allHotkeys.filter((h) => {
    const p = stats.hotkeyPerformance[h.id]
    if (!p || p.totalAttempts === 0 || p.excluded) return false
    return p.correctAttempts / p.totalAttempts < 0.7
  })

  // Find which sets contain the weak hotkeys
  function practiceWeakSpots() {
    const weakIds = new Set(weakHotkeys.map((h) => h.id))
    const sets = app.sets.filter((s) => s.hotkeys.some((h) => weakIds.has(h.id)))
    const setIds = sets.map((s) => s.id).join(',')
    navigate({ to: '/app/$appId/train', params: { appId }, search: { sets: setIds } })
  }

  const totalAttempts = allHotkeys.reduce((s, h) => s + (stats.hotkeyPerformance[h.id]?.totalAttempts ?? 0), 0)
  const totalCorrect = allHotkeys.reduce((s, h) => s + (stats.hotkeyPerformance[h.id]?.correctAttempts ?? 0), 0)
  const overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/app/$appId" params={{ appId }}>
          <Button variant="ghost" size="icon" className="rounded-xl text-[#8D6E63]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-[#3E2723]">{app.name} Dashboard</h1>
          <p className="text-[#8D6E63] text-sm">Your hotkey performance</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#F5E6D8] p-4 text-center"
        >
          <p className="font-display font-bold text-2xl text-[#3E2723]">{totalAttempts}</p>
          <p className="text-xs text-[#8D6E63]">Total attempts</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-[#F5E6D8] p-4 text-center"
        >
          <p className="font-display font-bold text-2xl text-[#22C55E]">
            {overallAccuracy !== null ? `${Math.round(overallAccuracy * 100)}%` : '—'}
          </p>
          <p className="text-xs text-[#8D6E63]">Overall accuracy</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[#F5E6D8] p-4 text-center"
        >
          <p className="font-display font-bold text-2xl text-[#F43F5E]">{weakHotkeys.length}</p>
          <p className="text-xs text-[#8D6E63]">Need practice</p>
        </motion.div>
      </div>

      {/* Practice weak spots */}
      {weakHotkeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FFF1F2] border border-[#F43F5E]/20 rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-[#3E2723] text-sm">
              {weakHotkeys.length} hotkey{weakHotkeys.length > 1 ? 's' : ''} below 70% accuracy
            </p>
            <p className="text-xs text-[#8D6E63]">Focus on these to improve your score</p>
          </div>
          <button
            onClick={practiceWeakSpots}
            className="flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Zap className="h-4 w-4" />
            Practice
          </button>
        </motion.div>
      )}

      {/* Per-set breakdown */}
      {app.sets.map((set) => (
        <motion.div
          key={set.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="font-display font-bold text-[#3E2723] mb-3">{set.name}</h3>
          <HotkeyStatsTable
            hotkeys={set.hotkeys}
            performance={stats.hotkeyPerformance}
            onToggleExclude={toggleExclude}
          />
        </motion.div>
      ))}
    </div>
  )
}
