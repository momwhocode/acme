import { FloatingBar } from "../../april/components/FloatingBar.jsx";

export default {
  title: "April System/Floating Bar",
  tags: ["autodocs"],
  component: FloatingBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bulk selection floating bar for table multi-select. Figma April System 925:2201 — ghost sm buttons, selection chip with pressed state + close, dividers between groups.",
      },
    },
  },
  argTypes: {
    selection: { control: "text", table: { category: "Content" } },
    message: { control: "text", table: { category: "Content" } },
    selectionDismiss: { control: "boolean", table: { category: "Properties" } },
    showDelete: { control: "boolean", table: { category: "Properties" } },
    showMore: { control: "boolean", table: { category: "Properties" } },
    moreLabel: { control: "text", table: { category: "Content" } },
    className: { table: { disable: true } },
    onClearSelection: { table: { disable: true } },
    onActionClick: { table: { disable: true } },
    onDelete: { table: { disable: true } },
    onMore: { table: { disable: true } },
  },
  args: {
    selection: "3 of 8 Selected",
    selectionDismiss: true,
    showDelete: true,
    showMore: true,
    moreLabel: "More",
    actions: [
      { id: "change-plan", label: "Change Plan", leadingIcon: "add" },
      { id: "download", label: "Download", leadingIcon: "add" },
    ],
  },
};

export const Playground = {
  render: (args) => (
    <div className="april-floating-bar-gallery">
      <FloatingBar {...args} />
    </div>
  ),
};

export const Gallery = {
  render: () => (
    <div className="april-floating-bar-gallery">
      <FloatingBar />
    </div>
  ),
};
