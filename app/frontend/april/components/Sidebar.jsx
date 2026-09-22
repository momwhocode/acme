import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  DEFAULT_SIDEBAR_ACTIVE_ITEM,
  SIDEBAR_VARIANTS,
  resolveSidebarMenuData,
} from "../renderers/sidebar.js";
import { flattenSidebarItems } from "../../lib/sidebarNav.js";
import { mapActionMenuItems } from "../renderers/menu-dropdown.js";
import { Avatar } from "./Avatar.jsx";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { MenuDropdown } from "./MenuDropdown.jsx";
import { MenuOption } from "./MenuOption.jsx";

const MENU_OPTION_DEFAULTS = {
  size: "md",
  transparent: true,
  showLeadingIcon: true,
  showLeadingSelector: false,
  trailingAddOns: true,
  showTrailingShortcut: false,
  showTrailingSelector: false,
  showTrailingIcon: false,
};

function SidebarNavItem({ item, id, active, onClick }) {
  if (item.skeleton) {
    return (
      <div className="april-sidebar__nav-skeleton" aria-hidden="true">
        <span className="april-sidebar__nav-skeleton-mark" />
        <span className="april-sidebar__nav-skeleton-label" />
      </div>
    );
  }

  const routed = Boolean(item.to) && !item.disabled;
  const state = item.disabled ? "disabled" : active ? "active" : routed ? "default" : "default";

  return (
    <MenuOption
      {...MENU_OPTION_DEFAULTS}
      id={id}
      label={item.label}
      leadingIconName={item.icon || "circle"}
      leadingMarker={item.marker || null}
      state={state}
      to={item.to}
      end={item.end}
      showTrailingTag={Boolean(item.tag)}
      tagLabel={item.tag || ""}
      tagType={item.tagType || "default"}
      onClick={onClick}
      className={item.className || ""}
    />
  );
}

