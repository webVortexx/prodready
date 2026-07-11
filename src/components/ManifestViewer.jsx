import { useState, useEffect } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { MANIFESTS } from '../data/manifests.js';
import { YamlLine } from './utils.jsx';

export function ManifestViewer({ initialManifest }) {
  const [active, setActive] = useState(initialManifest || "deployment");
  const [hovered, setHovered] = useState(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { if (initialManifest) setActive(initialManifest); }, [initialManifest]);

  const cur = MANIFESTS.find(m => m.id === active);
  const lines = search ? cur.yaml.filter(l =>
    l.line.toLowerCase().includes(search.toLowerCase()) ||
    (l.note && l.note.toLowerCase().includes(search.toLowerCase()))
  ) : cur.yaml;

  const copy = () => {
    navigator.clipboard.writeText(cur.yaml.map(l => l.line).join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: COLORS.bg }}>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0, background: COLORS.bgDeep }}>
        {MANIFESTS.map(m => {
          const isActive = active === m.id;
          return (
            <button key={m.id} onClick={() => { setActive(m.id); setSearch(""); setHovered(null); }} className="pr-tab"
              style={{ padding: "10px 16px", ...(isActive ? { color: m.color, background: COLORS.surface, borderBottom: `1px solid ${m.color}`, boxShadow: `inset 0 -1px 0 ${m.color}` } : {}) }}>
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{m.icon}</span><span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, background: COLORS.surface }}>
        <span style={{ fontSize: TYPE.xs, color: COLORS.textDim, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <span style={{ color: cur.color, marginRight: 8 }}>◈</span>{cur.description}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.bgDeep, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, padding: "4px 10px", transition: `border-color ${THEME.transitions.fast}` }}>
          <span style={{ color: COLORS.textFaint, fontSize: TYPE.xs }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter fields..."
            style={{ background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: TYPE.xs, width: 130, fontFamily: THEME.fontFamily }} />
        </div>
        <button onClick={copy} className="pr-btn"
          style={{ padding: "4px 12px", ...(copied ? { background: COLORS.greenDim, borderColor: `${COLORS.ok}66`, color: COLORS.ok } : {}) }}>
          {copied ? "✓ copied" : "⎘ copy"}
        </button>
      </div>

      {/* Code + annotations */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPE.sm, lineHeight: 1.75 }}>
          <tbody>
            {lines.map((item, i) => {
              const isH = hovered === i;
              return (
                <tr key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{ background: isH ? `${cur.color}0d` : "transparent", transition: "background 0.1s ease" }}>
                  <td style={{ width: 40, textAlign: "right", paddingRight: 14, color: isH ? cur.color : COLORS.textFaint, fontSize: TYPE.micro, userSelect: "none", borderRight: `1px solid ${COLORS.border}`, paddingLeft: 8, verticalAlign: "top", paddingTop: 1, transition: "color 0.1s ease" }}>{i + 1}</td>
                  <td style={{ paddingLeft: 18, paddingRight: 12, whiteSpace: "pre", verticalAlign: "top", fontFamily: THEME.fontFamilyMono }}><YamlLine text={item.line} /></td>
                  <td style={{ paddingRight: 20, verticalAlign: "top", width: 300 }}>
                    {item.note && isH ? (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, animation: "fadeIn 0.14s ease" }}>
                        <span style={{ color: cur.color, fontSize: TYPE.micro, marginTop: 4 }}>◀</span>
                        <span style={{ fontSize: TYPE.micro, color: COLORS.text, background: COLORS.elevated, border: `1px solid ${cur.color}50`, borderLeft: `2px solid ${cur.color}`, borderRadius: 3, padding: "3px 9px", lineHeight: 1.55 }}>{item.note}</span>
                      </div>
                    ) : item.note ? (
                      <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: cur.color, opacity: 0.4, marginTop: 8 }} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ height: 32 }} />
      </div>

      {/* Status bar */}
      <div style={{ padding: "7px 16px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, background: COLORS.bgDeep, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cur.color, opacity: 0.7 }} />
        <span style={{ ...THEME.label, fontSize: 9, color: COLORS.textFaint }}>
          {lines.length} lines · hover annotated fields{search ? ` · filtered: "${search}"` : ""}
        </span>
      </div>
    </div>
  );
}
