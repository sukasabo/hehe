/*
  Entry page: click the cookie (or cup) and a kettle pours coffee into the cup, which floods
  the screen in ripples and lifts away to reveal the guide. Shown once per browser tab;
  reloads go straight to the guide.
*/
(function () {
  const root = document.documentElement;
  const splash = document.getElementById("splash");
  if (!splash || root.classList.contains("entered")) return;

  const cup = document.getElementById("splash-cup");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let started = false;

  cup.addEventListener("click", async () => {
    if (started) return;
    started = true;
    try { sessionStorage.setItem("entered", "1"); } catch {}

    if (reduceMotion) {
      splash.classList.add("is-fading");
      await wait(250);
      return finish();
    }

    // Center the flood's ripples on the spot where the stream meets the cup.
    const rim = cup.querySelector(".cup-rim").getBoundingClientRect();
    const flood = splash.querySelector(".flood");
    flood.style.setProperty("--rx", `${rim.left + rim.width / 2}px`);
    flood.style.setProperty("--ry", `${rim.top + rim.height / 2 + 60}px`);

    splash.classList.add("is-pouring");
    await wait(2500);
    splash.classList.add("is-flooding");
    await wait(1500);
    splash.classList.add("is-leaving");
    await wait(800);
    finish();
  });

  function finish() {
    root.classList.add("entered");
    splash.remove();
    document.querySelector(".view-toggle button[aria-selected='true']")?.focus({ preventScroll: true });
  }
})();
