import { COLORS } from '../constants/colors.js';

export function YamlLine({ text }) {
  if (text.trim().startsWith("#")) {
    return <span style={{ color: COLORS.textFaint, fontStyle: "italic" }}>{text}</span>;
  }
  const ci = text.indexOf(":");
  if (ci === -1) return <span style={{ color: COLORS.text }}>{text}</span>;
  const indent = text.match(/^(\s*)/)[1];
  const key = text.substring(indent.length, ci + 1);
  const val = text.substring(ci + 1);
  const valColor = val.includes('"') || val.includes("'") ? COLORS.green : /^\s+\d/.test(val) ? COLORS.orange : COLORS.text;
  return (
    <>
      <span style={{ color: COLORS.textFaint }}>{indent}</span>
      <span style={{ color: COLORS.blue, fontWeight: 600 }}>{key}</span>
      <span style={{ color: valColor }}>{val}</span>
    </>
  );
}

export function highlight(text, query) {
  if (!query || !text) return text || '';
  try {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: COLORS.accentDim, color: COLORS.accentBright, borderRadius: 2, padding: "0 1px" }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  } catch (error) {
    console.error('Highlight error:', error);
    return text || '';
  }
}

export const TYPE_LABELS = {
  page: "Page",
  manifest: "Manifest",
  field: "YAML field",
  cheatsheet: "Cheatsheet",
  command: "Command",
};
