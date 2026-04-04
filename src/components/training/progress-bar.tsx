type ProgressBarProps = {
  current: number
  total: number
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const pct = (current / total) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#F5E6D8] dark:bg-[#5A5570] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F43F5E] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#8D6E63] dark:text-[#B0BEC5] tabular-nums">
        {current}/{total}
      </span>
    </div>
  )
}
