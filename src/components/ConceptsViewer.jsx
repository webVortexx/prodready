import { useState, useEffect } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { ARCHITECTURE, EXPLAINERS } from '../data/concepts.js';
import { ConceptDiagram } from './ConceptDiagram.jsx';

const CATEGORIES = [
  { id: "architecture", label: "Architecture", icon: "⬡", items: ARCHITECTURE },
  { id: "explainers",   label: "Explainers",   icon: "⌁", items: EXPLAINERS },
];

export function ConceptsViewer({ initialConcept }) {
  const initialCategory = ARCHITECTURE.some(a => a.id === initialConcept) ? "architecture"
    : EXPLAINERS.some(e => e.id === initialConcept) ? "explainers" : "architecture";
  const [category, setCategory] = useState(initialCategory);
  const [active, setActive] = useState(initialConcept || ARCHITECTURE[0].id);

  useEffect(() => {
    if (!initialConcept) return;
    setActive(initialConcept);
    setCategory(ARCHITECTURE.some(a => a.id === initialConcept) ? "architecture" : "explainers");
  }, [initialConcept]);

  const items = CATEGORIES.find(c => c.id === category).items;
  const cur = items.find(i => i.id === active) || items[0];

  const selectCategory = (catId) => {
    setCategory(catId);
    setActive(CATEGORIES.find(c => c.id === catId).items[0].id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: COLORS.bg }}>

      {/* Category switch */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px 0", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bgDeep, flexShrink: 0 }}>
        {CATEGORIES.map(c => {
          const isActive = category === c.id;
          return (
            <button key={c.id} onClick={() => selectCategory(c.id)} className="pr-btn pr-btn-ghost"
              style={{ padding: "7px 14px 9px", fontSize: TYPE.sm, borderRadius: 0, borderBottom: `2px solid ${isActive ? COLORS.accent : "transparent"}`, color: isActive ? COLORS.accent : COLORS.textDim, display: "flex", alignItems: "center", gap: 7 }}>
              <span>{c.icon}</span><span>{c.label}</span>
              <span style={{ ...THEME.label, fontSize: 8, color: COLORS.textFaint, marginLeft: 2 }}>{c.items.length}</span>
            </button>
          );
        })}
      </div>

      {/* Item tabs */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0, background: COLORS.surface }}>
        {items.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} className="pr-tab"
              style={{ padding: "9px 16px", ...(isActive ? { color: item.color, boxShadow: `inset 0 -1px 0 ${item.color}` } : {}) }}>
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span><span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="pr-dotgrid" style={{ flex: 1, overflowY: "auto" }}>
        {category === "architecture" ? (
          <ArchitecturePanel arch={cur} />
        ) : (
          <ExplainerPanel exp={cur} />
        )}
      </div>
    </div>
  );
}

function ArchitecturePanel({ arch }) {
  return (
    <div style={{ padding: "28px 40px 48px", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20, color: arch.color }}>{arch.icon}</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.02em" }}>{arch.title}</h1>
      </div>
      <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.7, maxWidth: 720, margin: "0 0 22px" }}>{arch.intro}</p>
      <ConceptDiagram nodes={arch.nodes} connections={arch.connections} zones={arch.zones} height={460} />
      <div style={{ marginTop: 12, fontSize: TYPE.micro, color: COLORS.textFaint, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: arch.color }}>▾</span> click any component for what it does and why it matters · hover to trace its connections
      </div>
    </div>
  );
}

function ExplainerPanel({ exp }) {
  return (
    <div style={{ padding: "28px 40px 56px", maxWidth: 780, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 20, color: exp.color }}>{exp.icon}</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.02em" }}>{exp.title}</h1>
      </div>
      <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 22px" }}>{exp.tagline}</p>

      <ConceptDiagram nodes={exp.diagram.nodes} connections={exp.diagram.connections} height={220} compact />

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
        {exp.sections.map((s, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <span style={{ width: 3, height: 13, background: exp.color, display: "inline-block" }} />
              <span style={{ fontSize: TYPE.sm, fontWeight: 700, color: COLORS.text }}>{s.heading}</span>
            </div>
            <p style={{ fontSize: TYPE.sm, color: COLORS.textDim, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div className="pr-frame" style={{ marginTop: 28, border: `1px solid ${COLORS.border}`, background: COLORS.surface, padding: "16px 20px", "--tick": `${exp.color}66` }}>
        <div style={{ ...THEME.label, color: exp.color, marginBottom: 10 }}>Key facts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {exp.keyFacts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 9, fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.6 }}>
              <span style={{ color: exp.color, flexShrink: 0 }}>·</span>{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
