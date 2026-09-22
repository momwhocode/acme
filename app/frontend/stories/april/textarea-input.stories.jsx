import { useState } from "react";
import { TextareaInput } from "../../april/components/TextareaInput.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Textarea Input",
  tags: ["autodocs"],
  component: TextareaInput,
  parameters: { layout: "fullscreen" },
  args: {
    label: "Input Label",
    placeholder: "Placeholder text",
    showLabel: true,
    showDescription: true,
    description: "Help / Error Description.",
    fullWidth: true,
    rows: 4,
    maxLength: 500,
  },
};

export const Playground = {
  render: function TextareaStory(args) {
    const [value, setValue] = useState("");
    return (
      <StoryFrame width="min(100%, 360px)">
        <TextareaInput {...args} value={value} onChange={(event) => setValue(event.target.value)} />
      </StoryFrame>
    );
  },
};
