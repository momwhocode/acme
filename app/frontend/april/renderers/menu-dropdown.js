import { resolveMenuOptionPlaygroundArgs } from "./menu-option.js";

export const DEFAULT_SINGLE_MENU_ITEMS = [
  {
    label: "Edit",
    shortcut: "⌘E",
    showLeadingIcon: false,
    showBadge: false,
    showLeadingSelector: false,
    showTrailingTag: false,
    showTrailingSelector: false,
    showTrailingIcon: false,
  },
  {
    label: "Save",
    shortcut: "⌘S",
    showLeadingIcon: false,
    showBadge: false,
    showLeadingSelector: false,
    showTrailingTag: false,
    showTrailingSelector: false,
    showTrailingIcon: false,
  },
  {
    label: "Undo",
    showLeadingIcon: false,
    showBadge: false,
    showLeadingSelector: false,
    showTrailingShortcut: false,
    showTrailingTag: false,
    showTrailingSelector: false,
    showTrailingIcon: false,
  },
];

export const DEFAULT_SINGLE_MENU_GROUP = {
  groupLabel: "Actions",
  items: [
    {
      label: "Archive",
      destructive: true,
      showLeadingIcon: false,
      showBadge: false,
      showLeadingSelector: false,
      showTrailingShortcut: false,
      showTrailingTag: false,
      showTrailingSelector: false,
      showTrailingIcon: false,
    },
    {
      label: "Delete",
      destructive: true,
      showLeadingIcon: false,
      showBadge: false,
      showLeadingSelector: false,
      showTrailingShortcut: false,
      showTrailingTag: false,
      showTrailingSelector: false,
      showTrailingIcon: false,
    },
  ],
};

export const DEFAULT_MULTI_MENU_ITEMS = [
  { label: "Mexico" },
  { label: "Phoenix" },
  { label: "Austin", selected: true },
  { label: "Orlando" },
  { label: "Sunnyvale" },
];

export function resolveMenuDropdownPlaygroundArgs(args = {}) {
  const multiselect = args.multiselect ?? false;

  return {
    multiselect,
    previewOption: resolveMenuOptionPlaygroundArgs({ ...args, multiselect }),
  };
}

/** Defaults for action-menu rows (table overflow, page header menus). */
export const ACTION_MENU_ITEM_DEFAULTS = {
  showLeadingIcon: false,
  showBadge: false,
  showLeadingSelector: false,
  showTrailingShortcut: false,
  showTrailingTag: false,
  showTrailingSelector: false,
  showTrailingIcon: false,
};

/** Archive / Delete actions are always red in dropdowns. */
export function isDestructiveActionMenuItem(item = {}) {
  if (item.destructive) return true;

  const id = String(item.id ?? "").toLowerCase();
  if (id === "delete" || id === "archive") return true;

  const label = String(item.label ?? "")
    .trim()
    .toLowerCase();
  return (
    label === "delete" || label === "archive" || label.startsWith("delete ") || label.startsWith("archive ")
  );
}

export function mapActionMenuItems(items = [], { idPrefix = "menu", onClose } = {}) {
  return items.map((item, index) => {
    if (item.divider) {
      return { divider: true, id: item.id ?? `${idPrefix}-divider-${index}` };
    }

    if (item.optionGroup) {
      return {
        optionGroup: true,
        groupLabel: item.groupLabel,
        id: item.id ?? `${idPrefix}-group-${index}`,
      };
    }

    const { onClick: itemOnClick, ...rest } = item;

    return {
      ...ACTION_MENU_ITEM_DEFAULTS,
      ...rest,
      label: item.label,
      destructive: isDestructiveActionMenuItem(item),
      showTrailingShortcut: Boolean(item.shortcut) || Boolean(rest.showTrailingShortcut),
      id: item.id ?? `${idPrefix}-item-${index}`,
      onClick: () => {
        itemOnClick?.();
        onClose?.();
      },
    };
  });
}
