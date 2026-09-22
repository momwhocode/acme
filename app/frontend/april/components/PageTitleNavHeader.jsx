import {
  DEFAULT_PAGE_TITLE_NAV_HEADER_CREATED_AT,
  PAGE_TITLE_NAV_HEADER_TYPE_PROPS,
} from "../renderers/page-title-nav-header.js";
import { formatAprilDateTime } from "../renderers/date-time.js";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { IconMenuDropdown } from "./IconMenuDropdown.jsx";
import { MenuButton } from "./MenuButton.jsx";
import { MenuButtonDropdown } from "./MenuButtonDropdown.jsx";
import { Tag } from "./Tag.jsx";

/** Page title navigation header — Figma 517:1835 / 769:15628 */
export function PageTitleNavHeader({
  type = "default",
  pageTitle = "Page Title",
  showLeadingIcon = false,
  showTag = false,
  showCreatedOn,
  showUserName = false,
  metaBeforeTitle = false,
  showSecondaryButton = false,
  showPrimaryButton = false,
  showMoreMenu = false,
  tagLabel = "Tag Label",
  userName = "User Name",
  createdOn = DEFAULT_PAGE_TITLE_NAV_HEADER_CREATED_AT,
  createdOnText,
  createdOnLabel = "Created on",
  secondaryButtonLabel = "Button Label",
  primaryButtonLabel = "Button Label",
  secondaryIcon = "upload",
  primaryIcon = "add",
  backIcon = "arrow_back",
  moreMenuIcon = "more_vert",
  moreMenuItems = null,
  id = "page-title-nav-header",
  className = "",
  primaryLeadingIcon = true,
  primaryUseMenuButton = false,
  primaryMenuItems = null,
  primaryButtonVariant = "primary",
  primaryDisabled = false,
  primaryLoading = false,
  secondaryLeadingIcon = true,
  secondaryTrailingIcon = "add",
  showSecondaryTrailingIcon = false,
  secondaryMenuItems = null,
  secondaryDisabled = false,
  primaryTrailingIcon = "add",
  showPrimaryTrailingIcon = false,
  onBack,
  onSecondary,
  onPrimary,
  onMoreMenu,
  onPageTitleClick,
  leadingContent = null,
  trailingContent = null,
  children = null,
}) {
  const typePreset = PAGE_TITLE_NAV_HEADER_TYPE_PROPS[type] ?? {};
  const resolvedShowCreatedOn = showCreatedOn ?? typePreset.showCreatedOn ?? false;
  const resolvedShowUserName = showUserName ?? typePreset.showUserName ?? false;
  const showMeta = resolvedShowCreatedOn || resolvedShowUserName;
  const showActions =
    Boolean(children) ||
    Boolean(trailingContent) ||
    showSecondaryButton ||
    showPrimaryButton ||
    showMoreMenu ||
    (moreMenuItems?.length ?? 0) > 0 ||
    (secondaryMenuItems?.length ?? 0) > 0;
  const resolvedCreatedOnText = createdOnText ?? formatAprilDateTime(createdOn);

  const metaBlock = showMeta ? (
    <div className="april-page-title-nav-header__meta">
      {resolvedShowCreatedOn ? (
        <span className="april-page-title-nav-header__created-on">
          {createdOnLabel} {resolvedCreatedOnText}
        </span>
      ) : null}
      {resolvedShowUserName ? (
        <Button variant="link" size="md" label={userName} leadingIcon={false} trailingIcon={false} />
      ) : null}
    </div>
  ) : null;

  return (
    <header
      className={["april-page-title-nav-header", `april-page-title-nav-header--${type}`, className]
        .filter(Boolean)
        .join(" ")}
      id={id}
    >
      <div className="april-page-title-nav-header__start">
        {leadingContent}
        {showLeadingIcon ? (
          <IconButton variant="ghost" size="md" icon={backIcon} ariaLabel="Go back" onClick={onBack} />
        ) : null}
        {metaBeforeTitle ? metaBlock : null}
        {onPageTitleClick ? (
          <h1 className="april-page-title-nav-header__title">
            <Button
              label={pageTitle}
              variant="link"
              size="md"
              leadingIcon={false}
              trailingIcon={false}
              onClick={onPageTitleClick}
              className="april-page-title-nav-header__title-link"
            />
          </h1>
        ) : (
          <h1 className="april-page-title-nav-header__title">{pageTitle}</h1>
        )}
        {showTag ? <Tag type="info" label={tagLabel} leadingIcon trailingIcon /> : null}
        {!metaBeforeTitle ? metaBlock : null}
      </div>
      {showActions ? (
        <div className="april-page-title-nav-header__actions">
          {children}
          {showSecondaryButton ? (
            secondaryMenuItems?.length ? (
              <MenuButtonDropdown
                id={`${id}-secondary-menu`}
                label={secondaryButtonLabel}
                variant="outlined"
                size="md"
                leadingIconName={secondaryIcon}
                showLeadingIcon={secondaryLeadingIcon}
                trailingIconName={secondaryTrailingIcon}
                items={secondaryMenuItems}
                disabled={secondaryDisabled}
              />
            ) : (
              <Button
                label={secondaryButtonLabel}
                variant="outlined"
                size="md"
                icon={secondaryIcon}
                leadingIcon={secondaryLeadingIcon}
                trailingIcon={showSecondaryTrailingIcon}
                trailingIconName={secondaryTrailingIcon}
                disabled={secondaryDisabled}
                onClick={onSecondary}
              />
            )
          ) : null}
          {showPrimaryButton ? (
            primaryMenuItems?.length ? (
              <MenuButtonDropdown
                id={`${id}-primary-menu`}
                label={primaryButtonLabel}
                variant="primary"
                size="md"
                leadingIconName={primaryIcon}
                showLeadingIcon={primaryLeadingIcon}
                items={primaryMenuItems}
              />
            ) : primaryUseMenuButton ? (
              <MenuButton
                label={primaryButtonLabel}
                variant="primary"
                size="md"
                leadingIconName={primaryIcon}
                trailingIconName="keyboard_arrow_down"
                onClick={onPrimary}
              />
            ) : (
              <Button
                label={primaryButtonLabel}
                variant={primaryButtonVariant}
                size="md"
                icon={primaryIcon}
                leadingIcon={primaryLeadingIcon}
                trailingIcon={showPrimaryTrailingIcon}
                trailingIconName={primaryTrailingIcon}
                loading={primaryLoading}
                disabled={primaryDisabled}
                onClick={onPrimary}
              />
            )
          ) : null}
          {showMoreMenu || moreMenuItems?.length ? (
            moreMenuItems?.length ? (
              <IconMenuDropdown
                id={`${id}-more-menu`}
                ariaLabel="More actions"
                items={moreMenuItems}
                variant="outlined"
                size="md"
              />
            ) : (
              <IconButton
                variant="outlined"
                size="md"
                icon={moreMenuIcon}
                ariaLabel="More actions"
                onClick={onMoreMenu}
              />
            )
          ) : null}
          {trailingContent}
        </div>
      ) : null}
    </header>
  );
}
