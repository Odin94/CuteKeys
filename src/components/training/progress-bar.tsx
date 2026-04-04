interface ProgressBarProps {
  current: number // 1-based
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = (current / total) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#F5E6D8] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F43F5E] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#8D6E63] tabular-nums">
        {current}/{total}
      </span>
    </div>
  )
}
