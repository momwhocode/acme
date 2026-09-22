import { MenuOption } from "../../april/components/MenuOption.jsx";
import { MENU_OPTION_SIZES, MENU_OPTION_STATES } from "../../april/renderers/menu-option.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

const argTypes = {
  state: { control: { type: "select" }, options: MENU_OPTION_STATES, table: { category: "Properties" } },
  optionGroup: { name: "option-group", control: "boolean", table: { category: "Properties" } },
  size: { control: { type: "select" }, options: MENU_OPTION_SIZES, table: { category: "Properties" } },
  destructive: { control: "boolean", table: { category: "Properties" } },
  transparent: { control: "boolean", table: { category: "Properties" } },
  trailingAddOns: { name: "trailing add-ons", control: "boolean", table: { category: "Properties" } },
  label: { name: "option-label", control: "text", table: { category: "Properties" } },
  showAvatar: { name: "show-avatar", control: "boolean", table: { category: "Properties" } },
  showBadge: { name: "show badge", control: "boolean", table: { category: "Properties" } },
  showLeadingIcon: { name: "show leading-icon", control: "boolean", table: { category: "Properties" } },
  showLeadingCheckbox: {
    name: "show leading-checkbox",
    control: "boolean",
    table: { category: "Properties" },
  },
  showTrailingTag: { name: "show tag", control: "boolean", table: { category: "Properties" } },
  showTrailingIcon: { name: "show trailing-icon", control: "boolean", table: { category: "Properties" } },
  showTrailingSelector: { name: "show switch", control: "boolean", table: { category: "Properties" } },
  showTrailingShortcut: { name: "show shortcut-key", control: "boolean", table: { category: "Properties" } },
};

export default {
  title: "April System/Base Menu Options",
  tags: ["autodocs"],
  component: MenuOption,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Base menu option component (Figma 243:1653)." } },
  },
  argTypes,
  args: {
    state: "default",
    optionGroup: false,
    size: "md",
    destructive: false,
    transparent: false,
    trailingAddOns: true,
    label: "Option Label",
    showLeadingIcon: true,
    showLeadingCheckbox: false,
    showAvatar: false,
    showBadge: false,
    showTrailingShortcut: true,
    showTrailingTag: true,
    showTrailingSelector: true,
    showTrailingIcon: true,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <div style={{ padding: 24, maxWidth: 420 }}>
        <MenuOption {...args} id="base-menu-option-playground" />
      </div>
    </StoryFrame>
  ),
};
