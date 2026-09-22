import { NavLink } from "react-router-dom";
import { MENU_OPTION_SIZES } from "../renderers/menu-option.js";
import { Avatar } from "./Avatar.jsx";
import { Badge } from "./Badge.jsx";
import { SelectorControl } from "./SelectorControl.jsx";
import { Spinner } from "./Spinner.jsx";
import { Tag } from "./Tag.jsx";

const ICON_SIZES = { md: 20, lg: 24, xl: 32 };
const AVATAR_SIZES = { md: "md", lg: "xl", xl: "2xl" };

function normalizeState(state) {
  if (state === "pressed/active") return "active";
  return state;
}

function OptionIcon({ name, size, status = false }) {
  const px = ICON_SIZES[size] || 20;
  return (
    <span
      className={
        status ? "april-menu-option__icon april-menu-option__icon--status" : "april-menu-option__icon"
      }
    >
      <span className="material-symbols-outlined" style={{ fontSize: px }} aria-hidden="true">
        {name}
      </span>
    </span>
  );
}

/** Colored triangle/square marker — same 20×20 icon slot as OptionIcon. */
function OptionMarker({ shape = "triangle", color = "var(--color-foreground-text-text-tertiary, #94A3B8)" }) {
  return (
    <span className="april-menu-option__icon april-menu-option__icon--marker" aria-hidden="true">
      <span
        className={`april-menu-option__marker april-menu-option__marker--${shape}`}
        style={{ "--marker-color": color }}
      />
    </span>
  );
}

