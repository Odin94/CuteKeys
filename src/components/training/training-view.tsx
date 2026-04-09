import { useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Maximize2, Minimize2, TriangleAlert } from 'lucide-react'
import type { AppDefinition } from '@/types/hotkey'
import type { KeyCombo } from '@/types/hotkey'
import { useTrainingSession } from '@/hooks/use-training-session'
import { useCountdown } from '@/hooks/use-countdown'
import { useHotkeyCapture } from '@/hooks/use-hotkey-capture'
import { useKeyboardLock } from '@/hooks/use-keyboard-lock'
import { ProgressBar } from './progress-bar'
import { ScoreDisplay } from './score-display'
import { ScreenshotDisplay } from './screenshot-display'
import { ActionPrompt } from './action-prompt'
import { CountdownRing } from './countdown-ring'
import { SuccessCelebration } from './success-celebration'
import { FailReveal } from './fail-reveal'
import { getSettings } from '@/lib/storage'
import { isBrowserReserved } from '@/lib/browser-shortcuts'
import { modifierLabel } from '@/lib/platform'

type TrainingViewProps = {
  app: AppDefinition
  selectedSetIds: string[]
  onFinish: (state: ReturnType<typeof useTrainingSession>['state']) => void
}

export const TrainingView = ({ app, selectedSetIds, onFinish }: TrainingViewProps) => {
  const settings = getSettings()
  const hotkeys = app.sets
    .filter((s) => selectedSetIds.includes(s.id))
    .flatMap((s) => s.hotkeys)

  const { state, startSession, handleCorrectPress, handleTimeout, handleKeyDuringTimeout, advance } =
    useTrainingSession()

  const sessionStarted = useRef(false)
  useEffect(() => {
    if (sessionStarted.current) return
    sessionStarted.current = true
    startSession(app.id, selectedSetIds, hotkeys, settings.countdownSeconds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sessionStartTime = useRef<number>(0)

  const handleExpire = useCallback(() => {
    handleTimeout()
  }, [handleTimeout])

  const countdown = useCountdown(handleExpire)

  // Start countdown when phase becomes 'prompt'
  useEffect(() => {
    if (state.phase === 'prompt' && state.queue.length > 0) {
      sessionStartTime.current = Date.now()
      countdown.start(state.totalTimeMs)
    }
    if (state.phase !== 'prompt') {
      countdown.pause()
    }
  // Include state.queue.length so the effect re-runs when START_SESSION populates the queue
  // (phase stays 'prompt' and currentIndex stays 0, so they alone wouldn't retrigger)
  }, [state.phase, state.currentIndex, state.queue.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance after success/reveal
  useEffect(() => {
    if (state.phase === 'success') {
      const t = setTimeout(() => advance(), 1600)
      return () => clearTimeout(t)
    }
    if (state.phase === 'reveal') {
      const t = setTimeout(() => advance(), 1200)
      return () => clearTimeout(t)
    }
  }, [state.phase, advance])

  // Navigate to results when finished
  useEffect(() => {
    if (state.phase === 'finished') {
      onFinish(state)
    }
  }, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentHotkey = state.queue[state.currentIndex]

  const onMatch = useCallback(() => {
    if (state.phase === 'prompt') {
      const responseTimeMs = Date.now() - sessionStartTime.current
      handleCorrectPress(responseTimeMs, currentHotkey.keys)
    }
  }, [state.phase, currentHotkey, handleCorrectPress])

  const onMismatch = useCallback((_pressed: KeyCombo) => {
    // Wrong key — do nothing in any phase, let the user try the correct one
  }, [])

  const handleSkip = useCallback(() => {
    if (state.phase === 'timeout') {
      handleKeyDuringTimeout(currentHotkey.keys)
    }
  }, [state.phase, currentHotkey, handleKeyDuringTimeout])

  // Also handle correct key during timeout
  const onMatchDuringTimeout = useCallback(() => {
    if (state.phase === 'timeout') {
      handleKeyDuringTimeout(currentHotkey.keys)
    } else if (state.phase === 'prompt') {
      const responseTimeMs = Date.now() - sessionStartTime.current
      handleCorrectPress(responseTimeMs, currentHotkey.keys)
    }
  }, [state.phase, currentHotkey, handleCorrectPress, handleKeyDuringTimeout])

  const { stagedModifiers } = useHotkeyCapture({
    expectedCombo: currentHotkey?.keys ?? null,
    enabled: state.phase === 'prompt' || state.phase === 'timeout',
    onMatch: state.phase === 'timeout' ? onMatchDuringTimeout : onMatch,
    onMismatch,
  })

  const { lockState, enter: enterFocus, exit: exitFocus, supported: focusSupported } = useKeyboardLock()
  const isLocked = lockState === 'fullscreen'

  if (!currentHotkey || state.queue.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-cutekey-brown-muted dark:text-[#B0BEC5]">Loading session…</p>
      </div>
    )
  }

  const isReserved = isBrowserReserved(currentHotkey.keys)
  const showBrowserWarning = isReserved && !isLocked && state.phase === 'prompt'

  const screenshotPhase = state.phase === 'reveal' || state.phase === 'success' ? 'after' : 'before'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <ProgressBar current={state.currentIndex + 1} total={state.queue.length} />
        <div className="flex items-center gap-3">
          <ScoreDisplay score={state.score} streak={state.streak} />
          {focusSupported ? (
            <button
              onClick={isLocked ? exitFocus : enterFocus}
              title={isLocked ? 'Exit focus mode' : 'Enter focus mode to capture all browser shortcuts'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                bg-cutekey-border dark:bg-[#3A3550] text-cutekey-brown-muted dark:text-[#B0BEC5]
                hover:bg-[#EDD9C8] dark:hover:bg-[#4A4560]
                border border-[#E0C9B5] dark:border-[#5A5570]"
            >
              {isLocked ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>Exit focus</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>Focus mode</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Screenshot */}
      <ScreenshotDisplay
        src={screenshotPhase === 'before' ? currentHotkey.screenshotBefore : currentHotkey.screenshotAfter}
        phase={screenshotPhase}
        appName={app.name}
        action={currentHotkey.description}
        accentColor={app.accentColor}
      />

      {/* Prompt / feedback area */}
      <div className="bg-white dark:bg-[#3A3550] rounded-2xl border border-[#F5E6D8] dark:border-[#5A5570] p-6">
        <AnimatePresence mode="wait">
          {state.phase === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {showBrowserWarning ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#FFF5EB]/80 dark:bg-[#4A4560]/80 border border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] text-xs"
                >
                  <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                  <span className="leading-relaxed">
                    {focusSupported
                      ? 'Your browser may intercept this shortcut. Enable Focus Mode, or press the keys one by one.'
                      : 'Your browser may intercept this shortcut. Press the modifier keys one by one, then the final key.'}
                  </span>
                </motion.div>
              ) : null}

              <ActionPrompt description={currentHotkey.description} label={app.name} />

              {stagedModifiers.length > 0 ? (
                <motion.div
                  key="staged"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-cutekey-brown-muted dark:text-[#B0BEC5]"
                >
                  {stagedModifiers.map((mod) => (
                    <kbd
                      key={mod}
                      className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-mono text-xs"
                    >
                      {modifierLabel(mod)}
                    </kbd>
                  ))}
                  <span className="opacity-50">+</span>
                  <span className="px-2 py-0.5 rounded-md border border-dashed border-cutekey-brown-muted/40 dark:border-[#B0BEC5]/40 font-mono text-xs opacity-60">
                    ?
                  </span>
                </motion.div>
              ) : null}

              <CountdownRing
                progress={countdown.isRunning ? countdown.progress : 1}
                remainingMs={countdown.isRunning ? countdown.remainingMs : state.totalTimeMs}
              />
            </motion.div>
          )}

          {state.phase === 'success' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SuccessCelebration
                points={state.attempts[state.attempts.length - 1]?.points ?? 0}
                streak={state.streak}
              />
            </motion.div>
          )}

          {state.phase === 'timeout' && (
            <motion.div key="timeout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FailReveal combo={currentHotkey.keys} onSkip={handleSkip} />
            </motion.div>
          )}

          {state.phase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-[#22C55E] font-semibold text-lg">✓ That's the effect!</p>
              <p className="text-[#8D6E63] dark:text-[#B0BEC5] text-sm mt-1">Next hotkey coming up…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
