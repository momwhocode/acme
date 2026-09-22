import { SEMANTIC_COLOR_TOKENS, groupSemanticColorTokens } from "../renderers/semantic-colors.js";

function SemanticColorSwatch({ token }) {
  return (
    <article className="april-semantic-color-swatch">
      <div
        className="april-semantic-color-swatch__chip"
        style={{ backgroundColor: token.hex }}
        aria-hidden="true"
      />
      <div className="april-semantic-color-swatch__meta">
        <span className="april-semantic-color-swatch__name">
          {token.key.replace(/^color-(background|foreground|border)-/, "")}
        </span>
        <span className="april-semantic-color-swatch__hex">{token.hex}</span>
        <code className="april-semantic-color-swatch__var">{token.cssVar}</code>
        {token.alias ? <span className="april-semantic-color-swatch__alias">→ {token.alias}</span> : null}
      </div>
    </article>
  );
}

function SemanticColorGroup({ group, tokens }) {
  const title = group.replace(/\//g, " / ");
  return (
    <section className="april-semantic-color-group">
      <header className="april-semantic-color-group__header">
        <h3 className="april-semantic-color-group__title">{title}</h3>
        <span className="april-semantic-color-group__count">{tokens.length} tokens</span>
      </header>
      <div className="april-semantic-color-group__grid">
        {tokens.map((token) => (
          <SemanticColorSwatch key={token.key} token={token} />
        ))}
      </div>
    </section>
  );
}

function SemanticColorRole({ role, groups }) {
  const groupEntries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  const total = groupEntries.reduce((sum, [, tokens]) => sum + tokens.length, 0);

  return (
    <section className="april-semantic-color-role">
      <header className="april-semantic-color-role__header">
        <h2 className="april-semantic-color-role__title">{role}</h2>
        <span className="april-semantic-color-role__count">{total} tokens</span>
      </header>
      {groupEntries.map(([group, tokens]) => (
        <SemanticColorGroup key={group} group={group} tokens={tokens} />
      ))}
    </section>
  );
}

export function SemanticColorsGallery({ tokens = SEMANTIC_COLOR_TOKENS }) {
  const grouped = groupSemanticColorTokens(tokens);
  const roles = Object.keys(grouped).sort();

  return (
    <div className="april-semantic-colors" style={{ padding: 24 }}>
      <header className="april-semantic-colors__header">
        <h1 className="april-semantic-colors__title">Semantic colors</h1>
        <p className="april-semantic-colors__description">
          Component-facing color tokens for background, foreground, border, text, and icon usage. Always use
          these in component CSS — never raw primitive hex values. Source:{" "}
          <code>src/data/semantic-colors.json</code>
        </p>
        <p className="april-semantic-colors__note">
          {tokens.length} tokens across {roles.length} roles ({roles.join(", ")}).
        </p>
      </header>
      {roles.map((role) => (
        <SemanticColorRole key={role} role={role} groups={grouped[role]} />
      ))}
    </div>
  );
}
