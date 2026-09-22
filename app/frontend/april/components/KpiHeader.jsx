import { KPI_HEADER_STATES } from "../renderers/kpi-header.js";

/** KPI header — Figma 407:131 / 769:15629 */
export function KpiHeader({ state = "default", items = [], id = "kpi-header", className = "" }) {
  const resolvedState = KPI_HEADER_STATES.includes(state) ? state : "default";
  const loading = resolvedState === "loading";

  return (
    <section
      className={["april-kpi-header", `april-kpi-header--${resolvedState}`, className]
        .filter(Boolean)
        .join(" ")}
      id={id}
      aria-label="Key metrics"
      aria-busy={loading || undefined}
    >
      <ul className="april-kpi-header__list">
        {items.map((item, index) => (
          <li
            key={`${id}-card-${index}`}
            className={["april-kpi-header__card", loading ? "april-kpi-header__card--loading" : ""]
              .filter(Boolean)
              .join(" ")}
            id={`${id}-card-${index}`}
            aria-hidden={loading || undefined}
          >
            {loading ? (
              <>
                <span className="april-kpi-header__skeleton april-kpi-header__skeleton--label" />
                <span className="april-kpi-header__skeleton april-kpi-header__skeleton--value" />
              </>
            ) : (
              <>
                <span className="april-kpi-header__label">{item.label}</span>
                <span className="april-kpi-header__value">{item.value}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
