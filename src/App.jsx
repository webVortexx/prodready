import { useState, useEffect, useCallback } from "react";
import { COLORS } from './constants/colors.js';
import { Home } from './components/Home.jsx';
import { CommandPalette } from './components/CommandPalette.jsx';
import { ManifestViewer } from './components/ManifestViewer.jsx';
import { CheatsheetViewer } from './components/CheatsheetViewer.jsx';
import { ClusterTopology } from './components/ClusterTopology.jsx';
import { getDefaultSearchIndex } from './utils/search.js';

export default function ProdReady() {
  const C = COLORS;
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeManifest, setActiveManifest] = useState(null);
  const [activeCheatsheet, setActiveCheatsheet] = useState(null);
  const [searchIndex] = useState(() => getDefaultSearchIndex());

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { 
        e.preventDefault(); 
        setPaletteOpen(o => !o); 
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNavigate = useCallback((targetPage, manifestId, cheatsheetId) => {
    setPage(targetPage);
    if (manifestId) setActiveManifest(manifestId);
    if (cheatsheetId) setActiveCheatsheet(cheatsheetId);
  }, []);

  const NAV = [
    { id: "home",        label: "Home",        icon: "⌂", group: null },
    { id: "topology",    label: "Topology",    icon: "⬡", group: null },
    { id: "manifests",   label: "Manifests",   icon: "☸", group: "References" },
    { id: "cheatsheets", label: "Cheatsheets", icon: "⌨", group: "References" },
  ];

  const groups = [
    { label: null,         items: NAV.filter(n => !n.group) },
    { label: "References", items: NAV.filter(n => n.group === "References") },
  ];
  
  const pageTitle = NAV.find(n => n.id === page)?.label || "Home";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", color: C.text }}>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={handleNavigate} searchIndex={searchIndex} />

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 52, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
        <div style={{ padding: sidebarOpen ? "18px 16px 14px" : "18px 14px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 58, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, background: C.green, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, fontWeight: 800, color: C.bg }}>P</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>ProdReady</div>
              <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.1em" }}>SRE · DevOps · Dev</div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "10px 10px 4px" }}>
            <button onClick={() => setPaletteOpen(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textFaint, cursor: "pointer", fontSize: 11, fontFamily: "inherit", textAlign: "left", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <span style={{ fontSize: 12 }}>⌕</span>
              <span style={{ flex: 1 }}>Search...</span>
              <kbd style={{ fontSize: 9, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 4px" }}>⌘K</kbd>
            </button>
          </div>
        )}

        {!sidebarOpen && (
          <div style={{ padding: "8px 8px 4px" }}>
            <button onClick={() => setPaletteOpen(true)} title="Search (⌘K)"
              style={{ width: "100%", padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, cursor: "pointer", fontSize: 14, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>⌕</button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 8px", scrollbarWidth: "none" }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 6 }}>
              {g.label && sidebarOpen && <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 8px 4px", whiteSpace: "nowrap" }}>{g.label}</div>}
              {g.items.map(item => {
                const isActive = page === item.id;
                return (
                  <button key={item.id} onClick={() => setPage(item.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "8px 10px" : "8px 12px", background: isActive ? `${C.green}15` : "transparent", border: "none", borderRadius: 6, color: isActive ? C.green : C.textDim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", textAlign: "left", whiteSpace: "nowrap", transition: "background 0.12s, color 0.12s" }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.elevated; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 14, flexShrink: 0, width: 16, textAlign: "center" }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && isActive && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.green }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 8px", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            {sidebarOpen ? "← collapse" : "→"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ height: 50, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, background: C.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: C.textFaint }}>prodready</span>
            <span style={{ color: C.textFaint, fontSize: 10 }}>/</span>
            <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{pageTitle.toLowerCase()}</span>
          </div>
          <button onClick={() => setPaletteOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textFaint, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <span>⌕</span><span>Search</span>
            <kbd style={{ fontSize: 9, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", marginLeft: 2 }}>⌘K</kbd>
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {["home", "manifests", "cheatsheets"].map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? C.elevated : "transparent", border: `1px solid ${page === p ? C.border : "transparent"}`, borderRadius: 5, padding: "3px 10px", color: page === p ? C.text : C.textFaint, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: page === "home" ? "auto" : "hidden" }}>
          {page === "home"        && <Home onNavigate={handleNavigate} />}
          {page === "topology"    && <ClusterTopology />}
          {page === "manifests"   && <ManifestViewer initialManifest={activeManifest} />}
          {page === "cheatsheets" && <CheatsheetViewer initialCheatsheet={activeCheatsheet} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:translateX(0); } }
        @keyframes paletteIn { from { opacity:0; transform:translateY(-8px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input::placeholder { color: ${C.textFaint}; }
        kbd { font-family: inherit; }
      `}</style>
    </div>
  );
}
