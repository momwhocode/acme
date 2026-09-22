import { FieldsetLabel } from "../../april/components/FieldsetLabel.jsx";
import { StoryFrame } from "../_helpers/StoryFrame.jsx";

export default {
  title: "April System/Fieldset Label",
  tags: ["autodocs"],
  component: FieldsetLabel,
};

export const Default = {
  render: () => (
    <StoryFrame width="min(100%, 360px)">
      <FieldsetLabel />
    </StoryFrame>
  ),
};

export const NoRequired = {
  render: () => (
    <StoryFrame width="min(100%, 360px)">
      <FieldsetLabel showRequired={false} />
    </StoryFrame>
  ),
};

export const NoDescription = {
  render: () => (
    <StoryFrame width="min(100%, 360px)">
      <FieldsetLabel showDescription={false} />
    </StoryFrame>
  ),
};

export const Minimal = {
  render: () => (
    <StoryFrame width="min(100%, 360px)">
      <FieldsetLabel showRequired={false} showDescription={false} />
    </StoryFrame>
  ),
};

export const Gallery = {
  render: () => (
    <div style={{ display: "grid", gap: 24, padding: 24, maxWidth: 360 }}>
      {[
        { label: "required · description", showRequired: true, showDescription: true },
        { label: "no required · description", showRequired: false, showDescription: true },
        { label: "required · no description", showRequired: true, showDescription: false },
        { label: "no required · no description", showRequired: false, showDescription: false },
      ].map((variant, index) => (
        <section key={variant.label}>
          <h3 className="april-text-style april-text-style--text-xs-semibold april-form-row__label-hint">
            {variant.label}
          </h3>
          <FieldsetLabel {...variant} id={`fieldset-label-${index}`} />
        </section>
      ))}
    </div>
  ),
};
