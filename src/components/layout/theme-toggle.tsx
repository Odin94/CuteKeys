import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden text-[#8D6E63] dark:text-[#B0BEC5] hover:text-[#3E2723] dark:hover:text-[#F8F8F2] hover:bg-[#FFF5EB] dark:hover:bg-[#4A4560] transition-colors cursor-pointer"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ y: 16, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 1 }}
            transition={{ duration: 0.12, ease: "linear" }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -16, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 1 }}
            transition={{ duration: 0.12, ease: "linear" }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
