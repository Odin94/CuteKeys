# CuteKey

A hotkey learning game for developer tools. CuteKey shows you before/after screenshots of an app and asks you to guess which keyboard shortcut caused the change — making it a fun, visual way to build muscle memory for hotkeys.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- pnpm

### Run in dev

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm run build
```

The output is written to `dist/`. To preview the production build locally:

```bash
pnpm run preview
```

### Lint and format

This project uses `oxlint` for linting and `oxfmt` for formatting.

```bash
pnpm run lint:fix
pnpm run format
```

## Screenshots

See [SCREENSHOTS.md](./SCREENSHOTS.md) for the full guide on adding before/after screenshot pairs for hotkeys. Screenshots go in `public/screenshots/{appId}/{setSlug}/` as WebP files. Placeholder SVGs are generated automatically for any missing screenshots so the app works without them.
