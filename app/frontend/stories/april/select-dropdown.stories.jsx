import { SelectDropdownPlayground } from "../../april/components/SelectDropdown.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Select Dropdown",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Select dropdown listbox — composes menu options inside `.april-select-dropdown`. Multiselect uses leading checkboxes; single uses trailing check.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["single", "multiselect", "multiselect-icon", "date-range"],
      table: { category: "Properties" },
    },
  },
  args: { variant: "multiselect" },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <SelectDropdownPlayground {...args} />
    </StoryFrame>
  ),
};

export const DateRangeSingle = {
  name: "Date range (single)",
  args: { variant: "date-range" },
  render: (args) => (
    <StoryFrame>
      <SelectDropdownPlayground {...args} />
    </StoryFrame>
  ),
};

export const StatusFilterMultiselect = {
  name: "Status filter (icon)",
  args: { variant: "multiselect-icon" },
  render: (args) => (
    <StoryFrame>
      <SelectDropdownPlayground {...args} />
    </StoryFrame>
  ),
};

export const PlanStatusSingle = {
  name: "Plan status (single)",
  args: { variant: "single" },
  render: (args) => (
    <StoryFrame>
      <SelectDropdownPlayground {...args} />
    </StoryFrame>
  ),
};
