import { Sidebar, SidebarPlayground } from "../../april/components/Sidebar.jsx";
import {
  DEFAULT_MAIN_MENU_BOTTOM,
  DEFAULT_MAIN_MENU_GROUPS,
  DEFAULT_MAIN_MENU_TOP,
  DEFAULT_SETTINGS_MENU_GROUPS,
  DEFAULT_SIDEBAR_ACTIVE_ITEM,
  SIDEBAR_VARIANTS,
} from "../../april/renderers/sidebar.js";

const activeItemOptions = [
  ...DEFAULT_MAIN_MENU_TOP,
  ...DEFAULT_MAIN_MENU_GROUPS.flatMap((group) => group.items),
  ...DEFAULT_MAIN_MENU_BOTTOM,
  ...DEFAULT_SETTINGS_MENU_GROUPS.flatMap((group) => group.items),
].map((item) => item.id);

export default {
  title: "April System/Sidebar",
  tags: ["autodocs"],
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Application sidebar with main and settings variants. Composes base menu options for navigation items.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "select" }, options: SIDEBAR_VARIANTS, table: { category: "Properties" } },
    activeItemId: {
      name: "active-item",
      control: { type: "select" },
      options: activeItemOptions,
      table: { category: "Properties" },
    },
    logoUrl: { table: { disable: true } },
    logoAlt: { table: { disable: true } },
    profileName: { table: { disable: true } },
    profileEmail: { table: { disable: true } },
    profileImageUrl: { table: { disable: true } },
    profileInitials: { table: { disable: true } },
    onItemClick: { table: { disable: true } },
    onBackClick: { table: { disable: true } },
    onLogoutClick: { table: { disable: true } },
  },
  args: {
    variant: "main",
    activeItemId: DEFAULT_SIDEBAR_ACTIVE_ITEM.main,
  },
};

export const Playground = {
  render: (args) => <SidebarPlayground {...args} />,
};
