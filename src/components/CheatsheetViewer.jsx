import { useState, useEffect } from "react";
import { COLORS, THEME } from '../constants/colors.js';
import { CHEATSHEETS } from '../data/cheatsheets.js';

export function CheatsheetViewer({ initialCheatsheet, onTryCommand }) {
  const [active, setActive] = useState(initialCheatsheet || "kubectl");
  const [copied, setCopied] = useState(null);

  useEffect(() => { if (initialCheatsheet) setActive(initialCheatsheet); }, [initialCheatsheet]);

  const cur = CHEATSHEETS.find(c => c.id === active);
  const copy = (cmd) => { 
    navigator.clipboard.writeText(cmd); 
    setCopied(cmd); 
    setTimeout(() => setCopied(null), 1500); 
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {CHEATSHEETS.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            style={{ background: active === c.id ? COLORS.surface : "transparent", border: "none", borderBottom: active === c.id ? `2px solid ${c.color}` : "2px solid transparent", padding: "9px 16px", color: active === c.id ? c.color : COLORS.textDim, cursor: "pointer", fontSize: 11, fontFamily: THEME.fontFamily, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.elevated, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: COLORS.textDim }}>{cur.description}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${COLORS.border} transparent`, padding: "20px 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {cur.sections.map(sec => (
            <div key={sec.title} style={{ background: COLORS.elevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 3, height: 14, background: cur.color, borderRadius: 2, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: cur.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{sec.title}</span>
              </div>
              <div>
                {sec.commands.map((c, i) => (
                  <div key={i} onClick={() => copy(c.cmd)}
                    style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 14px", cursor: "pointer", gap: 10, borderBottom: i < sec.commands.length - 1 ? `1px solid ${COLORS.border}` : "none", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${cur.color}0d`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: 11.5, color: COLORS.green, marginBottom: 2, wordBreak: "break-all" }}>{c.cmd}</div>
                      <div style={{ fontSize: 10.5, color: COLORS.textDim, lineHeight: 1.4 }}>{c.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      {onTryCommand && (
                        <button onClick={e => { e.stopPropagation(); onTryCommand(c.cmd); }}
                          style={{ border: "1px solid transparent", borderRadius: 6, background: COLORS.surface, color: COLORS.textDim, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
                          Try
                        </button>
                      )}
                      <span style={{ fontSize: 9, color: copied === c.cmd ? COLORS.green : COLORS.textFaint, marginTop: onTryCommand ? 0 : 1 }}>{copied === c.cmd ? "✓" : "⎘"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
