export const AVATAR_COLORS = ["orange", "green", "pink", "gray", "teal", "blue", "red"];

/** Stable assignment order — matches UserSerializer / RoleSerializer */
const AVATAR_ID_COLORS = ["pink", "green", "blue", "teal", "orange", "red", "gray"];

const AVATAR_COLOR_ALIASES = {
  purple: "blue",
  white: "orange",
};

/** CRC32 — matches Ruby Zlib.crc32 for avatar color assignment */
function crc32(value) {
  const str = String(value);
  let crc = 0xffffffff;

  for (let i = 0; i < str.length; i += 1) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function normalizeAvatarColor(color, fallback = "orange") {
  const resolved = AVATAR_COLOR_ALIASES[color] ?? color;
  return AVATAR_COLORS.includes(resolved) ? resolved : fallback;
}

export function avatarColorForId(id, fallback = "orange") {
  if (id == null || id === "") return fallback;
  return normalizeAvatarColor(AVATAR_ID_COLORS[crc32(id) % AVATAR_ID_COLORS.length]);
}

export const AVATAR_SIZES = ["md", "xl", "2xl"];
