import { PageTitleNavHeader } from "../../april/components/PageTitleNavHeader.jsx";
import {
  PAGE_TITLE_NAV_HEADER_TYPES,
  resolvePageTitleNavHeaderTypeProps,
} from "../../april/renderers/page-title-nav-header.js";

const pageTitleNavHeaderArgTypes = {
  type: {
    control: { type: "select" },
    options: PAGE_TITLE_NAV_HEADER_TYPES,
    table: { category: "Properties" },
  },
  pageTitle: { name: "page-title", control: "text", table: { category: "Properties" } },
  showLeadingIcon: { name: "show leading-icon", control: "boolean", table: { category: "Properties" } },
  showTag: { name: "show tag", control: "boolean", table: { category: "Properties" } },
  showCreatedOn: { name: "show created-on", control: "boolean", table: { category: "Properties" } },
  showUserName: { name: "show user-name", control: "boolean", table: { category: "Properties" } },
  showSecondaryButton: {
    name: "show secondary-button",
    control: "boolean",
    table: { category: "Properties" },
  },
  showPrimaryButton: { name: "show primary-button", control: "boolean", table: { category: "Properties" } },
  showMoreMenu: { name: "show more-menu", control: "boolean", table: { category: "Properties" } },
  showSecondaryTrailingIcon: {
    name: "show secondary trailing-icon",
    control: "boolean",
    table: { category: "Properties" },
  },
  showPrimaryTrailingIcon: {
    name: "show primary trailing-icon",
    control: "boolean",
    table: { category: "Properties" },
  },
  tagLabel: {
    name: "tag-label",
    control: "text",
    if: { arg: "showTag", eq: true },
    table: { category: "Content" },
  },
  userName: {
    name: "user-name",
    control: "text",
    if: { arg: "showUserName", eq: true },
    table: { category: "Content" },
  },
  secondaryButtonLabel: {
    name: "secondary-button-label",
    control: "text",
    if: { arg: "showSecondaryButton", eq: true },
    table: { category: "Content" },
  },
  primaryButtonLabel: {
    name: "primary-button-label",
    control: "text",
    if: { arg: "showPrimaryButton", eq: true },
    table: { category: "Content" },
  },
};

const figmaActionButtons = {
  showSecondaryButton: true,
  showPrimaryButton: true,
  showMoreMenu: true,
  secondaryButtonLabel: "Button Label",
  primaryButtonLabel: "Button Label",
  secondaryIcon: "add",
  primaryIcon: "add",
  secondaryLeadingIcon: true,
  showSecondaryTrailingIcon: true,
  primaryLeadingIcon: true,
  showPrimaryTrailingIcon: true,
};

export default {
  title: "April System/Page Title Nav Header",
  tags: ["autodocs"],
  component: PageTitleNavHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Page title navigation header (Figma 517:1835). Two types: `default` (title only) and `with-meta` (title + created-on + user name). Actions: outlined secondary, primary, and outlined more menu.",
      },
    },
  },
  argTypes: pageTitleNavHeaderArgTypes,
};

export const Playground = {
  args: {
    type: "default",
    pageTitle: "Page Title",
    showLeadingIcon: false,
    showTag: false,
    ...figmaActionButtons,
  },
  render: (args) => (
    <div style={{ width: "100%" }}>
      <PageTitleNavHeader {...args} />
    </div>
  ),
};

export const Default = {
  name: "Default",
  args: resolvePageTitleNavHeaderTypeProps("default", {
    pageTitle: "Page Title",
    showLeadingIcon: false,
    ...figmaActionButtons,
  }),
  render: (args) => (
    <div style={{ width: "100%" }}>
      <PageTitleNavHeader {...args} />
    </div>
  ),
};

export const WithMeta = {
  name: "With meta",
  args: resolvePageTitleNavHeaderTypeProps("with-meta", {
    pageTitle: "Page Title",
    showLeadingIcon: false,
    ...figmaActionButtons,
  }),
  render: (args) => (
    <div style={{ width: "100%" }}>
      <PageTitleNavHeader {...args} />
    </div>
  ),
};
