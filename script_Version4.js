const year = document.querySelector("#year");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

year.textContent = new Date().getFullYear();

menuButton.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";

  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute(
    "aria-label",
    opening ? "Close navigation" : "Open navigation"
  );
  navigation.classList.toggle("is-open", opening);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  });
});