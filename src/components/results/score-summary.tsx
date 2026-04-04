import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect } from 'react'
import { Target, Zap, Flame } from 'lucide-react'
import type { TrainingSessionState } from '@/types/session'

interface ScoreSummaryProps {
  session: TrainingSessionState
}

export function ScoreSummary({ session }: ScoreSummaryProps) {
  const correct = session.attempts.filter((a) => a.correct).length
  const accuracy = session.attempts.length > 0 ? correct / session.attempts.length : 0
  const avgTime =
    session.attempts.filter((a) => a.responseTimeMs !== null).reduce((s, a) => s + (a.responseTimeMs ?? 0), 0) /
    Math.max(1, session.attempts.filter((a) => a.responseTimeMs !== null).length)

  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    const controls = animate(count, session.score, { duration: 1.8, ease: 'easeOut' })
    return controls.stop
  }, [session.score, count])

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="text-6xl mb-3"
      >
        {accuracy >= 0.8 ? '🏆' : accuracy >= 0.5 ? '⭐' : '💪'}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display font-black text-6xl text-[#F43F5E] mb-1"
      >
        <motion.span>{rounded}</motion.span>
      </motion.div>
      <p className="text-[#8D6E63] font-semibold mb-6">points</p>

      <div className="grid grid-cols-3 gap-4">
        <Stat icon={<Target className="h-5 w-5 text-[#8B5CF6]" />} label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
        <Stat icon={<Zap className="h-5 w-5 text-[#FB923C]" />} label="Avg. Speed" value={`${(avgTime / 1000).toFixed(1)}s`} />
        <Stat icon={<Flame className="h-5 w-5 text-[#F43F5E]" />} label="Best Streak" value={`${session.bestStreak}x`} />
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[#FFF5EB] rounded-xl p-3"
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="font-display font-bold text-lg text-[#3E2723]">{value}</div>
      <div className="text-xs text-[#8D6E63]">{label}</div>
    </motion.div>
  )
}
