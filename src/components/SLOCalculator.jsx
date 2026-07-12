import { useState, useMemo } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
import { WINDOWS, TARGETS, allowedDowntimeMinutes, formatDuration, computeBurn, burnStatus } from '../utils/slo.js';

export function SLOCalculator() {
  const [targetPct, setTargetPct] = useState(99.9);
  const [windowId, setWindowId] = useState("month");
  const [elapsedHours, setElapsedHours] = useState(160);
  const [downtimeMinutes, setDowntimeMinutes] = useState(18);

  const win = WINDOWS.find(w => w.id === windowId) || WINDOWS[2];
  const budget = allowedDowntimeMinutes(targetPct, win.minutes);

  const burn = useMemo(() => computeBurn({
    targetPct, windowMinutes: win.minutes,
    elapsedMinutes: Number(elapsedHours) * 60,
    downtimeMinutes: Number(downtimeMinutes),
  }), [targetPct, win.minutes, elapsedHours, downtimeMinutes]);

  const status = burnStatus(burn.burnRate, COLORS);
  const consumedPct = burn.budget > 0 ? Math.min(100, Math.max(0, (burn.consumed / burn.budget) * 100)) : 0;

  return (
    <div className="pr-dotgrid" style={{ height: "100%", overflow: "auto" }}>
      <div style={{ padding: "44px 40px 48px", maxWidth: 920, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span className="pr-frame pr-frame-accent" style={{ ...THEME.label, color: COLORS.accent, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}55`, padding: "3px 9px" }}>◔ error budget</span>
            <span style={{ ...THEME.label, color: COLORS.textFaint }}>SLO math, worked out for you</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>SLO Budget Calculator</h1>
          <p style={{ fontSize: TYPE.base, color: COLORS.textDim, lineHeight: 1.7, maxWidth: 580, margin: 0 }}>
            Pick a target and a window to see exactly how much downtime it allows. Then plug in what you've actually used to see your burn rate — how many times faster than sustainable you're spending the budget.
          </p>
        </div>

        {/* Target + window pickers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 8 }}>Target SLO</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TARGETS.map(t => (
                <button key={t} onClick={() => setTargetPct(t)} className="pr-btn"
                  style={{ padding: "6px 14px", fontFamily: THEME.fontFamilyMono, fontSize: TYPE.sm, ...(t === targetPct ? { background: COLORS.accentDim, borderColor: `${COLORS.accent}66`, color: COLORS.accent } : {}) }}>
                  {t}%
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 8 }}>Window</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WINDOWS.map(w => (
                <button key={w.id} onClick={() => setWindowId(w.id)} className="pr-btn"
                  style={{ padding: "6px 14px", fontSize: TYPE.sm, ...(w.id === windowId ? { background: COLORS.accentDim, borderColor: `${COLORS.accent}66`, color: COLORS.accent } : {}) }}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big readout */}
        <div className="pr-frame pr-frame-accent" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: "26px 28px", marginBottom: 28, display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: TYPE.hero, fontWeight: 800, color: COLORS.accent, lineHeight: 1, fontFamily: THEME.fontFamilyMono }}>{formatDuration(budget)}</span>
          <span style={{ fontSize: TYPE.sm, color: COLORS.textDim }}>of allowed downtime at <strong style={{ color: COLORS.text }}>{targetPct}%</strong> over <strong style={{ color: COLORS.text }}>{win.label}</strong></span>
        </div>

        {/* Matrix table */}
        <div className="pr-frame" style={{ marginBottom: 32, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPE.xs }}>
              <thead>
                <tr style={{ background: COLORS.bgDeep }}>
                  <th style={{ textAlign: "left", padding: "9px 14px", color: COLORS.textFaint, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, ...THEME.label, fontSize: 9 }}>target</th>
                  {WINDOWS.map(w => (
                    <th key={w.id} style={{ textAlign: "right", padding: "9px 14px", color: w.id === windowId ? COLORS.accent : COLORS.textFaint, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, ...THEME.label, fontSize: 9 }}>{w.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TARGETS.map((t, ri) => (
                  <tr key={t} className="pr-row" style={{ background: t === targetPct ? COLORS.accentDim : "transparent" }}>
                    <td style={{ padding: "8px 14px", color: t === targetPct ? COLORS.accent : COLORS.text, fontFamily: THEME.fontFamilyMono, fontWeight: 600, borderBottom: ri < TARGETS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>{t}%</td>
                    {WINDOWS.map(w => {
                      const isCell = t === targetPct && w.id === windowId;
                      return (
                        <td key={w.id} style={{ padding: "8px 14px", textAlign: "right", fontFamily: THEME.fontFamilyMono, color: isCell ? COLORS.accent : COLORS.textDim, fontWeight: isCell ? 700 : 400, borderBottom: ri < TARGETS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                          {formatDuration(allowedDowntimeMinutes(t, w.minutes))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Burn rate */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 4 }}>Burn rate</div>
          <p style={{ fontSize: TYPE.xs, color: COLORS.textDim, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 620 }}>
            How fast is the current incident (or accumulated downtime) eating into the budget above? A burn rate of 1.0× is sustainable — exactly enough to hit zero right as the window ends. Above that, you'll run out early.
          </p>
        </div>

        <div className="pr-frame" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface, padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "block" }}>
              <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 8 }}>Time elapsed in window (hours)</div>
              <input type="number" min="0" value={elapsedHours} onChange={e => setElapsedHours(e.target.value)}
                style={{ width: "100%", background: COLORS.bgDeep, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, padding: "9px 12px", color: COLORS.text, fontFamily: THEME.fontFamilyMono, fontSize: TYPE.base, outline: "none" }} />
              <div style={{ fontSize: 9, color: COLORS.textFaint, marginTop: 6 }}>≈ {(Number(elapsedHours) / 24).toFixed(1)} days of a {win.label} window</div>
            </label>
            <label style={{ display: "block" }}>
              <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 8 }}>Downtime consumed so far (minutes)</div>
              <input type="number" min="0" value={downtimeMinutes} onChange={e => setDowntimeMinutes(e.target.value)}
                style={{ width: "100%", background: COLORS.bgDeep, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, padding: "9px 12px", color: COLORS.text, fontFamily: THEME.fontFamilyMono, fontSize: TYPE.base, outline: "none" }} />
              <div style={{ fontSize: 9, color: COLORS.textFaint, marginTop: 6 }}>of a {formatDuration(burn.budget)} budget</div>
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ ...THEME.label, color: COLORS.textFaint, marginBottom: 8 }}>Budget consumed</div>
              <div style={{ height: 8, background: COLORS.bgDeep, borderRadius: 4, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
                <div style={{ height: "100%", width: `${consumedPct}%`, background: status.color, transition: "width 0.3s ease, background 0.3s ease", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: TYPE.micro, color: COLORS.textFaint }}>{consumedPct.toFixed(1)}% used</span>
                <span style={{ fontSize: TYPE.micro, color: COLORS.textFaint }}>{formatDuration(Math.max(0, burn.remaining))} left</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: TYPE.xl, fontWeight: 800, color: status.color, fontFamily: THEME.fontFamilyMono, lineHeight: 1 }}>
                {burn.burnRate === null ? "—" : `${burn.burnRate.toFixed(2)}×`}
              </span>
              <span style={{ ...THEME.label, color: status.color }}>{status.label}</span>
            </div>

            <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint, lineHeight: 1.6 }}>
              {burn.alreadyExhausted
                ? "Budget is already exhausted for this window."
                : burn.exhaustsBeforeWindowEnds
                  ? `At this rate, the budget runs out in ~${formatDuration(burn.minutesToExhaustion)} — before the ${win.label} window ends.`
                  : `At this rate, the budget lasts through the rest of the ${win.label} window.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
