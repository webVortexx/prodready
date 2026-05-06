import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS, THEME } from '../constants/colors.js';
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
      background: "rgba(8,11,15,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 620, maxWidth: "90vw", background: COLORS.surface,
        border: `1px solid ${COLORS.borderHi}`, borderRadius: 12,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        maxHeight: "60vh", animation: "paletteIn 0.15s cubic-bezier(.2,0,.1,1)",
      }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          <span style={{ color: COLORS.textFaint, fontSize: 15, lineHeight: 1 }}>⌕</span>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search manifests, commands, fields..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: 14, fontFamily: THEME.fontFamily, caretColor: COLORS.green }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: COLORS.textFaint, cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>}
          <kbd style={{ fontSize: 10, color: COLORS.textFaint, background: COLORS.elevated, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${COLORS.border} transparent` }}>
          {!query.trim() && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.textFaint, marginBottom: 16 }}>Quick jump</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[
                  { label: "Home", page: "home", icon: "⌂" },
                  { label: "Manifests", page: "manifests", icon: "☸" },
                  { label: "Cheatsheets", page: "cheatsheets", icon: "⌨" },
                ].map(p => (
                  <button key={p.page} onClick={() => { onNavigate(p.page); onClose(); }}
                    style={{ background: COLORS.elevated, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 16px", color: COLORS.textDim, cursor: "pointer", fontSize: 12, fontFamily: THEME.fontFamily, display: "flex", alignItems: "center", gap: 6, transition: "border-color 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.color = COLORS.green; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textDim; }}>
                    <span>{p.icon}</span><span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: COLORS.textFaint, fontSize: 12 }}>
              No results for <span style={{ color: COLORS.textDim }}>"{query}"</span>
            </div>
          )}
          {results.map((item, i) => {
            const isActive = i === activeIdx;
            const isCopied = copied === item.cmd;
            return (
              <div key={i} onClick={() => handleSelect(item)} onMouseEnter={() => setActiveIdx(i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: isActive ? `${COLORS.green}10` : "transparent", borderLeft: `2px solid ${isActive ? COLORS.green : "transparent"}`, cursor: "pointer", transition: "background 0.08s" }}>
                <span style={{ fontSize: 13, color: item.color || COLORS.textDim, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: COLORS.text, fontFamily: (item.type === "command" || item.type === "field") ? THEME.fontFamilyMono : "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label ? highlight(item.label, query) : 'No label'}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: 10.5, color: COLORS.textFaint, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {highlight(item.sub, query)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {isCopied && <span style={{ fontSize: 10, color: COLORS.green }}>✓ copied</span>}
                  <span style={{ fontSize: 9, color: item.color || COLORS.textFaint, border: `1px solid ${(item.color || COLORS.textFaint) + "40"}`, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.04em" }}>
                    {item.type === "command" ? "copy" : TYPE_LABELS[item.type]}
                  </span>
                  {isActive && item.type !== "command" && <span style={{ fontSize: 10, color: COLORS.textFaint }}>↵</span>}
                </div>
              </div>
            );
          })}
          {results.length > 0 && <div style={{ height: 8 }} />}
        </div>

        {/* Footer */}
        <div style={{ padding: "7px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 16, flexShrink: 0 }}>
          {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"], ["click command", "copy"]].map(([key, label]) => (
            <span key={key} style={{ fontSize: 10, color: COLORS.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
              <kbd style={{ background: COLORS.elevated, border: `1px solid ${COLORS.border}`, borderRadius: 3, padding: "1px 5px", fontSize: 9 }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
