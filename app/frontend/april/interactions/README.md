# April DOM interactions

These modules wire **declarative `data-controller` markup** used by React components that still rely on shared interaction behavior in Storybook (and any legacy markup).

## Required for

| Module           | Used by (React)                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| `menuOptions.js` | `MenuDropdown`, `SelectDropdown`, `Sidebar`                            |
| `tabs.js`        | `Tabs`                                                                 |
| `modal.js`       | `Modal`                                                                |
| `datePicker.js`  | `DatePickerInput`                                                      |
| `filterChips.js` | Legacy filter chip markup (React `BaseFilterChip` uses native buttons) |

`bindAprilInteractions(root)` is called from `.storybook/preview.jsx` on each story so menus, tabs, and modals work without per-story setup.

## Do not remove

Removing this folder breaks Storybook stories for **Tabs**, **Modal**, **Menu dropdown**, **Date picker**, and **Sidebar** until those components are refactored to fully controlled React state with no `data-controller` attributes.
