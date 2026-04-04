import { useEffect, useRef } from 'react'
import type { KeyCombo } from '@/types/hotkey'
import { eventToKeyCombo, isBareModifier, keyCombosMatch } from '@/lib/hotkey-utils'

interface UseHotkeyCaptureOptions {
  expectedCombo: KeyCombo | null
  enabled: boolean
  onMatch: () => void
  onMismatch: (pressed: KeyCombo) => void
}

export function useHotkeyCapture({
  expectedCombo,
  enabled,
  onMatch,
  onMismatch,
}: UseHotkeyCaptureOptions) {
  const lastMatchTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      // Always prevent defaults when capture is enabled
      e.preventDefault()
      e.stopPropagation()

      // Ignore bare modifier keypresses
      if (isBareModifier(e)) return

      // Debounce: ignore presses within 100ms of last match
      const now = Date.now()
      if (now - lastMatchTime.current < 100) return

      const pressed = eventToKeyCombo(e)

      if (expectedCombo && keyCombosMatch(pressed, expectedCombo)) {
        lastMatchTime.current = now
        onMatch()
      } else {
        onMismatch(pressed)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [enabled, expectedCombo, onMatch, onMismatch])
}
