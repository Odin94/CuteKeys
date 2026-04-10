import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Keyboard, RotateCcw } from 'lucide-react'
import type { HotkeySet, HotkeySetOverrides, KeyCombo, ModifierKey } from '@/types/hotkey'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { eventToKeyCombo, keyCombosEqual, toDisplayString } from '@/lib/hotkey-utils'
import { cn } from '@/lib/cn'

type HotkeySetSettingsDialogProps = {
  open: boolean
  set: HotkeySet
  overrides?: HotkeySetOverrides
  onOpenChange: (open: boolean) => void
  onSave: (overrides: HotkeySetOverrides) => void
}

type DraftRow = {
  enabled: boolean
  keys: KeyCombo | null
}

const STAGE_WINDOW_MS = 3000

function toModifierKey(key: string): ModifierKey | null {
  switch (key) {
    case 'Control':
      return 'ctrl'
    case 'Shift':
      return 'shift'
    case 'Alt':
      return 'alt'
    case 'Meta':
      return 'meta'
    default:
      return null
  }
}

function buildDraft(set: HotkeySet, overrides?: HotkeySetOverrides): Record<string, DraftRow> {
  return Object.fromEntries(
    set.hotkeys.map((hotkey) => [
      hotkey.id,
      {
        enabled: overrides?.[hotkey.id]?.enabled ?? true,
        keys: overrides?.[hotkey.id]?.keys ?? null,
      },
    ])
  )
}

function cleanOverrides(set: HotkeySet, draft: Record<string, DraftRow>): HotkeySetOverrides {
  const cleaned: HotkeySetOverrides = {}

  for (const hotkey of set.hotkeys) {
    const current = draft[hotkey.id]
    const hasCustomKeys = current.keys !== null && !keyCombosEqual(current.keys, hotkey.keys)
    const enabledChanged = current.enabled !== true

    if (!hasCustomKeys && !enabledChanged) continue

    cleaned[hotkey.id] = {
      enabled: current.enabled,
      keys: hasCustomKeys ? current.keys : null,
    }
  }

  return cleaned
}

