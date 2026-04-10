export type ModifierKey = 'primary' | 'ctrl' | 'shift' | 'alt' | 'meta'

export interface KeyCombo {
  modifiers: ModifierKey[]
  key: string // lowercase: "p", "f", "arrowup", "enter", "`"
}

export interface HotkeyEntry {
  id: string
  label: string
  description: string // Action prompt shown to user: "Open the file search!"
  keys: KeyCombo
  screenshotBefore: string // path relative to /public, e.g. /screenshots/cursor/navigation/open-file-before.webp
  screenshotAfter: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface HotkeySet {
  id: string
  name: string
  description: string
  icon: string // Lucide icon name
  hotkeys: HotkeyEntry[]
}

export interface HotkeyOverride {
  enabled: boolean
  keys: KeyCombo | null
}

export type HotkeySetOverrides = Record<string, HotkeyOverride>
export type AppHotkeyOverrides = Record<string, HotkeySetOverrides>

export interface AppDefinition {
  id: string
  name: string
  tagline: string
  logo: string // path to logo in /public/logos/
  accentColor: string // hex
  sets: HotkeySet[]
}
