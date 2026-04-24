import type { KeyCombo } from "@/types/hotkey";

/**
 * Browser-reserved combos in data format.
 * These may be intercepted by the browser before JavaScript sees them,
 * even when preventDefault() is called. Only the Keyboard Lock API
 * (requires fullscreen) can reliably capture them and some browsers
 * don't support it at all.
 */
const BROWSER_RESERVED: KeyCombo[] = [
  { modifiers: ["primary"], key: "t" },
  { modifiers: ["primary", "shift"], key: "t" },
  { modifiers: ["primary"], key: "w" },
  { modifiers: ["primary", "shift"], key: "w" },
  { modifiers: ["primary"], key: "n" },
  { modifiers: ["primary", "shift"], key: "n" },
  { modifiers: ["primary"], key: "tab" },
  { modifiers: ["primary", "shift"], key: "tab" },
  { modifiers: ["primary"], key: "f" },
  { modifiers: ["primary"], key: "o" },
  { modifiers: ["ctrl"], key: "l" },
];

export const isBrowserReserved = (combo: KeyCombo): boolean => {
  const key = combo.key.toLowerCase();
  const mods = [...combo.modifiers].sort().join(",");
  return BROWSER_RESERVED.some((r) => r.key === key && [...r.modifiers].sort().join(",") === mods);
};
