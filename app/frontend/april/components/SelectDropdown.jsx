import {
  DATE_RANGE_GROUPS,
  PLAN_MULTISELECT_GROUPS,
  PLAN_STATUS_GROUPS,
  SELECT_DROPDOWN_VARIANTS,
  STATUS_FILTER_GROUPS,
} from "../renderers/select-dropdown.js";
import { MenuOption } from "./MenuOption.jsx";

function SelectDropdownDivider() {
  return <hr className="april-select-dropdown__divider" role="separator" aria-hidden="true" />;
}

function resolveOptionState(item, multiselect) {
  if (item.state) return item.state;
  if (item.selected) return multiselect ? "default" : "active";
  return "default";
}

function SelectDropdownOption({ item, id, multiselect, iconStatus, onOptionSelect }) {
  const selected = Boolean(item.selected);
  const state = resolveOptionState(item, multiselect);

  const defaults = iconStatus
    ? {
        showLeadingIcon: selected,
        leadingIconVariant: "status",
        leadingIconName: item.leadingIconName || "check",
        showLeadingSelector: false,
        showTrailingCheck: false,
      }
    : multiselect
      ? { showLeadingSelector: true, selectorType: "checkbox", showTrailingCheck: false }
      : { showLeadingSelector: false, showTrailingCheck: selected };

  return (
    <MenuOption
      id={id}
      size="md"
      showLeadingIcon={defaults.showLeadingIcon ?? false}
      showBadge={false}
      showLeadingSelector={defaults.showLeadingSelector ?? false}
      showAvatar={false}
      showTrailingShortcut={false}
      showTrailingTag={false}
      showTrailingSelector={false}
      showTrailingIcon={false}
      showTrailingCheck={defaults.showTrailingCheck}
      selectorType={defaults.selectorType || "radio"}
      leadingIconVariant={defaults.leadingIconVariant}
      leadingIconName={item.leadingIconName || defaults.leadingIconName || "add"}
      selected={multiselect ? selected : false}
      indeterminate={Boolean(item.indeterminate)}
      state={state}
      label={item.label}
      onClick={() => onOptionSelect?.(item)}
    />
  );
}

function renderGroups(groups, id, { multiselect, iconStatus, onOptionSelect }) {
  let itemIndex = 0;
  const nodes = [];

  groups.forEach((group, groupIndex) => {
    if (group.label) {
      nodes.push(
        <MenuOption
          key={`${id}-group-${groupIndex}`}
          optionGroup
          groupLabel={group.label}
          id={`${id}-group-${groupIndex}`}
        />
      );
    }

    (group.items || []).forEach((item) => {
      nodes.push(
        <SelectDropdownOption
          key={`${id}-item-${itemIndex}`}
          item={item}
          id={`${id}-item-${itemIndex}`}
          multiselect={multiselect}
          iconStatus={iconStatus}
          onOptionSelect={onOptionSelect}
        />
      );
      itemIndex += 1;
    });

    if (group.dividerAfter) {
      nodes.push(<SelectDropdownDivider key={`${id}-divider-${groupIndex}`} />);
    }
  });

  return nodes;
}

/** Select dropdown — composes menu options (Figma select-dropdown) */
export function SelectDropdown({
  variant = "single",
  multiselect = false,
  groups = null,
  items = null,
  id = "select-dropdown",
  className = "",
  onOptionSelect,
}) {
  const resolvedVariant = SELECT_DROPDOWN_VARIANTS.includes(variant) ? variant : "single";
  const isMultiselect = multiselect || resolvedVariant.startsWith("multiselect");
  const iconStatus = resolvedVariant === "multiselect-icon";
  const resolvedGroups = groups ?? [{ items: items ?? [] }];
  const variantClass =
    resolvedVariant === "multiselect-icon"
      ? "april-select-dropdown--multiselect-icon"
      : isMultiselect
        ? "april-select-dropdown--multiselect"
        : "april-select-dropdown--single";
  const mode = isMultiselect ? "multiselect" : "single-select";

  return (
    <div
      className={["april-select-dropdown", variantClass, className].filter(Boolean).join(" ")}
      id={id}
      role="listbox"
      aria-multiselectable={isMultiselect || undefined}
      data-controller="april-menu-options"
      data-april-menu-options-mode-value={mode}
    >
      <div className="april-select-dropdown__menu" role="presentation">
        {renderGroups(resolvedGroups, id, {
          multiselect: isMultiselect,
          iconStatus,
          onOptionSelect,
        })}
      </div>
    </div>
  );
}

const VARIANT_GROUPS = {
  multiselect: PLAN_MULTISELECT_GROUPS,
  "multiselect-icon": STATUS_FILTER_GROUPS,
  "date-range": DATE_RANGE_GROUPS,
  single: PLAN_STATUS_GROUPS,
};

export function SelectDropdownPlayground({ variant = "single", groups, ...rest } = {}) {
  const resolvedGroups = groups ?? VARIANT_GROUPS[variant] ?? PLAN_STATUS_GROUPS;
  const resolvedVariant = variant === "date-range" ? "single" : variant;

  return (
    <div className="april-select-dropdown-playground">
      <div className="april-select-dropdown-playground__frame">
        <SelectDropdown
          variant={resolvedVariant}
          groups={resolvedGroups}
          id="select-dropdown-playground"
          {...rest}
        />
      </div>
    </div>
  );
}
