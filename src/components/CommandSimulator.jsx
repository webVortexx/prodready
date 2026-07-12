import { useState, useEffect } from "react";
import { COLORS, THEME, TYPE } from '../constants/colors.js';
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
  const toolColors = { kubectl: COLORS.cluster, helm: COLORS.pvc, terraform: COLORS.configmap, networking: COLORS.external, generic: COLORS.textDim };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bgDeep, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, color: COLORS.accent }}>▶</span>
          <div>
            <div style={{ fontSize: TYPE.md, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.01em" }}>Command Simulator</div>
            <div style={{ fontSize: TYPE.xs, color: COLORS.textDim, marginTop: 2 }}>Safe sandbox to preview commands before execution</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, padding: "5px 12px", background: COLORS.surface }}>
            <span style={{ fontSize: 13, color: toolColors[tool] || toolColors.generic }}>{toolIcons[tool] || toolIcons.generic}</span>
            <span style={{ ...THEME.label, color: toolColors[tool] || COLORS.textDim }}>{tool}</span>
          </div>
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: THEME.radius.control, paddingLeft: 14, transition: `border-color ${THEME.transitions.fast}` }}
            onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
            <span style={{ fontSize: 13, color: COLORS.accent, marginRight: 10 }}>❯</span>
            <input
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") runCommand(); }}
              placeholder="Type a command here..."
              style={{ flex: 1, border: "none", background: "transparent", color: COLORS.text, padding: "11px 0", fontFamily: THEME.fontFamilyMono, fontSize: TYPE.base, outline: "none" }}
            />
          </div>
          <button onClick={runCommand} className="pr-btn pr-btn-primary"
            disabled={status === "running"}
            title={status === "running" ? "Command is currently running" : "Execute this command in simulator mode"}
            style={{ padding: "0 22px", fontSize: TYPE.sm, borderRadius: THEME.radius.control }}>
            {status === "running" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${COLORS.bg}4d`, borderTopColor: COLORS.bg, animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                Running…
              </span>
            ) : "Execute"}
          </button>
        </div>

        {/* Status line */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: TYPE.micro, color: COLORS.textFaint }}>
            press <kbd>↵</kbd> or click Execute to run
          </span>
          <span style={{ ...THEME.label, fontSize: 9, color: status === "error" ? COLORS.err : COLORS.textFaint, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: status === "error" ? COLORS.err : COLORS.ok, boxShadow: `0 0 5px ${status === "error" ? COLORS.err : COLORS.ok}` }} />
            {status === "error" ? "error detected" : "mocked for learning"}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 22, overflow: "auto", minHeight: 0, flex: 1 }}>

        {/* Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...THEME.label, color: COLORS.textDim }}>Output</div>
            <button onClick={copyOutput} className="pr-btn"
              title="Copy the current simulator output to clipboard"
              style={{ padding: "4px 10px", fontSize: TYPE.micro, color: copied ? COLORS.ok : undefined, borderColor: copied ? `${COLORS.ok}66` : undefined }}>
              {copied ? "✓ copied" : "⎘ copy"}
            </button>
          </div>
          <div className={`pr-frame ${status === "error" ? "" : "pr-frame-accent"}`} style={{ "--tick": status === "error" ? COLORS.err : undefined, background: COLORS.bgDeep, border: `1px solid ${status === "error" ? `${COLORS.err}77` : COLORS.border}`, padding: "16px 18px", minHeight: 240, maxHeight: 400, whiteSpace: "pre-wrap", fontFamily: THEME.fontFamilyMono, fontSize: TYPE.sm, color: status === "error" ? COLORS.err : COLORS.text, lineHeight: 1.65, overflow: "auto" }}>
            {status === "error" && <span style={{ fontWeight: 700 }}>ERROR{"\n"}</span>}
            {output}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ ...THEME.label, color: COLORS.textDim }}>
              History <span style={{ color: COLORS.textFaint }}>· {history.length}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {history.map((entry, index) => (
                <button key={index} onClick={() => setCommand(entry.command)} className="pr-btn"
                  style={{ textAlign: "left", background: COLORS.surface, padding: "11px 14px", borderRadius: THEME.radius.control }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: THEME.fontFamilyMono, fontSize: TYPE.sm, color: COLORS.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: COLORS.accent, marginRight: 8 }}>❯</span>{entry.command}
                      </div>
                      <div style={{ fontSize: TYPE.micro, color: COLORS.textFaint }}>
                        {new Date(entry.ts).toLocaleTimeString()}
                      </div>
                    </div>
                    <span style={{ ...THEME.label, fontSize: 9, color: entry.success ? COLORS.ok : COLORS.err, flexShrink: 0 }} title={entry.success ? "Command executed successfully" : "Command failed validation or simulation"}>
                      {entry.success ? "✓ ok" : "✕ err"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && status === "ready" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "44px 20px", textAlign: "center" }}>
            <div className="pr-frame" style={{ width: 44, height: 44, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: COLORS.textFaint }}>▶</div>
            <div style={{ color: COLORS.textFaint, fontSize: TYPE.sm, lineHeight: 1.7 }}>
              No commands executed yet.<br />
              Try a command from the cheatsheets to see results here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
