import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { appsById } from "@/data/apps";
import { ScoreSummary } from "@/components/results/score-summary";
import { HotkeyResultsList } from "@/components/results/hotkey-results-list";
import { Leaderboard } from "@/components/results/leaderboard";
import { Button } from "@/components/ui/button";
import { getAppStats } from "@/lib/storage";
import { RotateCcw, LayoutDashboard, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import type { TrainingSessionState } from "@/types/session";
import { PageWrapper } from "@/components/layout/page-wrapper";

export const ResultsPage = () => {
  const { appId } = useParams({ from: "/app/$appId/results" });
  const navigate = useNavigate();
  const app = appsById[appId]!;

  const historyState = window.history.state as
    | { session?: TrainingSessionState; entryId?: string }
    | undefined;
  const session = historyState?.session;
  const entryId = historyState?.entryId;

  const stats = getAppStats(appId);

  if (!session) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-[#8D6E63] dark:text-[#B0BEC5] mb-4">No session data found.</p>
          <Link to="/app/$appId" params={{ appId }}>
            <Button>Back to {app.name}</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-8 mb-6"
        >
          <ScoreSummary session={session} />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5"
          >
            <h3 className="font-display font-bold text-[#3E2723] dark:text-[#F8F8F2] mb-4">
              This Session
            </h3>
            <HotkeyResultsList attempts={session.attempts} hotkeys={session.queue} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-5"
          >
            <h3 className="font-display font-bold text-[#3E2723] dark:text-[#F8F8F2] mb-4">
              🏆 Leaderboard
            </h3>
            <Leaderboard entries={stats.leaderboard} currentEntryId={entryId} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() =>
              navigate({
                to: "/app/$appId/train",
                params: { appId },
                search: { sets: session.selectedSetIds.join(",") },
              })
            }
            className="flex-1 flex items-center justify-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] dark:bg-[#FFB8D1] dark:text-[#3A3550] dark:hover:bg-[#F9A8C9] text-white font-display font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link to="/app/$appId" params={{ appId }} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl border-[#F5E6D8] dark:border-[#5A5570] dark:text-[#F8F8F2] gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Pick New Sets
            </Button>
          </Link>
          <Link to="/app/$appId/dashboard" params={{ appId }} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl border-[#F5E6D8] dark:border-[#5A5570] dark:text-[#F8F8F2] gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  );
};
