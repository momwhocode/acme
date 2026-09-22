import { useInteractionState, blurOnMouseClick } from "../hooks/useInteractionState.js";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../renderers/button.js";
import { BUTTON_ICON_SIZE } from "../renderers/shared.js";
import { resolveMenuButtonPlaygroundArgs } from "../renderers/menu-button.js";
import { buttonBusyLabel } from "./Button.jsx";

function BtnIcon({ name, size }) {
  const canvas = BUTTON_ICON_SIZE[size] || 20;
  return (
    <span
      className="april-btn__icon material-symbols-outlined april-icon"
      style={{ fontSize: `var(--icon-size-icon-${canvas})` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/** Menu button — label + chevron (Figma 34:5079) */
export function MenuButton({
  label = "Button Label",
  variant = "primary",
  size = "md",
  state: stateProp = null,
  icon = true,
  leadingIconName = "add",
  trailingIconName = "keyboard_arrow_down",
  loading = false,
  loadingLabel,
  disabled = false,
  href = null,
  className = "",
  onClick,
  ...rest
}) {
  const { interaction, mouseBind, focusBind } = useInteractionState({ keyboardFocusOnly: true });
  const isDisabled = disabled || loading;
  const classes = [
    "april-btn",
    "april-menu-btn",
    `april-btn--${variant}`,
    `april-btn--${size}`,
    loading ? "april-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && !loading ? <BtnIcon name={leadingIconName} size={size} /> : null}
      <span className="april-btn__label">{loading ? buttonBusyLabel(label, loadingLabel) : label}</span>
      {loading ? null : <BtnIcon name={trailingIconName} size={size} />}
    </>
  );

  const sharedProps = {
    className: classes,
    "aria-haspopup": "menu",
    "data-state": !isDisabled && (stateProp || interaction) ? stateProp || interaction : undefined,
    "aria-busy": loading || undefined,
    ...mouseBind,
    ...focusBind,
    ...rest,
  };

  if (href) {
    return (
      <a
        href={href}
        {...sharedProps}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={blurOnMouseClick(onClick)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      {...sharedProps}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onClick={blurOnMouseClick(onClick)}
    >
      {content}
    </button>
  );
}

export function MenuButtonPlayground(args) {
  const props = resolveMenuButtonPlaygroundArgs(args);
  return (
    <div className="april-button-playground">
      <MenuButton {...props} />
    </div>
  );
}

const FIGMA_STATES = [
  { name: "Default", state: null },
  { name: "Hover", state: "hover" },
  { name: "Active", state: "active-pressed" },
  { name: "Focused", state: "focused" },
  { name: "Disabled", disabled: true },
  { name: "Loading", loading: true },
];

export function MenuButtonFigmaMatrix() {
  return (
    <div className="april-button-figma-matrix">
      <header className="april-button-figma-matrix__header">
        <h2 className="april-button-figma-matrix__title">Menu Button</h2>
        <p className="april-button-figma-matrix__description">
          Figma node 34:5079 — types: {BUTTON_VARIANTS.join(", ")} · sizes: {BUTTON_SIZES.join(", ")} ·
          states: default, hover, active/pressed, focused, disabled, loading
        </p>
      </header>
      <div className="april-button-figma-matrix__scroll">
        <table className="april-button-figma-matrix__table">
          <thead>
            <tr>
              <th />
              {FIGMA_STATES.map((config) => (
                <th key={config.name}>{config.name}</th>
              ))}
            </tr>
          </thead>
          {BUTTON_VARIANTS.map((variant) => (
            <tbody key={variant} className="april-button-figma-matrix__variant">
              <tr className="april-button-figma-matrix__variant-label">
                <th colSpan={FIGMA_STATES.length + 1}>{variant}</th>
              </tr>
              {BUTTON_SIZES.map((size) => (
                <tr key={`${variant}-${size}`}>
                  <th className="april-button-figma-matrix__size">{size}</th>
                  {FIGMA_STATES.map((config) => (
                    <td key={config.name} className="april-button-figma-matrix__cell">
                      <MenuButton
                        variant={variant}
                        size={size}
                        state={config.state ?? undefined}
                        loading={config.loading}
                        disabled={config.disabled}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
