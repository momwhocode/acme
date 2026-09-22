export const TEXT_STYLE_WEIGHTS = ["regular", "medium", "semibold", "bold"];

export const TEXT_STYLE_SCALES = [
  { id: "display-2xl", label: "display 2xl", letterSpacing: "-2%" },
  { id: "display-xl", label: "display xl", letterSpacing: "-2%" },
  { id: "display-lg", label: "display lg", letterSpacing: "-2%" },
  { id: "display-md", label: "display md", letterSpacing: "-2%" },
  { id: "display-sm", label: "display sm" },
  { id: "display-xs", label: "display xs" },
  { id: "display-heading-xs", label: "display heading xs" },
  { id: "text-xl", label: "text xl" },
  { id: "text-lg", label: "text lg" },
  { id: "text-md", label: "text md" },
  { id: "text-sm", label: "text sm" },
  { id: "text-xs", label: "text xs" },
  { id: "text-xxs", label: "text xxs" },
];

export const TEXT_STYLES = TEXT_STYLE_SCALES.flatMap((scale) =>
  TEXT_STYLE_WEIGHTS.map((weight) => `${scale.id}-${weight}`)
);

export const DEFAULT_PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog";
