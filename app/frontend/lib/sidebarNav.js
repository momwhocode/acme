/** Map app nav config entries to April Sidebar item shape. */

export function navItemToSidebar(item) {
  let to;
  if (!item.disabled && item.path) {
    if (item.query && Object.keys(item.query).length > 0) {
      const search = new URLSearchParams(item.query).toString();
      to = `${item.path}?${search}`;
    } else {
      to = item.path;
    }
  }

  return {
    id: item.id,
    label: item.label,
    icon: item.icon,
    to,
    disabled: Boolean(item.disabled),
    tag: item.tag,
    end: Boolean(item.end),
  };
}

function flattenNavItem(item) {
  const nested = [
    ...(item.children || []),
    ...(item.nestedGroups || []).flatMap((group) => group.items || []),
  ];
  return [item, ...nested.flatMap(flattenNavItem)];
}

export function flattenSidebarItems({ topItems = [], groups = [], bottomItems = [] } = {}) {
  return [
    ...topItems.flatMap(flattenNavItem),
    ...groups.flatMap((group) => (group.items || []).flatMap(flattenNavItem)),
    ...bottomItems.flatMap(flattenNavItem),
  ];
}

export function resolveActiveNavItemId(menu, pathname) {
  const items = flattenSidebarItems(menu).filter((item) => item.to);
  const sorted = [...items].sort((a, b) => b.to.length - a.to.length);

  for (const item of sorted) {
    if (item.end) {
      if (pathname === item.to) return item.id;
      continue;
    }

    if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
      return item.id;
    }
  }

  return undefined;
}