export const HotkeySetSettingsDialog = ({
  open,
  set,
  overrides,
  onOpenChange,
  onSave,
}: HotkeySetSettingsDialogProps) => {
  const [draft, setDraft] = useState<Record<string, DraftRow>>(() => buildDraft(set, overrides))
  const [recordingHotkeyId, setRecordingHotkeyId] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [stagedModifiers, setStagedModifiers] = useState<ModifierKey[]>([])
  const stagedModifiersRef = useRef<ModifierKey[]>([])
  const stagedAtRef = useRef<number>(0)

  useEffect(() => {
    if (!open) return
    setDraft(buildDraft(set, overrides))
    setRecordingHotkeyId(null)
    setShowResetConfirm(false)
    setStagedModifiers([])
    stagedModifiersRef.current = []
  }, [open, overrides, set])

  useEffect(() => {
    if (!open || !recordingHotkeyId) return

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const now = Date.now()

      if (event.key === 'Escape') {
        setRecordingHotkeyId(null)
        setStagedModifiers([])
        stagedModifiersRef.current = []
        return
      }

      const modifier = toModifierKey(event.key)
      if (modifier) {
        if (!stagedModifiersRef.current.includes(modifier)) {
          const next = [...stagedModifiersRef.current, modifier]
          stagedModifiersRef.current = next
          stagedAtRef.current = now
          setStagedModifiers(next)
        }
        return
      }

      if (now - stagedAtRef.current > STAGE_WINDOW_MS) {
        stagedModifiersRef.current = []
        setStagedModifiers([])
      }

      const pressed = eventToKeyCombo(event)
      const combo: KeyCombo = {
        modifiers: [...new Set([...pressed.modifiers, ...stagedModifiersRef.current])].sort(),
        key: pressed.key,
      }

      setDraft((prev) => ({
        ...prev,
        [recordingHotkeyId]: {
          ...prev[recordingHotkeyId],
          enabled: true,
          keys: combo,
        },
      }))
      setRecordingHotkeyId(null)
      setStagedModifiers([])
      stagedModifiersRef.current = []
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      stagedModifiersRef.current = []
      setStagedModifiers([])
    }
  }, [open, recordingHotkeyId])

  const cleanedOverrides = useMemo(() => cleanOverrides(set, draft), [draft, set])
  const hasChanges = Object.keys(cleanedOverrides).length > 0

  const handleSave = () => {
    onSave(cleanedOverrides)
    onOpenChange(false)
  }

  const handleConfirmResetAll = () => {
    setDraft(buildDraft(set))
    setRecordingHotkeyId(null)
    setShowResetConfirm(false)
    setStagedModifiers([])
    stagedModifiersRef.current = []
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
      <DialogContent
        showCloseButton
        className="relative flex max-h-[88vh] w-[min(720px,calc(100%-2rem))] max-w-[720px] flex-col overflow-hidden rounded-3xl border border-[#F5E6D8] bg-white p-0 dark:border-[#5A5570] dark:bg-[#3A3550]"
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-display text-xl text-[#3E2723] dark:text-[#F8F8F2]">
            Customize {set.name}
          </DialogTitle>
          <DialogDescription className="text-[#8D6E63] dark:text-[#B0BEC5]">
            Assign replacement shortcuts and choose which hotkeys should appear in training.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-6 pb-4">
          <div className="cutekey-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
            <div className="space-y-3">
            {set.hotkeys.map((hotkey) => {
              const row = draft[hotkey.id]
              const customCombo = row.keys
              const effectiveCombo = customCombo ?? hotkey.keys
              const isCustom = customCombo !== null && !keyCombosEqual(customCombo, hotkey.keys)
              const isRecording = recordingHotkeyId === hotkey.id

              return (
                <div
                  key={hotkey.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    row.enabled
                      ? 'border-[#F5E6D8] dark:border-[#5A5570] bg-[#FFFDFC] dark:bg-[#413C58]'
                      : 'border-[#F5E6D8] dark:border-[#5A5570] bg-[#FFF7F7]/70 dark:bg-[#3B364F] opacity-80'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          [hotkey.id]: {
                            ...prev[hotkey.id],
                            enabled: !prev[hotkey.id].enabled,
                          },
                        }))
                      }
                      className={cn(
                        'mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-[2px] transition-colors cursor-pointer',
                        row.enabled
                          ? 'bg-[#F43F5E] border-[#F43F5E]'
                          : 'bg-[#F5E6D8] dark:bg-[#4A4560] border-[#E7D2C2] dark:border-[#5A5570]'
                      )}
                      aria-pressed={row.enabled}
                      aria-label={row.enabled ? `Disable ${hotkey.label}` : `Enable ${hotkey.label}`}
                      >
                      <span
                        className={cn(
                          'block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(62,39,35,0.18)] transition-transform',
                          row.enabled ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#3E2723] dark:text-[#F8F8F2]">{hotkey.label}</p>
                        {!row.enabled ? (
                          <span className="rounded-full bg-[#FDE7EA] dark:bg-[#4A2A35] px-2 py-0.5 text-[11px] font-semibold text-[#BE123C] dark:text-[#FFB8D1]">
                            hidden
                          </span>
                        ) : null}
                        {isCustom ? (
                          <span className="rounded-full bg-[#FFF1F2] dark:bg-[#4A3E56] px-2 py-0.5 text-[11px] font-semibold text-[#F43F5E] dark:text-[#FFB8D1]">
                            custom
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#8D6E63] dark:text-[#B0BEC5]">{hotkey.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <kbd className="rounded-xl border border-[#F5E6D8] dark:border-[#5A5570] bg-[#FFF5EB] dark:bg-[#4A4560] px-3 py-1.5 font-mono text-xs text-[#3E2723] dark:text-[#F8F8F2]">
                          {toDisplayString(effectiveCombo)}
                        </kbd>
                        <span className="text-xs text-[#8D6E63] dark:text-[#B0BEC5]">
                          Default: {toDisplayString(hotkey.keys)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={isRecording ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'rounded-xl',
                            isRecording
                              ? 'bg-[#F43F5E] text-white hover:bg-[#E11D48]'
                              : 'border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5]',
                            'cursor-pointer'
                          )}
                          onClick={() => setRecordingHotkeyId(isRecording ? null : hotkey.id)}
                        >
                          <Keyboard className="h-3.5 w-3.5" />
                          {isRecording ? 'Press keys...' : 'Record hotkey'}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] cursor-pointer disabled:cursor-not-allowed"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              [hotkey.id]: {
                                ...prev[hotkey.id],
                                keys: null,
                              },
                            }))
                          }
                          disabled={row.keys === null}
                        >
                          Reset shortcut
                        </Button>
                        {isRecording && stagedModifiers.length > 0 ? (
                          <span className="inline-flex items-center rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 font-mono text-xs text-amber-700 dark:text-amber-300">
                            {toDisplayString({ modifiers: stagedModifiers, key: '?' }).replace('+?', '')} + ...
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-[#F5E6D8] dark:border-[#5A5570] bg-[#FFF8F2] dark:bg-[#342F46] px-6 pb-7 pt-5">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setShowResetConfirm(true)}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[#F43F5E] text-white hover:bg-[#E11D48] cursor-pointer"
            onClick={handleSave}
          >
            Save changes
          </Button>
        </DialogFooter>
        <AnimatePresence>
          {showResetConfirm ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#FFF8F2]/75 p-6 backdrop-blur-sm dark:bg-[#241F33]/80"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                className="w-full max-w-md rounded-3xl border border-[#F5E6D8] bg-white p-6 shadow-2xl shadow-[#3E2723]/10 dark:border-[#5A5570] dark:bg-[#3A3550]"
              >
                <div className="mb-5">
                  <p className="font-display text-lg font-bold text-[#3E2723] dark:text-[#F8F8F2]">
                    Reset all customizations?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8D6E63] dark:text-[#B0BEC5]">
                    This will restore every hotkey in {set.name} to its default shortcut and re-enable hidden entries.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] cursor-pointer"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Keep changes
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-[#F43F5E] text-white hover:bg-[#E11D48] cursor-pointer"
                    onClick={handleConfirmResetAll}
                  >
                    Reset everything
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
