import {
  DEFAULT_MULTI_MENU_ITEMS,
  DEFAULT_SINGLE_MENU_GROUP,
  DEFAULT_SINGLE_MENU_ITEMS,
  resolveMenuDropdownPlaygroundArgs,
} from "../renderers/menu-dropdown.js";
import { MenuOption } from "./MenuOption.jsx";

function MenuDropdownDivider() {
  return <hr className="april-menu-dropdown__divider" role="separator" aria-hidden="true" />;
}

function renderItems(items, idPrefix, { startIndex = 0 } = {}) {
  let index = startIndex;
  let dividerInserted = false;
  let hasNonDestructiveItem = false;
  const nodes = [];

  items.forEach((item) => {
    if (item.divider) {
      // Skip a leading divider when the menu would otherwise start with a rule.
      if (nodes.length > 0) {
        nodes.push(<MenuDropdownDivider key={item.id ?? `divider-${index}`} />);
      }
      index += 1;
      return;
    }

    // Only separate destructive actions when mixed with regular ones (avoids a lone top rule).
    if (item.destructive && !dividerInserted && hasNonDestructiveItem) {
      nodes.push(<MenuDropdownDivider key={`divider-${index}`} />);
      dividerInserted = true;
    }

    if (item.optionGroup) {
      nodes.push(
        <MenuOption
          key={`${idPrefix}-group-${index}`}
          optionGroup
          groupLabel={item.groupLabel}
          id={`${idPrefix}-group-${index}`}
        />
      );
      index += 1;
      return;
    }

    if (!item.destructive) hasNonDestructiveItem = true;
    nodes.push(<MenuOption key={`${idPrefix}-item-${index}`} id={`${idPrefix}-item-${index}`} {...item} />);
    index += 1;
  });

  return nodes;
}

function mergePlaygroundIntoFirstItem(items, previewOption) {
  if (!items.length) return items;
  const [first, ...rest] = items;
  return [
    {
      ...first,
      label: previewOption.label,
      state: previewOption.state,
      size: previewOption.size,
      destructive: previewOption.destructive,
      trailingAddOns: previewOption.trailingAddOns,
      selected: previewOption.selected,
      showLeadingIcon: previewOption.showLeadingIcon,
      showBadge: previewOption.showBadge,
      showLeadingSelector: previewOption.showLeadingSelector,
      showLeadingCheckbox: previewOption.showLeadingCheckbox,
      showAvatar: previewOption.showAvatar,
      showTrailingShortcut: previewOption.showTrailingShortcut,
      showTrailingTag: previewOption.showTrailingTag,
      showTrailingSelector: previewOption.showTrailingSelector,
      showTrailingIcon: previewOption.showTrailingIcon,
      ...(previewOption.showLeadingSelector ? { selectorType: "checkbox" } : {}),
    },
    ...rest,
  ];
}

/** Menu dropdown — composes base menu options (Figma 394:2347) */
export function MenuDropdown({
  multiselect = false,
  items,
  group = DEFAULT_SINGLE_MENU_GROUP,
  groupLabel = "Cities",
  id = "menu-dropdown",
  className = "",
}) {
  const mode = multiselect ? "multiselect" : "menu";
  const variantClass = multiselect ? "april-menu-dropdown--multiselect" : "april-menu-dropdown--single";

  if (multiselect) {
    const multiItems = items || DEFAULT_MULTI_MENU_ITEMS;
    return (
      <div
        className={["april-menu-dropdown", variantClass, className].filter(Boolean).join(" ")}
        id={id}
        role="presentation"
        data-controller="april-menu-options"
        data-april-menu-options-mode-value={mode}
      >
        <div className="april-menu-dropdown__menu" role="menu">
          {renderItems([{ optionGroup: true, groupLabel }, ...multiItems], id)}
        </div>
      </div>
    );
  }

  const singleItems = items ?? DEFAULT_SINGLE_MENU_ITEMS;
  const resolvedGroup = items != null ? null : (group ?? DEFAULT_SINGLE_MENU_GROUP);
  const groupItems = resolvedGroup
    ? [
        ...(resolvedGroup.groupLabel ? [{ optionGroup: true, groupLabel: resolvedGroup.groupLabel }] : []),
        ...(resolvedGroup.items || []),
      ]
    : [];

  return (
    <div
      className={["april-menu-dropdown", variantClass, className].filter(Boolean).join(" ")}
      id={id}
      role="presentation"
      data-controller="april-menu-options"
      data-april-menu-options-mode-value={mode}
    >
      <div className="april-menu-dropdown__menu" role="menu">
        {renderItems(singleItems, id)}
        {groupItems.length ? renderItems(groupItems, id, { startIndex: singleItems.length }) : null}
      </div>
    </div>
  );
}

export function MenuDropdownPlayground(args) {
  const { multiselect, previewOption } = resolveMenuDropdownPlaygroundArgs(args);

  const dropdown = multiselect ? (
    <MenuDropdown
      multiselect
      items={mergePlaygroundIntoFirstItem(DEFAULT_MULTI_MENU_ITEMS, previewOption)}
      groupLabel="Cities"
      id="menu-dropdown-playground"
    />
  ) : (
    <MenuDropdown
      items={mergePlaygroundIntoFirstItem(DEFAULT_SINGLE_MENU_ITEMS, previewOption)}
      group={DEFAULT_SINGLE_MENU_GROUP}
      id="menu-dropdown-playground"
    />
  );

  return <div className="april-menu-dropdown-playground">{dropdown}</div>;
}
