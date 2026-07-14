// Shared "status pill" — a colored dot + label, scannable at a glance
// without reading the text. Part of the Signal Room pass: semantic
// ok/warn/err state becomes the primary visual language on the three
// pages where live/operational state actually matters (Incidents, SLO
// Budget, Topology). Deliberately reuses this codebase's existing small
// outlined-chip convention (radius, border, tinted background — see the
// difficulty/severity badges in IncidentSimulator.jsx / RunbookViewer.jsx)
// rather than introducing a new rounded-capsule shape.
export function StatusPill({ color, label, size = "sm", pulse = false, maxWidth }) {
  const dot = size === "xs" ? 4 : 5;
  return (
    <span title={maxWidth ? label : undefined} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: size === "xs" ? 9 : 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
      color, background: `${color}1a`, border: `1px solid ${color}45`,
      borderRadius: 4, padding: size === "xs" ? "2px 7px" : "3px 8px",
      lineHeight: 1.4, maxWidth: maxWidth || "none",
    }}>
      <span style={{ width: dot, height: dot, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0, animation: pulse ? "blink 1.4s ease-in-out infinite" : "none" }} />
      <span style={{ whiteSpace: "nowrap", overflow: maxWidth ? "hidden" : "visible", textOverflow: "ellipsis", minWidth: 0 }}>{label}</span>
    </span>
  );
}
