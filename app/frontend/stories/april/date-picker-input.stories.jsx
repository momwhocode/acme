import { DatePickerInput, DatePickerInputPlayground } from "../../april/components/DatePickerInput.jsx";
import { DATE_PICKER_STATES } from "../../april/renderers/date-picker-input.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Date Picker Input",
  tags: ["autodocs"],
  component: DatePickerInput,
  parameters: { layout: "fullscreen" },
  argTypes: {
    state: {
      control: { type: "inline-radio" },
      options: DATE_PICKER_STATES,
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
  },
};

export const Playground = {
  args: {
    state: "default",
    valueEntered: true,
    label: "Input Label",
    showLabel: true,
    showRequired: false,
    placeholder: "MM/DD/YYYY",
    value: "03/13/2045",
    showDescription: true,
    description: "Help / Error Description.",
  },
  render: (args) => {
    const open = args.state === "calendar-opened";
    const playgroundClass = open
      ? "april-date-picker-input-playground april-date-picker-input-playground--calendar-opened"
      : "april-date-picker-input-playground";

    return (
      <StoryFrame width="min(100%, 360px)">
        <div className={playgroundClass}>
          <DatePickerInputPlayground {...args} />
        </div>
      </StoryFrame>
    );
  },
};
