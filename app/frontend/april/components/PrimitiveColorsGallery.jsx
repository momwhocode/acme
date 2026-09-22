import { PRIMITIVE_COLOR_FAMILIES } from "../renderers/primitive-colors.js";

function ColorSwatch({ color }) {
  return (
    <article className="april-primitive-color-swatch">
      <div
        className="april-primitive-color-swatch__chip"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />
      <div className="april-primitive-color-swatch__meta">
        <span className="april-primitive-color-swatch__name">{color.name}</span>
        <span className="april-primitive-color-swatch__hex">{color.hex}</span>
        <span className="april-primitive-color-swatch__path">{color.tokenPath}</span>
        <code className="april-primitive-color-swatch__var">{color.cssVar}</code>
      </div>
    </article>
  );
}

function ColorFamily({ family, colors }) {
  return (
    <section className="april-primitive-color-family">
      <header className="april-primitive-color-family__header">
        <h2 className="april-primitive-color-family__title">{family}</h2>
        <span className="april-primitive-color-family__count">{colors.length} shades</span>
      </header>
      <div className="april-primitive-color-family__strip">
        {colors.map((color) => (
          <ColorSwatch key={color.cssVar} color={color} />
        ))}
      </div>
    </section>
  );
}

export function PrimitiveColorsGallery() {
  return (
    <div className="april-primitive-colors" style={{ padding: 24 }}>
      <header className="april-primitive-colors__header">
        <h1 className="april-primitive-colors__title">Primitive colors</h1>
        <p className="april-primitive-colors__description">
          Raw palette tokens from Figma. Use only in token generation — reference semantic tokens in
          components.
        </p>
      </header>
      {PRIMITIVE_COLOR_FAMILIES.map(({ family, colors }) => (
        <ColorFamily key={family} family={family} colors={colors} />
      ))}
    </div>
  );
}
