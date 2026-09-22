import { BaseCalendarDate, BaseCalendarDateGallery } from "../../april/components/BaseCalendarDate.jsx";
import { CalendarPopover } from "../../april/components/CalendarPopover.jsx";
import { BASE_CALENDAR_DATE_STATES } from "../../april/renderers/base-calendar-date.js";
import { CALENDAR_POPOVER_STATES } from "../../april/renderers/calendar.js";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

const calendarPopoverArgTypes = {
  state: { control: { type: "select" }, options: CALENDAR_POPOVER_STATES, table: { category: "Properties" } },
};

const baseCalendarDateArgTypes = {
  state: {
    control: { type: "select" },
    options: BASE_CALENDAR_DATE_STATES,
    table: { category: "Properties" },
  },
  label: { control: "text", table: { category: "Properties" } },
};

export default {
  title: "April System/Calendar Popover",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Calendar popover system (Figma 456:3034). Calendar Popover composes base calendar date cells in day grids.",
      },
    },
  },
};

export const CalendarPopoverStory = {
  name: "Calendar Popover",
  argTypes: calendarPopoverArgTypes,
  args: { state: "single-date" },
  render: (args) => (
    <StoryFrame>
      <div className="april-calendar-popover-playground">
        <div className="april-calendar-popover-playground__frame">
          <CalendarPopover state={args.state} />
        </div>
      </div>
    </StoryFrame>
  ),
};

export const BaseCalendarDateStory = {
  name: "_base Calendar Date",
  argTypes: baseCalendarDateArgTypes,
  args: { state: "default", label: "1" },
  render: (args) => (
    <StoryFrame>
      <div className="april-base-calendar-date-playground">
        <div className="april-base-calendar-date-playground__frame">
          <BaseCalendarDate state={args.state} label={args.label} />
        </div>
      </div>
    </StoryFrame>
  ),
};

export const AllDateStates = {
  name: "_base Calendar Date — all states",
  parameters: { docs: { disable: true } },
  render: () => <BaseCalendarDateGallery />,
};
