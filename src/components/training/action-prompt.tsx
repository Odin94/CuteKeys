import { motion, AnimatePresence } from "motion/react";

type ActionPromptProps = {
  description: string;
  label: string;
};

export const ActionPrompt = ({ description, label }: ActionPromptProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={description}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="text-center"
    >
      <p className="text-sm font-semibold text-[#8D6E63] dark:text-[#B0BEC5] uppercase tracking-wide mb-2">
        {label}
      </p>
      <h2 className="font-display font-black text-3xl text-[#3E2723] dark:text-[#F8F8F2] leading-tight">
        {description}
      </h2>
    </motion.div>
  </AnimatePresence>
);
