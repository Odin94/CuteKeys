import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/stats'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentEntryId?: string
}

export function Leaderboard({ entries, currentEntryId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-[#8D6E63]">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>No runs yet — this is your first!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.slice(0, 10).map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
            entry.id === currentEntryId
              ? 'bg-[#FFF1F2] border-2 border-[#F43F5E]'
              : 'bg-white border border-[#F5E6D8]'
          }`}
        >
          <span className="text-lg w-7 text-center">
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#3E2723]">
              {new Date(entry.date).toLocaleDateString()}
            </p>
            <p className="text-xs text-[#8D6E63]">{Math.round(entry.accuracy * 100)}% accuracy</p>
          </div>
          <div className="font-display font-black text-lg text-[#F43F5E]">
            {entry.score.toLocaleString()}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
