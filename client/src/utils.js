/* Shared utilities for SyncCode */

const AVATAR_COLORS = [
  { bg: "#0e3a4a", text: "#00d1ff" },
  { bg: "#1a2e4a", text: "#60a5fa" },
  { bg: "#2d1b4a", text: "#a78bfa" },
  { bg: "#3a1a2e", text: "#f472b6" },
  { bg: "#1a3a2d", text: "#34d399" },
];

export function avatarColor(id = "") {
  const index =
    id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
