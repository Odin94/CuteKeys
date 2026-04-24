# CuteKey

A hotkey learning game for developer tools. CuteKey shows you before/after screenshots of an app and asks you to guess which keyboard shortcut caused the change — making it a fun, visual way to build muscle memory for hotkeys.

Currently supports **Cursor**, **Zed**, and **Ghostty**.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Run in dev

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output is written to `dist/`. To preview the production build locally:

```bash
npm run preview
```

### Lint and format

This project uses `oxlint` for linting and `oxfmt` for formatting.

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

Typical local workflow:

```bash
npm run format
npm run lint
```

## Screenshots

See [SCREENSHOTS.md](./SCREENSHOTS.md) for the full guide on adding before/after screenshot pairs for hotkeys. Screenshots go in `public/screenshots/{appId}/{setSlug}/` as WebP files. Placeholder SVGs are generated automatically for any missing screenshots so the app works without them.
