import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'

export const Header = () => (
  <header className="sticky top-0 z-50 border-b border-[#F5E6D8] dark:border-[#5A5570] bg-[#FFFBF5]/90 dark:bg-[#433E56]/90 backdrop-blur-sm">
    <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 0.4 }}
          className="text-2xl"
        >
          ⌨️
        </motion.div>
        <span className="font-display font-black text-xl text-[#F43F5E] dark:text-[#FFB8D1]">CuteKey</span>
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-xl text-[#8D6E63] dark:text-[#B0BEC5] hover:text-[#3E2723] dark:hover:text-[#F8F8F2] hover:bg-[#FFF5EB] dark:hover:bg-[#4A4560] cursor-pointer">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </header>
)
