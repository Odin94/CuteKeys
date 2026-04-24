import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";

type ScoreDisplayProps = {
  score: number;
  streak: number;
};

export const ScoreDisplay = ({ score, streak }: ScoreDisplayProps) => (
  <div className="flex items-center gap-4">
    <motion.div
      key={score}
      initial={{ scale: 1.3 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="font-display font-black text-2xl text-[#3E2723] dark:text-[#F8F8F2]"
    >
      {score.toLocaleString()}
    </motion.div>

    <AnimatePresence>
      {streak >= 2 && (
        <motion.div
          key={streak}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex items-center gap-1 bg-[#FFF7ED] dark:bg-[#4A3E30] border border-[#FB923C]/30 rounded-full px-2 py-0.5"
        >
          <Flame className="h-3.5 w-3.5 text-[#FB923C]" />
          <span className="text-xs font-bold text-[#FB923C]">{streak}x</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
