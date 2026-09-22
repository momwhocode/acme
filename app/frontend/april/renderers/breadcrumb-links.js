export const BREADCRUMB_LINKS_VALUES = ["1", "2", "3", "overflown"];

const DEFAULT_LINK_LABEL = "Button Label";

export const DEFAULT_BREADCRUMB_PLAYGROUND_LABELS = ["Home", "Leads", "Settings"];

export function breadcrumbLinksSegmentCount(links = "2") {
  return links === "overflown" ? 3 : Math.min(3, Math.max(1, Number.parseInt(links, 10) || 1));
}

function labelsForSegmentCount(count, { linkLabels, linkLabel } = {}) {
  if (Array.isArray(linkLabels) && linkLabels.length > 0) {
    return Array.from({ length: count }, (_, index) => linkLabels[index] ?? linkLabel ?? DEFAULT_LINK_LABEL);
  }

  return Array.from({ length: count }, () => linkLabel ?? DEFAULT_LINK_LABEL);
}

export function resolveBreadcrumbLinksSegments({
  links = "2",
  items,
  linkLabels,
  linkLabel = DEFAULT_LINK_LABEL,
} = {}) {
  if (Array.isArray(items) && items.length > 0) {
    const normalized = items.map((item) => (typeof item === "string" ? { label: item } : item));

    if (links === "overflown") {
      return { segments: normalized.slice(0, 3), showOverflow: normalized.length > 3 || true };
    }

    const explicitCount = Number.parseInt(links, 10);
    const count =
      Number.isFinite(explicitCount) && explicitCount > 0
        ? Math.min(3, explicitCount)
        : Math.min(3, normalized.length);

    return { segments: normalized.slice(0, count), showOverflow: false };
  }

  const count = breadcrumbLinksSegmentCount(links);
  const labels = labelsForSegmentCount(count, { linkLabels, linkLabel });

  return {
    segments: labels.map((label) => ({ label })),
    showOverflow: links === "overflown",
  };
}

export function resolvePlaygroundLinkLabels(args = {}) {
  const count = breadcrumbLinksSegmentCount(args.links ?? "2");

  return [
    args.linkLabel1 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[0],
    args.linkLabel2 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[1],
    args.linkLabel3 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[2],
  ].slice(0, count);
}

export function resolveBreadcrumbLinksPlaygroundArgs(args = {}) {
  const links = BREADCRUMB_LINKS_VALUES.includes(args.links) ? args.links : "2";
  const labels = resolvePlaygroundLinkLabels({ ...args, links });

  return {
    links,
    items: labels.map((label) => ({ label })),
    linkLabel1: args.linkLabel1 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[0],
    linkLabel2: args.linkLabel2 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[1],
    linkLabel3: args.linkLabel3 ?? DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[2],
  };
}
