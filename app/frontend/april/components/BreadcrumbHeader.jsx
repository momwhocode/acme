import { BreadcrumbLinks } from "./BreadcrumbLinks.jsx";

/** Breadcrumb header bar — composes breadcrumb links (Figma 361:1629) */
export function BreadcrumbHeader({
  links,
  items,
  linkLabels,
  linkLabel,
  id = "breadcrumb-header",
  className = "",
}) {
  const resolvedLinks =
    links ?? (Array.isArray(items) && items.length > 0 ? String(Math.min(items.length, 3)) : "2");

  return (
    <header className={["april-breadcrumb-header", className].filter(Boolean).join(" ")} id={id}>
      <BreadcrumbLinks links={resolvedLinks} items={items} linkLabels={linkLabels} linkLabel={linkLabel} />
    </header>
  );
}
