import { Tabs } from "../../april/components/Tabs.jsx";
import { TABS_MAX_COUNT, TABS_MIN_COUNT } from "../../april/renderers/tabs.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Tabs",
  tags: ["autodocs"],
  component: Tabs,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Transparent page tabs (Figma 857:7100). Structure: `.april-tabs-group` → `.april-tabs-group__base-rail` (flex, gap-sm, no padding, start-aligned) → `.april-tab-wrapper` (48px, no padding) → ghost `sm` Button. Active tab uses ghost `active-pressed` state. Edge-to-edge divider: 2px `--color-border-border-gray-light` below base-rail. Minimum two tabs.",
      },
    },
  },
  argTypes: {
    tabCount: {
      name: "tabs",
      control: { type: "number", min: TABS_MIN_COUNT, max: TABS_MAX_COUNT, step: 1 },
      table: { category: "Properties" },
    },
    activeIndex: { table: { disable: true } },
  },
  args: { tabCount: 5 },
};

export const Playground = {
  render: (args) => (
    <StoryFrame width="100%">
      <Tabs tabCount={args.tabCount} />
    </StoryFrame>
  ),
};
