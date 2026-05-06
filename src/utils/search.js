import { MANIFESTS } from '../data/manifests.js';
import { CHEATSHEETS } from '../data/cheatsheets.js';

export function buildSearchIndex(manifests, cheatsheets) {
  const index = [];
  
  // Add manifests
  manifests.forEach(m => {
    if (m.id && m.label) {
      index.push({
        type: "manifest",
        label: m.label,
        icon: m.icon || "⬡",
        color: m.color,
        page: "manifests",
        manifestId: m.id,
        sub: m.description || '',
      });
    }
    
    // Add YAML fields
    if (m.yaml && Array.isArray(m.yaml)) {
      m.yaml.forEach(y => {
        if (y.line && y.note) {
          index.push({
            type: "field",
            label: y.line.trim(),
            icon: "·",
            color: m.color,
            page: "manifests",
            manifestId: m.id,
            sub: `${m.label} · ${y.note}`,
            note: y.note,
          });
        }
      });
    }
  });
  
  // Add cheatsheets
  cheatsheets.forEach(c => {
    if (c.id && c.label) {
      index.push({
        type: "cheatsheet",
        label: c.label,
        icon: c.icon || "⌨",
        color: c.color,
        page: "cheatsheets",
        cheatsheetId: c.id,
        sub: c.description || '',
      });
    }
    
    // Add commands
    if (c.sections && Array.isArray(c.sections)) {
      c.sections.forEach(sec => {
        if (sec.commands && Array.isArray(sec.commands)) {
          sec.commands.forEach(cmd => {
            if (cmd.cmd && cmd.desc) {
              index.push({
                type: "command",
                label: cmd.cmd,
                icon: "❯",
                color: c.color,
                page: "cheatsheets",
                cheatsheetId: c.id,
                sub: `${c.label} · ${sec.title} · ${cmd.desc}`,
                cmd: cmd.cmd,
              });
            }
          });
        }
      });
    }
  });
  
  return index;
}

export function scoreMatch(item, query) {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const sub = (item.sub || "").toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (sub.includes(q)) return 40;
  return 0;
}

export function runSearch(query, searchIndex) {
  if (!query.trim()) return [];
  return searchIndex
    .map(item => ({ item, score: scoreMatch(item, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.item);
}

export function getDefaultSearchIndex() {
  return buildSearchIndex(MANIFESTS, CHEATSHEETS);
}
