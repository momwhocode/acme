import { Avatar } from "../../april/components/Avatar.jsx";
import { AVATAR_COLORS, AVATAR_SIZES } from "../../april/renderers/avatar.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Avatar",
  tags: ["autodocs"],
  component: Avatar,
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: "select", options: ["initial", "image"] },
    size: { control: "select", options: AVATAR_SIZES },
    color: { control: "select", options: AVATAR_COLORS },
    initials: { control: "text" },
  },
  args: {
    type: "initial",
    size: "md",
    color: "orange",
    initials: "PS",
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Avatar {...args} />
    </StoryFrame>
  ),
};

export const Gallery = {
  render: () => (
    <StoryFrame width="100%">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
        {AVATAR_COLORS.flatMap((color) =>
          AVATAR_SIZES.map((size) => <Avatar key={`${color}-${size}`} color={color} size={size} />)
        )}
        {AVATAR_SIZES.map((size) => (
          <Avatar key={`img-${size}`} type="image" size={size} />
        ))}
      </div>
    </StoryFrame>
  ),
};
