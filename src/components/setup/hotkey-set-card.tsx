import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import type { HotkeySet } from '@/types/hotkey'
import { toDisplayString } from '@/lib/hotkey-utils'
import { cn } from '@/lib/cn'
import { useState } from 'react'

type HotkeySetCardProps = {
  set: HotkeySet
  selected: boolean
  onToggle: () => void
  accentColor: string
  index?: number
}

export const HotkeySetCard = ({ set, selected, onToggle, accentColor, index = 0 }: HotkeySetCardProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3, type: 'spring', bounce: 0.3 }}
    >
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'rounded-2xl border-2 transition-colors overflow-hidden',
        selected
          ? 'border-[#F43F5E] bg-[#FFF1F2] dark:bg-[#4A3E56]'
          : 'border-[#F5E6D8] dark:border-[#5A5570] bg-white dark:bg-[#3A3550]'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        className="w-full p-5 flex items-center gap-4 text-left cursor-pointer"
      >
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            selected ? 'bg-[#F43F5E]' : 'bg-[#FFF5EB] dark:bg-[#4A4560]'
          )}
          style={selected ? {} : { backgroundColor: `${accentColor}18` }}
        >
          {selected ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <span className="text-lg">{setIcon(set.icon)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-[#3E2723] dark:text-[#F8F8F2]">{set.name}</h3>
          <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] truncate">{set.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {set.hotkeys.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="text-[#8D6E63] dark:text-[#B0BEC5] hover:text-[#3E2723] dark:hover:text-[#F8F8F2] transition-colors p-1"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#F5E6D8] dark:border-[#5A5570] pt-3 flex flex-col gap-2">
              {set.hotkeys.map((hotkey) => (
                <div key={hotkey.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#8D6E63] dark:text-[#B0BEC5]">{hotkey.label}</span>
                  <kbd className="font-mono text-xs px-2 py-1 rounded-lg bg-[#FFF5EB] dark:bg-[#4A4560] border border-[#F5E6D8] dark:border-[#5A5570] text-[#3E2723] dark:text-[#F8F8F2]">
                    {toDisplayString(hotkey.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </motion.div>
  )
}

const setIcon = (icon: string): string => {
  const map: Record<string, string> = {
    Compass: '🧭',
    Search: '🔍',
    Pencil: '✏️',
    LayoutGrid: '⊞',
    PanelLeft: '▣',
    ArrowUpDown: '↕️',
  }
  return map[icon] ?? '📂'
}
