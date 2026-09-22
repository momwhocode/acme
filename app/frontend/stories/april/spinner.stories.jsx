import { Spinner, SPINNER_SIZES } from "../../april/components/Spinner.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Spinner",
  tags: ["autodocs"],
  component: Spinner,
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "select", options: SPINNER_SIZES },
  },
  args: {
    size: "20",
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Spinner {...args} />
    </StoryFrame>
  ),
};
