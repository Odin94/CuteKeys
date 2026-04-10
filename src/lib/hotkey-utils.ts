import type { KeyCombo, ModifierKey } from '@/types/hotkey'
import { mapModifier, modifierLabel } from './platform'

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta'])

export function normalizeKeyCombo(combo: KeyCombo): KeyCombo {
  return {
    modifiers: [...new Set(combo.modifiers)].sort(),
    key: combo.key.toLowerCase(),
  }
}

export function keyCombosEqual(a: KeyCombo, b: KeyCombo): boolean {
  const normalizedA = normalizeKeyCombo(a)
  const normalizedB = normalizeKeyCombo(b)
  return normalizedA.key === normalizedB.key && normalizedA.modifiers.join(',') === normalizedB.modifiers.join(',')
}

export function isBareModifier(e: KeyboardEvent): boolean {
  return MODIFIER_KEYS.has(e.key)
}

export function eventToKeyCombo(e: KeyboardEvent): KeyCombo {
  const modifiers: ModifierKey[] = []
  if (e.ctrlKey) modifiers.push('ctrl')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')
  if (e.metaKey) modifiers.push('meta')
  return normalizeKeyCombo({ modifiers, key: e.key.toLowerCase() })
}

/** Compare a pressed KeyCombo against an expected KeyCombo from data.
 *  Applies platform modifier mapping so data can express cross-platform shortcuts. */
export function keyCombosMatch(pressed: KeyCombo, expected: KeyCombo): boolean {
  const mappedExpected = normalizeKeyCombo({
    modifiers: expected.modifiers.map(mapModifier),
    key: expected.key.toLowerCase(),
  })

  return keyCombosEqual(normalizeKeyCombo(pressed), mappedExpected)
}

/** Pretty display string for a KeyCombo, e.g. "Ctrl+P" or "Cmd+P" */
export function toDisplayString(combo: KeyCombo): string {
  const normalized = normalizeKeyCombo(combo)
  const mods = normalized.modifiers.map(modifierLabel)
  const key = formatKey(normalized.key)
  return [...mods, key].join('+')
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    arrowup: 'Up',
    arrowdown: 'Down',
    arrowleft: 'Left',
    arrowright: 'Right',
    pageup: 'PgUp',
    pagedown: 'PgDn',
    enter: 'Enter',
    escape: 'Esc',
    tab: 'Tab',
    backspace: 'Backspace',
    delete: 'Del',
    ' ': 'Space',
    ',': ',',
    '`': '`',
    '[': '[',
    ']': ']',
    '-': '-',
    '=': '=',
  }
  return map[key.toLowerCase()] ?? key.toUpperCase()
}
