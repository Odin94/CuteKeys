export function calculatePoints(
  responseTimeMs: number,
  totalTimeMs: number,
  streak: number
): number {
  const timeFraction = Math.max(0, Math.min(1, responseTimeMs / totalTimeMs))
  const base = Math.round((1 - timeFraction) * 100)
  const multiplier = 1 + Math.min(streak, 10) * 0.1
  return Math.round(base * multiplier)
}
