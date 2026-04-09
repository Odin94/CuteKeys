import { useState, useEffect, useCallback, useRef } from 'react'

export const isFocusModeSupported = () =>
  typeof navigator !== 'undefined' &&
  typeof document !== 'undefined' &&
  'keyboard' in navigator &&
  typeof (navigator as Navigator & { keyboard?: { lock?: unknown } }).keyboard?.lock === 'function' &&
  'requestFullscreen' in document.documentElement

const isKeyboardLockSupported = () =>
  typeof navigator !== 'undefined' && 'keyboard' in navigator && typeof (navigator as Navigator & { keyboard?: { lock?: unknown } }).keyboard?.lock === 'function'

const isFullscreenSupported = () =>
  typeof document !== 'undefined' && 'requestFullscreen' in document.documentElement

export type KeyboardLockState = 'idle' | 'fullscreen' | 'unsupported'

export const useKeyboardLock = () => {
  const [lockState, setLockState] = useState<KeyboardLockState>('idle')
  const supportedRef = useRef(isFullscreenSupported() && isKeyboardLockSupported())
  const supported = supportedRef.current

  const enter = useCallback(async () => {
    if (!supported) return

    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    } catch {
      // User denied fullscreen
      return
    }

    // Mark focus mode active as soon as fullscreen is entered.
    // keyboard.lock() may fail silently on some Chromium forks (e.g. Vivaldi)
    // but fullscreen alone already suppresses many browser shortcuts.
    setLockState('fullscreen')

    try {
      await (navigator as Navigator & { keyboard: { lock: () => Promise<void> } }).keyboard.lock()
    } catch {
      // keyboard.lock() unavailable or failed — fullscreen is still active
    }
  }, [supported])

  const exit = useCallback(async () => {
    if (typeof (navigator as Navigator & { keyboard?: { unlock?: () => void } }).keyboard?.unlock === 'function') {
      ;(navigator as Navigator & { keyboard: { unlock: () => void } }).keyboard.unlock()
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {})
    }
    setLockState('idle')
  }, [])

  // Keep state in sync when user presses Esc to exit fullscreen
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        if (typeof (navigator as Navigator & { keyboard?: { unlock?: () => void } }).keyboard?.unlock === 'function') {
          ;(navigator as Navigator & { keyboard: { unlock: () => void } }).keyboard.unlock()
        }
        setLockState('idle')
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // Release on unmount
  useEffect(() => {
    return () => {
      if (typeof (navigator as Navigator & { keyboard?: { unlock?: () => void } }).keyboard?.unlock === 'function') {
        ;(navigator as Navigator & { keyboard: { unlock: () => void } }).keyboard.unlock()
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  return { lockState, enter, exit, supported }
}
