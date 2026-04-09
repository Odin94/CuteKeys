import { motion } from 'motion/react'
import type { KeyCombo } from '@/types/hotkey'
import { HotkeyDisplay } from './hotkey-display'

type FailRevealProps = {
  combo: KeyCombo
  onSkip?: () => void
}

export const FailReveal = ({ combo, onSkip }: FailRevealProps) => (
  <motion.div
    initial={{ x: 0 }}
    animate={{ x: [-8, 8, -6, 6, -3, 3, 0] }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="text-center py-4"
  >
    <p className="text-cutekey-peach font-semibold mb-3">Time's up! Here's the hotkey:</p>
    <HotkeyDisplay combo={combo} variant="reveal" />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex items-center justify-center gap-3 mt-3"
    >
      <p className="text-sm text-cutekey-brown-muted dark:text-[#B0BEC5]">Press it now to continue →</p>
      {onSkip ? (
        <button
          onClick={onSkip}
          className="text-xs text-cutekey-brown-muted/60 dark:text-[#B0BEC5]/60 hover:text-cutekey-brown-muted dark:hover:text-[#B0BEC5] underline underline-offset-2 cursor-pointer transition-colors"
        >
          Skip
        </button>
      ) : null}
    </motion.div>
  </motion.div>
)
