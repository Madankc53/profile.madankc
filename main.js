document.getElementById("year").textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- cursor dot ---------- */
const dot = document.getElementById("cursorDot");
if (dot && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    dot.classList.add("active");
  });
  document.querySelectorAll("[data-hover]").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("hover"));
    el.addEventListener("mouseleave", () => dot.classList.remove("hover"));
  });
}

/* ---------- scroll reveals ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const revealGroups = [
    ".story-lead",
    ".story-col p",
    ".venture-card",
    ".build-card",
    ".contact-title",
    ".contact-row",
  ];

  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 3) * 0.06,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    });
  });

  // hero content entrance on load
  gsap.fromTo(
    ".hero-content > *",
    { autoAlpha: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 },
    { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.2 }
  );
}
