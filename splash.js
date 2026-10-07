/*
  Entry page: tap the coffee cup, coffee pours in (and the music starts), floods the screen
  and lifts away to reveal the guide. Shown on every page load.
*/
(function () {
  const root = document.documentElement;
  const splash = document.getElementById("splash");
  if (!splash) return;

  const cup = document.getElementById("splash-cup");

  // Fill the awning with enough stripes to span the screen.
  const awning = splash.querySelector(".awning");
  awning.innerHTML = "<span></span>".repeat(Math.ceil(Math.max(screen.width, innerWidth) / 72) + 1);
  const stream = splash.querySelector(".stream");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let started = false;

  cup.addEventListener("click", async () => {
    if (started) return;
    started = true;
    window.Music?.startIfWanted();

    if (reduceMotion) {
      splash.classList.add("is-fading");
      await wait(250);
      return finish();
    }

    // Line the stream up with the middle of the cup's rim.
    const rim = cup.querySelector(".mouth").getBoundingClientRect();
    stream.style.left = `${rim.left + rim.width / 2}px`;
    // Pour from the very top of the screen down into the cup.
    stream.style.top = "0px";
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
