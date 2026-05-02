import { useParams, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { appsById } from "@/data/apps";
import { TrainingView } from "@/components/training/training-view";
import type { TrainingSessionState } from "@/types/session";
import { addChallengeRun, getCurrentUser, updatePerformance } from "@/lib/storage";
import type { ChallengeRun } from "@/types/stats";
import { PageWrapper } from "@/components/layout/page-wrapper";

export const ChallengePage = () => {
  const { appId } = useParams({ from: "/app/$appId/challenge" });
  const navigate = useNavigate();
  const app = appsById[appId]!;
  const startedAt = useRef<number>(Date.now());

  // Challenge mode runs through every set + every hotkey.
  const allSetIds = app.sets.map((s) => s.id);

  const handleFinish = (state: TrainingSessionState) => {
    updatePerformance(appId, state.attempts);

    const correct = state.attempts.filter((a) => a.correct).length;
    const accuracy = state.attempts.length > 0 ? correct / state.attempts.length : 0;
    const timed = state.attempts.filter((a) => a.responseTimeMs !== null);
    const avgTime =
      timed.length > 0 ? timed.reduce((s, a) => s + (a.responseTimeMs ?? 0), 0) / timed.length : 0;

    const user = getCurrentUser();
    const run: ChallengeRun = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.userId,
      userName: user.userName,
      date: new Date().toISOString(),
      appId,
      score: state.score,
      totalHotkeys: state.attempts.length,
      correctCount: correct,
      accuracy,
      avgResponseTimeMs: avgTime,
      bestStreak: state.bestStreak,
      durationMs: Date.now() - startedAt.current,
    };
    addChallengeRun(appId, run);

    navigate({
      to: "/app/$appId/leaderboard",
      params: { appId },
      search: { highlight: run.id },
    });
  };

  return (
    <PageWrapper>
      <TrainingView app={app} selectedSetIds={allSetIds} onFinish={handleFinish} challenge />
    </PageWrapper>
  );
};
