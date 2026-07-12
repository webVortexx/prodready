import { useState, useEffect, useRef } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { RUNBOOKS } from '../data/runbooks.js';

export function RunbookViewer({ initialRunbook, onNavigate }) {
  const [active, setActive] = useState(initialRunbook || RUNBOOKS[0].id);
  const [copied, setCopied] = useState(null);
  const [pendingJump, setPendingJump] = useState(null);
  const [highlightKey, setHighlightKey] = useState(null);
  const itemRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => { if (initialRunbook) setActive(initialRunbook); }, [initialRunbook]);

  const cur = RUNBOOKS.find(r => r.id === active) || RUNBOOKS[0];

  const copy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1500);
  };

  const doScroll = (kind, id) => {
    const key = `${kind}:${id}`;
    const el = itemRefs.current[key];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightKey(key);
    setTimeout(() => setHighlightKey(k => (k === key ? null : k)), 1700);
  };

  const handleJump = (jump) => {
    if (!jump) return;
    if (jump.kind === "runbook") {
      setActive(jump.id);
      if (jump.stepId) setPendingJump({ kind: "step", id: jump.stepId });
      else if (jump.causeId) setPendingJump({ kind: "rootcause", id: jump.causeId });
    } else {
      doScroll(jump.kind, jump.id);
    }
  };

  // After switching tabs for a cross-runbook jump, wait a tick for the new
  // runbook's DOM to mount, then scroll to the requested step/root cause.
  useEffect(() => {
    if (!pendingJump) return;
    const t = setTimeout(() => {
      doScroll(pendingJump.kind, pendingJump.id);
      setPendingJump(null);
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pendingJump]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [active]);

  const setRef = (kind, id) => (el) => { itemRefs.current[`${kind}:${id}`] = el; };
  const isHighlighted = (kind, id) => highlightKey === `${kind}:${id}`;
  const highlightStyle = (kind, id) => isHighlighted(kind, id)
    ? { borderColor: COLORS.accent, boxShadow: `0 0 0 3px ${COLORS.accentGlow}` }
    : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: COLORS.bg }}>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0, background: COLORS.bgDeep }}>
        {RUNBOOKS.map(r => {
          const isActive = active === r.id;
          return (
            <button key={r.id} onClick={() => setActive(r.id)} className="pr-tab"
              style={{ padding: "10px 16px", ...(isActive ? { color: r.color, background: COLORS.surface, boxShadow: `inset 0 -1px 0 ${r.color}` } : {}) }}>
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{r.icon}</span><span>{r.title}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="pr-dotgrid" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "36px 40px 56px", maxWidth: 860, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span className="pr-frame pr-frame-accent" style={{ ...THEME.label, color: cur.severity.tone, background: `${cur.severity.tone}1a`, border: `1px solid ${cur.severity.tone}55`, padding: "3px 9px" }}>{cur.severity.label}</span>
              <span style={{ ...THEME.label, color: COLORS.textFaint }}>runbook</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 24, color: cur.color }}>{cur.icon}</span>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{cur.title}</h1>
            </div>
            <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>{cur.subtitle}</p>
          </div>

          {/* Trigger / Impact / Symptoms */}
          <div className="pr-frame" style={{ marginBottom: 20, border: `1px solid ${COLORS.border}`, background: COLORS.surface, overflow: "hidden", "--tick": `${cur.color}66` }}>
            <Field label="Trigger" text={cur.trigger} color={cur.color} />
            <Field label="Impact" text={cur.impact} color={cur.color} border />
            <div style={{ padding: "14px 18px" }}>
              <div style={{ ...THEME.label, color: cur.color, marginBottom: 8 }}>What you'll see</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cur.symptoms.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.6 }}>
                    <span style={{ color: cur.color, flexShrink: 0 }}>·</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Immediate actions */}
          {cur.immediateActions?.length > 0 && (
            <div className="pr-frame" style={{ marginBottom: 32, border: `1px solid ${COLORS.err}45`, background: "rgba(224,122,118,0.08)", padding: "14px 18px", "--tick": COLORS.err }}>
              <div style={{ ...THEME.label, color: COLORS.err, marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.err, boxShadow: `0 0 6px ${COLORS.err}` }} />
                First moves — before you finish diagnosing
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cur.immediateActions.map((a, i) => (
                  <div key={i} style={{ fontSize: TYPE.xs, color: COLORS.text, lineHeight: 1.65 }}>{a}</div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic flow */}
          <SectionLabel color={cur.color}>Diagnostic flow</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
            {cur.steps.map(step => (
              <div key={step.id} ref={setRef("step", step.id)} className="pr-frame"
                style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface, padding: "18px 20px", "--tick": `${cur.color}55`, transition: "box-shadow 0.4s ease, border-color 0.4s ease", ...highlightStyle("step", step.id) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: `1px solid ${cur.color}80`, background: `${cur.color}1a`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: cur.color, fontFamily: THEME.fontFamilyMono,
                  }}>{step.id}</span>
                  <div style={{ fontSize: TYPE.md, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.01em" }}>{step.title}</div>
                </div>

                {step.commands?.length > 0 && (
                  <div style={{ marginBottom: 10, marginLeft: 32 }}>
                    {step.commands.map((c, i) => (
                      <div key={i} onClick={() => copy(c.cmd)} className="pr-row"
                        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "7px 10px", cursor: "pointer", gap: 10, borderRadius: 4 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: TYPE.xs, color: copied === c.cmd ? COLORS.ok : COLORS.text, wordBreak: "break-all" }}>
                            <span style={{ color: copied === c.cmd ? COLORS.ok : cur.color, marginRight: 7, userSelect: "none" }}>{copied === c.cmd ? "✓" : "❯"}</span>
                            {c.cmd}
                          </div>
                          <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint, lineHeight: 1.5, paddingLeft: 15, marginTop: 2 }}>{c.desc}</div>
                        </div>
                        <span style={{ fontSize: 9, color: copied === c.cmd ? COLORS.ok : COLORS.textFaint, flexShrink: 0, marginTop: 2 }}>{copied === c.cmd ? "copied" : "⎘"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {step.guidance && (
                  <div style={{ marginLeft: 32, marginBottom: step.branches ? 12 : 0, fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.65 }}>{step.guidance}</div>
                )}

                {step.branches?.length > 0 && (
                  <div style={{ marginLeft: 32, display: "flex", flexDirection: "column", gap: 7 }}>
                    {step.branches.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: COLORS.bgDeep, border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${cur.color}80`, borderRadius: 3 }}>
                        <span style={{ color: cur.color, fontSize: 11, marginTop: 1, flexShrink: 0 }}>↳</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: TYPE.xs, color: COLORS.text }}>
                            <strong style={{ fontWeight: 600 }}>if</strong> {b.when}
                          </div>
                          {b.note && <div style={{ fontSize: TYPE.micro, color: COLORS.textDim, lineHeight: 1.55, marginTop: 3 }}>{b.note}</div>}
                        </div>
                        {b.jump && (
                          <button onClick={() => handleJump(b.jump)} className="pr-btn" style={{ padding: "3px 9px", fontSize: 9.5, flexShrink: 0, color: cur.color, borderColor: `${cur.color}45` }}>
                            {b.jump.kind === "runbook" ? `→ ${RUNBOOKS.find(r => r.id === b.jump.id)?.title || "runbook"}` : "jump ▸"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Root causes */}
          <SectionLabel color={cur.color}>Root causes &amp; fixes</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
            {cur.rootCauses.map(rc => (
              <div key={rc.id} ref={setRef("rootcause", rc.id)} className="pr-frame"
                style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface, padding: "16px 20px", "--tick": `${cur.color}55`, transition: "box-shadow 0.4s ease, border-color 0.4s ease", ...highlightStyle("rootcause", rc.id) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: TYPE.sm, fontWeight: 700, color: COLORS.text }}>{rc.label}</div>
                  {rc.crossRunbook && (
                    <button onClick={() => handleJump({ kind: "runbook", id: rc.crossRunbook })} className="pr-btn pr-btn-ghost"
                      style={{ padding: "2px 8px", fontSize: 9.5, marginLeft: "auto", color: COLORS.textFaint }}>
                      full playbook: {RUNBOOKS.find(r => r.id === rc.crossRunbook)?.title} ▸
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: "6px 12px", fontSize: TYPE.xs, lineHeight: 1.65 }}>
                  <div style={{ color: COLORS.textFaint, ...THEME.label, fontSize: 9, paddingTop: 2 }}>confirm</div>
                  <div style={{ color: COLORS.textDim }}>{rc.confirm}</div>
                  <div style={{ color: COLORS.textFaint, ...THEME.label, fontSize: 9, paddingTop: 2 }}>fix</div>
                  <div style={{ color: COLORS.text }}>{rc.fix}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prevention */}
          <SectionLabel color={cur.color}>Prevention</SectionLabel>
          <div className="pr-frame" style={{ marginBottom: cur.simulatorId ? 24 : 4, border: `1px solid ${COLORS.border}`, background: COLORS.surface, padding: "16px 20px", "--tick": `${COLORS.ok}55` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cur.prevention.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 9, fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.65 }}>
                  <span style={{ color: COLORS.ok, flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>

          {/* Practice CTA */}
          {cur.simulatorId && onNavigate && (
            <div onClick={() => onNavigate("incidents")} className="pr-frame pr-frame-accent pr-card" role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate("incidents"); } }}
              style={{ border: `1px solid ${COLORS.border}`, background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.elevated} 100%)`, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${COLORS.accent}55`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}>
              <span style={{ fontSize: 16, color: COLORS.accent }}>▶</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: TYPE.sm, fontWeight: 700, color: COLORS.text }}>Practice this scenario</div>
                <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint, marginTop: 2 }}>Run the same failure class hands-on in the Incident Simulator, with a real topology and a live terminal.</div>
              </div>
              <span style={{ fontSize: TYPE.xs, color: COLORS.accent }}>Open ▸</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <span style={{ width: 3, height: 13, background: color, display: "inline-block" }} />
      <span style={{ ...THEME.label, color: COLORS.textDim }}>{children}</span>
    </div>
  );
}

function Field({ label, text, color, border }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: border ? `1px solid ${COLORS.border}` : "none", borderTop: border ? `1px solid ${COLORS.border}` : "none" }}>
      <div style={{ ...THEME.label, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}
