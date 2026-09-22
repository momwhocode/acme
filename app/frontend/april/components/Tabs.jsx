import { useState } from "react";
import { DEFAULT_PAGE_TABS, TABS_MAX_COUNT, TABS_MIN_COUNT } from "../renderers/tabs.js";
import { Button } from "./Button.jsx";

function clampTabCount(count) {
  return Math.min(TABS_MAX_COUNT, Math.max(TABS_MIN_COUNT, count));
}

function resolveTabs({ tabs, tabCount }) {
  const source = tabs || DEFAULT_PAGE_TABS;
  const normalized = source.map((tab) => (typeof tab === "string" ? { label: tab, icon: "add" } : tab));
  const count = tabCount != null ? clampTabCount(tabCount) : normalized.length;
  return normalized.slice(0, count);
}

/** Page tabs — ghost buttons in tab wrappers.
 * Tablist is flush (`padding/margin: 0`) with a shared flex gap between tabs.
 */
export function Tabs({
  tabCount = DEFAULT_PAGE_TABS.length,
  tabs,
  activeIndex: activeIndexProp = 0,
  onTabChange,
  id = "tabs",
  className = "",
}) {
  const resolvedTabs = resolveTabs({ tabs, tabCount });
  const [internalIndex, setInternalIndex] = useState(
    Math.min(resolvedTabs.length - 1, Math.max(0, activeIndexProp))
  );
  const isControlled = onTabChange != null;
  const activeIndex = isControlled
    ? Math.min(resolvedTabs.length - 1, Math.max(0, activeIndexProp))
    : internalIndex;

  const selectTab = (index) => {
    if (!isControlled) {
      setInternalIndex(index);
    }
    onTabChange?.(index);
  };

  return (
    <div
      className={["april-tabs-group", className].filter(Boolean).join(" ")}
      id={id}
      data-controller="april-tabs"
      data-april-tabs-active-index-value={activeIndex}
    >
      <div className="april-tabs-group__base-rail" role="tablist" aria-label="Page tabs">
        {resolvedTabs.map((tab, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={`${id}-tab-wrap-${index}`}
              className={["april-tab-wrapper", active ? "april-tab-wrapper--active" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <Button
                id={`${id}-tab-${index}`}
                label={tab.label}
                variant="ghost"
                size="sm"
                icon={tab.icon || "add"}
                leadingIcon
                trailingIcon={false}
                state={active ? "active-pressed" : null}
                onClick={() => selectTab(index)}
                role="tab"
                aria-selected={active}
                data-april-tabs-target="tab"
                data-index={index}
              />
            </div>
          );
        })}
      </div>
      <hr className="april-tabs-group__divider" role="separator" aria-hidden="true" />
    </div>
  );
}
