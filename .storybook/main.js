/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../app/frontend/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "vite.storybook.config.js",
      },
    },
  },
}

export default config
