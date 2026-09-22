const OPTION_SELECTOR = "button.april-menu-option:not(.april-menu-option--group)";

const MENU_CONTAINER_SELECTOR = [
  "[data-controller='april-menu-options']",
  "[data-april-menu-options-mode-value]",
  ".april-sidebar .april-menu-dropdown[data-controller='april-menu-options']",
  ".april-menu-dropdown[data-controller='april-menu-options']",
  ".april-select-dropdown[data-controller='april-menu-options']",
].join(", ");

export function bindMenuOptions(container, mode = "menu") {
  const resolvedMode = container.dataset.aprilMenuOptionsModeValue || mode;
  const options = [...container.querySelectorAll(OPTION_SELECTOR)];

  const onPointerEnter = (event) => {
    const option = event.currentTarget;
    if (option.disabled) return;
    option.classList.add("april-menu-option--hover");
  };

  const onPointerLeave = (event) => {
    event.currentTarget.classList.remove("april-menu-option--hover");
  };

  const removeTrailingCheck = (option) => {
    option.querySelector(".april-menu-option__check")?.remove();
  };

  const ensureTrailingCheck = (option) => {
    let trailing = option.querySelector(".april-menu-option__trailing");
    if (!trailing) {
      trailing = document.createElement("span");
      trailing.className = "april-menu-option__trailing";
      option.appendChild(trailing);
    }
    if (trailing.querySelector(".april-menu-option__check")) return;
    const check = document.createElement("span");
    check.className = "april-menu-option__check";
    check.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true" style="font-size:20px">check</span>';
    trailing.appendChild(check);
  };

  const selectMenu = (option) => {
    options.forEach((item) => {
      item.classList.remove("april-menu-option--active");
      item.removeAttribute("aria-selected");
    });
    option.classList.add("april-menu-option--active");
    option.setAttribute("aria-selected", "true");
  };

  const selectSingle = (option) => {
    options.forEach((item) => {
      item.classList.remove("april-menu-option--active");
      item.removeAttribute("aria-selected");
      removeTrailingCheck(item);
    });
    option.classList.add("april-menu-option--active");
    option.setAttribute("aria-selected", "true");
    ensureTrailingCheck(option);
  };

  const updateCheckboxMarkup = (selector, checked) => {
    const box = selector.querySelector(".april-selector__box");
    if (!box) return;
    box.innerHTML = checked
      ? '<span class="material-symbols-outlined" aria-hidden="true" style="font-size:12px">check</span>'
      : "";
  };

  const syncStatusIcon = (option, checked) => {
    const leading = option.querySelector(".april-menu-option__leading");
    if (!leading) return;
    let icon = leading.querySelector(".april-menu-option__icon--status");
    if (checked && !icon) {
      icon = document.createElement("span");
      icon.className = "april-menu-option__icon april-menu-option__icon--status";
      icon.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true" style="font-size:12px">check</span>';
      leading.prepend(icon);
    } else if (!checked && icon) {
      icon.remove();
    }
  };

  const toggleMultiselect = (option) => {
    if (container.classList.contains("april-select-dropdown--multiselect-icon")) {
      const checked = !option.querySelector(".april-menu-option__icon--status");
      syncStatusIcon(option, checked);
      option.setAttribute("aria-checked", checked ? "true" : "false");
      return;
    }

    const selector = option.querySelector(".april-selector--checkbox");
    if (!selector) return;
    const wasIndeterminate = selector.classList.contains("april-selector--indeterminate");
    const checked = wasIndeterminate ? true : !selector.classList.contains("april-selector--checked");
    selector.classList.toggle("april-selector--checked", checked);
    selector.classList.remove("april-selector--indeterminate");
    updateCheckboxMarkup(selector, checked);
    option.setAttribute("aria-checked", checked ? "true" : "false");
  };

  const onClick = (event) => {
    const option = event.currentTarget;
    if (option.disabled) return;
    event.preventDefault();
    if (resolvedMode === "multiselect") toggleMultiselect(option);
    else if (resolvedMode === "single-select") selectSingle(option);
    else selectMenu(option);
  };

  options.forEach((option) => {
    option.addEventListener("pointerenter", onPointerEnter);
    option.addEventListener("pointerleave", onPointerLeave);
    option.addEventListener("click", onClick);
  });

  return () => {
    options.forEach((option) => {
      option.removeEventListener("pointerenter", onPointerEnter);
      option.removeEventListener("pointerleave", onPointerLeave);
      option.removeEventListener("click", onClick);
    });
  };
}

export function bindMenuOptionsInRoot(root) {
  const cleanups = [];
  root.querySelectorAll(MENU_CONTAINER_SELECTOR).forEach((container) => {
    if (container.dataset.aprilBound === "menu-options") return;
    container.dataset.aprilBound = "menu-options";
    cleanups.push(bindMenuOptions(container));
  });
  return () => cleanups.forEach((fn) => fn?.());
}
