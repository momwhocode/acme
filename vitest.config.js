import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [ "app/frontend/test/setup.js" ],
    include: ["app/frontend/**/*.{test,spec}.{js,jsx}"]
  }
})
