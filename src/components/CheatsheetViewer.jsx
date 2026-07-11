import { useState, useEffect } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0, background: COLORS.bgDeep }}>
        {CHEATSHEETS.map(c => {
          const isActive = active === c.id;
          return (
            <button key={c.id} onClick={() => setActive(c.id)} className="pr-tab"
              style={{ padding: "10px 16px", ...(isActive ? { color: c.color, background: COLORS.surface, boxShadow: `inset 0 -1px 0 ${c.color}` } : {}) }}>
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{c.icon}</span><span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description bar */}
      <div style={{ padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: cur.color, fontSize: TYPE.xs }}>◈</span>
        <span style={{ fontSize: TYPE.xs, color: COLORS.textDim }}>{cur.description}</span>
        <span style={{ ...THEME.label, fontSize: 9, color: COLORS.textFaint, marginLeft: "auto" }}>click any command to copy</span>
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {cur.sections.map(sec => (
            <div key={sec.title} className="pr-frame" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, overflow: "hidden", "--tick": `${cur.color}66`, alignSelf: "start" }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 9, background: COLORS.bgDeep }}>
                <span style={{ width: 3, height: 12, background: cur.color, display: "inline-block" }} />
                <span style={{ ...THEME.label, color: cur.color }}>{sec.title}</span>
                <span style={{ fontSize: 9, color: COLORS.textFaint, marginLeft: "auto" }}>{sec.commands.length}</span>
              </div>
              <div>
                {sec.commands.map((c, i) => (
                  <div key={i} onClick={() => copy(c.cmd)} className="pr-row"
                    style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer", gap: 10, borderBottom: i < sec.commands.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: TYPE.xs, color: copied === c.cmd ? COLORS.ok : COLORS.text, marginBottom: 3, wordBreak: "break-all", transition: "color 0.15s ease" }}>
                        <span style={{ color: copied === c.cmd ? COLORS.ok : cur.color, marginRight: 7, userSelect: "none" }}>{copied === c.cmd ? "✓" : "❯"}</span>
                        {c.cmd}
                      </div>
                      <div style={{ fontSize: TYPE.micro, color: COLORS.textDim, lineHeight: 1.5, paddingLeft: 15 }}>{c.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      {onTryCommand && (
                        <button onClick={e => { e.stopPropagation(); onTryCommand(c.cmd); }} className="pr-btn"
                          title="Open in the command simulator"
                          style={{ padding: "3px 9px", fontSize: TYPE.micro }}>
                          try ▸
                        </button>
                      )}
                      <span style={{ fontSize: 9, color: copied === c.cmd ? COLORS.ok : COLORS.textFaint }}>{copied === c.cmd ? "copied" : "⎘"}</span>
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
