/*
  Entry page: tap the espresso cup, coffee pours in, floods the screen and lifts away
  to reveal the guide. Shown once per browser tab; reloads go straight to the guide.
*/
(function () {
  const root = document.documentElement;
  const splash = document.getElementById("splash");
  if (!splash || root.classList.contains("entered")) return;

  const cup = document.getElementById("splash-cup");
  const stream = splash.querySelector(".stream");
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

    // Line the stream up with the middle of the cup's rim.
    const rim = cup.querySelector(".cup-mouth").getBoundingClientRect();
    stream.style.left = `${rim.left + rim.width / 2}px`;
    stream.style.height = `${rim.top + rim.height / 2}px`;

    splash.classList.add("is-pouring");
    await wait(1300);
    splash.classList.add("is-flooding");
    await wait(1000);
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
