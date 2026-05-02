import { parseKeyboardEvent } from "@tanstack/react-hotkeys";
import type { KeyCombo, ModifierKey } from "@/types/hotkey";
import { mapModifier, modifierLabel } from "./platform";

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);

export function normalizeKeyCombo(combo: KeyCombo): KeyCombo {
  return {
    modifiers: [...new Set(combo.modifiers)].sort(),
    key: combo.key.toLowerCase(),
  };
}

export function keyCombosEqual(a: KeyCombo, b: KeyCombo): boolean {
  const normalizedA = normalizeKeyCombo(a);
  const normalizedB = normalizeKeyCombo(b);
  return (
    normalizedA.key === normalizedB.key &&
    normalizedA.modifiers.join(",") === normalizedB.modifiers.join(",")
  );
}

export function isBareModifier(e: KeyboardEvent): boolean {
  return MODIFIER_KEYS.has(e.key);
}

export function eventToKeyCombo(e: KeyboardEvent): KeyCombo {
  const parsed = parseKeyboardEvent(e);
  const modifiers: ModifierKey[] = [];
  if (parsed.ctrl) modifiers.push("ctrl");
  if (parsed.shift) modifiers.push("shift");
  if (parsed.alt) modifiers.push("alt");
  if (parsed.meta) modifiers.push("meta");
  return normalizeKeyCombo({ modifiers, key: parsed.key.toLowerCase() });
}

/** Compare a pressed KeyCombo against an expected KeyCombo from data.
 *  Applies platform modifier mapping so data can express cross-platform shortcuts. */
export function keyCombosMatch(pressed: KeyCombo, expected: KeyCombo): boolean {
  const mappedExpected = normalizeKeyCombo({
    modifiers: expected.modifiers.map(mapModifier),
    key: expected.key.toLowerCase(),
  });

  return keyCombosEqual(normalizeKeyCombo(pressed), mappedExpected);
}

/** Pretty display string for a KeyCombo, e.g. "Ctrl+P" or "Cmd+P" */
export function toDisplayString(combo: KeyCombo): string {
  const normalized = normalizeKeyCombo(combo);
  const mods = normalized.modifiers.map(modifierLabel);
  const key = formatKey(normalized.key);
  return [...mods, key].join("+");
}

/** Returns the full ordered list of chord steps for a hotkey-like value. */
export function getChordSteps(value: {
  keys: KeyCombo;
  prefix?: KeyCombo[];
}): KeyCombo[] {
  return [...(value.prefix ?? []), value.keys];
}

/** Pretty display string for a sequence of combos joined by spaces (e.g. "Cmd+K Cmd+Z"). */
export function chordToDisplayString(steps: KeyCombo[]): string {
  return steps.map(toDisplayString).join(" ");
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    arrowup: "Up",
    arrowdown: "Down",
    arrowleft: "Left",
    arrowright: "Right",
    pageup: "PgUp",
    pagedown: "PgDn",
    enter: "Enter",
    escape: "Esc",
    tab: "Tab",
    backspace: "Backspace",
    delete: "Del",
    " ": "Space",
    ",": ",",
    "`": "`",
    "[": "[",
    "]": "]",
    "-": "-",
    "=": "=",
  };
  return map[key.toLowerCase()] ?? key.toUpperCase();
}
