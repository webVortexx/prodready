import { useState, useEffect, useCallback } from "react";
import { COLORS, THEME } from '../constants/colors.js';
import { RESOURCE_INFO } from '../data/resourceInfo.js';

export function ClusterTopology({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [nodePositions, setNodePositions] = useState({
    cluster: { x: 50, y: 5 }, external: { x: 85, y: 5 },
    ingress: { x: 20, y: 20 }, svc: { x: 50, y: 20 },
    deploy: { x: 35, y: 35 }, hpa: { x: 65, y: 35 }, sa: { x: 85, y: 35 },
    pod1: { x: 25, y: 50 }, pod2: { x: 50, y: 50 }, pod3: { x: 75, y: 50 },
    cm: { x: 15, y: 65 }, secret: { x: 35, y: 65 }, pvc: { x: 55, y: 65 }, pv: { x: 75, y: 65 },
    node1: { x: 30, y: 80 }, node2: { x: 70, y: 80 }
  });

  const nodes = [
    { id: "cluster", label: "CLUSTER", sub: "v1.28.0 / amd64", icon: "⬡", color: COLORS.cluster, x: 50, y: 5, type: "cluster" },
    { id: "external", label: "EXTERNAL", sub: "LoadBalancer:80/443", icon: "⬢", color: COLORS.external, x: 85, y: 5, type: "external" },
    { id: "ingress", label: "INGRESS", sub: "nginx-ingress", icon: "⟶", color: COLORS.ingress, x: 20, y: 20, type: "ingress" },
    { id: "svc", label: "SERVICE", sub: "ClusterIP:80→8080", icon: "◈", color: COLORS.service, x: 50, y: 20, type: "service" },
    { id: "deploy", label: "DEPLOYMENT", sub: "replicas=3", icon: "⬡", color: COLORS.deployment, x: 35, y: 35, type: "deployment" },
    { id: "hpa", label: "HPA", sub: "3→5 replicas", icon: "↕", color: COLORS.hpa, x: 65, y: 35, type: "hpa" },
    { id: "sa", label: "SERVICEACCOUNT", sub: "my-app-sa", icon: "◉", color: COLORS.textDim, x: 85, y: 35, type: "serviceaccount" },
    { id: "pod1", label: "POD", sub: "my-app-7d9f8 ● Running", icon: "▸", color: COLORS.pod, x: 25, y: 50, type: "pod" },
    { id: "pod2", label: "POD", sub: "my-app-7d9f9 ● Running", icon: "▸", color: COLORS.pod, x: 50, y: 50, type: "pod" },
    { id: "pod3", label: "POD", sub: "my-app-7d9fa ● Running", icon: "▸", color: COLORS.pod, x: 75, y: 50, type: "pod" },
    { id: "cm", label: "CONFIGMAP", sub: "app-config (3 keys)", icon: "⊞", color: COLORS.configmap, x: 15, y: 65, type: "configmap" },
    { id: "secret", label: "SECRET", sub: "db-secret (2 keys)", icon: "◆", color: COLORS.secret, x: 35, y: 65, type: "secret" },
    { id: "pvc", label: "PVC", sub: "5Gi bound", icon: "▣", color: COLORS.pvc, x: 55, y: 65, type: "pvc" },
    { id: "pv", label: "PV", sub: "10Gi available", icon: "⬢", color: COLORS.pvc, x: 75, y: 65, type: "pv" },
    { id: "node1", label: "NODE", sub: "node-1 / 2CPU / 4Gi", icon: "▣", color: COLORS.node, x: 30, y: 80, type: "node" },
    { id: "node2", label: "NODE", sub: "node-2 / 2CPU / 4Gi", icon: "▣", color: COLORS.node, x: 70, y: 80, type: "node" },
  ];

  const connections = [
    { from: "external", to: "cluster", label: "traffic" },
    { from: "cluster", to: "ingress", label: "" },
    { from: "cluster", to: "svc", label: "" },
    { from: "ingress", to: "svc", label: "80/443" },
    { from: "svc", to: "deploy", label: "selector" },
    { from: "deploy", to: "hpa", label: "scales" },
    { from: "hpa", to: "deploy", label: "replicas" },
    { from: "deploy", to: "pod1", label: "" },
    { from: "deploy", to: "pod2", label: "" },
    { from: "deploy", to: "pod3", label: "" },
    { from: "sa", to: "pod1", label: "identity" },
    { from: "sa", to: "pod2", label: "identity" },
    { from: "sa", to: "pod3", label: "identity" },
    { from: "pod1", to: "cm", label: "mount" },
    { from: "pod1", to: "secret", label: "env" },
    { from: "pod2", to: "cm", label: "mount" },
    { from: "pod2", to: "secret", label: "env" },
    { from: "pod3", to: "cm", label: "mount" },
    { from: "pod3", to: "secret", label: "env" },
    { from: "pod1", to: "pvc", label: "read" },
    { from: "pod2", to: "pvc", label: "read" },
    { from: "pod3", to: "pvc", label: "read" },
    { from: "pvc", to: "pv", label: "bound" },
    { from: "pod1", to: "node1", label: "scheduled" },
    { from: "pod2", to: "node2", label: "scheduled" },
    { from: "pod3", to: "node1", label: "scheduled" },
    { from: "cluster", to: "node1", label: "" },
    { from: "cluster", to: "node2", label: "" },
  ];

  const getConnectedNodes = (nodeId) => {
    const connected = new Set();
    connections.forEach(c => {
      if (c.from === nodeId) connected.add(c.to);
      if (c.to === nodeId) connected.add(c.from);
    });
    return connected;
  };

  const connectedNodes = hovered ? getConnectedNodes(hovered) : new Set();
  const selectedConnected = selected ? getConnectedNodes(selected.id) : new Set();
  const hoveredNode = nodes.find(n => n.id === hovered);

  const handleDragStart = (e, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging(nodeId);
  };

  const handleDragMove = useCallback((e) => {
    if (!dragging) return;
    const container = e.currentTarget.closest('.topology-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    setNodePositions(prev => ({ ...prev, [dragging]: { x: clampedX, y: clampedY } }));
  }, [dragging]);

  const handleDragEnd = () => {
    setDragging(null);
  };

  const handleNodeClick = (node) => {
    setSelected(selected?.id === node.id ? null : node);
  };

  const resetLayout = () => {
    setNodePositions({
      cluster: { x: 50, y: 5 }, external: { x: 85, y: 5 },
      ingress: { x: 20, y: 20 }, svc: { x: 50, y: 20 },
      deploy: { x: 35, y: 35 }, hpa: { x: 65, y: 35 }, sa: { x: 85, y: 35 },
      pod1: { x: 25, y: 50 }, pod2: { x: 50, y: 50 }, pod3: { x: 75, y: 50 },
      cm: { x: 15, y: 65 }, secret: { x: 35, y: 65 }, pvc: { x: 55, y: 65 }, pv: { x: 75, y: 65 },
      node1: { x: 30, y: 80 }, node2: { x: 70, y: 80 }
    });
  };

  return (
    <div 
      className="topology-container"
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Control Bar */}
      <div style={{
        position: "absolute", top: 16, left: 16, right: 16,
        display: "flex", alignItems: "center", gap: 12,
        zIndex: 30
      }}>
        <button
          onClick={resetLayout}
          className="pr-btn"
          style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, background: COLORS.surface }}
        >
          <span>↺</span> Reset
        </button>
        <span style={{ ...THEME.label, fontSize: 9, color: COLORS.textFaint }}>drag nodes · hover to trace · click to inspect</span>
      </div>

      {/* SVG Grid and Connections */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {connections.map((c, i) => {
          const fromNode = nodes.find(x => x.id === c.from);
          const toNode = nodes.find(x => x.id === c.to);
          if (!fromNode || !toNode) return null;
          
          const fromPos = nodePositions[c.from] || { x: fromNode.x, y: fromNode.y };
          const toPos = nodePositions[c.to] || { x: toNode.x, y: toNode.y };
          const isHighlighted = hovered && (c.from === hovered || c.to === hovered);
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;
          
          return (
            <g key={i}>
              <path 
                d={`M ${fromPos.x}% ${fromPos.y}% L ${toPos.x}% ${toPos.y}%`}
                fill="none" 
                stroke={isHighlighted ? hoveredNode?.color || COLORS.accent : COLORS.borderHi}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeDasharray={isHighlighted ? "none" : "3 3"}
                opacity={isHighlighted ? 1 : 0.4}
                style={{ transition: "stroke-width 0.15s ease" }}
              />
              <circle r="1.3" fill={COLORS.accent} opacity="0.45">
                <animateMotion 
                  dur="3s" 
                  repeatCount="indefinite"
                  path={`M ${fromPos.x}% ${fromPos.y}% L ${toPos.x}% ${toPos.y}%`}
                  begin={`${i * 0.2}s`}
                />
              </circle>
              {c.label && (
                <g>
                  <rect x={`${midX - 2}%`} y={`${midY - 0.8}%`} width="4%" height="1.6%" fill={COLORS.bg} rx="2" />
                  <text x={`${midX}%`} y={`${midY}%`} fill={COLORS.textFaint} fontSize="7" textAnchor="middle"
                    style={{ fontFamily: "inherit", fontWeight: 500 }}>{c.label}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const isHovered = hovered === node.id;
        const isSelected = selected?.id === node.id;
        const isConnected = connectedNodes.has(node.id);
        const isDragging = dragging === node.id;
        
        const pos = nodePositions[node.id] || { x: node.x, y: node.y };
        
        return (
          <div key={node.id}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
            onMouseDown={(e) => handleDragStart(e, node.id)}
            style={{
              position: "absolute",
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: `translate(-50%, -50%) scale(${isSelected ? 1.1 : isHovered ? 1.05 : 1})`,
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "all 0.2s ease",
              zIndex: isDragging ? 20 : isSelected ? 15 : isHovered ? 10 : isConnected ? 5 : 1,
            }}>
            {isHovered && (
              <div style={{
                position: "absolute", inset: -8, borderRadius: 10,
                background: `radial-gradient(circle, ${node.color}15 0%, transparent 70%)`,
                transition: "all 0.2s ease"
              }} />
            )}
            
            <div style={{
              background: isHovered ? COLORS.elevated : isConnected ? COLORS.elevated : COLORS.surface,
              border: `1px solid ${isHovered ? node.color : isConnected ? `${node.color}60` : COLORS.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              minWidth: 90,
              boxShadow: isHovered ? `0 6px 20px rgba(0,0,0,0.5), 0 0 14px ${node.color}30` : "0 2px 8px rgba(0,0,0,0.25)",
              transition: "all 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ 
                  color: isHovered || isConnected ? node.color : COLORS.textDim, 
                  fontSize: 14,
                  transition: "all 0.2s ease"
                }}>{node.icon}</span>
                <div>
                  <div style={{ color: isHovered ? node.color : COLORS.text, fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{node.label}</div>
                  <div style={{ color: COLORS.textFaint, fontSize: 8, marginTop: 2 }}>{node.sub}</div>
                </div>
              </div>
            </div>

            <div style={{
              position: "absolute", top: -2, right: -2,
              width: 5, height: 5,
              borderRadius: "50%",
              background: node.type === "pod" ? COLORS.ok : node.type === "secret" ? COLORS.secret : COLORS.external,
              boxShadow: `0 0 5px ${node.type === "pod" ? COLORS.ok : node.type === "secret" ? COLORS.secret : COLORS.external}`,
              opacity: 0.8
            }} />
          </div>
        );
      })}

      {/* Hover Tooltip & Details Panel */}
      {hovered && hoveredNode && (
        <div className="pr-frame" style={{
          "--tick": hoveredNode.color,
          position: "absolute", top: 16, right: 16,
          background: COLORS.elevated, border: `1px solid ${hoveredNode.color}77`,
          padding: "12px 16px",
          minWidth: 200, zIndex: 20,
          boxShadow: `0 8px 28px rgba(0,0,0,0.5)`,
          animation: "fadeIn 0.15s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: hoveredNode.color, fontSize: 16 }}>{hoveredNode.icon}</span>
            <div>
              <div style={{ color: hoveredNode.color, fontSize: 11, fontWeight: 600 }}>{hoveredNode.label}</div>
              <div style={{ color: COLORS.textFaint, fontSize: 9 }}>{hoveredNode.sub}</div>
            </div>
          </div>
          <div style={{ color: hoveredNode.color, fontSize: 9, marginBottom: 6, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
            Connected to:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Array.from(connectedNodes).map(connId => {
              const connNode = nodes.find(n => n.id === connId);
              return connNode ? (
                <span key={connId} style={{
                  background: `${connNode.color}20`, color: connNode.color,
                  padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 500
                }}>
                  {connNode.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Selected Resource Details */}
      {selected && RESOURCE_INFO[selected.type] && (
        <div className="pr-frame" style={{
          "--tick": selected.color,
          position: "absolute", top: 70, right: 16,
          width: 380, maxHeight: "calc(100% - 100px)",
          background: COLORS.surface, border: `1px solid ${selected.color}88`,
          zIndex: 25,
          overflow: "hidden",
          boxShadow: `0 16px 48px rgba(0,0,0,0.6)`,
          animation: `slideIn ${THEME.transitions.spring}`
        }}>
          <div style={{
            background: `${selected.color}15`, padding: "16px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, color: selected.color }}>{selected.icon}</span>
              <div>
                <div style={{ color: selected.color, fontSize: 14, fontWeight: 600 }}>
                  {RESOURCE_INFO[selected.type].title}
                </div>
                <div style={{ color: COLORS.textFaint, fontSize: 10, marginTop: 2 }}>
                  {RESOURCE_INFO[selected.type].name}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelected(null)}
              style={{
                background: "transparent", border: "none",
                color: COLORS.textFaint, fontSize: 18, cursor: "pointer",
                padding: 4, lineHeight: 1
              }}
            >×</button>
          </div>

          <div style={{ padding: 16, overflow: "auto", maxHeight: "calc(100% - 80px)" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                color: COLORS.textFaint, fontSize: 9, letterSpacing: 1, 
                marginBottom: 6, textTransform: "uppercase" 
              }}>What is this?</div>
              <div style={{ color: COLORS.text, fontSize: 11, lineHeight: 1.6 }}>
                {RESOURCE_INFO[selected.type].what}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                color: COLORS.textFaint, fontSize: 9, letterSpacing: 1, 
                marginBottom: 8, textTransform: "uppercase" 
              }}>Key Concepts</div>
              {RESOURCE_INFO[selected.type].concepts.map((concept, i) => (
                <div key={i} style={{ 
                  display: "flex", alignItems: "flex-start", gap: 8, 
                  marginBottom: 6 
                }}>
                  <span style={{ color: selected.color, fontSize: 8 }}>●</span>
                  <span style={{ color: COLORS.textDim, fontSize: 10, lineHeight: 1.5 }}>
                    {concept}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <div style={{ 
                color: COLORS.textFaint, fontSize: 9, letterSpacing: 1, 
                marginBottom: 6, textTransform: "uppercase" 
              }}>Why it matters</div>
              <div style={{ color: COLORS.text, fontSize: 11, lineHeight: 1.6 }}>
                {RESOURCE_INFO[selected.type].why}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
