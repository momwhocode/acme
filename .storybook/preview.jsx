import React from "react"
import { MemoryRouter } from "react-router-dom"
import "../app/frontend/styles/april.css"
import { bindAprilInteractions } from "../app/frontend/april/interactions/index.js"

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    (Story) => {
      React.useEffect(() => {
        return bindAprilInteractions(document)
      }, [])
      return <Story />
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
