import { COLORS, THEME } from '../constants/colors.js';

export function Home({ onNavigate }) {
  const stats = [
    { val: "6",   label: "Manifest Kinds" },
    { val: "4",   label: "Cheatsheets" },
    { val: "100+", label: "Commands" },
    { val: "50+", label: "Annotated Fields" },
  ];

  const cards = [
    { 
      id: "manifests",   
      icon: "☸", 
      color: COLORS.cyan,  
      title: "Manifests",   
      desc: "Kubernetes resource blueprints with annotated fields. Deployment, Service, ConfigMap, Secret, Ingress, HPA and more.", 
      badge: "6 kinds" 
    },
    { 
      id: "cheatsheets", 
      icon: "⌨", 
      color: COLORS.green, 
      title: "Cheatsheets", 
      desc: "Command references for kubectl, Docker, Git, Linux and more.", 
      badge: "4 sheets" 
    },
  ];

  return (
    <div style={{ padding: "48px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, border: `1px solid ${COLORS.greenDim}`, borderRadius: 4, padding: "2px 8px" }}>v1.0</span>
          <span style={{ fontSize: 10, color: COLORS.textFaint, letterSpacing: "0.12em", textTransform: "uppercase" }}>SRE · DevOps · Engineering</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: COLORS.text, margin: "0 0 12px", letterSpacing: "-1px", lineHeight: 1.15, fontFamily: THEME.fontFamilyMono }}>
          Production-grade<br />
          <span style={{ color: COLORS.green }}>knowledge, fast.</span>
        </h1>
        <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
          Interactive reference for engineers who build, deploy and operate production systems. No fluff — just annotated blueprints and copy-ready commands.
        </p>
      </div>

      <div style={{ display: "flex", gap: 1, marginBottom: 44, background: COLORS.border, borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "18px 20px", background: COLORS.elevated, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.green, fontFamily: THEME.fontFamilyMono, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 44 }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => onNavigate(card.id)}
            style={{ background: COLORS.elevated, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24, cursor: "pointer", transition: "border-color 0.2s, transform 0.15s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `${card.color}08`, borderRadius: "0 10px 0 80px" }} />
            <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{card.title}</span>
              <span style={{ fontSize: 9, color: card.color, border: `1px solid ${card.color}50`, borderRadius: 3, padding: "1px 6px", letterSpacing: "0.05em" }}>{card.badge}</span>
            </div>
            <p style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
            <div style={{ marginTop: 16, fontSize: 11, color: card.color, display: "flex", alignItems: "center", gap: 4 }}>Open <span>→</span></div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 10, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Coming soon</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Architecture Diagrams", "Runbooks", "Interview Prep", "Concepts", "CI/CD Pipelines"].map(item => (
            <span key={item} style={{ fontSize: 11, color: COLORS.textFaint, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "4px 10px" }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
