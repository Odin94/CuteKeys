import { z } from "zod";

export const appIdSchema = z.enum(["cursor", "zed", "ghostty", "codex"]);
export type AppId = z.infer<typeof appIdSchema>;

export const trainSearchSchema = z.object({
  sets: z.string().optional(),
  challenge: z
    .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "1" || v === "true"),
});

export const leaderboardSearchSchema = z.object({
  highlight: z.string().optional(),
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

export const challengeRunSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  date: z.string(),
  appId: z.string(),
  score: z.number(),
  totalHotkeys: z.number(),
  correctCount: z.number(),
  accuracy: z.number(),
  avgResponseTimeMs: z.number(),
  bestStreak: z.number(),
  durationMs: z.number(),
});

export const appStatsSchema = z.object({
  hotkeyPerformance: z.record(hotkeyPerformanceSchema),
  leaderboard: z.array(leaderboardEntrySchema),
  challengeRuns: z.array(challengeRunSchema).default([]),
});

export const userSettingsSchema = z.object({
  countdownSeconds: z.number().min(1).max(10),
  soundEnabled: z.boolean(),
  modifierDisplay: z.enum(["auto", "ctrl", "cmd"]),
  userId: z.string().default(""),
  userName: z.string().default(""),
});

export const hotkeyOverrideSchema = z.object({
  enabled: z.boolean(),
  keys: keyComboSchema.nullable(),
  prefix: z.array(keyComboSchema).optional(),
});

export const hotkeySetOverridesSchema = z.record(hotkeyOverrideSchema);
export const appHotkeyOverridesSchema = z.record(hotkeySetOverridesSchema);

export const storageDataSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  stats: z.record(appStatsSchema),
  settings: userSettingsSchema,
  hotkeyOverrides: z.record(appHotkeyOverridesSchema).default({}),
});
