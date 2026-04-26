import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings, saveSettings, clearAllData } from "@/lib/storage";
import type { UserSettings } from "@/types/stats";
import { PageWrapper } from "@/components/layout/page-wrapper";

export const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings>(getSettings);
  const [cleared, setCleared] = useState(false);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleClear = () => {
    if (confirm("Clear ALL CuteKey data? This cannot be undone.")) {
      clearAllData();
      setCleared(true);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-[#8D6E63] dark:text-[#B0BEC5] cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display font-black text-2xl text-[#3E2723] dark:text-[#F8F8F2]">
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5"
          >
            <label className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] block mb-1">
              Display Name
            </label>
            <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] mb-3">
              Shown on the leaderboard. Will appear globally once syncing ships.
            </p>
            <input
              type="text"
              value={settings.userName}
              maxLength={32}
              onChange={(e) => update("userName", e.target.value)}
              placeholder="Pick a name…"
              className="w-full px-3 py-2 rounded-xl bg-[#FFF5EB] dark:bg-[#4A4560] border border-[#F5E6D8] dark:border-[#5A5570] text-[#3E2723] dark:text-[#F8F8F2] text-sm focus:outline-none focus:border-[#F43F5E]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.025 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5"
          >
            <label className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] block mb-1">
              Countdown Duration
            </label>
            <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] mb-3">
              How many seconds to guess each hotkey
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                value={settings.countdownSeconds}
                onChange={(e) => update("countdownSeconds", Number(e.target.value))}
                className="flex-1 accent-[#F43F5E]"
              />
              <span className="font-display font-bold text-lg text-[#F43F5E] dark:text-[#FFB8D1] w-8 text-center">
                {settings.countdownSeconds}s
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5 flex items-center justify-between"
          >
            <div>
              <label className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] block">
                Sound Effects
              </label>
              <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5]">
                Play sounds on success and timeout
              </p>
            </div>
            <motion.button
              onClick={() => update("soundEnabled", !settings.soundEnabled)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`w-12 h-6 rounded-full transition-colors relative overflow-hidden cursor-pointer ${
                settings.soundEnabled ? "bg-[#F43F5E]" : "bg-[#F5E6D8] dark:bg-[#5A5570]"
              }`}
            >
              <span
                className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.soundEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5"
          >
            <label className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] block mb-1">
              Modifier Key Display
            </label>
            <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] mb-3">
              How to show the primary modifier key
            </p>
            <div className="flex gap-2">
              {(["auto", "ctrl", "cmd"] as const).map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => update("modifierDisplay", opt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    settings.modifierDisplay === opt
                      ? "bg-[#F43F5E] text-white"
                      : "bg-[#FFF5EB] dark:bg-[#4A4560] text-[#8D6E63] dark:text-[#B0BEC5] hover:bg-[#FFF1F2] dark:hover:bg-[#5A5570]"
                  }`}
                >
                  {opt === "auto" ? "Auto" : opt === "ctrl" ? "Ctrl" : "⌘ Cmd"}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-red-100 dark:border-[#5A2A3A] p-5"
          >
            <label className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] block mb-1">
              Danger Zone
            </label>
            <p className="text-sm text-[#8D6E63] dark:text-[#B0BEC5] mb-3">
              Permanently delete all your stats and leaderboard data
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex"
            >
              <Button
                variant="outline"
                onClick={handleClear}
                className="gap-2 border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                {cleared ? "Data cleared!" : "Clear All Data"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};
