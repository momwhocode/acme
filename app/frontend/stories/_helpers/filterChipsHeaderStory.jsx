import { useFilterChipsHeaderState } from "../../lib/useFilterChipsHeaderState.js";
import { FilterChipsHeader } from "../../april/components/FilterChipsHeader.jsx";
import {
  DEFAULT_FILTER_CHIPS_HEADER_CHIPS,
  DEFAULT_FILTER_CHIPS_HEADER_FILTER_VALUES,
} from "../../april/renderers/filter-chips-header.js";

/** Storybook / demo wrapper with interactive filter-chips-header state. */
export function FilterChipsHeaderDemo({
  chips = DEFAULT_FILTER_CHIPS_HEADER_CHIPS,
  initialFilterValues = DEFAULT_FILTER_CHIPS_HEADER_FILTER_VALUES,
  columns = [],
  id = "filter-chips-header-demo",
  ...headerProps
}) {
  const state = useFilterChipsHeaderState({
    columns,
    initialFilterValues,
  });

  return <FilterChipsHeader id={id} chips={chips} {...state} {...headerProps} />;
}
