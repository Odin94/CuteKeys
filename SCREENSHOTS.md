# Screenshot Guide

Screenshots should be **WebP format, 1280×800px**, saved to `public/screenshots/{appId}/{setSlug}/{hotkeySlug}-{before|after}.webp`.

The **before** screenshot shows the app in a neutral state. The **after** screenshot shows the visual result of pressing the hotkey.

Placeholder SVGs are generated automatically for missing screenshots, so the app works without them.

---

## Cursor (24 screenshots)

### Navigation Set (`cursor/navigation/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Quick Open File (Ctrl+P) | Editor with files, no dialog | Quick Open dialog visible |
| Go to Line (Ctrl+G) | Editor with cursor in file | Go to Line input bar at top |
| Toggle Explorer (Ctrl+Shift+E) | Explorer panel open | Explorer panel closed |
| Toggle Terminal (Ctrl+`) | No terminal panel | Integrated terminal open at bottom |
| Toggle Sidebar (Ctrl+B) | Sidebar visible | Sidebar hidden, more editor space |

### Search Set (`cursor/search/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Find in Files (Ctrl+Shift+F) | Editor, no search | Search panel open in sidebar |
| Find & Replace (Ctrl+H) | Editor with text | Find & Replace panel open in editor |
| Find in File (Ctrl+F) | Editor with text | Find in File bar visible at top |

### Editing Set (`cursor/editing/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Select Next Occurrence (Ctrl+D) | Cursor on a word | Same word selected with multi-cursor |
| Delete Line (Ctrl+Shift+K) | Cursor on a line | Line removed, cursor on next line |
| Move Line Up (Alt+Up) | Line below another line | Line moved one position up |
| Move Line Down (Alt+Down) | Line above another line | Line moved one position down |

---

## Zed (24 screenshots)

### Navigation Set (`zed/navigation/`)

| Hotkey | Before | After |
|--------|--------|-------|
| File Finder (Ctrl+P) | Editor open | File finder palette visible |
| Go to Line (Ctrl+G) | Editor with cursor | Go to Line input visible |
| Toggle Project Panel (Ctrl+Shift+E) | Project panel open | Project panel closed |
| Toggle Terminal (Ctrl+`) | No terminal | Terminal panel open |
| Toggle Left Dock (Ctrl+B) | Left dock visible | Left dock hidden |

### Search Set (`zed/search/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Project Search (Ctrl+Shift+F) | Editor open | Project search panel open |
| Buffer Search (Ctrl+F) | Editor with text | Buffer search bar at top |
| Replace in Buffer (Ctrl+H) | Editor with text | Find & Replace bar visible |

### Editing Set (`zed/editing/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Select Next Occurrence (Ctrl+D) | Word in editor | Same word multi-selected |
| Delete Line (Ctrl+Shift+K) | Cursor on a line | Line deleted |
| Move Line Up (Alt+Up) | Cursor on a line | Line moved up |
| Move Line Down (Alt+Down) | Cursor on a line | Line moved down |

---

## Ghostty (20 screenshots)

### Tabs Set (`ghostty/tabs/`)

| Hotkey | Before | After |
|--------|--------|-------|
| New Tab (Ctrl+Shift+T) | Single tab open | New tab created, tab bar visible |
| Close Tab (Ctrl+Shift+W) | Multiple tabs open | Current tab closed |
| Next Tab (Ctrl+Tab) | Multiple tabs, first active | Second tab active |
| Previous Tab (Ctrl+Shift+Tab) | Multiple tabs, second active | First tab active |

### Splits Set (`ghostty/splits/`)

| Hotkey | Before | After |
|--------|--------|-------|
| New Split Right (Ctrl+Shift+Enter) | Single pane | Two panes side by side |
| Focus Next Split (Ctrl+Shift+]) | Left pane focused | Right pane focused |
| Focus Previous Split (Ctrl+Shift+[) | Right pane focused | Left pane focused |

### Navigation Set (`ghostty/navigation/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Scroll Up (Shift+PageUp) | Terminal at bottom of output | Scrolled up several lines |
| Scroll Down (Shift+PageDown) | Terminal scrolled up | Back at bottom of output |
| Clear Screen (Ctrl+Shift+K) | Terminal with previous output | Clean terminal, cursor at top |

---

## Codex (28 screenshots)

### Workspace Set (`codex/workspace/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Command Menu (Cmd+K) | Thread view with composer idle | Command menu visible |
| Open Folder (Cmd+O) | Codex home or thread view | Folder picker or workspace chooser opened |
| Navigate Back (Cmd+[) | Later screen in navigation history | Previous screen visible |
| Navigate Forward (Cmd+]) | Earlier screen after going back | Forward screen restored |

### Panels Set (`codex/panels/`)

| Hotkey | Before | After |
|--------|--------|-------|
| Open Settings (Cmd+,) | Main app view | Settings panel or screen visible |
| Toggle Sidebar (Cmd+B) | Sidebar visible | Sidebar hidden |
| Toggle Diff Panel (Cmd+Option+B) | Diff panel closed | Diff panel open |
| Toggle Terminal (Cmd+J) | Terminal hidden | Terminal panel visible |
| Clear Terminal (Ctrl+L) | Terminal with previous output | Terminal cleared |

### Thread Set (`codex/thread/`)

| Hotkey | Before | After |
|--------|--------|-------|
| New Thread (Cmd+N) | Existing thread open | Fresh thread created |
| Find in Thread (Cmd+F) | Long thread with messages | Thread search UI open |
| Previous Thread (Cmd+Shift+[) | Later thread selected | Previous thread selected |
| Next Thread (Cmd+Shift+]) | Earlier thread selected | Next thread selected |
| Dictation (Ctrl+M) | Composer focused | Dictation started in composer |

---

## Capture Tips

- Use a **consistent window size** (1280×800) across all screenshots for the same app
- Use **light theme** for Cursor and Zed — it matches the app's warm palette
- For **before/after pairs**, keep everything the same except the visible change from the hotkey
- Export as **WebP** with quality ~85 for good size/quality balance
- Put screenshots in `public/screenshots/` — the app serves them as static assets
