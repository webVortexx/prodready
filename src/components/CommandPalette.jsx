import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { runSearch } from '../utils/search.js';
import { highlight, TYPE_LABELS } from './utils.jsx';

export function CommandPalette({ open, onClose, onNavigate, searchIndex }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open && searchIndex) {
      setQuery(""); setResults([]); setActiveIdx(0); setCopied(null);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open, searchIndex]);

  useEffect(() => {
    if (searchIndex) {
      try {
        setResults(runSearch(query, searchIndex));
        setActiveIdx(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }
    }
  }, [query, searchIndex]);

  useEffect(() => {
    const el = listRef.current?.children[activeIdx];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const handleSelect = useCallback((item) => {
    if (item.type === "command") {
      navigator.clipboard.writeText(item.cmd);
      setCopied(item.cmd);
      setTimeout(() => { setCopied(null); onClose(); }, 900);
      return;
    }
    onNavigate(item.page, item.manifestId, item.cheatsheetId);
    onClose();
  }, [onNavigate, onClose]);

  const handleKey = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => results.length > 0 ? Math.min(i + 1, results.length - 1) : 0);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => results.length > 0 ? Math.max(i - 1, 0) : 0);
    }
    if (e.key === "Enter" && results[activeIdx]) handleSelect(results[activeIdx]);
    if (e.key === "Escape") onClose();
  }, [results, activeIdx, handleSelect, onClose]);

  if (!open || !searchIndex) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,8,10,0.78)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh",
      animation: "overlayIn 0.15s ease",
    }}>
      <div onClick={e => e.stopPropagation()} className="pr-frame pr-frame-accent" style={{
        width: 640, maxWidth: "90vw", background: COLORS.surface,
        border: `1px solid ${COLORS.borderHi}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.4)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        maxHeight: "62vh", animation: `paletteIn ${THEME.transitions.spring}`,
      }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          <span style={{ color: COLORS.accent, fontSize: 14, lineHeight: 1 }}>❯</span>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search manifests, commands, fields..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: 14, fontFamily: THEME.fontFamily }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: COLORS.textFaint, cursor: "pointer", fontSize: 13, padding: "0 2px", fontFamily: "inherit" }}>✕</button>}
          <kbd>esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto" }}>
          {!query.trim() && (
            <div style={{ padding: "30px 20px", textAlign: "center" }}>
              <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 16 }}>Quick jump</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Home", page: "home", icon: "⌂" },
                  { label: "Topology", page: "topology", icon: "⬡" },
                  { label: "Simulator", page: "simulator", icon: "▶" },
                  { label: "Manifests", page: "manifests", icon: "☸" },
                  { label: "Cheatsheets", page: "cheatsheets", icon: "⌨" },
                ].map(p => (
                  <button key={p.page} onClick={() => { onNavigate(p.page); onClose(); }} className="pr-btn"
                    style={{ padding: "8px 14px", fontSize: TYPE.sm, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ color: COLORS.accent }}>{p.icon}</span><span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div style={{ padding: "44px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 18, color: COLORS.textFaint, marginBottom: 10, opacity: 0.6 }}>∅</div>
              <div style={{ color: COLORS.textFaint, fontSize: TYPE.sm }}>
                No results for <span style={{ color: COLORS.textDim }}>"{query}"</span>
              </div>
              <div style={{ color: COLORS.textFaint, fontSize: TYPE.micro, marginTop: 6, opacity: 0.7 }}>try a resource kind, tool name, or command fragment</div>
            </div>
          )}
          {results.map((item, i) => {
            const isActive = i === activeIdx;
            const isCopied = copied === item.cmd;
            return (
              <div key={i} onClick={() => handleSelect(item)} onMouseEnter={() => setActiveIdx(i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: isActive ? COLORS.accentDim : "transparent", borderLeft: `2px solid ${isActive ? COLORS.accent : "transparent"}`, cursor: "pointer", transition: "background 0.08s ease" }}>
                <span style={{ fontSize: 13, color: item.color || COLORS.textDim, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: TYPE.base, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label ? highlight(item.label, query) : 'No label'}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {highlight(item.sub, query)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {isCopied && <span style={{ fontSize: TYPE.micro, color: COLORS.ok }}>✓ copied</span>}
                  <span style={{ ...THEME.label, fontSize: 9, color: item.color || COLORS.textFaint, border: `1px solid ${(item.color || COLORS.textFaint) + "40"}`, borderRadius: 3, padding: "1px 6px" }}>
                    {item.type === "command" ? "copy" : TYPE_LABELS[item.type]}
                  </span>
                  {isActive && item.type !== "command" && <span style={{ fontSize: TYPE.micro, color: COLORS.textFaint }}>↵</span>}
                </div>
              </div>
            );
          })}
          {results.length > 0 && <div style={{ height: 8 }} />}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 16, flexShrink: 0, background: COLORS.bgDeep }}>
          {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"], ["click command", "copy"]].map(([key, label]) => (
            <span key={key} style={{ fontSize: TYPE.micro, color: COLORS.textFaint, display: "flex", alignItems: "center", gap: 5 }}>
              <kbd>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
