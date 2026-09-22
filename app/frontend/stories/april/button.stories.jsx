import { Button } from "../../april/components/Button.jsx";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../../april/renderers/button.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Button",
  tags: ["autodocs"],
  component: Button,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: { control: "select", options: BUTTON_VARIANTS },
    size: { control: "select", options: BUTTON_SIZES },
    label: { control: "text" },
    leadingIcon: { control: "boolean" },
    trailingIcon: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Button Label",
    variant: "primary",
    size: "md",
    leadingIcon: true,
    trailingIcon: true,
    loading: false,
    disabled: false,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Button {...args} onClick={() => {}} />
    </StoryFrame>
  ),
};
