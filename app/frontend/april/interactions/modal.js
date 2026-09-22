export function bindModalInRoot(root) {
  const cleanups = [];

  root.querySelectorAll(".april-modal-backdrop, .april-modal").forEach((container) => {
    if (container.dataset.aprilBound === "modal") return;
    container.dataset.aprilBound = "modal";

    const close = () => container.closest(".april-modal-backdrop")?.remove() || container.remove();
    const closeBtn = container.querySelector(".april-modal__close");
    const onCloseClick = () => close();
    const onBackdropClick = (event) => {
      if (event.target === container) close();
    };

    closeBtn?.addEventListener("click", onCloseClick);
    if (container.classList.contains("april-modal-backdrop")) {
      container.addEventListener("click", onBackdropClick);
    }

    cleanups.push(() => {
      closeBtn?.removeEventListener("click", onCloseClick);
      if (container.classList.contains("april-modal-backdrop")) {
        container.removeEventListener("click", onBackdropClick);
      }
    });
  });

  return () => cleanups.forEach((fn) => fn?.());
}
