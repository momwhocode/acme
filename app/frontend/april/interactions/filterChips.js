export function bindFilterChipsInRoot(root) {
  const cleanups = [];

  const bindChipGroup = (container, chips) => {
    const handlers = chips.map((chip, index) => {
      if (!chip.dataset.index) chip.dataset.index = String(index);
      const handler = () => {
        chips.forEach((c, i) => {
          const active = i === Number(chip.dataset.index);
          c.classList.toggle("april-base-filter-chip--active", active);
          c.classList.toggle("april-filter-chip--active", active);
          c.setAttribute("aria-pressed", active);
          c.setAttribute("aria-selected", active);
        });
      };
      chip.addEventListener("click", handler);
      return () => chip.removeEventListener("click", handler);
    });
    return () => handlers.forEach((off) => off());
  };

  root
    .querySelectorAll("[data-controller='april-filter-chips'], [data-april-filter-chips]")
    .forEach((container) => {
      if (container.dataset.aprilBound === "filter-chips") return;
      container.dataset.aprilBound = "filter-chips";
      const chips = [
        ...container.querySelectorAll(
          "[data-april-filter-chips-target='chip'], .april-base-filter-chip, .april-filter-chip"
        ),
      ];
      cleanups.push(bindChipGroup(container, chips));
    });

  root.querySelectorAll(".april-filter-chips-header__chips[role='toolbar']").forEach((container) => {
    if (container.dataset.aprilBound === "filter-chips") return;
    container.dataset.aprilBound = "filter-chips";
    const chips = [...container.querySelectorAll(".april-base-filter-chip")].filter(
      (chip) => !chip.closest(".april-filter-chip-dropdown")
    );
    if (chips.length) cleanups.push(bindChipGroup(container, chips));
  });

  return () => cleanups.forEach((fn) => fn?.());
}
