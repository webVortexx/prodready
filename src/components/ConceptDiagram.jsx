import { useState } from "react";
import { COLORS, THEME } from '../constants/colors.js';

// Shared annotated diagram renderer for the Concepts section.
// Used both for the two full architecture diagrams (nodes carry a
// `.detail` object → click opens an explanation panel) and for the
// compact inline diagrams inside each concept explainer (no `.detail`
// → hover-only, no click panel). Deliberately separate from
// ClusterTopology.jsx (no drag, adds zone regions + click detail panel).
export function ConceptDiagram({ nodes, connections, zones = [], height = 420, compact = false }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const hoveredNode = nodes.find(n => n.id === hovered);
  const selectedNode = nodes.find(n => n.id === selected);

  const getConnected = (nodeId) => {
    const set = new Set();
    connections.forEach(c => {
      if (c.from === nodeId) set.add(c.to);
      if (c.to === nodeId) set.add(c.from);
    });
    return set;
  };
  const connectedIds = hovered ? getConnected(hovered) : new Set();

  return (
    <div className="pr-dotgrid" style={{ position: "relative", width: "100%", height, border: `1px solid ${COLORS.border}`, background: COLORS.bgDeep, overflow: "hidden" }}>

      {/* Zone regions */}
      {zones.map(z => (
        <div key={z.id} style={{
          position: "absolute", left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%`,
          border: `1px dashed ${COLORS.border}`, borderRadius: 4, pointerEvents: "none",
        }}>
          <span style={{ position: "absolute", top: -8, left: 10, background: COLORS.bgDeep, padding: "0 6px", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.textFaint, fontWeight: 600 }}>{z.label}</span>
        </div>
      ))}

      {/* Connections */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {connections.map((c, i) => {
          const from = nodes.find(n => n.id === c.from);
          const to = nodes.find(n => n.id === c.to);
          if (!from || !to) return null;
          const isHighlighted = hovered && (c.from === hovered || c.to === hovered);
          const stroke = isHighlighted ? (hoveredNode?.color || COLORS.accent) : (c.color || COLORS.borderHi);
          return (
            <path key={i}
              d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
              vectorEffect="non-scaling-stroke"
              fill="none" stroke={stroke}
              strokeWidth={isHighlighted ? 1.5 : 1.1}
              strokeDasharray={c.dashed || !isHighlighted ? "3 3" : "none"}
              opacity={isHighlighted ? 1 : (c.dashed ? 0.75 : 0.85)}
              style={{ transition: "stroke 0.15s ease, opacity 0.15s ease" }}
            />
          );
        })}
      </svg>

      {/* Connection labels — plain HTML, not SVG, so text never gets stretched by the non-uniform viewBox above */}
      {connections.map((c, i) => {
        if (!c.label) return null;
        const from = nodes.find(n => n.id === c.from);
        const to = nodes.find(n => n.id === c.to);
        if (!from || !to) return null;
        const isHighlighted = hovered && (c.from === hovered || c.to === hovered);
        const stroke = isHighlighted ? (hoveredNode?.color || COLORS.accent) : (c.color || COLORS.borderHi);
        return (
          <div key={i} style={{
            position: "absolute", left: `${(from.x + to.x) / 2}%`, top: `${(from.y + to.y) / 2}%`,
            transform: "translate(-50%, -50%)", background: COLORS.bgDeep, padding: "0 5px",
            fontSize: compact ? 7 : 8, fontWeight: 500, color: isHighlighted ? stroke : COLORS.textFaint,
            whiteSpace: "nowrap", pointerEvents: "none", transition: "color 0.15s ease",
          }}>{c.label}</div>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const isHovered = hovered === node.id;
        const isSelected = selected === node.id;
        const isConnected = connectedIds.has(node.id);
        const clickable = !!node.detail;
        return (
          <div key={node.id}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => clickable && setSelected(s => s === node.id ? null : node.id)}
            style={{
              position: "absolute", left: `${node.x}%`, top: `${node.y}%`,
              transform: `translate(-50%, -50%) scale(${isSelected ? 1.08 : isHovered ? 1.05 : 1})`,
              cursor: clickable ? "pointer" : "default",
              transition: "transform 0.15s ease",
              zIndex: isSelected ? 15 : isHovered ? 10 : isConnected ? 5 : 1,
            }}>
            {isHovered && (
              <div style={{ position: "absolute", inset: -8, borderRadius: 10, background: `radial-gradient(circle, ${node.color}18 0%, transparent 70%)`, pointerEvents: "none" }} />
            )}
            <div className="pr-frame" style={{
              "--tick": (isHovered || isSelected) ? node.color : undefined,
              background: (isHovered || isSelected) ? COLORS.elevated : isConnected ? COLORS.elevated : COLORS.surface,
              border: `1px solid ${(isHovered || isSelected) ? node.color : isConnected ? `${node.color}60` : COLORS.border}`,
              padding: compact ? "6px 9px" : "7px 11px",
              minWidth: compact ? 92 : 108,
              boxShadow: isHovered ? `0 6px 20px rgba(0,0,0,0.5), 0 0 14px ${node.color}30` : "0 2px 8px rgba(0,0,0,0.25)",
              transition: "all 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: compact ? 12 : 13, color: (isHovered || isConnected || isSelected) ? node.color : COLORS.textDim, transition: "color 0.15s ease" }}>{node.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: compact ? 8.5 : 9.5, fontWeight: 700, letterSpacing: "0.03em", color: (isHovered || isSelected) ? node.color : COLORS.text, whiteSpace: "nowrap" }}>{node.label}</div>
                  {node.sub && <div style={{ fontSize: compact ? 7 : 8, color: COLORS.textFaint, marginTop: 2, whiteSpace: "nowrap" }}>{node.sub}</div>}
                </div>
                {clickable && <span style={{ fontSize: 8, color: COLORS.textFaint, marginLeft: 2 }}>▾</span>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Click detail panel */}
      {selectedNode && selectedNode.detail && (
        <div className="pr-frame" style={{
          "--tick": selectedNode.color,
          position: "absolute", top: 12, right: 12, width: 300, maxHeight: "calc(100% - 24px)",
          background: COLORS.surface, border: `1px solid ${selectedNode.color}88`, zIndex: 25, overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)", animation: `slideIn ${THEME.transitions.spring}`,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ background: `${selectedNode.color}15`, padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, color: selectedNode.color }}>{selectedNode.icon}</span>
              <div>
                <div style={{ color: selectedNode.color, fontSize: 12, fontWeight: 700 }}>{selectedNode.label}</div>
                {selectedNode.sub && <div style={{ color: COLORS.textFaint, fontSize: 9, marginTop: 1 }}>{selectedNode.sub}</div>}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: COLORS.textFaint, fontSize: 16, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: 14, overflow: "auto" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: COLORS.textFaint, fontSize: 9, letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>What it does</div>
              <div style={{ color: COLORS.text, fontSize: 10.5, lineHeight: 1.6 }}>{selectedNode.detail.what}</div>
            </div>
            {selectedNode.detail.facts?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: COLORS.textFaint, fontSize: 9, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Good to know</div>
                {selectedNode.detail.facts.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                    <span style={{ color: selectedNode.color, fontSize: 8, marginTop: 3, flexShrink: 0 }}>●</span>
                    <span style={{ color: COLORS.textDim, fontSize: 10, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <div style={{ color: COLORS.textFaint, fontSize: 9, letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>Why it matters</div>
              <div style={{ color: COLORS.text, fontSize: 10.5, lineHeight: 1.6 }}>{selectedNode.detail.why}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
