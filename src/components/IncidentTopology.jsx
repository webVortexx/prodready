import { COLORS } from '../constants/colors.js';

// Compact, static-layout topology for a single incident scenario.
// Deliberately separate from ClusterTopology.jsx (no drag, no selection
// panel) — just enough visual language to react to diagnosis progress.
export function IncidentTopology({ topology, resolved }) {
  const { nodes, connections, unhealthy = [] } = topology;
  const unhealthySet = new Set(unhealthy);

  return (
    <div className="pr-dotgrid" style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {connections.map((c, i) => {
          const from = nodes.find(n => n.id === c.from);
          const to = nodes.find(n => n.id === c.to);
          if (!from || !to) return null;
          const broken = !resolved && (unhealthySet.has(from.id) || unhealthySet.has(to.id));
          return (
            <line key={i}
              x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={broken ? COLORS.err : COLORS.borderHi}
              strokeWidth={broken ? 1.3 : 0.8}
              strokeDasharray={broken ? "3 3" : "none"}
              opacity={broken ? 0.8 : 0.5}
              style={{ transition: "stroke 0.4s ease, opacity 0.4s ease" }}
            />
          );
        })}
      </svg>

      {nodes.map(node => {
        const isUnhealthy = !resolved && unhealthySet.has(node.id);
        const sub = isUnhealthy && node.subBroken ? node.subBroken : node.sub;
        return (
          <div key={node.id} style={{
            position: "absolute", left: `${node.x}%`, top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
          }}>
            {node.root && isUnhealthy && (
              <div style={{
                position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
                color: COLORS.err, whiteSpace: "nowrap", fontWeight: 700,
              }}>root cause</div>
            )}
            <div className="pr-frame" style={{
              "--tick": isUnhealthy ? COLORS.err : node.color,
              background: COLORS.elevated,
              border: `1px solid ${isUnhealthy ? `${COLORS.err}99` : `${node.color}80`}`,
              padding: "7px 11px", minWidth: 116, textAlign: "left",
              animation: isUnhealthy ? "alertPulse 1.7s ease-in-out infinite" : "none",
              transition: "border-color 0.4s ease, background 0.4s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: isUnhealthy ? COLORS.err : node.color, transition: "color 0.4s ease" }}>{node.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.03em", color: isUnhealthy ? COLORS.err : COLORS.text, whiteSpace: "nowrap", transition: "color 0.4s ease" }}>{node.label}</div>
                  <div style={{ fontSize: 8, color: COLORS.textFaint, marginTop: 2, whiteSpace: "nowrap" }}>{sub}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
