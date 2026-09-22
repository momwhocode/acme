import {
  DEFAULT_PREVIEW_TEXT,
  TEXT_STYLES,
  TEXT_STYLE_SCALES,
  TEXT_STYLE_WEIGHTS,
} from "../renderers/text-styles.js";

/** Single April text style sample */
export function TextStyle({
  style = "text-md-regular",
  text = DEFAULT_PREVIEW_TEXT,
  tag: Tag = "p",
  className = "",
}) {
  const resolvedStyle = TEXT_STYLES.includes(style) ? style : "text-md-regular";
  const classes = ["april-text-style", `april-text-style--${resolvedStyle}`, className]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{text}</Tag>;
}

function ValueRow({ label, token }) {
  return (
    <div className="april-text-styles__value-row">
      <span className="april-text-styles__value-label">{label}</span>
      <span className="april-text-styles__value-token">{token}</span>
    </div>
  );
}

function TextStyleRow({ scale, weight }) {
  const styleId = `${scale.id}-${weight}`;
  const figmaName = `${scale.label}/${weight}`;

  return (
    <div className="april-text-styles__row">
      <div className="april-text-styles__name">
        <span>{weight}</span>
        <span>{figmaName}</span>
      </div>
      <div className="april-text-styles__value">
        <ValueRow label="font-family:" token="Inter" />
        <ValueRow label="font-style:" token={`font/weight/${weight}`} />
        <ValueRow label="font-size:" token={`font/size/${scale.id}`} />
        <ValueRow label="line-height:" token={`font/line-height/${scale.id}`} />
        {scale.letterSpacing ? <ValueRow label="letter-spacing:" token={scale.letterSpacing} /> : null}
      </div>
      <div className="april-text-styles__preview">
        <TextStyle style={styleId} className="april-text-styles__preview-text" />
      </div>
    </div>
  );
}

function TextStylesTable() {
  return (
    <div className="april-text-styles">
      <div className="april-text-styles__header">
        <div className="april-text-styles__header-cell">Text Styles</div>
        <div className="april-text-styles__header-cell">Value</div>
        <div className="april-text-styles__header-cell">Preview</div>
      </div>
      {TEXT_STYLE_SCALES.map((scale) => (
        <section key={scale.id} className="april-text-styles__group">
          <div className="april-text-styles__group-label">{scale.label}</div>
          {TEXT_STYLE_WEIGHTS.map((weight) => (
            <TextStyleRow key={`${scale.id}-${weight}`} scale={scale} weight={weight} />
          ))}
        </section>
      ))}
    </div>
  );
}

export function TextStylesGallery() {
  return (
    <div style={{ padding: 24, maxWidth: 1240 }}>
      <TextStylesTable />
    </div>
  );
}
