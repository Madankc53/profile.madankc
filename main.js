document.getElementById("year").textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasHover = window.matchMedia("(hover: hover)").matches;

document.body.style.overflow = "hidden";

/* ---------- smooth scroll (Lenis) ---------- */
let lenis;
if (window.Lenis && !prefersReduced) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (window.gsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------- loader ---------- */
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderCount = document.getElementById("loaderCount");
let progress = 0;
const loaderInterval = setInterval(() => {
  progress += Math.random() * 18 + 6;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loaderInterval);
    setTimeout(finishLoad, 220);
  }
  loaderFill.style.width = progress + "%";
  loaderCount.textContent = String(Math.floor(progress)).padStart(2, "0");
}, 140);

function finishLoad() {
  loader.classList.add("done");
  document.body.style.overflow = "";
  playHeroIntro();
}

/* ---------- hero intro (line reveal) ---------- */
function playHeroIntro() {
  if (!window.gsap) return;
  gsap.set(".hero-title .line-inner", { yPercent: prefersReduced ? 0 : 110 });
  gsap.set([".eyebrow", ".hero-sub", ".hero-actions"], { autoAlpha: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 });

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(".hero-title .line-inner", { yPercent: 0, duration: 1.1, stagger: 0.1 })
    .to(".eyebrow", { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15)
    .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.6")
    .to(".hero-actions", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");
}

/* ---------- split text into words for scroll reveal ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.innerHTML = "";
  el.childNodes; // noop
  const words = text.split(/\s+/);
  words.forEach((w, i) => {
    const wrap = document.createElement("span");
    wrap.className = "split-word";
    const inner = document.createElement("span");
    inner.className = "split-word-inner";
    inner.textContent = w + (i < words.length - 1 ? "\u00A0" : "");
    wrap.appendChild(inner);
    el.appendChild(wrap);
  });
}

/* rebuild data-split-words elements preserving <em> emphasis by operating on text nodes only where simple */
document.querySelectorAll("[data-split-words]").forEach((el) => {
  // preserve inline <em> tags: split per top-level child (text nodes and em elements) word by word
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/).filter((s) => s.length);
      words.forEach((w) => {
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; }
        const wrap = document.createElement("span");
        wrap.className = "split-word";
        const inner = document.createElement("span");
        inner.className = "split-word-inner";
        inner.textContent = w;
        wrap.appendChild(inner);
        el.appendChild(wrap);
      });
    } else {
      const wrap = document.createElement("span");
      wrap.className = "split-word";
      const inner = document.createElement("span");
      inner.className = "split-word-inner";
      inner.appendChild(node.cloneNode(true));
      wrap.appendChild(inner);
      el.appendChild(wrap);
    }
  });
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[data-split-words]").forEach((el) => {
    const inners = el.querySelectorAll(".split-word-inner");
    gsap.set(inners, { yPercent: prefersReduced ? 0 : 100, autoAlpha: prefersReduced ? 1 : 0 });
    gsap.to(inners, {
      yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.02,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  const revealGroups = [".build-card", ".social-card"];
  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 26 },
        {
          autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
  });
}

/* ---------- custom cursor (smooth trailing) ---------- */
if (hasHover && window.gsap) {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const setDot = gsap.quickTo(dot, "x", { duration: 0.05, ease: "none" });
  const setDotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "none" });
  const setRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
  const setRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    setDot(e.clientX); setDotY(e.clientY);
    setRing(e.clientX); setRingY(e.clientY);
    dot.classList.add("active"); ring.classList.add("active");
  });
  document.querySelectorAll("[data-hover]").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}

/* ---------- magnetic buttons ---------- */
if (hasHover && window.gsap && !prefersReduced) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.35;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ---------- subtle tilt on cards/portrait ---------- */
if (hasHover && !prefersReduced) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${py * -6}deg) rotateY(${px * 6}deg)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = "perspective(700px) rotateX(0) rotateY(0)"; });
  });
}
