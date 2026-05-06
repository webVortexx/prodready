// Design tokens - Color palette
export const COLORS = {
  bg:        "#0a0e27",
  surface:   "#131720",
  elevated:  "#1a2035",
  border:    "#2a3142",
  borderHi:  "#3d4556",
  text:      "#e0e6ed",
  textDim:   "#8892a0",
  textFaint: "#4a5568",
  // K8s color scheme
  cluster:   "#4dd0e1",
  ingress:   "#5c6bc0",
  service:   "#26a69a",
  external:  "#42a5f5",
  configmap: "#9575cd",
  deployment:"#66bb6a",
  secret:    "#ff7043",
  pod:       "#4caf50",
  node:      "#78909c",
  hpa:       "#ffa726",
  pvc:       "#7e57c2",
  // Legacy mappings
  green:     "#4caf50",
  greenDim:  "#1b5e20",
  blue:      "#42a5f5",
  cyan:      "#4dd0e1",
  orange:    "#ff7043",
  yellow:    "#9575cd",
  purple:    "#7e57c2",
  red:       "#ef5350",
};

export const THEME = {
  fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
  fontFamilyMono: "'JetBrains Mono','Fira Code',monospace",
  transitions: {
    quick: "0.12s ease",
    fast: "0.15s ease",
    smooth: "0.2s ease",
  },
};
