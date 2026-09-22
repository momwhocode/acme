import { Tag } from "../../april/components/Tag.jsx";
import { TAG_TYPES } from "../../april/renderers/tag.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Tag",
  tags: ["autodocs"],
  component: Tag,
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: "select", options: TAG_TYPES },
    label: { control: "text" },
    leadingIcon: { control: "boolean" },
    trailingIcon: { control: "boolean" },
  },
  args: {
    type: "default",
    label: "Tag Label",
    leadingIcon: true,
    trailingIcon: true,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Tag {...args} />
    </StoryFrame>
  ),
};
