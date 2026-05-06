export const NAV_ITEMS = [
  { id: "home",        label: "Home",        icon: "⌂", group: null },
  { id: "topology",    label: "Topology",    icon: "⬡", group: null },
  { id: "manifests",   label: "Manifests",   icon: "☸", group: "References" },
  { id: "cheatsheets", label: "Cheatsheets", icon: "⌨", group: "References" },
];

export const getNavGroups = () => [
  { label: null,         items: NAV_ITEMS.filter(n => !n.group) },
  { label: "References", items: NAV_ITEMS.filter(n => n.group === "References") },
];
