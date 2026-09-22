import { useState } from "react";
import { OtpInput } from "../../april/components/OtpInput.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/OTP Input",
  tags: ["autodocs"],
  component: OtpInput,
  parameters: { layout: "fullscreen" },
  args: {
    label: "Enter OTP",
    showLabel: true,
    showDescription: true,
    description: "Enter the 4-digit code sent to your email.",
  },
};

export const Playground = {
  render: function OtpStory(args) {
    const [value, setValue] = useState("");
    return (
      <StoryFrame width="min(100%, 360px)">
        <OtpInput {...args} value={value} onChange={setValue} />
      </StoryFrame>
    );
  },
};
