// ─────────────────────────────────────────────────────────────
// ProdReady design tokens — "instrument panel" theme
// Warm near-black graphite · hairline borders · aurora accent
// NOTE: keep in sync with the CSS custom properties in src/index.css
// ─────────────────────────────────────────────────────────────
export const COLORS = {
  // Surfaces (layered, warm graphite)
  bgDeep:    "#08080a",
  bg:        "#0c0c0f",
  surface:   "#111116",
  elevated:  "#16161d",
  overlay:   "#1b1b24",

  // Hairlines
  border:    "#22222c",
  borderHi:  "#32323f",

  // Ink
  text:      "#e8e6e1",
  textDim:   "#94929c",
  textFaint: "#5c5a66",

  // Accent — aurora (teal-cyan anchor; used solid everywhere except the
  // two signature gradient spots called out by auroraGradient below)
  accent:       "#2dd4bf",
  accentBright: "#5eead4",
  accentDim:    "rgba(45,212,191,0.14)",
  accentGlow:   "rgba(45,212,191,0.35)",

  // Aurora gradient — reserved for exactly two signature spots:
  // the brand mark and the hero headline highlight. Everywhere else
  // uses the solid `accent` above to keep the UI coherent, not chaotic.
  auroraGradient: "linear-gradient(135deg, #2dd4bf 0%, #6d8fe8 52%, #b37fe0 100%)",

  // Status
  ok:        "#7fc98b",
  err:       "#e07a76",
  errDim:    "rgba(224,122,118,0.14)",

  // K8s resource color-coding (desaturated, sits quietly on graphite)
  cluster:   "#7fd1c7",
  ingress:   "#8b93d6",
  service:   "#6fc7b4",
  external:  "#7aaee0",
  configmap: "#a995db",
  deployment:"#85c88f",
  secret:    "#e09070",
  pod:       "#7fc98b",
  node:      "#8d9ba8",
  hpa:       "#e0ac6b",
  pvc:       "#9c86d4",

  // Legacy mappings (data files & older call sites)
  green:     "#7fc98b",
  greenDim:  "rgba(127,201,139,0.16)",
  blue:      "#7aaee0",
  cyan:      "#7fd1c7",
  orange:    "#e09070",
  yellow:    "#a995db",
  purple:    "#9c86d4",
  red:       "#e07a76",
};

// Type scale — use these sizes only, no ad-hoc values
export const TYPE = {
  micro: 10,   // uppercase micro-labels, kbd, meta
  xs:    11,   // secondary text, buttons
  sm:    12,   // body, code
  base:  13,   // inputs, primary rows
  md:    15,   // panel titles
  lg:    18,   // section headings
  xl:    26,   // stats
  title: 28,   // standalone sub-page H1 (Incidents, SLO, Runbooks, Concepts)
  hero:  40,   // landing headline (Home only)
};

export const THEME = {
  fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
  fontFamilyMono: "'JetBrains Mono','Fira Code',monospace",
  // Corner-radius language: controls 6, cards 8, framed feature surfaces 0 (+ ticks)
  radius: { control: 6, card: 8, frame: 0 },
  transitions: {
    quick: "0.12s ease",
    fast: "0.16s ease",
    smooth: "0.22s cubic-bezier(.4,0,.2,1)",
    spring: "0.24s cubic-bezier(.16,1,.3,1)",
  },
  // Uppercase micro-label — the app's most repeated typographic gesture
  label: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
};
