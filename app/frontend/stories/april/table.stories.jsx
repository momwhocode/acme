import { FilterChipsHeaderDemo } from "../_helpers/filterChipsHeaderStory.jsx";
import { Table } from "../../april/components/Table.jsx";
import {
  DEFAULT_TABLE_COLUMNS,
  TABLE_DEMO_ROWS,
  TABLE_LOADED_ROWS_MAX,
  TABLE_LOADED_ROWS_MIN,
  TABLE_PLAYGROUND_STATES,
} from "../_helpers/tableStory.js";

export default {
  title: "April System/Table",
  tags: ["autodocs"],
  component: Table,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Data table. Supports default, loading (skeleton), partial loading, and empty states.",
      },
    },
  },
  argTypes: {
    state: {
      name: "state",
      control: { type: "select" },
      options: TABLE_PLAYGROUND_STATES.map((option) => option.value),
      labels: Object.fromEntries(TABLE_PLAYGROUND_STATES.map((option) => [option.value, option.label])),
      table: { category: "Properties" },
    },
    loadedRows: {
      name: "loaded-rows",
      control: { type: "number", min: TABLE_LOADED_ROWS_MIN, max: TABLE_LOADED_ROWS_MAX, step: 1 },
      table: { category: "Properties" },
      if: { arg: "state", eq: "partially-loading" },
    },
    showFilterChipsHeader: {
      name: "show filter-chips-header",
      control: "boolean",
      table: { category: "Properties" },
    },
    showSearch: {
      name: "show search",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "showFilterChipsHeader", eq: true },
    },
    showColumnsButton: {
      name: "show columns-button",
      control: "boolean",
      table: { category: "Properties" },
      if: { arg: "showFilterChipsHeader", eq: true },
    },
  },
  args: {
    state: "default",
    loadedRows: 4,
    showFilterChipsHeader: true,
    showSearch: true,
    showColumnsButton: true,
  },
};

export const Playground = {
  render: (args) => (
    <div className="april-table-playground" style={{ width: "100%" }}>
      <div className="april-table-playground__frame">
        {args.showFilterChipsHeader ? (
          <FilterChipsHeaderDemo
            id="table-story-filters"
            columns={DEFAULT_TABLE_COLUMNS}
            showSearch={args.showSearch}
            showColumnsButton={args.showColumnsButton}
          />
        ) : null}
        <Table
          type={args.state}
          columns={DEFAULT_TABLE_COLUMNS}
          rows={TABLE_DEMO_ROWS}
          loadedRows={args.loadedRows}
        />
      </div>
    </div>
  ),
};
