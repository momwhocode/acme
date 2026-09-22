export function bindDatePickerInRoot(root) {
  const cleanups = [];

  root
    .querySelectorAll("[data-april-date-picker], [data-controller='april-date-picker']")
    .forEach((container) => {
      if (container.dataset.aprilBound === "date-picker") return;
      if (container.classList.contains("april-date-picker-input--disabled")) return;
      if (container.classList.contains("april-date-picker-input--loading")) return;
      container.dataset.aprilBound = "date-picker";

      const trigger = container.querySelector(".april-date-picker-input__trigger");
      const field = container.querySelector(".april-date-picker-input__field");
      if (!trigger) return;

      const toggle = () => {
        const isOpen = container.classList.toggle("april-date-picker-input--open");
        container.classList.toggle("april-date-picker-input--calendar-opened", isOpen);
        container.classList.toggle("april-date-picker-input--focused", isOpen);
        field?.setAttribute("aria-expanded", isOpen ? "true" : "false");
        const popover = container.querySelector(".april-date-picker-input__popover");
        if (popover) popover.hidden = !isOpen;
      };

      trigger.addEventListener("click", toggle);
      cleanups.push(() => trigger.removeEventListener("click", toggle));
    });

  return () => cleanups.forEach((fn) => fn?.());
}
