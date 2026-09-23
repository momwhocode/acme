import { OverviewKpi } from "../../components/home/OverviewKpi.jsx"
import { StoryFrame } from "../_helpers/StoryFrame.jsx"

export default {
  title: "Acme/Overview KPI",
  tags: ["autodocs"],
  component: OverviewKpi,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Clickable Home metric. Deltas use April Tag: up = success, down = error, flat = default."
      }
    }
  }
}

export const Playground = {
  args: {
    icon: "payments",
    label: "Annual Cost",
    value: "$8.1M",
    delta: "+4.2%",
    selected: false
  },
  render: (args) => (
    <StoryFrame width="16rem">
      <OverviewKpi {...args} onClick={() => {}} />
    </StoryFrame>
  )
}

export const SelectedDown = {
  render: () => (
    <StoryFrame width="16rem">
      <OverviewKpi
        icon="group"
        label="Headcount"
        value="128"
        delta="-3"
        selected
        onClick={() => {}}
      />
    </StoryFrame>
  )
}
