import { z } from "zod";

export const appIdSchema = z.enum(["cursor", "zed", "ghostty", "codex"]);
export type AppId = z.infer<typeof appIdSchema>;

export const trainSearchSchema = z.object({
  sets: z.string().optional(),
});

export const keyComboSchema = z.object({
  modifiers: z.array(z.enum(["primary", "ctrl", "shift", "alt", "meta"])),
  key: z.string(),
});

export const hotkeyPerformanceSchema = z.object({
  hotkeyId: z.string(),
  totalAttempts: z.number(),
  correctAttempts: z.number(),
  avgResponseTimeMs: z.number(),
  bestResponseTimeMs: z.number(),
  excluded: z.boolean(),
  lastPracticed: z.string(),
});

export const leaderboardEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  appId: z.string(),
  setIds: z.array(z.string()),
  score: z.number(),
  totalHotkeys: z.number(),
  correctCount: z.number(),
  accuracy: z.number(),
  avgResponseTimeMs: z.number(),
  bestStreak: z.number(),
});

export const appStatsSchema = z.object({
  hotkeyPerformance: z.record(hotkeyPerformanceSchema),
  leaderboard: z.array(leaderboardEntrySchema),
});

export const userSettingsSchema = z.object({
  countdownSeconds: z.number().min(1).max(10),
  soundEnabled: z.boolean(),
  modifierDisplay: z.enum(["auto", "ctrl", "cmd"]),
});

export const hotkeyOverrideSchema = z.object({
  enabled: z.boolean(),
  keys: keyComboSchema.nullable(),
});

export const hotkeySetOverridesSchema = z.record(hotkeyOverrideSchema);
export const appHotkeyOverridesSchema = z.record(hotkeySetOverridesSchema);

export const storageDataSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  stats: z.record(appStatsSchema),
  settings: userSettingsSchema,
  hotkeyOverrides: z.record(appHotkeyOverridesSchema).default({}),
});
