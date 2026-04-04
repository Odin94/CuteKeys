import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from '@tanstack/react-router'

type PageTransitionProps = {
  children: React.ReactNode
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const router = useRouter()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.state.location.pathname}
        style={{ opacity: 0 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
