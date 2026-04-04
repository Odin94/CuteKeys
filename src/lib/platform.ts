import type { ModifierKey } from '@/types/hotkey'

export type Platform = 'mac' | 'windows' | 'linux'

let _platform: Platform | null = null

export function getPlatform(): Platform {
  if (_platform) return _platform
  const ua = navigator.userAgent
  if (ua.includes('Mac')) _platform = 'mac'
  else if (ua.includes('Linux')) _platform = 'linux'
  else _platform = 'windows'
  return _platform
}

export function isMac(): boolean {
  return getPlatform() === 'mac'
}

/** Map a data-level modifier to the actual keyboard modifier for this platform.
 *  Data uses 'ctrl' as the "primary" modifier.
 *  On Mac, 'ctrl' maps to 'meta' (Cmd). */
export function mapModifier(mod: ModifierKey): ModifierKey {
  if (mod === 'ctrl' && isMac()) return 'meta'
  return mod
}

/** Display label for modifiers */
export function modifierLabel(mod: ModifierKey): string {
  const platform = getPlatform()
  switch (mod) {
    case 'ctrl':
      return platform === 'mac' ? '⌘' : 'Ctrl'
    case 'shift':
      return platform === 'mac' ? '⇧' : 'Shift'
    case 'alt':
      return platform === 'mac' ? '⌥' : 'Alt'
    case 'meta':
      return platform === 'mac' ? '⌘' : 'Win'
  }
}
