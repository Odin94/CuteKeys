import type { KeyCombo, ModifierKey } from '@/types/hotkey'
import { mapModifier, modifierLabel } from './platform'

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta'])

export function isBareModifier(e: KeyboardEvent): boolean {
  return MODIFIER_KEYS.has(e.key)
}

export function eventToKeyCombo(e: KeyboardEvent): KeyCombo {
  const modifiers: ModifierKey[] = []
  if (e.ctrlKey) modifiers.push('ctrl')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')
  if (e.metaKey) modifiers.push('meta')
  return { modifiers, key: e.key.toLowerCase() }
}

/** Compare a pressed KeyCombo against an expected KeyCombo from data.
 *  Applies platform modifier mapping so 'ctrl' in data matches Cmd on Mac. */
export function keyCombosMatch(pressed: KeyCombo, expected: KeyCombo): boolean {
  const mappedExpected: KeyCombo = {
    modifiers: expected.modifiers.map(mapModifier),
    key: expected.key.toLowerCase(),
  }

  const pressedKey = pressed.key.toLowerCase()
  if (pressedKey !== mappedExpected.key) return false

  const sortedPressed = [...pressed.modifiers].sort().join(',')
  const sortedExpected = [...mappedExpected.modifiers].sort().join(',')
  return sortedPressed === sortedExpected
}

/** Pretty display string for a KeyCombo, e.g. "Ctrl+P" or "⌘P" */
export function toDisplayString(combo: KeyCombo): string {
  const mods = combo.modifiers.map(modifierLabel)
  const key = formatKey(combo.key)
  return [...mods, key].join('+')
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    pageup: 'PgUp',
    pagedown: 'PgDn',
    enter: '↵',
    escape: 'Esc',
    tab: 'Tab',
    backspace: '⌫',
    delete: 'Del',
    ' ': 'Space',
  }
  return map[key.toLowerCase()] ?? key.toUpperCase()
}
