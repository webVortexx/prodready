import { useState, useEffect } from "react";
import { COLORS, THEME } from '../constants/colors.js';
import { getSimulatedResponse, inferSimulatorTool } from '../data/commandSimulator.js';

export function CommandSimulator({ initialCommand }) {
  const [command, setCommand] = useState(initialCommand || "kubectl get pods");
  const [output, setOutput] = useState("Ready to simulate a command.");
  const [status, setStatus] = useState("ready");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (initialCommand) {
      setCommand(initialCommand);
    }
  }, [initialCommand]);

  const runCommand = () => {
    const trimmed = String(command || "").trim();
    if (!trimmed) {
      setOutput("Enter a valid command to simulate.");
      setStatus("error");
      return;
    }

    setStatus("running");
    setOutput("Simulating command...");

    window.setTimeout(() => {
      const result = getSimulatedResponse(trimmed);
      setOutput(result.output);
      setStatus(result.success ? "ready" : "error");
      setHistory(current => [{ command: trimmed, output: result.output, success: result.success, ts: Date.now() }, ...current].slice(0, 6));
    }, 320);
  };

  const tool = inferSimulatorTool(command);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderBottom: `1px solid ${COLORS.border}`, background: COLORS.elevated, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, letterSpacing: "0.06em" }}>Command simulator</div>
          <span style={{ fontSize: 10, color: COLORS.textDim, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 8px" }}>{tool}</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") runCommand(); }}
            placeholder="Enter a command to simulate"
            style={{ flex: 1, minWidth: 0, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, padding: "12px 14px", fontFamily: THEME.fontFamilyMono, fontSize: 13 }}
          />
          <button onClick={runCommand}
            style={{ border: "none", borderRadius: 8, padding: "12px 18px", background: COLORS.green, color: COLORS.bg, cursor: "pointer", fontWeight: 700, fontSize: 12, minWidth: 95 }}>
            {status === "running" ? "Running…" : "Run"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: COLORS.textDim }}>Tip: type commands from cheat sheets or CLI patterns.</span>
          <span style={{ fontSize: 11, color: status === "error" ? COLORS.secret : COLORS.textDim }}>
            {status === "error" ? "Invalid command or no command entered." : "Simulator output is mocked for safe learning."}
          </span>
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflow: "auto", minHeight: 0 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${status === "error" ? COLORS.secret : COLORS.border}`, borderRadius: 12, padding: 16, minHeight: 220, whiteSpace: "pre-wrap", fontFamily: THEME.fontFamilyMono, fontSize: 12, color: status === "error" ? COLORS.secret : COLORS.text, lineHeight: 1.5, overflow: "auto" }}>
          {status === "error" && <span style={{ color: COLORS.secret, fontWeight: 700 }}>❌ ERROR: </span>}
          {output}
        </div>

        {history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent simulator commands</div>
            <div style={{ display: "grid", gap: 10 }}>
              {history.map((entry, index) => (
                <button key={index} onClick={() => setCommand(entry.command)}
                  style={{ textAlign: "left", borderRadius: 10, border: `1px solid ${entry.success ? COLORS.border : COLORS.secret}`, background: COLORS.elevated, padding: 12, color: COLORS.text, cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: THEME.fontFamilyMono, fontSize: 12 }}>{entry.command}</span>
                    <span style={{ fontSize: 10, color: entry.success ? COLORS.green : COLORS.secret }}>{entry.success ? "✓ Success" : "❌ Error"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
