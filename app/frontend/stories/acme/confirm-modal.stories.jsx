import { useState } from "react"
import { Button } from "../../april/components/Button.jsx"
import ConfirmModal from "../../components/ConfirmModal.jsx"
import { StoryFrame } from "../_helpers/StoryFrame.jsx"

export default {
  title: "Acme/Confirm Modal",
  tags: ["autodocs"],
  component: ConfirmModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Shared sm confirmation used by delete hire, leave, and other destructive directory actions."
      }
    }
  }
}

function DeleteHireStory() {
  const [open, setOpen] = useState(true)
  return (
    <StoryFrame>
      <Button label="Open confirm" variant="outlined" size="md" onClick={() => setOpen(true)} />
      {open ? (
        <ConfirmModal
          title="Delete Ada Lovelace?"
          description="Removes this hire. This action cannot be undone."
          confirm="Delete"
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      ) : null}
    </StoryFrame>
  )
}

export const DeleteHire = {
  render: () => <DeleteHireStory />
}
