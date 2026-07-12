import { useState, useEffect, useCallback } from "react";
import { COLORS, THEME } from './constants/colors.js';
import { Home } from './components/Home.jsx';
import { CommandPalette } from './components/CommandPalette.jsx';
import { ManifestViewer } from './components/ManifestViewer.jsx';
import { CheatsheetViewer } from './components/CheatsheetViewer.jsx';
import { ClusterTopology } from './components/ClusterTopology.jsx';
import { CommandSimulator } from './components/CommandSimulator.jsx';
import { IncidentSimulator } from './components/IncidentSimulator.jsx';
import { SLOCalculator } from './components/SLOCalculator.jsx';
import { RunbookViewer } from './components/RunbookViewer.jsx';
import { ConceptsViewer } from './components/ConceptsViewer.jsx';
import { getDefaultSearchIndex } from './utils/search.js';

export default function ProdReady() {
  const C = COLORS;
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeManifest, setActiveManifest] = useState(null);
  const [activeCheatsheet, setActiveCheatsheet] = useState(null);
  const [activeCommand, setActiveCommand] = useState("kubectl get pods");
  const [activeRunbook, setActiveRunbook] = useState(null);
  const [activeConcept, setActiveConcept] = useState(null);
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

  const handleNavigate = useCallback((targetPage, manifestId, cheatsheetId, command, runbookId, conceptId) => {
    setPage(targetPage);
    if (manifestId) setActiveManifest(manifestId);
    if (cheatsheetId) setActiveCheatsheet(cheatsheetId);
    if (command) setActiveCommand(command);
    if (runbookId) setActiveRunbook(runbookId);
    if (conceptId) setActiveConcept(conceptId);
  }, []);

  const NAV = [
    { id: "home",        label: "Home",        icon: "⌂", group: null },
    { id: "topology",    label: "Topology",    icon: "⬡", group: null },
    { id: "simulator",   label: "Simulator",   icon: "▶", group: "Tools" },
    { id: "incidents",   label: "Incidents",   icon: "▲", group: "Tools" },
    { id: "slo",         label: "SLO Budget",  icon: "◔", group: "Tools" },
    { id: "manifests",   label: "Manifests",   icon: "☸", group: "References" },
    { id: "cheatsheets", label: "Cheatsheets", icon: "⌨", group: "References" },
    { id: "runbooks",    label: "Runbooks",    icon: "▤", group: "References" },
    { id: "concepts",    label: "Concepts",    icon: "◎", group: "References" },
  ];

  const groups = [
    { label: null,         items: NAV.filter(n => !n.group) },
    { label: "Tools",      items: NAV.filter(n => n.group === "Tools") },
    { label: "References", items: NAV.filter(n => n.group === "References") },
  ];

  const pageTitle = NAV.find(n => n.id === page)?.label || "Home";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: THEME.fontFamily, color: C.text }}>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={handleNavigate} searchIndex={searchIndex} />

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 224 : 56, flexShrink: 0, background: C.bgDeep, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: `width ${THEME.transitions.smooth}`, overflow: "hidden" }}>

        {/* Brand */}
        <div style={{ padding: sidebarOpen ? "16px 14px" : "16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 60, flexShrink: 0 }}>
          <div className="pr-frame pr-frame-accent" style={{ width: 30, height: 30, background: C.auroraGradient, border: `1px solid ${C.accent}88`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, fontWeight: 800, color: C.bgDeep }}>P</div>
          {sidebarOpen && (
            <div style={{ whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>ProdReady</div>
              <div style={{ ...THEME.label, fontSize: 9, color: C.textFaint, marginTop: 1 }}>SRE · DevOps · Dev</div>
            </div>
          )}
        </div>

        {/* Search trigger */}
        <div style={{ padding: sidebarOpen ? "12px 10px 4px" : "12px 8px 4px" }}>
          {sidebarOpen ? (
            <button onClick={() => setPaletteOpen(true)} className="pr-btn"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", textAlign: "left", color: C.textFaint }}>
              <span style={{ fontSize: 12 }}>⌕</span>
              <span style={{ flex: 1 }}>Search...</span>
              <kbd>⌘K</kbd>
            </button>
          ) : (
            <button onClick={() => setPaletteOpen(true)} title="Search (⌘K)" className="pr-btn pr-btn-ghost"
              style={{ width: "100%", padding: 8, fontSize: 13 }}>⌕</button>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 8px", scrollbarWidth: "none" }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              {g.label && sidebarOpen && <div style={{ ...THEME.label, fontSize: 9, color: C.textFaint, padding: "10px 8px 5px", whiteSpace: "nowrap" }}>{g.label}</div>}
              {g.label && !sidebarOpen && <div style={{ height: 1, background: C.border, margin: "10px 6px 8px" }} />}
              {g.items.map(item => {
                const isActive = page === item.id;
                return (
                  <button key={item.id} onClick={() => setPage(item.id)} className="pr-nav-item" data-active={isActive} title={sidebarOpen ? undefined : item.label}
                    style={{ padding: sidebarOpen ? "8px 10px" : "8px 12px", marginBottom: 1 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, width: 16, textAlign: "center" }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && isActive && <span style={{ marginLeft: "auto", width: 3, height: 12, background: C.accent, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 8px", flexShrink: 0 }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px 8px", whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ok, boxShadow: `0 0 6px ${C.ok}`, flexShrink: 0 }} />
              <span style={{ ...THEME.label, fontSize: 9, color: C.textFaint }}>all systems nominal</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className="pr-btn pr-btn-ghost"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{ width: "100%", padding: 6, border: `1px solid ${C.border}` }}>
            {sidebarOpen ? "← collapse" : "→"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, background: C.bgDeep, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
            <span style={{ color: C.textFaint }}>prodready</span>
            <span style={{ color: C.textFaint, opacity: 0.5 }}>/</span>
            <span style={{ color: C.accent, fontWeight: 600 }}>{pageTitle.toLowerCase()}</span>
          </div>
          <button onClick={() => setPaletteOpen(true)} className="pr-btn"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", color: C.textFaint }}>
            <span>⌕</span><span>Search</span>
            <kbd style={{ marginLeft: 2 }}>⌘K</kbd>
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["home", "manifests", "cheatsheets"].map(p => (
              <button key={p} onClick={() => setPage(p)} className="pr-btn pr-btn-ghost"
                style={{ padding: "3px 10px", fontSize: 10, letterSpacing: "0.04em", ...(page === p ? { background: C.elevated, borderColor: C.borderHi, color: C.text } : { borderColor: "transparent", color: C.textFaint }) }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Page — keyed so every navigation gets a subtle entrance */}
        <div key={page} className="pr-dotgrid" style={{ flex: 1, minHeight: 0, overflow: page === "home" ? "auto" : "hidden", animation: "pageIn 0.28s cubic-bezier(.16,1,.3,1)" }}>
          {page === "home"        && <Home onNavigate={handleNavigate} />}
          {page === "topology"    && <ClusterTopology />}
          {page === "simulator"   && <CommandSimulator initialCommand={activeCommand} />}
          {page === "incidents"   && <IncidentSimulator />}
          {page === "slo"         && <SLOCalculator />}
          {page === "manifests"   && <ManifestViewer initialManifest={activeManifest} />}
          {page === "cheatsheets" && <CheatsheetViewer initialCheatsheet={activeCheatsheet} onTryCommand={(cmd) => handleNavigate("simulator", null, null, cmd)} />}
          {page === "runbooks"    && <RunbookViewer initialRunbook={activeRunbook} onNavigate={handleNavigate} />}
          {page === "concepts"    && <ConceptsViewer initialConcept={activeConcept} />}
        </div>
      </div>
    </div>
  );
}
