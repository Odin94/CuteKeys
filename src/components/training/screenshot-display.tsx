import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { placeholderScreenshot } from "@/lib/screenshot-placeholder";

interface ScreenshotDisplayProps {
  src: string;
  phase: "before" | "after";
  appName: string;
  action: string;
  accentColor: string;
}

export function ScreenshotDisplay({
  src,
  phase,
  appName,
  action,
  accentColor,
}: ScreenshotDisplayProps) {
  const [errored, setErrored] = useState(false);
  const fallback = placeholderScreenshot(appName, action, accentColor, phase);

  return (
    <div className="w-full rounded-2xl overflow-hidden border-2 border-[#F5E6D8] dark:border-[#5A5570] shadow-lg bg-[#FFF5EB] dark:bg-[#4A4560]">
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={errored ? fallback : src}
          alt={`${appName} - ${phase}`}
          onError={() => setErrored(true)}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full h-auto object-cover"
          style={{ maxHeight: "400px", objectFit: "cover", objectPosition: "top" }}
        />
      </AnimatePresence>
    </div>
  );
}
