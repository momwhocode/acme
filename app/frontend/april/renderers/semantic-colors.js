import semanticColorTokens from "../../data/semantic-colors.json";

function colorHex(value) {
  let hex = value.hex.toUpperCase();
  if (value.alpha !== undefined && value.alpha < 1) {
    const alpha = Math.round(value.alpha * 255)
      .toString(16)
      .padStart(2, "0");
    hex = `${hex}${alpha}`;
  }
  return hex;
}

export function parseSemanticColorTokens(source = semanticColorTokens) {
  /** @type {Array<{ key: string, hex: string, alias: string | null, role: string, group: string, tokenPath: string, cssVar: string, primitiveVar: string | null }>} */
  const parsed = [];

  function walk(obj, path = []) {
    if (obj?.$type === "color" && obj?.$value?.hex) {
      const key = path.join("-");
      const alias = obj.$extensions?.["com.figma.aliasData"]?.targetVariableName ?? null;
      parsed.push({
        key,
        hex: colorHex(obj.$value),
        alias,
        role: path[1] ?? "",
        group: path.slice(2).join("/"),
        tokenPath: path.join("/"),
        cssVar: `--${key}`,
        primitiveVar: alias ? `--${alias.replace("/", "-")}` : null,
      });
      return;
    }

    if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        if (!key.startsWith("$")) walk(value, [...path, key]);
      }
    }
  }

  walk(source);
  return parsed.sort((a, b) => a.key.localeCompare(b.key));
}

export const SEMANTIC_COLOR_TOKENS = parseSemanticColorTokens();

export function groupSemanticColorTokens(tokens = SEMANTIC_COLOR_TOKENS) {
  /** @type {Record<string, Record<string, typeof tokens>>} */
  const grouped = {};

  for (const token of tokens) {
    const parts = token.tokenPath.split("/");
    const role = parts[1] ?? "other";
    const component = parts[2] ?? "other";
    grouped[role] ??= {};
    grouped[role][component] ??= [];
    grouped[role][component].push(token);
  }

  return grouped;
}
