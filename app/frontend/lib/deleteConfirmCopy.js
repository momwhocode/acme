/** Delete confirmation modal copy — sm modal UI pattern (title + description). */

const UNDONE_WARNING = "This action cannot be undone.";

const DELETE_CONFIRM_ENTITIES = {
  item: {
    label: "item",
    singleConsequence: "This item will be permanently removed",
    bulkConsequence: "The selected items will be permanently removed",
  },
};

function pluralizeEntityLabel(label, count) {
  if (count === 1) return label;
  return `${label}s`;
}

function withUndoneWarning(consequence) {
  const trimmed = consequence.trim();
  if (/cannot be undone\.?$/i.test(trimmed)) {
    return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  }
  const sentence = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
  return `${sentence}. ${UNDONE_WARNING}`;
}

/** Title — question form: `{Verb} {name}?` or `{Verb} {count} {entities}?` */
export function deleteConfirmTitle({ count = 1, label = "item", itemName, verb = "Delete" } = {}) {
  if (count === 1 && itemName) return `${verb} ${itemName}?`;
  if (count === 1) return `${verb} ${label}?`;
  return `${verb} ${count} ${pluralizeEntityLabel(label, count)}?`;
}

/** Description — consequence sentence, optionally ending with the standard undo warning. */
export function deleteConfirmDescription({ consequence, appendUndoneWarning = true } = {}) {
  if (!consequence?.trim()) return appendUndoneWarning ? UNDONE_WARNING : "";
  if (!appendUndoneWarning) {
    const trimmed = consequence.trim();
    return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  }
  return withUndoneWarning(consequence);
}

/**
 * @param {{ entity?: keyof typeof DELETE_CONFIRM_ENTITIES, count?: number, itemName?: string, consequence?: string }} options
 */
export function buildDeleteConfirmCopy({ entity = "item", count = 1, itemName, consequence } = {}) {
  const config = DELETE_CONFIRM_ENTITIES[entity] ?? DELETE_CONFIRM_ENTITIES.item;
  const resolvedConsequence =
    consequence ?? (count === 1 ? config.singleConsequence : config.bulkConsequence);
  const verb = config.verb ?? "Delete";
  const appendUndoneWarning = config.appendUndoneWarning !== false;

  return {
    title: deleteConfirmTitle({ count, label: config.label, itemName, verb }),
    description: deleteConfirmDescription({
      consequence: resolvedConsequence,
      appendUndoneWarning,
    }),
    confirmLabel: config.confirmLabel ?? "Delete",
    icon: config.icon ?? "delete",
  };
}
