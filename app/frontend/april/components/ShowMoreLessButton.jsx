import { Button } from "./Button.jsx";

/** Shared Show More / Show Less control used by activity feeds and similar lists. */
export function ShowMoreLessButton({ expanded = false, onClick, className = "" }) {
  return (
    <Button
      label={expanded ? "Show Less" : "Show More"}
      variant="ghost"
      size="sm"
      type="button"
      leadingIcon
      trailingIcon={false}
      icon={expanded ? "keyboard_arrow_up" : "chevron_right"}
      className={className}
      onClick={onClick}
    />
  );
}
