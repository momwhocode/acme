import { PrimitiveColorsGallery } from "../../april/components/PrimitiveColorsGallery.jsx";
import { SemanticColorsGallery } from "../../april/components/SemanticColorsGallery.jsx";

export default {
  title: "April System/Colors",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export const SemanticColors = {
  name: "Semantic Colors",
  render: () => <SemanticColorsGallery />,
};

export const PrimitiveColors = {
  name: "Primitive Colors",
  render: () => <PrimitiveColorsGallery />,
};
