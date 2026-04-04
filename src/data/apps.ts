import type { AppDefinition } from '@/types/hotkey'
import cursorApp from './cursor'
import zedApp from './zed'
import ghosttyApp from './ghostty'

export const apps: AppDefinition[] = [cursorApp, zedApp, ghosttyApp]

export const appsById: Record<string, AppDefinition> = Object.fromEntries(
  apps.map((app) => [app.id, app])
)
