import { useState, useEffect } from "react";
import { COLORS, THEME } from '../constants/colors.js';
import { getSimulatedResponse, inferSimulatorTool } from '../data/commandSimulator.js';

export function CommandSimulator({ initialCommand }) {
  const [command, setCommand] = useState(initialCommand || "kubectl get pods");
  const [output, setOutput] = useState("Ready to simulate a command.");
  const [status, setStatus] = useState("ready");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

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
      setHistory(current => [{ command: trimmed, output: result.output, success: result.success, ts: Date.now() }, ...current].slice(0, 8));
    }, 320);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tool = inferSimulatorTool(command);
  const toolIcons = { kubectl: "☸", helm: "⎈", terraform: "⬡", networking: "⇄", generic: "▶" };
  const toolColors = { kubectl: COLORS.cyan, helm: COLORS.purple, terraform: "#7b61ff", networking: COLORS.cyan, generic: COLORS.textDim };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: COLORS.bg }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "24px 24px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.elevated, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20, opacity: 0.8 }}>▶</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.5px" }}>Command Simulator</div>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>Safe sandbox to preview commands before execution</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 14 }}>{toolIcons[tool] || toolIcons.generic}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: toolColors[tool], textTransform: "uppercase", letterSpacing: "0.06em" }}>{tool}</span>
          </div>
        </div>

        {/* Input Area */}
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: COLORS.surface, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, paddingLeft: 14, transition: "all 0.2s" }} 
            onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
            <span style={{ fontSize: 14, color: COLORS.textDim, marginRight: 8 }}>$</span>
            <input
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") runCommand(); }}
              placeholder="Type a command here..."
              style={{ flex: 1, border: "none", background: "transparent", color: COLORS.text, padding: "12px 0", fontFamily: THEME.fontFamilyMono, fontSize: 13, outline: "none" }}
            />
          </div>
          <button onClick={runCommand}
            style={{ border: "none", borderRadius: 10, padding: "12px 24px", background: status === "running" ? COLORS.textDim : COLORS.green, color: COLORS.bg, cursor: "pointer", fontWeight: 700, fontSize: 12, transition: "all 0.2s", opacity: status === "running" ? 0.6 : 1 }}
            onMouseEnter={e => { if (status !== "running") e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            {status === "running" ? "Running…" : "Execute"}
          </button>
        </div>

        {/* Info & Tips */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <span style={{ color: COLORS.textDim }}>💡 Press Enter or click Execute to run the command</span>
          <span style={{ color: status === "error" ? COLORS.secret : COLORS.textDim }}>
            {status === "error" ? "❌ Error detected" : "✓ Mocked for learning"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, overflow: "auto", minHeight: 0, flex: 1 }}>
        {/* Output Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>Output</div>
            <button onClick={copyOutput}
              style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: copied ? COLORS.green : COLORS.textDim, borderRadius: 6, padding: "4px 10px", fontSize: 10, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.borderColor = COLORS.borderHi; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
              {copied ? "✓ Copied" : "⎘ Copy"}
            </button>
          </div>
          <div style={{ background: COLORS.surface, border: `1px solid ${status === "error" ? COLORS.secret : COLORS.border}`, borderRadius: 12, padding: "16px", minHeight: 240, maxHeight: 400, whiteSpace: "pre-wrap", fontFamily: THEME.fontFamilyMono, fontSize: 12, color: status === "error" ? COLORS.secret : COLORS.text, lineHeight: 1.6, overflow: "auto", scrollbarWidth: "thin", scrollbarColor: `${COLORS.border} transparent` }}>
            {status === "error" && <span style={{ fontWeight: 700 }}>❌ ERROR:\n</span>}
            {output}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              History <span style={{ color: COLORS.textDim }}>({history.length})</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {history.map((entry, index) => (
                <button key={index} onClick={() => setCommand(entry.command)}
                  style={{ textAlign: "left", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, background: COLORS.elevated, padding: "12px 14px", color: COLORS.text, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.surface; e.currentTarget.style.borderColor = COLORS.borderHi; }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.elevated; e.currentTarget.style.borderColor = COLORS.border; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: 12, color: COLORS.green, marginBottom: 4 }}>{entry.command}</div>
                      <div style={{ fontSize: 10, color: COLORS.textFaint }}>
                        {new Date(entry.ts).toLocaleTimeString()}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: entry.success ? COLORS.green : COLORS.secret, flexShrink: 0 }}>
                      {entry.success ? "✓ OK" : "❌ ERR"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && status === "ready" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "40px 20px", opacity: 0.5, textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>▶</div>
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>
              No commands executed yet.<br />
              Try running a command from the cheat sheets to see results here.
            </div>
          </div>
        )}
      </div>

      <style>{`
        input::placeholder { color: ${COLORS.textFaint}; opacity: 0.6; }
        button:active { transform: scale(0.98) !important; }
      `}</style>
    </div>
  );
}

