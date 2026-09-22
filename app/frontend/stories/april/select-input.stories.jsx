import { SelectInput, SelectInputPlayground } from "../../april/components/SelectInput.jsx";
import { SELECT_INPUT_SIZES, SELECT_INPUT_PLAYGROUND_STATES } from "../../april/renderers/select-input.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Select Input",
  tags: ["autodocs"],
  component: SelectInput,
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: {
      control: { type: "inline-radio" },
      options: SELECT_INPUT_SIZES,
      table: { category: "Properties" },
    },
    state: {
      control: { type: "inline-radio" },
      options: SELECT_INPUT_PLAYGROUND_STATES,
      table: { category: "Properties" },
    },
    valueEntered: { name: "value-entered", control: "boolean", table: { category: "Properties" } },
    label: { name: "input label", control: "text", table: { category: "Properties" } },
    showLabel: { name: "show input label", control: "boolean", table: { category: "Properties" } },
    showRequired: { name: "show required", control: "boolean", table: { category: "Properties" } },
    placeholder: { name: "placeholder-text", control: "text", table: { category: "Properties" } },
    value: { control: "text", table: { category: "Properties" }, if: { arg: "valueEntered" } },
    showDescription: { name: "show help/error", control: "boolean", table: { category: "Properties" } },
    description: {
      name: "help/error description",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showDescription" },
    },
    leadingIcon: { name: "show leading-icon", control: "boolean", table: { category: "Properties" } },
    leadingIconName: {
      name: "↳ leading-icon",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "leadingIcon" },
    },
    caretIcon: { name: "show caret", control: "boolean", table: { category: "Properties" } },
    caretIconName: {
      name: "↳ caret icon",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "caretIcon" },
    },
  },
};

export const Playground = {
  args: {
    size: "md",
    state: "interactive",
    valueEntered: false,
    label: "Input Label",
    showLabel: true,
    showRequired: false,
    placeholder: "Placeholder text",
    value: "Selected value",
    showDescription: true,
    description: "Help / Error Description.",
    leadingIcon: true,
    leadingIconName: "add",
    caretIcon: true,
    caretIconName: "keyboard_arrow_down",
  },
  render: (args) => (
    <StoryFrame width="min(100%, 360px)">
      <SelectInputPlayground {...args} />
    </StoryFrame>
  ),
};
