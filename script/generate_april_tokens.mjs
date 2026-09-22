#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "april-ds.md");
const semanticPath = resolve(root, "app/frontend/data/semantic-colors.json");
const outputPath = resolve(root, "app/frontend/styles/april/tokens.css");

const source = readFileSync(sourcePath, "utf8");
const match = source.match(/^---\n([\s\S]*?)\n---/);

if (!match) {
  console.error("Could not parse YAML front matter in april-ds.md");
  process.exit(1);
}

const frontMatterEnd = match[0].length;
const body = source.slice(frontMatterEnd);
const tokens = yaml.load(match[1]);
const semanticSource = JSON.parse(readFileSync(semanticPath, "utf8"));

function cssVarName(key) {
  return `--${key.replace(/_/g, "-")}`;
}

function aliasToPrimitiveVar(alias) {
  const [family, name] = alias.split("/");
  return `var(${cssVarName(`${family}-${name}`)})`;
}

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

function parseSemanticColorTokens(source = semanticSource) {
  /** @type {Array<{ key: string, hex: string, alias: string | null, role: string, group: string, tokenPath: string }>} */
  const parsed = [];

  function walk(obj, path = []) {
    if (obj?.$type === "color" && obj?.$value?.hex) {
      parsed.push({
        key: path.join("-"),
        hex: colorHex(obj.$value),
        alias: obj.$extensions?.["com.figma.aliasData"]?.targetVariableName ?? null,
        role: path[1] ?? "",
        group: path.slice(2).join("/"),
        tokenPath: path.join("/"),
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

const semanticTokens = parseSemanticColorTokens();

function syncSemanticToAprilDs() {
  const primitives = Object.fromEntries(
    Object.entries(tokens.colors || {}).filter(([key]) => !key.startsWith("color-"))
  );
  const semantic = Object.fromEntries(semanticTokens.map(({ key, hex }) => [key, hex.toLowerCase()]));

  tokens.colors = { ...primitives, ...semantic };

  const updatedFrontMatter = yaml.dump(tokens, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
    sortKeys: false,
  });

  writeFileSync(sourcePath, `---\n${updatedFrontMatter}---${body}`);
  console.log(`Synced ${semanticTokens.length} semantic tokens to ${sourcePath}`);
}

syncSemanticToAprilDs();

const primitiveEntries = Object.entries(tokens.colors || {}).filter(([key]) => !key.startsWith("color-"));

const lines = [
  "/* Generated from april-ds.md + app/frontend/data/semantic-colors.json — run: npm run generate:tokens */",
  "",
  ":root {",
  '  --april-font-family: "Inter", system-ui, -apple-system, sans-serif;',
  "  --april-font-family-display: var(--april-font-family);",
  "  --font-family-typeface: var(--april-font-family);",
  "",
  "  /* Shadows */",
  "  --april-shadow-xs: 0px 1px 2px 0px #0000000d;",
  "  --april-shadow-sm: 0px 1px 2px 0px #0000000f, 0px 1px 3px 0px #0000001a;",
  "  --april-shadow-md: 0px 2px 4px -1px #0000000f, 0px 4px 6px -1px #0000001a;",
  "  --april-shadow-lg: 0px 4px 6px -2px #0000000d, 0px 10px 15px -3px #0000001a;",
  "  --april-shadow-xl: 0px 10px 10px 0px #0000000a, 0px 20px 25px 0px #0000001a;",
  "  --april-shadow-2xl: 0px 25px 50px -12px #00000040;",
  "  --april-shadow-cards-menus: 0px 0px 0px 1px #d8dee4, 0px 5px 17px 0px #0c0c0c24;",
  "",
  "  /* Focus ring (Figma focus-rings/2px) */",
  "  --april-focus-ring: 0 0 0 2px var(--white-white-950), 0 0 0 4px var(--primary-primary-300);",
  "  --april-shadow-focus-ring: var(--april-focus-ring);",
  "",
  "  /* Primitive colors (Figma Mode 1) */",
];

for (const [key, value] of primitiveEntries) {
  lines.push(`  ${cssVarName(key)}: ${value};`);
}

lines.push("", "  /* Semantic colors — use these in components (reference primitives when aliased) */");

for (const token of semanticTokens) {
  const cssValue = token.alias ? aliasToPrimitiveVar(token.alias) : token.hex.toLowerCase();
  lines.push(`  ${cssVarName(token.key)}: ${cssValue};`);
}

lines.push("", "  /* Typography — font/size scale (Figma) */");

for (const [key, value] of Object.entries(tokens.fontSize || {})) {
  lines.push(`  --font-size-${key}: ${value};`);
}

lines.push("", "  /* Typography — font/line-height scale (Figma) */");

for (const [key, value] of Object.entries(tokens.lineHeight || {})) {
  lines.push(`  --font-line-height-${key}: ${value};`);
}

lines.push("", "  /* Typography — composite text styles */");

for (const [key, value] of Object.entries(tokens.typography || {})) {
  const prefix = cssVarName(`typography-${key}`);
  lines.push(`  ${prefix}-font-family: "${value.fontFamily}", system-ui, sans-serif;`);
  lines.push(`  ${prefix}-font-size: ${value.fontSize};`);
  lines.push(`  ${prefix}-font-weight: ${value.fontWeight};`);
  lines.push(`  ${prefix}-line-height: ${value.lineHeight};`);
  if (value.letterSpacing) {
    lines.push(`  ${prefix}-letter-spacing: ${value.letterSpacing};`);
  }
}

lines.push("", "  /* Radius */");

for (const [key, value] of Object.entries(tokens.rounded || {})) {
  lines.push(`  ${cssVarName(key)}: ${value};`);
}

lines.push("", "  /* Spacing */");

for (const [key, value] of Object.entries(tokens.spacing || {})) {
  lines.push(`  ${cssVarName(key)}: ${value};`);
}

lines.push("}", "");

writeFileSync(outputPath, lines.join("\n"));
console.log(`Wrote ${outputPath}`);
