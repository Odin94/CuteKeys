import { motion } from 'motion/react'
import type { KeyCombo } from '@/types/hotkey'
import { toDisplayString } from '@/lib/hotkey-utils'

type HotkeyDisplayProps = {
  combo: KeyCombo
  variant?: 'reveal' | 'hint'
}

export const HotkeyDisplay = ({ combo, variant = 'reveal' }: HotkeyDisplayProps) => {
  const parts = toDisplayString(combo).split('+')

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
      className="flex items-center gap-1 justify-center flex-wrap"
    >
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          <kbd
            className={`
              font-mono font-semibold px-3 py-2 rounded-xl border-2 text-sm shadow-sm
              ${variant === 'reveal'
                ? 'bg-white dark:bg-[#3A3550] border-[#F43F5E] text-[#F43F5E] shadow-[#F43F5E]/20'
                : 'bg-[#FFF5EB] dark:bg-[#4A4560] border-[#F5E6D8] dark:border-[#5A5570] text-[#3E2723] dark:text-[#F8F8F2]'
              }
            `}
          >
            {part}
          </kbd>
          {i < parts.length - 1 && (
            <span className="text-[#8D6E63] dark:text-[#B0BEC5] font-bold text-lg">+</span>
          )}
        </span>
      ))}
    </motion.div>
  )
}
