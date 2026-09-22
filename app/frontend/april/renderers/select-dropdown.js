export const SELECT_DROPDOWN_VARIANTS = ["single", "multiselect", "multiselect-icon"];

export const PLAN_MULTISELECT_GROUPS = [
  {
    items: [
      { label: "All", indeterminate: true },
      { label: "Trial" },
      { label: "Pro", selected: true, state: "active" },
      { label: "Platinum" },
    ],
  },
];

export const DATE_RANGE_GROUPS = [
  {
    label: "Select Date Range",
    items: [
      { label: "Lifetime" },
      { label: "Today" },
      { label: "Yesterday", selected: true, state: "active" },
      { label: "Last Week" },
      { label: "Last Month" },
    ],
    dividerAfter: true,
  },
  {
    items: [{ label: "Custom" }],
  },
];

export const STATUS_FILTER_GROUPS = [
  {
    items: [
      { label: "All", selected: true, leadingIconName: "check" },
      { label: "Active" },
      { label: "Inactive" },
    ],
  },
];

export const PLAN_STATUS_GROUPS = [
  {
    label: "Select Plan",
    items: [{ label: "Paid" }, { label: "Unpaid", selected: true, state: "active" }],
  },
];
