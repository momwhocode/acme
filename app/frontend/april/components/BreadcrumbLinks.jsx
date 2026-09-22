import { resolveBreadcrumbLinksSegments } from "../renderers/breadcrumb-links.js";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";

function BreadcrumbSeparator() {
  return (
    <span className="april-breadcrumb-links__separator" aria-hidden="true">
      <span className="material-symbols-outlined april-icon" style={{ fontSize: 16 }}>
        chevron_right
      </span>
    </span>
  );
}

/** Breadcrumb links — Figma 120:7977 */
export function BreadcrumbLinks({
  links = "2",
  items,
  linkLabels,
  linkLabel = "Button Label",
  className = "",
}) {
  const { segments, showOverflow } = resolveBreadcrumbLinksSegments({ links, items, linkLabels, linkLabel });

  return (
    <nav className={["april-breadcrumb-links", className].filter(Boolean).join(" ")} aria-label="Breadcrumb">
      <ol className="april-breadcrumb-links__list">
        {segments.map((item, index) => (
          <li key={`${item.label}-${index}`} className="april-breadcrumb-links__item">
            <Button
              label={item.label}
              variant="link"
              size="md"
              leadingIcon={false}
              trailingIcon={false}
              onClick={item.onClick}
            />
            <BreadcrumbSeparator />
          </li>
        ))}
        {showOverflow ? (
          <li className="april-breadcrumb-links__item april-breadcrumb-links__item--overflow">
            <IconButton variant="ghost" size="sm" icon="more_horiz" ariaLabel="Show more breadcrumb links" />
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
