import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

interface SuccessCelebrationProps {
  points: number;
  streak: number;
}

export function SuccessCelebration({ points, streak }: SuccessCelebrationProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#F43F5E", "#8B5CF6", "#22C55E", "#FB923C", "#F9A8D4"],
      ticks: 200,
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="text-center py-4"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl mb-2"
      >
        🎉
      </motion.div>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display font-black text-xl text-[#22C55E]"
      >
        {streak >= 3 ? `${streak}x Streak! 🔥` : "Nice!"}
      </motion.p>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1.4, 1], opacity: [1, 0] }}
        transition={{ delay: 0.15, duration: 0.8 }}
        className="font-display font-black text-2xl text-[#F43F5E] mt-1"
      >
        +{points}
      </motion.div>
    </motion.div>
  );
}
