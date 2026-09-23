import { Tag } from "../../april/components/Tag"
import { deltaTagProps } from "../../lib/homeOverview"

/** Clickable Home metric. Deltas use April tags (up = success, down = error). */
export function OverviewKpi({ icon, label, value, delta, onClick, selected = false }) {
  return (
    <button
      type="button"
      className={[ "acme-overview__kpi", selected ? "is-selected" : "" ].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      <p className="acme-overview__kpi-label april-text-style april-text-style--text-sm-regular">
        <span className="material-symbols-outlined april-icon" aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className="acme-overview__kpi-value april-text-style april-text-style--display-sm-semibold">{value}</p>
      {delta ? <Tag label={delta} trailingIcon={false} {...deltaTagProps(delta)} /> : null}
    </button>
  )
}
