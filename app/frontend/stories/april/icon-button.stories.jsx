import { IconButton } from "../../april/components/IconButton.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Icon Button",
  tags: ["autodocs"],
  component: IconButton,
  parameters: { layout: "fullscreen" },
  args: {
    variant: "primary",
    size: "md",
    icon: "add",
    ariaLabel: "Add",
    loading: false,
    disabled: false,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <IconButton {...args} onClick={() => {}} />
    </StoryFrame>
  ),
};
