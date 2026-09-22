import { BaseFilterChip } from "../../april/components/BaseFilterChip.jsx";
import {
  BASE_FILTER_CHIP_STATES,
  DEFAULT_BASE_FILTER_CHIP_BADGE_VALUE,
  DEFAULT_BASE_FILTER_CHIP_LABEL,
} from "../../april/renderers/base-filter-chip.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

function FilterChipCanvas({ children }) {
  return (
    <div className="april-filter-chips-header__chips" style={{ padding: 16 }}>
      {children}
    </div>
  );
}

const argTypes = {
  state: {
    control: { type: "select" },
    options: BASE_FILTER_CHIP_STATES,
    table: { category: "Properties" },
  },
  active: { control: "boolean", table: { category: "Properties" } },
  overflown: { control: "boolean", table: { category: "Properties" } },
  filterLabel: {
    name: "filter-label",
    control: "text",
    if: { arg: "overflown", eq: false },
    table: { category: "Properties" },
  },
  badgeValue: {
    name: "badge-value",
    control: "text",
    if: { arg: "active", eq: true },
    table: { category: "Content" },
  },
};

const args = {
  state: "default",
  active: false,
  overflown: false,
  filterLabel: DEFAULT_BASE_FILTER_CHIP_LABEL,
  badgeValue: DEFAULT_BASE_FILTER_CHIP_BADGE_VALUE,
};

export default {
  title: "April System/Base Filter Chip",
  tags: ["autodocs"],
  component: BaseFilterChip,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Base filter chip (Figma base-filter-chips). Subcomponent for the filter-chips header. Chips hug content with 12px horizontal padding (`spacing-md`), 4px vertical padding and gap (`spacing-xs`), and 16px icons. Badge appears when active with a count. Overflown chip opens the filter modal via `FilterChipOverflow`.",
      },
    },
  },
  argTypes,
  args,
};

export const Playground = {
  render: (chipArgs) => (
    <StoryFrame>
      <FilterChipCanvas>
        <BaseFilterChip {...chipArgs} id="base-filter-chip-playground" />
      </FilterChipCanvas>
    </StoryFrame>
  ),
};

const variantGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, max-content)",
  gap: 16,
  alignItems: "center",
};

export const AllVariants = {
  name: "All variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <StoryFrame width="max-content">
      <FilterChipCanvas>
        <div style={variantGridStyle}>
          <BaseFilterChip id="label-default" filterLabel="Filter Label" />
          <BaseFilterChip id="label-hover" filterLabel="Filter Label" state="hover" />
          <BaseFilterChip id="label-active" filterLabel="Filter Label" active badgeValue="3" />
          <BaseFilterChip
            id="label-active-hover"
            filterLabel="Filter Label"
            active
            state="hover"
            badgeValue="3"
          />

          <BaseFilterChip id="icon-default" overflown />
          <BaseFilterChip id="icon-hover" overflown state="hover" />
          <BaseFilterChip id="icon-active" overflown active badgeValue="3" />
          <BaseFilterChip id="icon-active-hover" overflown active state="hover" badgeValue="3" />
        </div>
      </FilterChipCanvas>
    </StoryFrame>
  ),
};
