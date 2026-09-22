import { FilterChipsHeader } from "../../april/components/FilterChipsHeader.jsx";
import { FilterChipsHeaderDemo } from "../_helpers/filterChipsHeaderStory.jsx";

const filterChipsHeaderArgTypes = {
  showSearch: { name: "show search", control: "boolean", table: { category: "Properties" } },
  showColumnsButton: { name: "show columns-button", control: "boolean", table: { category: "Properties" } },
  showClearAll: { name: "show clear-all", control: "boolean", table: { category: "Properties" } },
  clearAllLabel: {
    name: "clear-all-label",
    control: "text",
    if: { arg: "showClearAll", eq: true },
    table: { category: "Content" },
  },
  searchPlaceholder: {
    name: "search-placeholder",
    control: "text",
    if: { arg: "showSearch", eq: true },
    table: { category: "Content" },
  },
};

const filterChipsHeaderArgs = {
  showSearch: true,
  showColumnsButton: true,
  showClearAll: true,
  clearAllLabel: "Clear all",
  searchPlaceholder: "Search",
};

export default {
  title: "April System/Filter Chips Header",
  tags: ["autodocs"],
  component: FilterChipsHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Filter chips header above table (Figma). Composes overflow + dropdown base filter chips, Clear All, 320px search, and outlined md `add_column_right` columns button. See `.cursor/rules/filter-chips-header.mdc`.",
      },
    },
  },
};

export const Playground = {
  name: "Playground",
  argTypes: filterChipsHeaderArgTypes,
  args: filterChipsHeaderArgs,
  render: (args) => (
    <div className="listing-table-shell__table-card" style={{ width: "100%" }}>
      <FilterChipsHeaderDemo {...args} />
    </div>
  ),
};
