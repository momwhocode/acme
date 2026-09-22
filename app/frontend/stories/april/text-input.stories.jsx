import { useState } from "react";
import { TextInput } from "../../april/components/TextInput.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Text Input",
  tags: ["autodocs"],
  component: TextInput,
  parameters: { layout: "fullscreen" },
  args: {
    label: "Input Label",
    placeholder: "Placeholder text",
    showLabel: true,
    showDescription: true,
    description: "Help / Error Description.",
    leadingIcon: true,
    trailingIcon: false,
    fullWidth: true,
  },
};

export const Playground = {
  render: function TextInputStory(args) {
    const [value, setValue] = useState("");
    return (
      <StoryFrame width="min(100%, 360px)">
        <TextInput {...args} value={value} onChange={(event) => setValue(event.target.value)} />
      </StoryFrame>
    );
  },
};
