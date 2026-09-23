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
          "April page tabs (Figma 857:7100): `.april-tabs-group` → `.april-tabs-group__base-rail` → ghost `sm` Button. The rail draws an edge-to-edge divider. Home in-card tabs use `OverviewTabs` (Acme/Overview Tabs) — the same ghost buttons without the rail divider.",
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
