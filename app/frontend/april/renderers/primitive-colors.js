import primitiveColorTokens from "../../data/mode-1-primitive-colors.json";

const SHADE_ORDER = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

function shadeSortKey(name) {
  const match = name.match(/-(\d+)$/);
  return match ? SHADE_ORDER.indexOf(match[1]) : 999;
}

export function parsePrimitiveColorTokens(source = primitiveColorTokens) {
  return Object.entries(source)
    .filter(([family]) => !family.startsWith("$"))
    .map(([family, shades]) => {
      const colors = Object.entries(shades)
        .filter(([, token]) => token?.$type === "color" && token?.$value?.hex)
        .map(([name, token]) => ({
          name,
          hex: token.$value.hex.toUpperCase(),
          tokenPath: `${family}/${name}`,
          cssVar: `--${family}-${name}`,
        }))
        .sort((a, b) => shadeSortKey(a.name) - shadeSortKey(b.name));

      return { family, colors };
    })
    .filter(({ colors }) => colors.length > 0);
}

export const PRIMITIVE_COLOR_FAMILIES = parsePrimitiveColorTokens();
