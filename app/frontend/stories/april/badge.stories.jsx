import { Badge } from "../../april/components/Badge.jsx";
import { BADGE_COLOURS, BADGE_TYPES } from "../../april/renderers/badge.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Badge",
  tags: ["autodocs"],
  component: Badge,
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: "select", options: BADGE_TYPES },
    colour: { control: "select", options: BADGE_COLOURS },
    label: { control: "text" },
  },
  args: {
    type: "single-digit",
    colour: "gray-dark",
    label: "3",
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Badge {...args} />
    </StoryFrame>
  ),
};
