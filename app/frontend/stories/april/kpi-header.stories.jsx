import { KpiHeader } from "../../april/components/KpiHeader.jsx";
import { DEFAULT_KPI_HEADER_ITEMS, KPI_HEADER_STATES } from "../../april/renderers/kpi-header.js";

export default {
  title: "April System/KPI Header",
  tags: ["autodocs"],
  component: KpiHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "KPI header (Figma 407:131). 120px metric bar with four cards. `state: default` shows labels and values; `state: loading` shows skeleton placeholders.",
      },
    },
  },
  argTypes: {
    state: { control: { type: "select" }, options: KPI_HEADER_STATES, table: { category: "Properties" } },
  },
  args: { state: "default" },
};

export const Playground = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <KpiHeader state={args.state} items={DEFAULT_KPI_HEADER_ITEMS} />
    </div>
  ),
};
