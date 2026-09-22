import { Modal, ModalPlayground } from "../../april/components/Modal.jsx";
import { TextInput } from "../../april/components/TextInput.jsx";
import { MODAL_SIZES } from "../../april/renderers/modal.js";

const mdDescription =
  "A secondary description line which is optional, but can be used to add a contextual help text.";

export default {
  title: "UI Patterns/Modal",
  tags: ["autodocs"],
  component: Modal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Modal shell. sm — confirmation (400px). md/lg — content via children. Pass any form or list as children.",
      },
    },
  },
  argTypes: {
    size: { control: { type: "inline-radio" }, options: MODAL_SIZES, table: { category: "Properties" } },
    showConfirmInput: {
      name: "show confirm-input",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "size", eq: "sm" },
    },
    title: { name: "modal title", control: "text", table: { category: "Properties" } },
    icon: { control: "text", table: { category: "Properties" } },
    showDescription: { name: "show description", control: "boolean", table: { category: "Properties" } },
    description: { control: "text", table: { category: "Properties" }, if: { arg: "showDescription" } },
    cancel: { name: "cancel label", control: "text", table: { category: "Properties" } },
    confirm: { name: "confirm label", control: "text", table: { category: "Properties" } },
    confirmPlaceholder: {
      name: "confirm placeholder",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showConfirmInput" },
    },
    showReset: {
      name: "show reset",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "size", neq: "sm" },
    },
    resetLabel: {
      name: "reset label",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showReset" },
    },
  },
};

export const Playground = {
  args: {
    size: "sm",
    showConfirmInput: true,
    title: "Modal Title?",
    icon: "delete",
    showDescription: true,
    description: mdDescription,
    cancel: "Cancel",
    confirm: "Delete",
    confirmPlaceholder: "Confirm",
    showReset: true,
    resetLabel: "Reset All",
  },
  render: (args) => <ModalPlayground {...args} />,
};

export const Confirmation = {
  name: "sm · Confirmation",
  args: {
    size: "sm",
    showConfirmInput: true,
    title: "Delete item?",
    icon: "delete",
    showDescription: true,
    description: "This item will be permanently removed. This action cannot be undone.",
    confirm: "Delete",
    confirmPlaceholder: "Confirm",
  },
  render: (args) => <ModalPlayground {...args} />,
};

export const MdContent = {
  name: "md · Content",
  args: {
    size: "md",
    title: "Edit item",
    icon: "edit",
    showDescription: true,
    description: mdDescription,
    confirm: "Save",
    showReset: false,
  },
  render: (args) => (
    <ModalPlayground {...args}>
      <div className="april-modal__container" data-april-modal-container>
        <TextInput
          label="Name"
          value="Alex Rivera"
          valueEntered
          showDescription={false}
          showRequired={false}
          id="modal-demo-name"
        />
      </div>
    </ModalPlayground>
  ),
};

export const LgContent = {
  name: "lg · Content",
  args: {
    size: "lg",
    title: "Filter",
    icon: "filter_list",
    showDescription: false,
    confirm: "Apply",
    resetLabel: "Reset All",
    showReset: true,
  },
  render: (args) => <ModalPlayground {...args} />,
};
