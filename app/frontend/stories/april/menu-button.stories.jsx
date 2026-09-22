import {
  MenuButton,
  MenuButtonFigmaMatrix,
  MenuButtonPlayground,
} from "../../april/components/MenuButton.jsx";
import {
  MENU_BUTTON_SIZES,
  MENU_BUTTON_STATES,
  MENU_BUTTON_VARIANTS,
} from "../../april/renderers/menu-button.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Menu Button",
  tags: ["autodocs"],
  component: MenuButton,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: {
      name: "type",
      control: { type: "select" },
      options: MENU_BUTTON_VARIANTS,
      table: { category: "Properties" },
    },
    size: { control: { type: "select" }, options: MENU_BUTTON_SIZES, table: { category: "Properties" } },
    state: { control: { type: "select" }, options: MENU_BUTTON_STATES, table: { category: "Properties" } },
    label: { name: "button-label", control: "text", table: { category: "Properties" } },
    icon: {
      name: "icon",
      description: "Show leading icon",
      control: "boolean",
      table: { category: "Properties" },
    },
    href: { table: { disable: true } },
    disabled: { table: { disable: true } },
    loading: { table: { disable: true } },
  },
  args: { label: "Button Label", variant: "primary", size: "md", state: "interactive", icon: true },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <MenuButtonPlayground {...args} />
    </StoryFrame>
  ),
};

export const FigmaMatrix = {
  name: "Figma Matrix (34:5079)",
  parameters: { layout: "padded" },
  render: () => <MenuButtonFigmaMatrix />,
};
