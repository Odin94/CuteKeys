import { useEffect, useRef, useState } from 'react'
import type { KeyCombo, ModifierKey } from '@/types/hotkey'
import { eventToKeyCombo, isBareModifier, keyCombosMatch } from '@/lib/hotkey-utils'

const STAGE_WINDOW_MS = 3000

const keyToModifier = (key: string): ModifierKey | null => {
  switch (key) {
    case 'Control': return 'ctrl'
    case 'Shift': return 'shift'
    case 'Alt': return 'alt'
    case 'Meta': return 'meta'
    default: return null
  }
}

type UseHotkeyCaptureOptions = {
  expectedCombo: KeyCombo | null
  enabled: boolean
  onMatch: () => void
  onMismatch: (pressed: KeyCombo) => void
}

export const useHotkeyCapture = ({
  expectedCombo,
  enabled,
  onMatch,
  onMismatch,
}: UseHotkeyCaptureOptions) => {
  const lastMatchTime = useRef<number>(0)
  const [stagedModifiers, setStagedModifiers] = useState<ModifierKey[]>([])
  const stagedRef = useRef<ModifierKey[]>([])
  const stageTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      stagedRef.current = []
      setStagedModifiers([])
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()

      if (isBareModifier(e)) {
        const mod = keyToModifier(e.key)
        if (mod && !stagedRef.current.includes(mod)) {
          const next = [...stagedRef.current, mod]
          stagedRef.current = next
          stageTimeRef.current = now
          setStagedModifiers(next)
        }
        return
      }

      // Clear stale staged modifiers
      if (now - stageTimeRef.current > STAGE_WINDOW_MS) {
        stagedRef.current = []
      }

      // Debounce: ignore presses within 100ms of last match
      if (now - lastMatchTime.current < 100) {
        stagedRef.current = []
        setStagedModifiers([])
        return
      }

      const pressed = eventToKeyCombo(e)

      // Merge simultaneously-held modifiers with sequentially-staged modifiers.
      // This lets users press e.g. Ctrl, then Shift, then T separately when the
      // browser would intercept the simultaneous Ctrl+Shift+T combo.
      const effectiveMods = [...new Set([...pressed.modifiers, ...stagedRef.current])]
      const effectiveCombo: KeyCombo = { modifiers: effectiveMods, key: pressed.key }

      stagedRef.current = []
      setStagedModifiers([])

      if (expectedCombo && keyCombosMatch(effectiveCombo, expectedCombo)) {
        lastMatchTime.current = now
        onMatch()
      } else {
        onMismatch(pressed)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      stagedRef.current = []
      setStagedModifiers([])
    }
  }, [enabled, expectedCombo, onMatch, onMismatch])

  return { stagedModifiers }
}
