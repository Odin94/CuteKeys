import { motion, AnimatePresence } from 'motion/react'

interface ActionPromptProps {
  description: string
  label: string
}

export function ActionPrompt({ description, label }: ActionPromptProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={description}
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="text-center"
      >
        <p className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-2">{label}</p>
        <h2 className="font-display font-black text-3xl text-[#3E2723] leading-tight">
          {description}
        </h2>
      </motion.div>
    </AnimatePresence>
  )
}