/** Base menu option — Figma 243:1653 (dropdowns, sidebars, selects) */
export function MenuOption({
  state = "default",
  optionGroup = false,
  size = "md",
  destructive = false,
  transparent = false,
  trailingAddOns = true,
  label = "Option Label",
  groupLabel = "Option Group",
  shortcut = "⌘P",
  tagLabel = "Tag Label",
  tagType = "default",
  selected = false,
  indeterminate = false,
  selectorType = "radio",
  showLeadingIcon = true,
  leadingIconName = "add",
  leadingIconVariant = "default",
  /** @type {{ shape?: 'triangle' | 'square', color?: string } | null} */
  leadingMarker = null,
  showBadge = false,
  showLeadingSelector = true,
  showLeadingCheckbox,
  showAvatar = false,
  avatarInitials = "",
  avatarImageUrl = "",
  avatarColor = "gray",
  avatarAlt = "",
  showTrailingShortcut = true,
  showTrailingTag = true,
  showTrailingSelector = true,
  showTrailingIcon = true,
  showTrailingCheck = false,
  trailingIconName = "add",
  id = "menu-option",
  className = "",
  to,
  end = false,
  onClick,
  ariaLabel,
}) {
  const resolvedState = normalizeState(state);
  const resolvedSize = MENU_OPTION_SIZES.includes(size) ? size : "md";
  const disabled = resolvedState === "disabled" || resolvedState === "loading";
  const iconSize = ICON_SIZES[resolvedSize] || 20;

  const resolvedShowLeadingSelector =
    typeof showLeadingCheckbox === "boolean" ? showLeadingCheckbox : showLeadingSelector;

  const resolvedTrailingAddOns = Boolean(trailingAddOns);
  const resolvedShowTrailingShortcut = resolvedTrailingAddOns && showTrailingShortcut;
  const resolvedShowTrailingTag = resolvedTrailingAddOns && showTrailingTag;
  const resolvedShowTrailingSelector = resolvedTrailingAddOns && showTrailingSelector;
  const resolvedShowTrailingIcon = resolvedTrailingAddOns && showTrailingIcon;
  const resolvedShowTrailingCheck = resolvedTrailingAddOns && showTrailingCheck;

  const classes = [
    "april-menu-option",
    optionGroup ? "april-menu-option--group" : "",
    !optionGroup ? `april-menu-option--${resolvedSize}` : "",
    !optionGroup ? `april-menu-option--${resolvedState}` : "",
    destructive ? "april-menu-option--destructive" : "",
    transparent ? "april-menu-option--transparent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (optionGroup) {
    return (
      <div className={classes} id={id} role="presentation">
        <span className="april-menu-option__group-label april-text-style april-text-style--text-xs-regular">
          {groupLabel}
        </span>
      </div>
    );
  }

  const leading = (
    <span className="april-menu-option__leading">
      {resolvedState === "loading" ? (
        <span className="april-menu-option__spinner">
          <Spinner size="16" decorative />
        </span>
      ) : (
        <>
          {showLeadingIcon ? (
            leadingMarker ? (
              <OptionMarker
                shape={leadingMarker.shape || "triangle"}
                color={leadingMarker.color || "var(--color-foreground-text-text-tertiary, #94A3B8)"}
              />
            ) : (
              <OptionIcon
                name={leadingIconName}
                size={resolvedSize}
                status={leadingIconVariant === "status"}
              />
            )
          ) : null}
          {showBadge ? <Badge type="dot" colour="primary-dark" /> : null}
          {resolvedShowLeadingSelector ? (
            <span className="april-menu-option__selector">
              <SelectorControl
                type={selectorType === "toggle" ? "switch" : selectorType}
                checked={selected}
                indeterminate={indeterminate}
                state={disabled ? "disabled" : "default"}
                decorative
              />
            </span>
          ) : null}
          {showAvatar ? (
            <Avatar
              type={avatarImageUrl ? "image" : "initials"}
              size={AVATAR_SIZES[resolvedSize] || "md"}
              color={avatarColor}
              initials={avatarInitials}
              imageUrl={avatarImageUrl || undefined}
              alt={avatarAlt || label}
            />
          ) : null}
        </>
      )}
    </span>
  );

  const labelBlock = <span className="april-menu-option__label">{label}</span>;

  const trailingParts = [
    resolvedShowTrailingShortcut ? (
      <span key="shortcut" className="april-menu-option__shortcut">
        {shortcut}
      </span>
    ) : null,
    resolvedShowTrailingTag ? (
      <Tag key="tag" type={tagType} label={tagLabel} leadingIcon={false} trailingIcon={false} />
    ) : null,
    resolvedShowTrailingSelector ? (
      <span key="toggle" className="april-menu-option__selector">
        <SelectorControl type="switch" decorative />
      </span>
    ) : null,
    resolvedShowTrailingCheck ? (
      <span key="check" className="april-menu-option__check">
        <span className="material-symbols-outlined" style={{ fontSize: iconSize }} aria-hidden="true">
          check
        </span>
      </span>
    ) : null,
    resolvedShowTrailingIcon ? (
      <OptionIcon key="trail-icon" name={trailingIconName} size={resolvedSize} />
    ) : null,
  ].filter(Boolean);

  const trailing = trailingParts.length ? (
    <span className="april-menu-option__trailing">{trailingParts}</span>
  ) : null;

  if (to && !disabled) {
    return (
      <NavLink
        to={to}
        end={end}
        id={id}
        aria-label={ariaLabel}
        className={({ isActive }) =>
          [
            "april-menu-option",
            `april-menu-option--${resolvedSize}`,
            isActive ? "april-menu-option--active" : "april-menu-option--default",
            destructive ? "april-menu-option--destructive" : "",
            transparent ? "april-menu-option--transparent" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")
        }
        onClick={onClick}
      >
        {leading}
        {labelBlock}
        {trailing}
      </NavLink>
    );
  }

  if (disabled) {
    return (
      <div className={classes} id={id} role="menuitem" aria-disabled="true" aria-label={ariaLabel}>
        {leading}
        {labelBlock}
        {trailing}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      id={id}
      role="menuitem"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={resolvedState === "loading" || undefined}
      onClick={onClick}
    >
      {leading}
      {labelBlock}
      {trailing}
    </button>
  );
}
