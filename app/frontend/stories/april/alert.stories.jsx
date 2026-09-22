import { Alert } from "../../april/components/Alert.jsx";
import { PageToast } from "../../april/components/PageToast.jsx";
import { ALERT_COLORS } from "../../april/renderers/alert.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Alert",
  tags: ["autodocs"],
  component: Alert,
  parameters: { layout: "fullscreen" },
  argTypes: {
    inline: { control: "boolean", table: { category: "Properties" } },
    toast: { control: "boolean", table: { category: "Properties" } },
    color: { control: { type: "inline-radio" }, options: ALERT_COLORS, table: { category: "Properties" } },
    title: { control: "text", table: { category: "Properties" } },
    description: { control: "text", table: { category: "Properties" } },
    showDescription: { name: "show description", control: "boolean", table: { category: "Properties" } },
    showButtons: { name: "buttons", control: "boolean", table: { category: "Properties" } },
    showPrimaryButton: {
      name: "primary-button",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "showButtons" },
    },
    showSecondaryButton: {
      name: "secondary-button",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "showButtons" },
    },
    primaryAction: {
      name: "primary-button-label",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showButtons" },
    },
    secondaryAction: {
      name: "secondary-button-label",
      control: "text",
      table: { category: "Properties" },
      if: { arg: "showButtons" },
    },
    dismissible: { control: "boolean", table: { category: "Properties" } },
    variant: { table: { disable: true } },
    message: { table: { disable: true } },
    action: { table: { disable: true } },
  },
  args: {
    inline: true,
    toast: false,
    color: "gray",
    title: "Alert Title",
    description: "Alert description",
    showDescription: true,
    showButtons: true,
    showPrimaryButton: true,
    showSecondaryButton: true,
    primaryAction: "Button Label",
    secondaryAction: "Button Label",
    dismissible: true,
  },
};

export const Playground = {
  render: (args) => (
    <StoryFrame>
      <Alert {...args} />
    </StoryFrame>
  ),
};

export const TenantCreatedToast = {
  name: "Tenant Created Toast",
  render: () => (
    <StoryFrame>
      <PageToast title="Tenant created" onDismiss={() => {}} />
    </StoryFrame>
  ),
};
