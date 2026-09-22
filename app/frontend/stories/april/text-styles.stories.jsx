import { TextStyle, TextStylesGallery } from "../../april/components/TextStyle.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Text Styles",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export const Display2xlRegular = {
  render: () => (
    <StoryFrame>
      <TextStyle style="display-2xl-regular" />
    </StoryFrame>
  ),
};

export const BodySemibold = {
  render: () => (
    <StoryFrame>
      <TextStyle style="text-md-semibold" text="Body semibold text" />
    </StoryFrame>
  ),
};

export const CustomTag = {
  render: () => (
    <StoryFrame>
      <TextStyle style="text-sm-regular" text="Small regular on a span" tag="span" />
    </StoryFrame>
  ),
};

export const Gallery = {
  render: () => <TextStylesGallery />,
};
