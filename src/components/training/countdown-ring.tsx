import { motion } from "motion/react";

type CountdownRingProps = {
  progress: number;
  remainingMs: number;
  size?: number;
};

export const CountdownRing = ({ progress, remainingMs, size = 120 }: CountdownRingProps) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  let color = "#22C55E";
  if (progress < 0.66) color = "#FB923C";
  if (progress < 0.33) color = "#F43F5E";

  const seconds = Math.ceil(remainingMs / 1000);
  const prevSeconds = Math.ceil((remainingMs + 50) / 1000);
  const didTick = seconds !== prevSeconds;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={8}
          className="stroke-[#F5E6D8] dark:stroke-[#5A5570]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          animate={{ stroke: color, strokeDashoffset }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </svg>

      <motion.div
        key={seconds}
        initial={didTick ? { scale: 1.3, opacity: 0.7 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, type: "spring", bounce: 0.5 }}
        className="absolute font-display font-black text-3xl"
        style={{ color }}
      >
        {seconds}
      </motion.div>
    </div>
  );
};
