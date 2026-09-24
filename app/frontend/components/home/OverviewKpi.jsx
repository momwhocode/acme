import { Tag } from "../../april/components/Tag"
import { deltaTagProps } from "../../lib/homeOverview"

/** Home metric tile. Deltas use April tags (up = success, down = error). */
export function OverviewKpi({ icon, label, value, delta }) {
  return (
    <article className="acme-overview__kpi">
      <p className="acme-overview__kpi-label april-text-style april-text-style--text-xs-regular">
        <span className="material-symbols-outlined april-icon" aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className="acme-overview__kpi-value april-text-style april-text-style--display-sm-semibold">{value}</p>
      {delta ? <Tag label={delta} trailingIcon={false} {...deltaTagProps(delta)} /> : null}
    </article>
  )
}
