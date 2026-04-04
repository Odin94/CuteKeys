import { useNavigate, useParams, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Play } from 'lucide-react'
import { appsById } from '@/data/apps'
import { HotkeySetCard } from '@/components/setup/hotkey-set-card'
import { Button } from '@/components/ui/button'
import { getAppStats } from '@/lib/storage'
import { PageWrapper } from '@/components/layout/page-wrapper'

export const SetSelectionPage = () => {
  const { appId } = useParams({ from: '/app/$appId/' })
  const app = appsById[appId]!
  const navigate = useNavigate()
  const stats = getAppStats(appId)

  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set())

  const toggleSet = (setId: string) => {
    setSelectedSetIds((prev) => {
      const next = new Set(prev)
      if (next.has(setId)) next.delete(setId)
      else next.add(setId)
      return next
    })
  }

  const totalHotkeys = app.sets
    .filter((s) => selectedSetIds.has(s.id))
    .reduce((sum, s) => {
      const active = s.hotkeys.filter((h) => !stats.hotkeyPerformance[h.id]?.excluded)
      return sum + active.length
    }, 0)

  const startTraining = () => {
    const sets = Array.from(selectedSetIds).join(',')
    navigate({ to: '/app/$appId/train', params: { appId }, search: { sets } })
  }

  return (
    <PageWrapper>
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-xl text-[#8D6E63]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-[#3E2723]">{app.name}</h1>
          <p className="text-[#8D6E63] text-sm">Pick the hotkey sets you want to practice</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to="/app/$appId/dashboard" params={{ appId }}>
            <Button variant="outline" size="sm" className="rounded-xl border-[#F5E6D8] text-[#8D6E63]">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-28">
        {app.sets.map((set) => (
          <HotkeySetCard
            key={set.id}
            set={set}
            selected={selectedSetIds.has(set.id)}
            onToggle={() => toggleSet(set.id)}
            accentColor={app.accentColor}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedSetIds.size > 0 ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={startTraining}
              className="flex items-center gap-3 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-display font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#F43F5E]/30 transition-colors"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Training
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">
                {totalHotkeys} hotkeys
              </span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </PageWrapper>
  )
}
