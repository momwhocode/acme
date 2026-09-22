/** Table story constants — Storybook only. */

export const DEFAULT_TABLE_COLUMNS = [
  { id: "select", kind: "select", sticky: "start" },
  { id: "name", label: "Name", kind: "lead", sticky: "start", showAvatar: true },
  { id: "status", label: "Status", kind: "status", scroll: "start" },
  { id: "email", label: "Email", kind: "header", scroll: true },
  { id: "role", label: "Role", kind: "header", scroll: true },
  { id: "owner", label: "Owner", kind: "person", scroll: true },
  { id: "createdOn", label: "Created", kind: "datetime", scroll: "end" },
  { id: "actions", kind: "actions", sticky: "end" },
];

export const TABLE_DEMO_ROWS = [
  {
    name: "Alex Rivera",
    initials: "AR",
    color: "blue",
    status: "Active",
    statusType: "success",
    email: "alex@example.com",
    role: "Admin",
    owner: { name: "Sam Lee", initials: "SL", color: "green" },
    createdOn: "2026-05-25T11:07:45",
  },
  {
    name: "Jordan Blake",
    initials: "JB",
    color: "teal",
    status: "Pending",
    statusType: "info",
    email: "jordan@example.com",
    role: "Editor",
    owner: { name: "Riley Chen", initials: "RC", color: "orange" },
    createdOn: "2026-05-24T09:15:30",
  },
  {
    name: "Morgan Patel",
    initials: "MP",
    color: "pink",
    status: "Active",
    statusType: "success",
    email: "morgan@example.com",
    role: "Viewer",
    owner: { name: "Sam Lee", initials: "SL", color: "green" },
    createdOn: "2026-05-23T16:42:10",
  },
  {
    name: "Casey Nguyen",
    initials: "CN",
    color: "green",
    status: "Inactive",
    statusType: "default",
    email: "casey@example.com",
    role: "Editor",
    owner: null,
    createdOn: "2026-05-21T14:55:12",
  },
  {
    name: "Riley Chen",
    initials: "RC",
    color: "orange",
    status: "Active",
    statusType: "success",
    email: "riley@example.com",
    role: "Admin",
    owner: { name: "Alex Rivera", initials: "AR", color: "blue" },
    createdOn: "2026-05-20T10:20:05",
  },
];

export const TABLE_PLAYGROUND_STATES = [
  { value: "default", label: "Default" },
  { value: "loading", label: "Loading" },
  { value: "partially-loading", label: "Partial loading" },
  { value: "empty", label: "Empty" },
];

export const TABLE_LOADED_ROWS_MIN = 1;
export const TABLE_LOADED_ROWS_MAX = TABLE_DEMO_ROWS.length;
