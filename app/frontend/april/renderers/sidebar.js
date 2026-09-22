export const SIDEBAR_VARIANTS = ["main", "settings"];

/** Neutral Storybook defaults; applications provide their own route-aware items. */
export const DEFAULT_MAIN_MENU_TOP = [
  { id: "home", label: "Home", icon: "home" },
  { id: "people", label: "People", icon: "person" },
  { id: "calendar", label: "Calendar", icon: "event" },
];

export const DEFAULT_MAIN_MENU_GROUPS = [];

export const DEFAULT_MAIN_MENU_BOTTOM = [
  { id: "reports", label: "Reports", icon: "bar_chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export const DEFAULT_SETTINGS_MENU_GROUPS = [
  {
    groupLabel: "General",
    items: [
      { id: "profile", label: "Profile", icon: "badge" },
      { id: "billing", label: "Billing", icon: "credit_card" },
    ],
  },
  {
    groupLabel: "Workspace",
    items: [{ id: "preferences", label: "Preferences", icon: "tune" }],
  },
  {
    groupLabel: "Access",
    items: [{ id: "users-roles", label: "Users & Roles", icon: "admin_panel_settings" }],
  },
];

export const DEFAULT_SIDEBAR_ACTIVE_ITEM = {
  main: "home",
  settings: "profile",
};

export function resolveSidebarMenuData({ variant = "main", topItems, groups, bottomItems } = {}) {
  if (variant === "settings") {
    return {
      topItems: [],
      groups: groups ?? DEFAULT_SETTINGS_MENU_GROUPS,
      bottomItems: [],
    };
  }

  return {
    topItems: topItems ?? DEFAULT_MAIN_MENU_TOP,
    groups: groups ?? DEFAULT_MAIN_MENU_GROUPS,
    bottomItems: bottomItems ?? DEFAULT_MAIN_MENU_BOTTOM,
  };
}
