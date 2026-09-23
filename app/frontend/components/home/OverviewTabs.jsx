import { Button } from "../../april/components/Button"

/** In-card ghost tabs — no April tab-rail divider. */
export function OverviewTabs({ id, tabs, activeIndex, onChange, align = "start" }) {
  return (
    <div
      className={[ "acme-overview__tabs", align === "end" ? "acme-overview__tabs--end" : "" ].filter(Boolean).join(" ")}
      id={id}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex
        return (
          <div
            key={tab.id || tab.label}
            className={[ "april-tab-wrapper", active ? "april-tab-wrapper--active" : "" ].filter(Boolean).join(" ")}
          >
            <Button
              label={tab.count != null ? `${tab.label} ${tab.count}` : tab.label}
              variant="ghost"
              size="sm"
              leadingIcon={false}
              trailingIcon={false}
              state={active ? "active-pressed" : null}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(index)}
            />
          </div>
        )
      })}
    </div>
  )
}
