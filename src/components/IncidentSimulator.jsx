import { useState } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { INCIDENTS } from '../data/incidents.js';
import { IncidentConsole } from './IncidentConsole.jsx';

const DIFFICULTY_COLOR = { Beginner: COLORS.ok, Intermediate: COLORS.hpa, Advanced: COLORS.err };

export function IncidentSimulator() {
  const [activeId, setActiveId] = useState(null);
  const active = INCIDENTS.find(i => i.id === activeId);

  if (active) {
    return <IncidentConsole key={active.id} incident={active} onExit={() => setActiveId(null)} />;
  }

  return (
    <div className="pr-dotgrid" style={{ height: "100%", overflow: "auto" }}>
      <div style={{ padding: "48px 40px 48px", maxWidth: 920, margin: "0 auto" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span className="pr-frame pr-frame-accent" style={{ ...THEME.label, color: COLORS.err, background: "rgba(224,122,118,0.12)", border: `1px solid ${COLORS.err}55`, padding: "3px 9px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.err, boxShadow: `0 0 5px ${COLORS.err}` }} /> live incident mode
            </span>
            <span style={{ ...THEME.label, color: COLORS.textFaint }}>scenario-driven troubleshooting</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Something's broken. <span style={{ color: COLORS.textFaint }}>Go find it.</span>
          </h1>
          <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            Pick an incident. You'll get a cluster with a real fault, a live topology, and a command line — no multiple choice. Diagnose with kubectl, confirm the root cause, then ship the fix.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {INCIDENTS.map(inc => {
            const diffColor = DIFFICULTY_COLOR[inc.difficulty] || COLORS.textDim;
            return (
              <div key={inc.id} onClick={() => setActiveId(inc.id)} className="pr-card" role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveId(inc.id); } }}
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.card, padding: "22px 24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${inc.color}66`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${inc.color}55, transparent)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, color: inc.color }}>▲</span>
                  <span style={{ fontSize: TYPE.md, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.01em" }}>{inc.title}</span>
                  <span style={{ ...THEME.label, fontSize: 9, color: diffColor, border: `1px solid ${diffColor}45`, borderRadius: 3, padding: "2px 7px", marginLeft: "auto" }}>{inc.difficulty}</span>
                </div>
                <p style={{ fontSize: TYPE.sm, color: COLORS.textDim, lineHeight: 1.65, margin: "0 0 14px" }}>{inc.premise}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: TYPE.micro, color: COLORS.textFaint, marginBottom: 16 }}>
                  <span>{inc.resource.kind.toLowerCase()}/{inc.resource.name}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{inc.objectives.length} diagnostic steps</span>
                </div>
                <div style={{ fontSize: TYPE.xs, color: inc.color, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 1, background: inc.color, display: "inline-block" }} />
                  Start incident
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, border: `1px dashed ${COLORS.border}`, borderRadius: THEME.radius.card, padding: "16px 20px", fontSize: TYPE.xs, color: COLORS.textFaint, lineHeight: 1.7 }}>
          Every command is checked against the real scenario — wrong guesses get a plausible response, not a wall. Stuck? Click any hint in the checklist to run it for you.
        </div>
      </div>
    </div>
  );
}
