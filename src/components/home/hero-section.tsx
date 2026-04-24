import { motion } from "motion/react";

export const HeroSection = () => (
  <div className="text-center py-12 pb-8">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className="text-7xl mb-4 inline-block"
    >
      ⌨️
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="font-display font-black text-5xl text-[#3E2723] dark:text-[#F8F8F2] mb-3"
    >
      Welcome to <span className="text-[#F43F5E] dark:text-[#FFB8D1]">CuteKey</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-[#8D6E63] dark:text-[#B0BEC5] text-lg max-w-md mx-auto"
    >
      Master hotkeys for your favorite apps — fast, fun, and a little addictive 🎉
    </motion.p>
  </div>
);
