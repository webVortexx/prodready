import { useState, useRef, useEffect } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { getIncidentResponse } from '../data/incidents.js';
import { IncidentTopology } from './IncidentTopology.jsx';
import { StatusPill } from './StatusPill.jsx';

export function IncidentConsole({ incident, onExit }) {
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [resolved, setResolved] = useState(false);
  const [running, setRunning] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const objectives = incident.objectives;
  const diagnosisComplete = objectives.every(o => matched.has(o.id));

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [log, running]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const pushLog = (entry) => setLog(l => [...l, { id: l.length, ts: Date.now(), ...entry }]);

  const execute = (raw) => {
    const command = String(raw ?? cmd).trim();
    if (!command || running || resolved) return;
    setRunning(true);
    setCmd("");

    window.setTimeout(() => {
      const res = getIncidentResponse(incident, command);

      if (res.type === "objective") {
        setMatched(prev => prev.has(res.objectiveId) ? prev : new Set(prev).add(res.objectiveId));
        pushLog({ command, output: res.output, kind: "objective" });
      } else if (res.type === "fix-attempt") {
        if (diagnosisComplete) {
          pushLog({ command: res.command, output: incident.fix.output, kind: "fix" });
          setResolved(true);
        } else {
          pushLog({ command: res.command, output: incident.fix.tooEarly, kind: "blocked" });
        }
      } else {
        pushLog({ command, output: res.output, kind: "generic" });
      }
      setRunning(false);
    }, 280);
  };

  const applyFix = () => execute(incident.fix.command);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: COLORS.bg }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bgDeep, flexShrink: 0 }}>
        <button onClick={onExit} className="pr-btn pr-btn-ghost" style={{ padding: "6px 10px", fontSize: TYPE.xs }}>← Incidents</button>
        <div style={{ width: 1, height: 22, background: COLORS.border }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: TYPE.md, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.01em" }}>{incident.title}</div>
          <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint, marginTop: 1 }}>{incident.resource.kind.toLowerCase()}/{incident.resource.name} · ns:{incident.resource.namespace}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusPill color={resolved ? COLORS.ok : COLORS.err} label={resolved ? "resolved" : "live incident"} pulse={!resolved} />
        </div>
      </div>

      {/* Split body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>

        {/* Left: topology + checklist */}
        <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ height: 240, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <IncidentTopology topology={incident.topology} resolved={resolved} />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ ...THEME.label, color: COLORS.textDim }}>Diagnosis checklist</span>
              <StatusPill
                color={resolved || diagnosisComplete ? COLORS.ok : COLORS.warn}
                label={resolved ? "resolved" : diagnosisComplete ? "root cause confirmed" : "diagnosing"}
                size="xs"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {objectives.map(o => {
                const done = matched.has(o.id);
                return (
                  <div key={o.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      border: `1px solid ${done ? COLORS.ok : COLORS.border}`,
                      background: done ? COLORS.greenDim : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}>
                      {done && <span style={{ fontSize: 9, color: COLORS.ok }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: TYPE.xs, color: done ? COLORS.text : COLORS.textDim, fontWeight: done ? 600 : 400 }}>{o.label}</div>
                      {done ? (
                        <div style={{ fontSize: TYPE.micro, color: COLORS.textDim, marginTop: 5, lineHeight: 1.55, borderLeft: `2px solid ${COLORS.ok}55`, paddingLeft: 8, animation: "fadeIn 0.2s ease" }}>{o.clue}</div>
                      ) : (
                        <button onClick={() => execute(o.hint)} disabled={running || resolved} className="pr-btn"
                          style={{ marginTop: 6, padding: "3px 8px", fontSize: 9.5, fontFamily: THEME.fontFamilyMono, color: COLORS.textFaint }}>
                          try: {o.hint}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {diagnosisComplete && !resolved && (
              <div className="pr-frame pr-frame-accent" style={{ marginTop: 20, padding: "12px 14px", background: COLORS.accentDim, border: `1px solid ${COLORS.accent}55`, animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontSize: TYPE.xs, color: COLORS.text, marginBottom: 10, lineHeight: 1.55 }}>Root cause confirmed. Ready to apply the fix.</div>
                <button onClick={applyFix} disabled={running} className="pr-btn pr-btn-primary" style={{ width: "100%", padding: "7px 0", fontSize: TYPE.xs }}>Apply fix ▸</button>
              </div>
            )}

            {resolved && (
              <div className="pr-frame" style={{ "--tick": COLORS.ok, marginTop: 20, padding: "12px 14px", background: COLORS.greenDim, border: `1px solid ${COLORS.ok}55`, animation: "fadeIn 0.25s ease" }}>
                <div style={{ ...THEME.label, color: COLORS.ok, marginBottom: 7 }}>Root cause</div>
                <div style={{ fontSize: TYPE.xs, color: COLORS.text, lineHeight: 1.6, marginBottom: 12 }}>{incident.fix.rootCause}</div>
                <div style={{ ...THEME.label, color: COLORS.ok, marginBottom: 7 }}>Resolution</div>
                <div style={{ fontSize: TYPE.xs, color: COLORS.text, lineHeight: 1.6 }}>{incident.fix.resolution}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: terminal */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <span style={{ fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.6 }}>{incident.premise}</span>
          </div>

          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {log.length === 0 && (
              <div style={{ color: COLORS.textFaint, fontSize: TYPE.sm, textAlign: "center", padding: "44px 20px", lineHeight: 1.8 }}>
                Start by checking pod status.<br />Try <kbd>kubectl get pods</kbd> or click a hint on the left.
              </div>
            )}
            {log.map(entry => (
              <div key={entry.id}>
                <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: TYPE.sm, color: COLORS.accent, marginBottom: 7 }}>
                  <span style={{ color: COLORS.textFaint, marginRight: 8 }}>❯</span>{entry.command}
                </div>
                <div className="pr-frame" style={{
                  "--tick": entry.kind === "fix" ? COLORS.ok : entry.kind === "blocked" ? COLORS.err : COLORS.borderHi,
                  background: COLORS.bgDeep,
                  border: `1px solid ${entry.kind === "fix" ? `${COLORS.ok}55` : entry.kind === "blocked" ? `${COLORS.err}55` : COLORS.border}`,
                  padding: "12px 14px", fontFamily: THEME.fontFamilyMono, fontSize: TYPE.sm,
                  color: entry.kind === "blocked" ? COLORS.err : entry.kind === "fix" ? COLORS.ok : COLORS.text,
                  whiteSpace: "pre-wrap", lineHeight: 1.6,
                }}>
                  {entry.output}
                </div>
              </div>
            ))}
            {running && <div style={{ color: COLORS.textFaint, fontSize: TYPE.xs, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              running…
            </div>}
          </div>

          <div style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, paddingLeft: 14, opacity: resolved ? 0.6 : 1 }}>
                <span style={{ color: COLORS.accent, marginRight: 10, fontSize: 13 }}>❯</span>
                <input ref={inputRef} value={cmd} onChange={e => setCmd(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") execute(); }}
                  placeholder={resolved ? "Incident resolved." : "Type a kubectl command..."} disabled={resolved}
                  style={{ flex: 1, border: "none", background: "transparent", color: COLORS.text, padding: "11px 0", fontFamily: THEME.fontFamilyMono, fontSize: TYPE.base, outline: "none" }} />
              </div>
              <button onClick={() => execute()} disabled={running || resolved || !cmd.trim()} className="pr-btn pr-btn-primary" style={{ padding: "0 22px", fontSize: TYPE.sm, borderRadius: THEME.radius.control }}>Run</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
