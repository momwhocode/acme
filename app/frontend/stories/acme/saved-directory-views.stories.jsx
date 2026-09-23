import { MemoryRouter } from "react-router-dom"
import SavedDirectoryViews from "../../components/SavedDirectoryViews.jsx"
import { StoryFrame } from "../_helpers/StoryFrame.jsx"

export default {
  title: "Acme/Saved Directory Views",
  tags: ["autodocs"],
  component: SavedDirectoryViews,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bookmark menu for named Employees filter and column snapshots. Views persist in localStorage."
      }
    }
  }
}

export const Playground = {
  render: () => (
    <MemoryRouter>
      <StoryFrame>
        <SavedDirectoryViews
          snapshot={{
            filterValues: { country: [ "GB" ] },
            q: "",
            columns: [ "email", "country" ],
            sort: { columnId: "lead", direction: "asc" }
          }}
          onApply={() => {}}
        />
      </StoryFrame>
    </MemoryRouter>
  )
}
