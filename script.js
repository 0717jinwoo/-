(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const links = [...document.querySelectorAll(".site-nav a")];
  const pageOrder = ["index.html", "about.html", "portfolio.html", "contact.html"];
  const currentFile = location.pathname.split("/").pop() || "index.html";
  const currentIndex = Math.max(0, pageOrder.indexOf(currentFile));
  const main = document.querySelector(".page-enter");
  const progress = document.querySelector(".drag-progress span");
  let startX = 0, startY = 0, dragging = false, pointerId = null;

  // Animate ordinary page navigation before changing documents.
  links.forEach(link => {
    link.addEventListener("click", event => {
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || target.pathname === location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => { location.href = link.href; }, 180);
    });
  });

  // Drag left/right on the content area to move between portfolio pages.
  // A vertical gesture is left to normal page scrolling.
  if (main && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    main.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest("a, button, input, textarea, label")) return;
      startX = event.clientX;
      startY = event.clientY;
      pointerId = event.pointerId;
      dragging = false;
    });
    main.addEventListener("pointermove", event => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!dragging && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        dragging = true;
        document.body.classList.add("dragging");
        main.setPointerCapture?.(event.pointerId);
      }
      if (dragging) {
        const limited = Math.max(-100, Math.min(100, dx * 0.22));
        const section = main.querySelector(".content-section");
        if (section) section.style.transform = `translateX(${limited}px) rotate(${limited * 0.025}deg)`;
        if (progress) progress.style.width = `${Math.min(100, Math.abs(dx) / 2)}%`;
      }
    });
    const finishDrag = event => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const wasDragging = dragging;
      const section = main.querySelector(".content-section");
      if (section) section.style.transform = "";
      document.body.classList.remove("dragging");
      if (progress) progress.style.width = "0";
      dragging = false;
      pointerId = null;
      if (wasDragging && Math.abs(dx) > 75) {
        const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= 0 && nextIndex < pageOrder.length) {
          document.body.classList.add("is-leaving");
          const direction = dx < 0 ? "-28px" : "28px";
          if (main) main.style.setProperty("--exit-direction", direction);
          window.setTimeout(() => { location.href = pageOrder[nextIndex]; }, 180);
        }
      }
    };
    main.addEventListener("pointerup", finishDrag);
    main.addEventListener("pointercancel", finishDrag);
  }
})();
