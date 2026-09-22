export const PAGE_TITLE_NAV_HEADER_TYPES = ["default", "with-meta"];

export const DEFAULT_PAGE_TITLE_NAV_HEADER_CREATED_AT = new Date("2025-05-15T08:00:00");

/** Figma page title nav header type presets — explicit props override these. */
export const PAGE_TITLE_NAV_HEADER_TYPE_PROPS = {
  default: {
    showCreatedOn: false,
    showUserName: false,
  },
  "with-meta": {
    showCreatedOn: true,
    showUserName: true,
  },
};

export function resolvePageTitleNavHeaderTypeProps(type = "default", overrides = {}) {
  const preset = PAGE_TITLE_NAV_HEADER_TYPE_PROPS[type] ?? PAGE_TITLE_NAV_HEADER_TYPE_PROPS.default;
  return { type, ...preset, ...overrides };
}
