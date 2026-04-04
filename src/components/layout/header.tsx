import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F5E6D8] bg-[#FFFBF5]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.4 }}
            className="text-2xl"
          >
            ⌨️
          </motion.div>
          <span className="font-display font-black text-xl text-[#F43F5E]">CuteKey</span>
        </Link>

        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-xl text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#FFF5EB] cursor-pointer">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
