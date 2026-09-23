/** Bookmark menu for named Employees filter/column snapshots (localStorage). */

import { useState } from "react"
import { IconMenuDropdown } from "../april/components/IconMenuDropdown"
import { Modal } from "../april/components/Modal"
import { TextInput } from "../april/components/TextInput"
import { listSavedViews, saveDirectoryView } from "../lib/directoryPrefs"

export default function SavedDirectoryViews({ snapshot, onApply }) {
  const [views, setViews] = useState(() => listSavedViews())
  const [saveOpen, setSaveOpen] = useState(false)
  const [name, setName] = useState("")

  const items = [
    ...views.map((view) => ({
      label: view.name,
      onClick: () => onApply?.(view)
    })),
    { label: "Save current view", onClick: () => setSaveOpen(true) }
  ]

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setViews(saveDirectoryView({ ...snapshot, name: trimmed }))
    setName("")
    setSaveOpen(false)
  }

  return (
    <>
      <IconMenuDropdown
        id="saved-directory-views"
        icon="bookmark"
        ariaLabel="Saved views"
        variant="outlined"
        size="md"
        items={items}
      />
      {saveOpen ? (
        <Modal
          backdrop
          size="sm"
          icon="bookmark"
          title="Save view"
          description="Keeps these filters and columns so you can reopen them later."
          showDescription
          showConfirmInput={false}
          showReset={false}
          cancel="Cancel"
          confirm="Save view"
          onCancel={() => setSaveOpen(false)}
          onConfirm={save}
        >
          <TextInput
            id="saved-view-name"
            showLabel={false}
            fullWidth
            autoFocus
            placeholder="UK contractors, active"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Modal>
      ) : null}
    </>
  )
}
