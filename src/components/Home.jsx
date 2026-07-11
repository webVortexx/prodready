import { COLORS, THEME, TYPE } from '../constants/colors.js';

export function Home({ onNavigate }) {
  const stats = [
    { val: "6",    label: "Manifest Kinds" },
    { val: "4",    label: "Cheatsheets" },
    { val: "100+", label: "Commands" },
    { val: "50+",  label: "Annotated Fields" },
  ];

  const cards = [
    {
      id: "topology",
      icon: "⬡",
      color: COLORS.cluster,
      title: "Topology",
      desc: "Interactive map of a production Kubernetes cluster. Drag nodes, trace connections, inspect every resource.",
      badge: "16 resources",
    },
    {
      id: "simulator",
      icon: "▶",
      color: COLORS.accent,
      title: "Simulator",
      desc: "Safe sandbox for kubectl, helm and terraform. Preview real output before you touch production.",
      badge: "sandbox",
    },
    {
      id: "manifests",
      icon: "☸",
      color: COLORS.external,
      title: "Manifests",
      desc: "Kubernetes resource blueprints with annotated fields. Deployment, Service, ConfigMap, Secret, Ingress, HPA.",
      badge: "6 kinds",
    },
    {
      id: "cheatsheets",
      icon: "⌨",
      color: COLORS.ok,
      title: "Cheatsheets",
      desc: "Copy-ready command references for kubectl, Docker, Git, Linux and more.",
      badge: "4 sheets",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      {/* Faint phosphor glow behind the hero */}
      <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 720, height: 340, background: `radial-gradient(ellipse at center, ${COLORS.accentDim} 0%, transparent 65%)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", padding: "56px 40px 48px", maxWidth: 920, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span className="pr-frame pr-frame-accent" style={{ ...THEME.label, color: COLORS.accent, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}55`, padding: "3px 9px" }}>v1.0</span>
            <span style={{ ...THEME.label, color: COLORS.textFaint }}>SRE · DevOps · Engineering</span>
          </div>
          <h1 style={{ fontSize: TYPE.hero, fontWeight: 800, color: COLORS.text, margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.12 }}>
            Production-grade<br />
            <span style={{ color: COLORS.accent }}>knowledge, fast<span style={{ color: COLORS.textFaint }}>_</span></span>
          </h1>
          <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.75, maxWidth: 540, margin: 0 }}>
            Interactive reference for engineers who build, deploy and operate production systems. No fluff — annotated blueprints and copy-ready commands.
          </p>
        </div>

        {/* Stats strip — framed instrument readout */}
        <div className="pr-frame" style={{ display: "flex", marginBottom: 44, border: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "18px 16px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
              <div style={{ fontSize: TYPE.xl, fontWeight: 800, color: COLORS.accent, lineHeight: 1 }}>{s.val}</div>
              <div style={{ ...THEME.label, fontSize: 9, color: COLORS.textFaint, marginTop: 7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 44 }}>
          {cards.map(card => (
            <div key={card.id} onClick={() => onNavigate(card.id)} className="pr-card" role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(card.id); } }}
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.card, padding: "22px 24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}66`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${card.color}44, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 18, color: card.color, width: 24 }}>{card.icon}</span>
                <span style={{ fontSize: TYPE.md, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.01em" }}>{card.title}</span>
                <span style={{ ...THEME.label, fontSize: 9, color: card.color, border: `1px solid ${card.color}45`, borderRadius: 3, padding: "2px 7px", marginLeft: "auto" }}>{card.badge}</span>
              </div>
              <p style={{ fontSize: TYPE.sm, color: COLORS.textDim, lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
              <div style={{ marginTop: 16, fontSize: TYPE.xs, color: card.color, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 1, background: card.color, display: "inline-block" }} />
                Open
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: THEME.radius.card, padding: "18px 20px" }}>
          <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 12 }}>Coming soon</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Architecture Diagrams", "Runbooks", "Interview Prep", "Concepts", "CI/CD Pipelines"].map(item => (
              <span key={item} style={{ fontSize: TYPE.xs, color: COLORS.textFaint, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "4px 10px" }}>{item}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...THEME.label, fontSize: 9, color: COLORS.textFaint }}>prodready · reference terminal</span>
          <span style={{ fontSize: TYPE.micro, color: COLORS.textFaint, display: "flex", alignItems: "center", gap: 6 }}>
            press <kbd>⌘K</kbd> to jump anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
