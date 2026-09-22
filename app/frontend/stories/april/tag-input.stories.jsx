import { useState } from "react";
import { TagInput, TagInputPlayground } from "../../april/components/TagInput.jsx";
import { TAG_INPUT_STATES, resolveTagInputPlaygroundArgs } from "../../april/renderers/tag-input.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Tag Input",
  tags: ["autodocs"],
  component: TagInput,
  parameters: { layout: "fullscreen" },
  argTypes: {
    state: {
      control: { type: "inline-radio" },
      options: TAG_INPUT_STATES,
      table: { category: "Properties" },
    },
    valueEntered: { name: "value-entered", control: "boolean", table: { category: "Properties" } },
    label: { name: "input label", control: "text", table: { category: "Properties" } },
    showLabel: { name: "show input label", control: "boolean", table: { category: "Properties" } },
    placeholder: { name: "placeholder-text", control: "text", table: { category: "Properties" } },
    showDescription: { name: "show help/error", control: "boolean", table: { category: "Properties" } },
    description: {
      name: "help/error description",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showDescription" },
    },
    leadingIcon: { name: "show leading-icon", control: "boolean", table: { category: "Properties" } },
  },
};

export const Playground = {
  args: {
    state: "default",
    valueEntered: false,
    label: "Input Label",
    showLabel: true,
    placeholder: "Add multiple tags separated by comma (,)",
    showDescription: true,
    description: "Help / Error Description.",
    leadingIcon: true,
  },
  render: (args) => (
    <StoryFrame width="min(100%, 360px)">
      <TagInputPlayground {...args} />
    </StoryFrame>
  ),
};

export const Interactive = {
  args: {
    label: "Input Label",
    showLabel: true,
    placeholder: "Add multiple tags separated by comma (,)",
    showDescription: true,
    description: "Help / Error Description.",
    leadingIcon: true,
    fullWidth: true,
  },
  render: function TagInputInteractiveStory(args) {
    const [tags, setTags] = useState(["JEE 2027", "High Income"]);
    return (
      <StoryFrame width="min(100%, 360px)">
        <TagInput {...args} tags={tags} onChange={setTags} />
      </StoryFrame>
    );
  },
};

const GALLERY_STATES = [
  { state: "default", valueEntered: false },
  { state: "default", valueEntered: true },
  { state: "hover", valueEntered: true },
  { state: "active", valueEntered: true },
  { state: "focused", valueEntered: false },
  { state: "focused", valueEntered: true },
  { state: "error", valueEntered: false },
  { state: "error", valueEntered: true },
  { state: "disabled", valueEntered: false },
  { state: "disabled", valueEntered: true },
  { state: "loading", valueEntered: false },
  { state: "loading", valueEntered: true },
];

export const AllStates = {
  render: () => (
    <div className="april-tag-input-gallery">
      {GALLERY_STATES.map(({ state, valueEntered }) => (
        <div key={`${state}-${valueEntered ? "filled" : "empty"}`}>
          <p className="april-tag-input-gallery__title">
            {state}
            {valueEntered ? " · value entered" : ""}
          </p>
          <TagInput {...resolveTagInputPlaygroundArgs({ state, valueEntered })} fullWidth />
        </div>
      ))}
    </div>
  ),
};
