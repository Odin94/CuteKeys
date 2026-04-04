import { motion } from 'motion/react'
import type { KeyCombo } from '@/types/hotkey'
import { HotkeyDisplay } from './hotkey-display'

type FailRevealProps = {
  combo: KeyCombo
}

export const FailReveal = ({ combo }: FailRevealProps) => (
  <motion.div
    initial={{ x: 0 }}
    animate={{ x: [-8, 8, -6, 6, -3, 3, 0] }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="text-center py-4"
  >
    <p className="text-[#FB923C] font-semibold mb-3">Time's up! Here's the hotkey:</p>
    <HotkeyDisplay combo={combo} variant="reveal" />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] mt-3"
    >
      Press it now to continue →
    </motion.p>
  </motion.div>
)