function SidebarNavTree({ item, activeItemId, id, onItemClick }) {
  const rootActive =
    item.id === activeItemId ||
    Boolean(item.children?.some((child) => child.id === activeItemId)) ||
    Boolean(item.nestedGroups?.some((group) => group.items.some((child) => child.id === activeItemId)));

  return (
    <div className="april-sidebar__tree">
      <SidebarNavItem
        item={item}
        id={`${id}-root`}
        active={rootActive}
        onClick={onItemClick ? () => onItemClick(item) : undefined}
      />
      <div className="april-sidebar__tree-body">
        {(item.children || []).map((child, index) => (
          <SidebarNavItem
            key={child.id || child.label}
            item={{ ...child, className: "april-sidebar__tree-child" }}
            id={`${id}-child-${index}`}
            active={child.id === activeItemId}
            onClick={onItemClick ? () => onItemClick(child) : undefined}
          />
        ))}
        {(item.nestedGroups || []).map((group, groupIndex) => (
          <div key={group.groupLabel || groupIndex} className="april-sidebar__tree-group">
            <MenuOption
              id={`${id}-group-${groupIndex}-label`}
              optionGroup
              groupLabel={group.groupLabel}
              transparent
              className="april-sidebar__tree-group-label"
            />
            {group.items.map((child, itemIndex) => (
              <SidebarNavItem
                key={child.id || child.label}
                item={{
                  ...child,
                  icon: child.icon || "fiber_manual_record",
                  className: "april-sidebar__tree-leaf",
                }}
                id={`${id}-group-${groupIndex}-${itemIndex}`}
                active={child.id === activeItemId}
                onClick={onItemClick ? () => onItemClick(child) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarNavGroup({ group, groupIndex, activeItemId, id, onItemClick }) {
  const collapsible = Boolean(group.collapsible);
  const [expanded, setExpanded] = useState(true);
  const labelId = `${id}-group-${groupIndex}-label`;
  const panelId = `${id}-group-${groupIndex}-items`;
  const showItems = !collapsible || expanded;

  return (
    <div className="april-sidebar__nav-group">
      {collapsible ? (
        <Button
          id={labelId}
          variant="ghost"
          size="sm"
          label={group.groupLabel}
          leadingIcon={false}
          trailingIcon
          trailingIconName={expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
          className="april-sidebar__nav-group-toggle"
        />
      ) : (
        <MenuOption id={labelId} optionGroup groupLabel={group.groupLabel} transparent />
      )}
      {showItems ? (
        <div className="april-sidebar__nav-group-items" id={panelId} role="group" aria-labelledby={labelId}>
          {(group.items || []).map((item, itemIndex) => (
            <SidebarNavItem
              key={item.id || item.label}
              item={item}
              id={`${id}-group-${groupIndex}-${itemIndex}`}
              active={item.id === activeItemId}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarProfileCard({
  name = "Account",
  email = "",
  imageUrl = "",
  initials = "?",
  onProfileClick,
  onLogout,
  logoutLoading = false,
  profileMenuItems = [],
}) {
  const displayName = name || email || "Account";
  const secondaryContact = name && email && email !== name ? email : "";
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => setOpen(false);
  const menuItems = mapActionMenuItems(
    [
      onProfileClick
        ? {
            label: "Edit profile",
            leadingIconName: "edit",
            showLeadingIcon: true,
            onClick: onProfileClick,
          }
        : null,
      ...(Array.isArray(profileMenuItems) ? profileMenuItems : []),
      {
        label: "Logout",
        leadingIconName: "logout",
        showLeadingIcon: true,
        destructive: true,
        state: logoutLoading ? "disabled" : "default",
        onClick: onLogout,
      },
    ].filter(Boolean),
    { idPrefix: "sidebar-profile-menu", onClose: close }
  );

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const minWidth = Math.max(200, rect.width);
      setMenuStyle({
        bottom: window.innerHeight - rect.top + 4,
        left: Math.max(8, rect.right - minWidth),
        minWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      close();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        id="sidebar-profile"
        className={[
          "april-sidebar__profile",
          "april-menu-option",
          "april-menu-option--md",
          "april-menu-option--transparent",
          open ? "april-menu-option--active" : "april-menu-option--default",
        ].join(" ")}
        aria-label={`Account menu for ${displayName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? "sidebar-profile-menu" : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="april-menu-option__leading">
          <Avatar
            type={imageUrl ? "image" : "initials"}
            size="md"
            color="gray"
            initials={initials || "?"}
            imageUrl={imageUrl || undefined}
            alt={displayName}
          />
        </span>
        <span className="april-menu-option__label april-sidebar__profile-copy">
          <span className="april-sidebar__profile-name">{displayName}</span>
          {secondaryContact ? <span className="april-sidebar__profile-email">{secondaryContact}</span> : null}
        </span>
        <span className="april-menu-option__trailing" aria-hidden="true">
          <span className="april-menu-option__icon">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              more_vert
            </span>
          </span>
        </span>
      </button>
      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              className="april-sidebar__profile-dropdown april-icon-menu-dropdown__menu--portal"
              style={menuStyle}
            >
              <MenuDropdown id="sidebar-profile-menu" items={menuItems} />
            </div>,
            document.body
          )
        : null}
    </>
  );
}

/** Application sidebar — composes base menu options (main + settings variants). */
export function Sidebar({
  variant = "main",
  activeItemId,
  logoUrl = "",
  logoAlt = "Logo",
  logoTo = "",
  headerContent,
  profileName = "Account",
  profileEmail = "",
  profileImageUrl = "",
  profileInitials = "?",
  topItems,
  groups,
  bottomItems,
  onItemClick,
  onBackClick,
  onProfileClick,
  onLogoutClick,
  logoutLoading = false,
  profileMenuItems = [],
  id = "sidebar",
  className = "",
  ariaLabel = "Application sidebar",
}) {
  const resolvedVariant = SIDEBAR_VARIANTS.includes(variant) ? variant : "main";
  const menuData = resolveSidebarMenuData({ variant: resolvedVariant, topItems, groups, bottomItems });
  const resolvedActiveItemId = activeItemId ?? DEFAULT_SIDEBAR_ACTIVE_ITEM[resolvedVariant];

  const classes = ["april-sidebar", `april-sidebar--${resolvedVariant}`, className].filter(Boolean).join(" ");
  const logoImage = logoUrl ? (
    <img className="april-sidebar__logo-image" src={logoUrl} alt={logoAlt} width={120} height={28} />
  ) : null;
  const defaultHeader =
    logoTo && logoImage ? (
      <Link to={logoTo} className="april-sidebar__logo-link">
        {logoImage}
      </Link>
    ) : (
      logoImage
    );

  return (
    <aside className={classes} id={id} aria-label={ariaLabel}>
      <header className="april-sidebar__header">
        {resolvedVariant === "settings" ? (
          <IconButton
            variant="ghost"
            size="lg"
            icon="arrow_back"
            ariaLabel="Back to main menu"
            onClick={onBackClick}
          />
        ) : null}
        {headerContent ?? defaultHeader}
      </header>

      <div className="april-sidebar__body">
        <nav
          className="april-sidebar__nav"
          aria-label={resolvedVariant === "settings" ? "Settings" : "Main menu"}
          data-controller="april-menu-options"
          data-april-menu-options-mode-value="menu"
        >
          {menuData.topItems.map((item, index) =>
            item.tree || item.nestedGroups || item.children ? (
              <SidebarNavTree
                key={item.id || item.label}
                item={item}
                activeItemId={resolvedActiveItemId}
                id={`${id}-top-${index}`}
                onItemClick={onItemClick}
              />
            ) : (
              <SidebarNavItem
                key={item.id || item.label}
                item={item}
                id={`${id}-top-${index}`}
                active={item.id === resolvedActiveItemId}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            )
          )}
          {menuData.groups.map((group, index) => (
            <SidebarNavGroup
              key={group.groupLabel}
              group={group}
              groupIndex={index}
              activeItemId={resolvedActiveItemId}
              id={id}
              onItemClick={onItemClick}
            />
          ))}
        </nav>

        {menuData.bottomItems.length ? (
          <nav
            className="april-sidebar__nav april-sidebar__nav--bottom"
            aria-label="Secondary"
            data-controller="april-menu-options"
            data-april-menu-options-mode-value="menu"
          >
            {menuData.bottomItems.map((item, index) => (
              <SidebarNavItem
                key={item.id || item.label}
                item={item}
                id={`${id}-bottom-${index}`}
                active={item.id === resolvedActiveItemId}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            ))}
          </nav>
        ) : null}
      </div>

      <footer className="april-sidebar__footer">
        <SidebarProfileCard
          name={profileName}
          email={profileEmail}
          imageUrl={profileImageUrl}
          initials={profileInitials}
          onProfileClick={onProfileClick}
          onLogout={onLogoutClick}
          logoutLoading={logoutLoading}
          profileMenuItems={profileMenuItems}
        />
      </footer>
    </aside>
  );
}

function resolveActiveItemId(variant, activeItemId) {
  const menuData = resolveSidebarMenuData({ variant });
  const menuItemIds = flattenSidebarItems(menuData).map((item) => item.id);

  return menuItemIds.includes(activeItemId) ? activeItemId : DEFAULT_SIDEBAR_ACTIVE_ITEM[variant];
}

export function SidebarPlayground({ variant = "main", activeItemId }) {
  return (
    <div className="april-sidebar-playground">
      <Sidebar
        variant={variant}
        activeItemId={resolveActiveItemId(variant, activeItemId)}
        id="sidebar-playground"
      />
    </div>
  );
}
