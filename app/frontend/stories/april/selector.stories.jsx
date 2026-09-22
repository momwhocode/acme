import { SelectorField } from "../../april/components/SelectorField.jsx";
import { resolveSelectorPlaygroundArgs } from "../../april/renderers/selector/field.js";
import { SELECTOR_TYPES, SELECTOR_STATES } from "../../april/components/SelectorControl.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Selector",
  tags: ["autodocs"],
  component: SelectorField,
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: { type: "select" }, options: SELECTOR_TYPES, table: { category: "Properties" } },
    state: { control: { type: "select" }, options: SELECTOR_STATES, table: { category: "Properties" } },
    checked: { control: "boolean", table: { category: "Properties" } },
    indeterminate: { control: "boolean", table: { category: "Properties" } },
    label: { control: "text", table: { category: "Properties" } },
    secondaryText: { name: "secondary-text", control: "text", table: { category: "Properties" } },
    showText: { name: "show text", control: "boolean", table: { category: "Properties" } },
    showSecondaryText: { name: "show secondary-text", control: "boolean", table: { category: "Properties" } },
  },
  args: {
    type: "checkbox",
    state: "default",
    checked: false,
    indeterminate: false,
    label: "Field Label",
    secondaryText: "Secondary Text",
    showText: true,
    showSecondaryText: true,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <div className="april-selector-playground">
        <SelectorField {...resolveSelectorPlaygroundArgs(args)} />
      </div>
    </StoryFrame>
  ),
};
