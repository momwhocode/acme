import { useState } from "react"
import { OverviewTabs } from "../../components/home/OverviewTabs.jsx"
import { StoryFrame } from "../_helpers/StoryFrame.jsx"

export default {
  title: "Acme/Overview Tabs",
  tags: ["autodocs"],
  component: OverviewTabs,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Home in-card tabs. Ghost `sm` buttons, no April tab-rail divider. Use April System/Tabs when the page-level rail is required."
      }
    }
  }
}

function MoneyCardStory() {
  const [activeIndex, setActiveIndex] = useState(2)
  return (
    <StoryFrame width="min(100%, 720px)">
      <OverviewTabs
        id="story-money-tabs"
        align="end"
        tabs={[
          { id: "country", label: "Country" },
          { id: "department", label: "Department" },
          { id: "type", label: "Type" }
        ]}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </StoryFrame>
  )
}

function ActionCenterStory() {
  const [activeIndex, setActiveIndex] = useState(0)
  return (
    <StoryFrame width="min(100%, 720px)">
      <OverviewTabs
        id="story-action-tabs"
        tabs={[
          { id: "onboarding", label: "Onboarding", count: 4 },
          { id: "offboarding", label: "Offboarding", count: 1 },
          { id: "contracts", label: "Contracts Expiring", count: 2 }
        ]}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </StoryFrame>
  )
}

export const MoneyCard = {
  render: () => <MoneyCardStory />
}

export const ActionCenter = {
  render: () => <ActionCenterStory />
}
