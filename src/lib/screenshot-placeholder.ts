/** Generates an SVG data URL used as a fallback when screenshots aren't available yet. */
export function placeholderScreenshot(
  appName: string,
  action: string,
  color: string,
  phase: "before" | "after",
): string {
  const bg = phase === "before" ? lighten(color, 0.9) : lighten(color, 0.8);
  const text = phase === "before" ? action : `✓ ${action}`;
  const label = phase === "before" ? "BEFORE" : "AFTER";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <rect width="1280" height="800" fill="${bg}" rx="0"/>

  <!-- Simulated window chrome -->
  <rect width="1280" height="36" fill="${lighten(color, 0.7)}" />
  <circle cx="20" cy="18" r="6" fill="#FF6B6B"/>
  <circle cx="40" cy="18" r="6" fill="#FFD93D"/>
  <circle cx="60" cy="18" r="6" fill="#6BCB77"/>

  <!-- App name in titlebar -->
  <text x="640" y="23" text-anchor="middle" font-family="system-ui" font-size="13" fill="${darken(color, 0.3)}" font-weight="600">${appName}</text>

  <!-- Phase badge -->
  <rect x="20" y="56" width="80" height="28" rx="6" fill="${color}" opacity="0.2"/>
  <text x="60" y="75" text-anchor="middle" font-family="system-ui" font-size="12" fill="${darken(color, 0.2)}" font-weight="700">${label}</text>

  <!-- Main content area placeholder lines -->
  ${Array.from(
    { length: 12 },
    (_, i) => `
  <rect x="120" y="${120 + i * 36}" width="${200 + Math.sin(i * 1.5) * 150 + 100}" height="14" rx="3" fill="${darken(color, 0.1)}" opacity="0.15"/>
  `,
  ).join("")}

  <!-- Center message -->
  <rect x="240" y="300" width="800" height="200" rx="16" fill="white" opacity="0.6"/>
  <text x="640" y="370" text-anchor="middle" font-family="system-ui" font-size="22" fill="${darken(color, 0.4)}" font-weight="700">${appName}</text>
  <text x="640" y="410" text-anchor="middle" font-family="system-ui" font-size="15" fill="${darken(color, 0.3)}">${text}</text>
  <text x="640" y="450" text-anchor="middle" font-family="system-ui" font-size="13" fill="${darken(color, 0.2)}" opacity="0.7">Screenshot not yet available — add your own!</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `rgb(${dr},${dg},${db})`;
}
