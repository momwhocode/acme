import { BreadcrumbHeader } from "../../april/components/BreadcrumbHeader.jsx";
import { BreadcrumbLinks } from "../../april/components/BreadcrumbLinks.jsx";
import {
  BREADCRUMB_LINKS_VALUES,
  DEFAULT_BREADCRUMB_PLAYGROUND_LABELS,
  resolveBreadcrumbLinksPlaygroundArgs,
} from "../../april/renderers/breadcrumb-links.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

const breadcrumbLinkArgTypes = {
  links: {
    name: "links",
    control: { type: "select" },
    options: BREADCRUMB_LINKS_VALUES,
    table: { category: "Properties" },
  },
  linkLabel1: { name: "link-label-1", control: "text", table: { category: "Properties" } },
  linkLabel2: {
    name: "link-label-2",
    control: "text",
    if: { arg: "links", neq: "1" },
    table: { category: "Properties" },
  },
  linkLabel3: {
    name: "link-label-3",
    control: "text",
    if: { arg: "links", in: ["3", "overflown"] },
    table: { category: "Properties" },
  },
};

const breadcrumbLinkArgs = {
  links: "2",
  linkLabel1: DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[0],
  linkLabel2: DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[1],
  linkLabel3: DEFAULT_BREADCRUMB_PLAYGROUND_LABELS[2],
};

export default {
  title: "April System/Breadcrumb",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Breadcrumb system (Figma 361:1629, 120:7977). Breadcrumb Header composes base Breadcrumb Links.",
      },
    },
  },
};

export const BreadcrumbHeaderStory = {
  name: "Breadcrumb Header",
  argTypes: breadcrumbLinkArgTypes,
  args: breadcrumbLinkArgs,
  render: (args) => (
    <StoryFrame width="100%">
      <div className="april-breadcrumb-header-playground">
        <div className="april-breadcrumb-header-playground__frame">
          <BreadcrumbHeader {...resolveBreadcrumbLinksPlaygroundArgs(args)} />
        </div>
      </div>
    </StoryFrame>
  ),
};

export const BaseBreadcrumbLinks = {
  name: "_base Breadcrumb Links",
  argTypes: breadcrumbLinkArgTypes,
  args: breadcrumbLinkArgs,
  render: (args) => (
    <StoryFrame>
      <div className="april-breadcrumb-links-playground">
        <div className="april-breadcrumb-links-playground__frame">
          <BreadcrumbLinks {...resolveBreadcrumbLinksPlaygroundArgs(args)} />
        </div>
      </div>
    </StoryFrame>
  ),
};
