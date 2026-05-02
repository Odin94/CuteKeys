import type {
  AppDefinition,
  AppHotkeyOverrides,
  HotkeyEntry,
  KeyCombo,
  ModifierKey,
} from "@/types/hotkey";

const ZED_MODIFIERS: Record<string, ModifierKey | null> = {
  cmd: "meta",
  ctrl: "ctrl",
  alt: "alt",
  shift: "shift",
  secondary: "primary",
  fn: null, // not representable — caller should skip binding
};

const KEY_ALIASES: Record<string, string> = {
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  space: " ",
  pageup: "pageup",
  pagedown: "pagedown",
};

/** Strip line and block comments Zed allows in keymap.json. */
function stripJsonComments(source: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  let stringChar = "";
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (inString) {
      out += c;
      if (c === "\\" && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === stringChar) inString = false;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      stringChar = c;
      out += c;
      i++;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Remove trailing commas before `]` or `}`. */
function stripTrailingCommas(source: string): string {
  return source.replace(/,(\s*[}\]])/g, "$1");
}

export function parseZedKeymap(source: string): unknown {
  const cleaned = stripTrailingCommas(stripJsonComments(source));
  return JSON.parse(cleaned);
}

/** Parse a single Zed keystroke like "cmd-shift-p". Returns null if not representable. */
export function parseZedKeystroke(raw: string): KeyCombo | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.includes(" ")) return null; // single-step only
  const parts = trimmed.split("-").filter(Boolean);
  if (parts.length === 0) return null;

  const modifiers: ModifierKey[] = [];
  let key: string | null = null;

  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    const isLast = idx === parts.length - 1;
    if (!isLast && part in ZED_MODIFIERS) {
      const mod = ZED_MODIFIERS[part];
      if (mod === null) return null;
      if (!modifiers.includes(mod)) modifiers.push(mod);
      continue;
    }
    if (isLast && part in ZED_MODIFIERS && parts.length > 1) {
      return null; // last token is a modifier, no actual key
    }
    key = KEY_ALIASES[part] ?? part;
  }

  if (!key) return null;
  return { modifiers: [...new Set(modifiers)].sort(), key };
}

/**
 * Parse a Zed keystroke sequence like "cmd-k cmd-z" into an ordered list of combos.
 * Returns null if any step is unrepresentable.
 */
export function parseZedKeystrokeSequence(raw: string): KeyCombo[] | null {
  const steps = raw.trim().split(/\s+/).filter(Boolean);
  if (steps.length === 0) return null;
  const combos: KeyCombo[] = [];
  for (const step of steps) {
    const combo = parseZedKeystroke(step);
    if (!combo) return null;
    combos.push(combo);
  }
  return combos;
}

type RawBinding = {
  context?: unknown;
  bindings?: unknown;
};

function extractAction(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

export type ZedKeymapImportResult = {
  overrides: AppHotkeyOverrides;
  matched: number;
  unmatchedActions: string[];
};

/** Given a parsed keymap.json value, build overrides for Zed hotkeys that expose a `zedAction`. */
export function buildZedOverrides(app: AppDefinition, parsed: unknown): ZedKeymapImportResult {
  if (!Array.isArray(parsed)) {
    throw new Error("keymap.json must be a JSON array of binding entries");
  }

  const actionToHotkeys = new Map<string, { setId: string; hotkey: HotkeyEntry }[]>();
  for (const set of app.sets) {
    for (const hotkey of set.hotkeys) {
      if (!hotkey.zedAction) continue;
      const existing = actionToHotkeys.get(hotkey.zedAction) ?? [];
      existing.push({ setId: set.id, hotkey });
      actionToHotkeys.set(hotkey.zedAction, existing);
    }
  }

  const overrides: AppHotkeyOverrides = {};
  const seen = new Set<string>();
  const unmatched = new Set<string>();
  let matched = 0;

  for (const entry of parsed as RawBinding[]) {
    const bindings = entry?.bindings;
    if (!bindings || typeof bindings !== "object") continue;

    for (const [keystroke, rawAction] of Object.entries(bindings as Record<string, unknown>)) {
      const action = extractAction(rawAction);
      if (!action) continue;

      const targets = actionToHotkeys.get(action);
      if (!targets || targets.length === 0) {
        unmatched.add(action);
        continue;
      }

      const sequence = parseZedKeystrokeSequence(keystroke);
      if (!sequence) continue;

      const finalCombo = sequence[sequence.length - 1];
      const prefix = sequence.length > 1 ? sequence.slice(0, -1) : undefined;

      for (const target of targets) {
        const dedupeKey = `${target.setId}:${target.hotkey.id}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        if (!overrides[target.setId]) overrides[target.setId] = {};
        overrides[target.setId][target.hotkey.id] = {
          enabled: true,
          keys: finalCombo,
          ...(prefix ? { prefix } : {}),
        };
        matched++;
      }
    }
  }

  return {
    overrides,
    matched,
    unmatchedActions: [...unmatched].sort(),
  };
}

/** Merge newly-imported overrides on top of existing ones. Imported bindings win per-hotkey. */
export function mergeOverrides(
  existing: AppHotkeyOverrides,
  incoming: AppHotkeyOverrides,
): AppHotkeyOverrides {
  const result: AppHotkeyOverrides = { ...existing };
  for (const [setId, setOverrides] of Object.entries(incoming)) {
    result[setId] = { ...result[setId], ...setOverrides };
  }
  return result;
}
