import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Trophy, Zap, Crown, Cloud } from "lucide-react";
import { appsById } from "@/data/apps";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { getChallengeRuns, getCurrentUser } from "@/lib/storage";
import type { ChallengeRun } from "@/types/stats";
import { cn } from "@/lib/cn";

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatDuration = (ms: number): string => {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const LeaderboardPage = () => {
  const { appId } = useParams({ from: "/app/$appId/leaderboard" });
  const { highlight } = useSearch({ from: "/app/$appId/leaderboard" });
  const navigate = useNavigate();
  const app = appsById[appId]!;
  const me = getCurrentUser();
  const runs: ChallengeRun[] = [...getChallengeRuns(appId)].sort((a, b) => b.score - a.score);

  const startChallenge = () => {
    navigate({ to: "/app/$appId/challenge", params: { appId } });
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/app/$appId" params={{ appId }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-[#8D6E63] dark:text-[#B0BEC5]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-2xl text-[#3E2723] dark:text-[#F8F8F2] flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[#F59E0B]" />
              {app.name} Leaderboard
            </h1>
            <p className="text-[#8D6E63] dark:text-[#B0BEC5] text-sm">
              Best Challenge Mode runs — your overall score for {app.name}
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#FFF8F2] dark:bg-[#3A3550] border border-[#F5E6D8] dark:border-[#5A5570] text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
          <Cloud className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
          <span>
            Scores are saved on this device for now. Global syncing across all CuteKeys players is
            coming soon — you'll keep your existing runs.
          </span>
        </div>

        {runs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-[#F5E6D8] dark:border-[#5A5570] p-10 text-center"
          >
            <p className="font-display font-bold text-lg text-[#3E2723] dark:text-[#F8F8F2] mb-1">
              No runs yet
            </p>
            <p className="text-[#8D6E63] dark:text-[#B0BEC5] text-sm mb-5">
              Take on the Challenge Mode to land on this board.
            </p>
            <button
              onClick={startChallenge}
              className="inline-flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-display font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-[#F43F5E]/30 transition-colors"
            >
              <Zap className="h-4 w-4 fill-white" />
              Start Challenge
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-6">
              {runs.map((run, i) => {
                const isMe = run.userId === me.userId;
                const isHighlight = highlight === run.id;
                const rank = i + 1;
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3",
                      isHighlight
                        ? "border-[#F43F5E] bg-[#FFF1F2] dark:bg-[#4A3E56] shadow-md shadow-[#F43F5E]/20"
                        : "border-[#F5E6D8] dark:border-[#5A5570] bg-white dark:bg-[#3A3550]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-display font-black text-sm",
                        rank === 1
                          ? "bg-[#FEF3C7] text-[#B45309] dark:bg-[#4A3F1F] dark:text-[#FCD34D]"
                          : rank === 2
                            ? "bg-[#E5E7EB] text-[#4B5563] dark:bg-[#3F4252] dark:text-[#D1D5DB]"
                            : rank === 3
                              ? "bg-[#FED7AA] text-[#9A3412] dark:bg-[#4A2F1F] dark:text-[#FDBA74]"
                              : "bg-[#FFF5EB] dark:bg-[#4A4560] text-[#8D6E63] dark:text-[#B0BEC5]",
                      )}
                    >
                      {rank === 1 ? <Crown className="h-4 w-4" /> : `#${rank}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#3E2723] dark:text-[#F8F8F2] text-sm truncate">
                          {run.userName}
                        </p>
                        {isMe ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#F43F5E] text-white">
                            you
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                        {Math.round(run.accuracy * 100)}% acc ·{" "}
                        {(run.avgResponseTimeMs / 1000).toFixed(2)}
                        s avg · streak {run.bestStreak} · {formatDuration(run.durationMs)} ·{" "}
                        {formatDate(run.date)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-lg text-[#F43F5E] dark:text-[#FFB8D1]">
                        {run.score.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#8D6E63] dark:text-[#B0BEC5]">
                        {run.correctCount}/{run.totalHotkeys}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={startChallenge}
                className="inline-flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-display font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-[#F43F5E]/30 transition-colors"
              >
                <Zap className="h-4 w-4 fill-white" />
                Run another Challenge
              </button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};
