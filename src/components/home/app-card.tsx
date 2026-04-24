import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { AppDefinition } from "@/types/hotkey";

type AppCardProps = {
  app: AppDefinition;
  index: number;
};

export const AppCard = ({ app, index }: AppCardProps) => {
  const totalHotkeys = app.sets.reduce((sum, s) => sum + s.hotkeys.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3, type: "spring", bounce: 0.3 }}
    >
      <Link to="/app/$appId" params={{ appId: app.id }} className="block group">
        <motion.div
          whileHover={{ y: -4, boxShadow: `0 12px 40px ${app.accentColor}25` }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-6 cursor-pointer"
          style={{ "--accent": app.accentColor } as React.CSSProperties}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
            style={{ backgroundColor: `${app.accentColor}18` }}
          >
            <AppLogo app={app} />
          </div>

          <h2 className="font-display font-bold text-xl text-[#3E2723] dark:text-[#F8F8F2] mb-1 group-hover:text-[#F43F5E] dark:group-hover:text-[#FFB8D1] transition-colors">
            {app.name}
          </h2>
          <p className="text-[#8D6E63] dark:text-[#B0BEC5] text-sm mb-4">{app.tagline}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: `${app.accentColor}18`, color: app.accentColor }}
              >
                {app.sets.length} sets
              </span>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: `${app.accentColor}18`, color: app.accentColor }}
              >
                {totalHotkeys} hotkeys
              </span>
            </div>
            <motion.div
              className="text-[#8D6E63] dark:text-[#B0BEC5] group-hover:text-[#F43F5E] dark:group-hover:text-[#FFB8D1] transition-colors"
              whileHover={{ x: 3 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const AppLogo = ({ app }: { app: AppDefinition }) => {
  const emoji: Record<string, string> = {
    cursor: "🖱️",
    zed: "⚡",
    ghostty: "👻",
    codex: "🤖",
  };
  return <span>{emoji[app.id] ?? "💻"}</span>;
};
