export function bindTabsInRoot(root) {
  const cleanups = [];

  root.querySelectorAll("[data-controller='april-tabs']").forEach((container) => {
    if (container.dataset.aprilBound === "tabs") return;
    container.dataset.aprilBound = "tabs";

    const tabs = [...container.querySelectorAll("[data-april-tabs-target='tab'], [data-index]")].filter(
      (el) => el.matches("button[role='tab']")
    );
    const panel = container.querySelector("[data-april-tabs-target='panel']");

    const setActive = (index) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        const wrapper = tab.closest(".april-tab-wrapper");
        wrapper?.classList.toggle("april-tab-wrapper--active", active);
        tab.setAttribute("aria-selected", active);
        if (active) tab.setAttribute("data-state", "active-pressed");
        else tab.removeAttribute("data-state");
      });
      if (panel) {
        const label = tabs[index]?.querySelector(".april-btn__label")?.textContent?.trim() || "";
        panel.textContent = `${label} panel content`;
      }
    };

    const handlers = tabs.map((tab) => {
      const handler = () => setActive(Number(tab.dataset.index));
      tab.addEventListener("click", handler);
      return () => tab.removeEventListener("click", handler);
    });

    cleanups.push(() => handlers.forEach((off) => off()));
  });

  return () => cleanups.forEach((fn) => fn?.());
}
