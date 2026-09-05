(function () {
  const section = document.querySelector("[data-about-section]");
  if (!section) return;

  const show = () => section.classList.add("about--visible");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show();
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  io.observe(section);
})();

(function () {
  const section = document.querySelector("[data-services-section]");
  if (!section) return;

  const show = () => section.classList.add("services--visible");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show();
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );

  io.observe(section);
})();
