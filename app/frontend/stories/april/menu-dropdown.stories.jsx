import { MenuDropdown, MenuDropdownPlayground } from "../../april/components/MenuDropdown.jsx";
import { MENU_OPTION_SIZES, MENU_OPTION_STATES } from "../../april/renderers/menu-option.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

const menuOptionArgTypes = {
  multiselect: { control: "boolean", table: { category: "Properties" } },
  state: {
    control: { type: "select" },
    options: MENU_OPTION_STATES,
    table: { category: "Properties" },
  },
  size: { control: { type: "select" }, options: MENU_OPTION_SIZES, table: { category: "Properties" } },
  destructive: { control: "boolean", table: { category: "Properties" } },
  trailingAddOns: { name: "trailing add-ons", control: "boolean", table: { category: "Properties" } },
  optionLabel: { name: "option-label", control: "text", table: { category: "Properties" } },
  selected: { control: "boolean", table: { category: "Properties" }, if: { arg: "multiselect", eq: true } },
  showLeadingIcon: { name: "show leading-icon", control: "boolean", table: { category: "Properties" } },
  showBadge: { name: "show badge", control: "boolean", table: { category: "Properties" } },
  showLeadingCheckbox: {
    name: "show leading-checkbox",
    control: "boolean",
    table: { category: "Properties" },
  },
  showAvatar: { name: "show-avatar", control: "boolean", table: { category: "Properties" } },
  showTrailingShortcut: { name: "show shortcut-key", control: "boolean", table: { category: "Properties" } },
  showTrailingTag: { name: "show tag", control: "boolean", table: { category: "Properties" } },
  showTrailingSelector: { name: "show switch", control: "boolean", table: { category: "Properties" } },
  showTrailingIcon: { name: "show trailing-icon", control: "boolean", table: { category: "Properties" } },
};

const menuOptionArgs = {
  multiselect: false,
  state: "default",
  size: "md",
  destructive: false,
  trailingAddOns: true,
  optionLabel: "Edit",
  selected: false,
  showLeadingIcon: false,
  showBadge: false,
  showLeadingCheckbox: false,
  showAvatar: false,
  showTrailingShortcut: true,
  showTrailingTag: false,
  showTrailingSelector: false,
  showTrailingIcon: false,
};

export default {
  title: "April System/Menu Dropdown",
  tags: ["autodocs"],
  component: MenuDropdown,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Menu dropdown system (Figma 394:2347, 243:1653). `MenuDropdown` composes base `MenuOption` rows inside `.april-menu-dropdown`. Triggered menus use `AnchoredMenuDropdown` (`IconMenuDropdown` / `MenuButtonDropdown`).",
      },
    },
  },
};

export const MenuDropdownStory = {
  name: "Menu Dropdown",
  argTypes: menuOptionArgTypes,
  args: menuOptionArgs,
  render: (args) => (
    <StoryFrame>
      <MenuDropdownPlayground {...args} />
    </StoryFrame>
  ),
};
