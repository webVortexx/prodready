import { useState, useEffect } from "react";
import { COLORS, THEME } from '../constants/colors.js';
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {MANIFESTS.map(m => (
          <button key={m.id} onClick={() => { setActive(m.id); setSearch(""); setHovered(null); }}
            style={{ background: active === m.id ? COLORS.surface : "transparent", border: "none", borderBottom: active === m.id ? `2px solid ${m.color}` : "2px solid transparent", padding: "9px 14px", color: active === m.id ? m.color : COLORS.textDim, cursor: "pointer", fontSize: 11, fontFamily: THEME.fontFamily, whiteSpace: "nowrap", transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, background: COLORS.elevated }}>
        <span style={{ fontSize: 11, color: COLORS.textDim, flex: 1 }}>{cur.description}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: "4px 10px" }}>
          <span style={{ color: COLORS.textFaint, fontSize: 11 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter fields..."
            style={{ background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: 11, width: 130, fontFamily: THEME.fontFamily }} />
        </div>
        <button onClick={copy} style={{ background: copied ? COLORS.greenDim : COLORS.surface, border: `1px solid ${copied ? COLORS.green : COLORS.border}`, borderRadius: 5, padding: "4px 12px", color: copied ? COLORS.green : COLORS.textDim, cursor: "pointer", fontSize: 11, fontFamily: THEME.fontFamily, transition: "all 0.2s" }}>
          {copied ? "✓ copied" : "⎘ copy"}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${COLORS.border} transparent` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, lineHeight: 1.75 }}>
          <tbody>
            {lines.map((item, i) => {
              const isH = hovered === i;
              return (
                <tr key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{ background: isH ? `${cur.color}0d` : "transparent", transition: "background 0.1s" }}>
                  <td style={{ width: 36, textAlign: "right", paddingRight: 14, color: COLORS.textFaint, fontSize: 10, userSelect: "none", borderRight: `1px solid ${COLORS.border}`, paddingLeft: 8, verticalAlign: "top", paddingTop: 1 }}>{i + 1}</td>
                  <td style={{ paddingLeft: 18, paddingRight: 12, whiteSpace: "pre", verticalAlign: "top" }}><YamlLine text={item.line} /></td>
                  <td style={{ paddingRight: 20, verticalAlign: "top", width: 300 }}>
                    {item.note && isH ? (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5, animation: "fadeIn 0.12s ease" }}>
                        <span style={{ color: cur.color, fontSize: 10, marginTop: 3 }}>◀</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim, background: COLORS.elevated, border: `1px solid ${cur.color}40`, borderRadius: 4, padding: "2px 8px", lineHeight: 1.5 }}>{item.note}</span>
                      </div>
                    ) : item.note ? (
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: cur.color, opacity: 0.35, marginTop: 7 }} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ height: 32 }} />
      </div>
      <div style={{ padding: "6px 16px", borderTop: `1px solid ${COLORS.border}`, fontSize: 10, color: COLORS.textFaint, flexShrink: 0 }}>
        {lines.length} lines · hover annotated fields {search ? `· filtered: "${search}"` : ""}
      </div>
    </div>
  );
}
