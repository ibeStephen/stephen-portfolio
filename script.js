const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

$("#year").textContent = new Date().getFullYear();

// Real backdrop refraction only works in Chromium; others keep the blur-based glass.
if (window.chrome && !/Edg|OPR/.test(navigator.userAgent)) document.documentElement.classList.add("refract");

// Scroll progress
const bar = $(".progress");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.setProperty("--p", max > 0 ? scrollY / max : 0);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Sliding nav pill + active section
const nav = $(".site-nav");
const links = $$("a", nav);
const movePill = (link) => {
  nav.style.setProperty("--x", link.offsetLeft + "px");
  nav.style.setProperty("--w", link.offsetWidth + "px");
};
const setActive = (id) => {
  const link = links.find((a) => a.hash === "#" + id);
  if (!link) return;
  links.forEach((a) => a.classList.toggle("active", a === link));
  movePill(link);
};
const sections = $$("main section[id]");
const spy = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));
document.fonts.ready.then(() => movePill($("a.active", nav)));
addEventListener("resize", () => movePill($("a.active", nav)));

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 2) * 0.1 + "s";
  io.observe(el);
});

// Glass glare + tilt that follows the pointer
if (fine && !reduce) {
  $$("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", x * 100 + "%");
      el.style.setProperty("--my", y * 100 + "%");
      el.style.setProperty("--rx", (x - 0.5) * 10 + "deg");
      el.style.setProperty("--ry", (0.5 - y) * 10 + "deg");
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  // Hero cards lean toward the cursor together
  const stage = $(".stage");
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    $$(".fcard", stage).forEach((c) => {
      if (c.matches(":hover")) return;
      const d = c.style.getPropertyValue("--d") / 40;
      c.style.setProperty("--rx", x * 14 * d + "deg");
      c.style.setProperty("--ry", -y * 14 * d + "deg");
    });
  });
  stage.addEventListener("pointerleave", () =>
    $$(".fcard", stage).forEach((c) => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); })
  );

  // Magnetic buttons
  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

// Project modal
const modal = $("#modal");
const openProject = (card) => {
  $("#m-tag").textContent = $(".tag", card).textContent;
  $("#m-title").textContent = $("h3", card).textContent;
  $("#m-body").innerHTML = $(".more", card).innerHTML;
  modal.showModal();
};
$$(".pcard").forEach((card) => {
  card.addEventListener("click", () => openProject(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(card); }
  });
});
$(".close", modal).addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

// Copy email with toast
const toast = $(".toast");
let timer;
const say = (msg) => {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove("show"), 2200);
};
$(".copy").addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(e.currentTarget.dataset.copy);
    say("Email copied");
  } catch {
    say("Copy failed. Use stephenkimanzi6520@gmail.com");
  }
});
