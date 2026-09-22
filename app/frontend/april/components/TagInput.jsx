import { useId, useRef, useState } from "react";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import {
  TAG_INPUT_SAMPLE_TAGS,
  TAG_INPUT_STATES,
  resolveTagInputPlaygroundArgs,
} from "../renderers/tag-input.js";
import { Spinner } from "./Spinner.jsx";
import { tagTypeForLabel } from "../renderers/tag.js";
import { Tag } from "./Tag.jsx";

const SEMANTIC_STATES = ["default", "error", "disabled", "loading"];
const ICON_SIZE = 20;

function splitTagInput(text) {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Tag input — Figma 1193:3629 */
export function TagInput({
  id: idProp,
  state = "default",
  playgroundState = null,
  label,
  required = false,
  requiredText = "*",
  showLabel = true,
  placeholder = "Add multiple tags separated by comma (,)",
  tags = [],
  onChange,
  description,
  showDescription = false,
  leadingIcon = true,
  leadingIconName = "add",
  fullWidth = false,
  disabled = false,
  className = "",
}) {
  const uid = useId();
  const id = idProp || `tag-input-${uid}`;
  const inputRef = useRef(null);
  const [draft, setDraft] = useState("");

  const semanticState = disabled ? "disabled" : SEMANTIC_STATES.includes(state) ? state : "default";
  const isPlayground = Boolean(playgroundState);
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = isPlayground ? playgroundState : resolveAprilVisualState(semanticState, interaction);
  const valueEntered = tags.length > 0;
  const isDisabled = semanticState === "disabled" || semanticState === "loading";
  const isError = semanticState === "error";
  const isLoading = semanticState === "loading";
  const showPlaceholder = !valueEntered && !draft;

  const classes = [
    "april-tag-input",
    visualState !== "default" ? `april-tag-input--${visualState}` : "",
    valueEntered ? "april-tag-input--entered" : "",
    fullWidth ? "april-tag-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const commitDraft = () => {
    const nextTags = splitTagInput(draft);
    if (!nextTags.length) {
      return;
    }

    const merged = [...tags];
    nextTags.forEach((tag) => {
      if (!merged.includes(tag)) {
        merged.push(tag);
      }
    });

    onChange?.(merged);
    setDraft("");
  };

  const handleRemove = (index) => {
    if (isDisabled) {
      return;
    }

    onChange?.(tags.filter((_, tagIndex) => tagIndex !== index));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === "Backspace" && !draft && tags.length) {
      handleRemove(tags.length - 1);
    }
  };

  const handleBlur = (event) => {
    focusBind.onBlur(event);
    if (draft.trim()) {
      commitDraft();
    }
  };

  const handleFocus = (event) => {
    focusBind.onFocus(event);
  };

  const handleControlClick = () => {
    if (!isDisabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={classes} id={id} {...(isPlayground ? {} : mouseBind)}>
      {showLabel && label ? (
        <div className="april-tag-input__label-row">
          <label className="april-tag-input__label" htmlFor={`${id}-field`}>
            {label}
            {required ? (
              <span className="april-tag-input__required" aria-hidden="true">
                {requiredText}
              </span>
            ) : null}
          </label>
        </div>
      ) : null}
      <div
        className="april-tag-input__control"
        onClick={handleControlClick}
        onKeyDown={undefined}
        role="presentation"
      >
        {leadingIcon ? (
          <span className="april-tag-input__icon" aria-hidden="true">
            <span
              className="material-symbols-outlined april-icon"
              style={{ fontSize: `var(--icon-size-icon-${ICON_SIZE})` }}
            >
              {leadingIconName}
            </span>
          </span>
        ) : null}
        <div className="april-tag-input__stack">
          {tags.map((tag, index) => (
            <Tag
              key={`${tag}-${index}`}
              type={tagTypeForLabel(tag)}
              label={tag}
              leadingIcon={false}
              trailingIcon
              trailingIconName="close"
              onRemove={
                isPlayground || isDisabled
                  ? undefined
                  : (event) => {
                      event.stopPropagation();
                      handleRemove(index);
                    }
              }
            />
          ))}
          {!isPlayground ? (
            <input
              ref={inputRef}
              className="april-tag-input__field"
              id={`${id}-field`}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={showPlaceholder ? placeholder : ""}
              disabled={isDisabled}
              readOnly={isLoading}
              aria-invalid={isError || undefined}
              aria-describedby={showDescription && description ? `${id}-desc` : undefined}
              aria-busy={isLoading || undefined}
            />
          ) : valueEntered ? null : (
            <span className="april-tag-input__placeholder">{placeholder}</span>
          )}
        </div>
        {isLoading ? (
          <span className="april-tag-input__spinner">
            <Spinner size="16" decorative />
          </span>
        ) : null}
      </div>
      {showDescription && description ? (
        <p className="april-tag-input__description" id={`${id}-desc`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function TagInputPlayground(args) {
  const props = resolveTagInputPlaygroundArgs(args);
  return (
    <div className="april-tag-input-playground">
      <div className="april-tag-input-playground__frame">
        <TagInput {...props} fullWidth />
      </div>
    </div>
  );
}

export { TAG_INPUT_STATES, TAG_INPUT_SAMPLE_TAGS };
