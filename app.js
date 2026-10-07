(() => {
  const SHOPS = window.SHOPS;
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>';

  const state = {
    view: "map",
    sort: "recommended",
    filters: new Set(),
    day: new Date().getDay(),
    hour: new Date().getHours() + new Date().getMinutes() / 60,
    userPos: null,
    activeId: null,
  };

  // ---------- Time helpers ----------
  const fmtHour = (h) => {
    if (h === 24) return "Midnight";
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    const suffix = hr >= 12 && hr < 24 ? "PM" : "AM";
    const h12 = hr % 12 === 0 ? 12 : hr % 12;
    return min ? `${h12}:${String(min).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
  };
  const shortHour = (h) => fmtHour(h).replace(":00", "").replace(" AM", "a").replace(" PM", "p");
  const hoursOn = (shop, day) => shop.hours[day];
  const isOpen = (shop, day, hour) => {
    const h = hoursOn(shop, day);
    return !!h && hour >= h[0] && hour < h[1];
  };
  const hoursLabel = (h) => (h ? `${fmtHour(h[0])} – ${fmtHour(h[1])}` : "Closed");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Estimated busyness 0-100 for a given day and hour.
  function busyness(shop, day, hour) {
    if (!isOpen(shop, day, hour)) return 0;
    const peaks = day === 0 || day === 6 ? shop.crowd.weekend : shop.crowd.weekday;
    let v = 12;
    for (const [c, amp, spread] of peaks) v += amp * Math.exp(-((hour - c) ** 2) / (2 * spread ** 2));
    return Math.min(100, Math.round(v));
  }
  const busyLabel = (v) =>
    v === 0 ? "Closed" : v < 35 ? "Usually not busy" : v < 60 ? "Usually a little busy" : v < 82 ? "Usually busy" : "Usually at its busiest";
  const busyShort = (v) => (v < 35 ? "Quiet" : v < 60 ? "Light crowd" : v < 82 ? "Busy" : "Peak");

  function peakWindow(shop, day) {
    const h = hoursOn(shop, day);
    if (!h) return null;
    let best = h[0], bestV = -1;
    for (let t = h[0]; t < h[1]; t += 0.5) {
      const v = busyness(shop, day, t);
      if (v > bestV) (bestV = v), (best = t);
    }
    const start = Math.floor(best);
    return `${fmtHour(start)} – ${fmtHour(start + 1)}`;
  }

  function statusText(shop) {
    const { day, hour } = state;
    const h = hoursOn(shop, day);
    if (isOpen(shop, day, hour)) return { open: true, text: `Open · closes ${fmtHour(h[1])}` };
    if (h && hour < h[0]) return { open: false, text: `Opens ${fmtHour(h[0])}` };
    return { open: false, text: "Closed" };
  }

  // ---------- Distance ----------
  function miles(a, b) {
    const R = 3958.8, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // ---------- Filtering and sorting ----------
  function visibleShops() {
    const { day, hour, filters } = state;
    let list = SHOPS.filter((s) => {
      if (filters.has("open") && !isOpen(s, day, hour)) return false;
      if (filters.has("late") && !((hoursOn(s, day) || [0, 0])[1] > 18)) return false;
      if (filters.has("work") && s.work.score < 4) return false;
      if (filters.has("quiet") && !(isOpen(s, day, hour) && busyness(s, day, hour) < 60)) return false;
      if (filters.has("photos") && !s.photos.space.length) return false;
      if (filters.has("budget") && s.price !== 1) return false;
      return true;
    });

    const close = (s) => (hoursOn(s, day) || [99, -1])[1];
    const open = (s) => (hoursOn(s, day) || [99, -1])[0];
    const sorters = {
      recommended: (a, b) => score(b) - score(a),
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      "closes-late": (a, b) => close(b) - close(a),
      "opens-early": (a, b) => open(a) - open(b),
      "hours-long": (a, b) => close(b) - open(b) - (close(a) - open(a)),
      work: (a, b) => b.work.score - a.work.score || b.rating - a.rating,
      quiet: (a, b) => quietRank(a) - quietRank(b),
      distance: (a, b) => (state.userPos ? miles(state.userPos, a) - miles(state.userPos, b) : 0),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(sorters[state.sort]);
  }
  // Rating weighted by review volume, nudged by open status.
  const score = (s) => s.rating * 2 + Math.log10(s.reviews) * 0.6 + (isOpen(s, state.day, state.hour) ? 0.5 : 0);
  const quietRank = (s) => (isOpen(s, state.day, state.hour) ? busyness(s, state.day, state.hour) : 1000);

  // ---------- Rendering: list ----------
  const listEl = document.getElementById("list");
  const countEl = document.getElementById("count");

  const firstPhoto = (s) => s.photos.space[0] || s.photos.food[0];

  function cardHTML(s) {
    const st = statusText(s);
    const busy = busyness(s, state.day, state.hour);
    const dist = state.userPos ? `<span>${miles(state.userPos, s).toFixed(1)} mi</span>` : "";
    const photo = s.photos.space[0]
      ? `<img src="images/${s.photos.space[0]}" alt="Inside ${s.name}" loading="lazy">`
      : `<div class="no-photo">${s.atmosphere.headline}</div>`;
    return `
      <li class="card" data-id="${s.id}" tabindex="0" role="button" aria-label="${s.name}">
        <div class="card-photo">${photo}</div>
        <div class="card-body">
          <h2>${s.name}</h2>
          <div class="hood">${s.neighborhood}</div>
          <div class="headline">${s.atmosphere.headline}</div>
          <p class="summary">${s.atmosphere.summary}</p>
          <div class="meta">
            <span class="rating">${STAR}${s.rating.toFixed(1)}</span>
            <span>${s.reviews.toLocaleString()} reviews</span>
            <span>${s.priceLabel}</span>
            ${dist}
          </div>
          <div class="meta" style="margin-top:4px">
            <span class="status ${st.open ? "open" : "closed"}">${st.text}</span>
          </div>
          <div class="pills">
            <span class="pill">Work ${s.work.score}/5</span>
            ${busy ? `<span class="pill ${busy < 35 ? "busy-low" : ""}">${busyShort(busy)}</span>` : ""}
            <span class="pill busy-low">${s.atmosphere.sound}</span>
          </div>
        </div>
      </li>`;
  }

  function renderList() {
    const shops = visibleShops();
    listEl.innerHTML = shops.length
      ? shops.map(cardHTML).join("")
      : `<li class="empty">Nothing matches those filters at that time.</li>`;
    countEl.textContent = `${shops.length} of ${SHOPS.length} shops · ${DAYS[state.day]} at ${fmtHour(Math.floor(state.hour))}`;
    updateMarkers(shops);
  }

  listEl.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openDetail(card.dataset.id);
  });
  listEl.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (card && (e.key === "Enter" || e.key === " ")) (e.preventDefault(), openDetail(card.dataset.id));
  });
  listEl.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".card");
    if (card) setActive(card.dataset.id, { fromList: true });
  });
  listEl.addEventListener("mouseleave", () => setActive(null));

  // ---------- Map ----------
  let map;
  const markers = {};

  function initMap() {
    if (!window.L) {
      document.getElementById("map").innerHTML = '<p class="empty">The map could not load. The list still works.</p>';
      return;
    }
    map = L.map("map", { zoomControl: true, scrollWheelZoom: true }).setView([35.22, -80.84], 12);
    // OpenStreetMap tiles need no key; styles.css mutes them (and darkens them in dark mode).
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    SHOPS.forEach((s) => {
      const icon = L.divIcon({ className: "pin-wrap", html: `<span class="pin">${s.rating.toFixed(1)}</span>`, iconSize: [0, 0] });
      const m = L.marker([s.lat, s.lng], { icon, title: s.name, riseOnHover: true }).addTo(map);
      const img = firstPhoto(s);
      m.bindTooltip(
        `<div class="peek">${img ? `<img src="images/${img}" alt="">` : ""}
          <div class="peek-body"><strong>${s.name}</strong><em>${s.atmosphere.headline}</em>
          <span class="peek-status" data-id="${s.id}"></span></div></div>`,
        { className: "peek", direction: "top", offset: [0, -14], opacity: 1 }
      );
      m.on("tooltipopen", () => {
        const el = document.querySelector(`.peek-status[data-id="${s.id}"]`);
        if (el) el.textContent = `${statusText(s).text} · ${s.neighborhood}`;
      });
      m.on("mouseover", () => setActive(s.id, { fromMap: true }));
      m.on("mouseout", () => setActive(null));
      m.on("click", () => openDetail(s.id));
      markers[s.id] = m;
    });
    fitAll();
  }

  function fitAll(shops = SHOPS) {
    if (!map || !shops.length) return;
    map.fitBounds(L.latLngBounds(shops.map((s) => [s.lat, s.lng])), { padding: [40, 40], maxZoom: 14 });
  }

  function updateMarkers(shops) {
    if (!map) return;
    const ids = new Set(shops.map((s) => s.id));
    SHOPS.forEach((s) => {
      const m = markers[s.id];
      if (ids.has(s.id)) {
        if (!map.hasLayer(m)) m.addTo(map);
        const pin = m.getElement()?.querySelector(".pin");
        if (pin) pin.classList.toggle("closed", !isOpen(s, state.day, state.hour));
      } else if (map.hasLayer(m)) map.removeLayer(m);
    });
  }

  function setActive(id, opts = {}) {
    if (state.activeId === id) return;
    if (state.activeId) {
      markers[state.activeId]?.getElement()?.querySelector(".pin")?.classList.remove("is-active");
      markers[state.activeId]?.setZIndexOffset(0);
      listEl.querySelector(`.card[data-id="${state.activeId}"]`)?.classList.remove("is-active");
    }
    state.activeId = id;
    if (!id) return;
    const m = markers[id];
    m?.getElement()?.querySelector(".pin")?.classList.add("is-active");
    m?.setZIndexOffset(1000);
    const card = listEl.querySelector(`.card[data-id="${id}"]`);
    card?.classList.add("is-active");
    if (opts.fromMap && card && state.view === "map" && window.innerWidth > 860) {
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  // ---------- Detail drawer ----------
  const detail = document.getElementById("detail");
  const detailBody = document.getElementById("detail-body");
  let lastFocus = null;

  function mapsURL(s) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " " + s.address)}`;
  }
  function yelpURL(s) {
    return `https://www.yelp.com/search?find_desc=${encodeURIComponent(s.name)}&find_loc=${encodeURIComponent("Charlotte, NC")}`;
  }

  function openDetail(id) {
    const s = SHOPS.find((x) => x.id === id);
    if (!s) return;
    lastFocus = document.activeElement;
    const tab = s.photos.space.length ? "space" : "food";
    detailBody.innerHTML = detailHTML(s);
    detail.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    detail.querySelector(".detail-panel").scrollTop = 0;
    detail.querySelector(".detail-panel").focus();
    bindDetail(s, tab);
    if (map) map.panTo([s.lat, s.lng], { animate: true });
  }

  function closeDetail() {
    detail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }
  detail.addEventListener("click", (e) => e.target.closest("[data-close]") && closeDetail());
  document.addEventListener("keydown", (e) => e.key === "Escape" && detail.getAttribute("aria-hidden") === "false" && closeDetail());

  function detailHTML(s) {
    const st = statusText(s);
    const w = s.work;
    return `
      <div class="gallery-main" id="g-main"></div>
      <div class="gallery-bar">
        <div class="tabs" role="tablist">
          <button role="tab" data-tab="space" ${s.photos.space.length ? "" : "disabled"}>The space</button>
          <button role="tab" data-tab="food" ${s.photos.food.length ? "" : "disabled"}>Food &amp; drink</button>
        </div>
        <div class="thumbs" id="g-thumbs"></div>
      </div>

      <div class="detail-content">
        <div class="eyebrow">${s.neighborhood} · ${s.category}</div>
        <h2 id="detail-name">${s.name}</h2>
        <div class="meta">
          <span class="rating">${STAR}${s.rating.toFixed(1)}</span>
          <span>${s.reviews.toLocaleString()} Google reviews</span>
          <span>${s.priceLabel} per person</span>
          <span class="status ${st.open ? "open" : "closed"}">${st.text}</span>
        </div>

        <div class="section">
          <h3>Atmosphere</h3>
          <div class="headline">${s.atmosphere.headline}</div>
          <p class="lede">${s.atmosphere.summary}</p>
          <dl class="facts">
            <div><dt>Sound</dt><dd>${s.atmosphere.sound}</dd></div>
            <div><dt>Light</dt><dd>${s.atmosphere.lighting}</dd></div>
          </dl>
          <div class="pills">${s.atmosphere.tags.map((t) => `<span class="pill">${t}</span>`).join("")}</div>
        </div>

        <div class="section">
          <h3>Workability <small>Editorial estimate</small></h3>
          <div class="score">
            <span class="score-num">${w.score}</span>
            <div class="score-track"><div class="score-fill" style="width:${(w.score / 5) * 100}%"></div></div>
            <span class="eyebrow">of 5</span>
          </div>
          <dl class="facts">
            <div><dt>Seating</dt><dd>${w.seating}</dd></div>
            <div><dt>Outlets</dt><dd>${w.outlets}</dd></div>
            <div><dt>Wi-Fi</dt><dd>${w.wifi}</dd></div>
            <div><dt>Laptops</dt><dd>${w.laptops}</dd></div>
          </dl>
          <p class="note">${w.note}</p>
        </div>

        <div class="section">
          <h3>When it gets busy <small>Estimated</small></h3>
          <div class="day-tabs" id="crowd-days">
            ${DAYS.map((d, i) => `<button data-day="${i}" aria-pressed="${i === state.day}">${d.slice(0, 3)}</button>`).join("")}
          </div>
          <div class="crowd" id="crowd"></div>
          <p class="crowd-read" id="crowd-read"></p>
        </div>

        <div class="section">
          <h3>Hours</h3>
          <table class="hours">
            ${[1, 2, 3, 4, 5, 6, 0]
              .map((d) => `<tr class="${d === new Date().getDay() ? "today" : ""}"><td>${DAYS[d]}</td><td>${hoursLabel(hoursOn(s, d))}</td></tr>`)
              .join("")}
          </table>
        </div>

        <div class="section">
          <h3>Address</h3>
          <p style="margin:0">${s.address}</p>
          <div class="actions">
            <a class="btn primary" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.name + " " + s.address)}" target="_blank" rel="noopener">Directions</a>
            <a class="btn" href="${mapsURL(s)}" target="_blank" rel="noopener">All photos on Google</a>
            <a class="btn" href="${yelpURL(s)}" target="_blank" rel="noopener">Yelp</a>
          </div>
        </div>
      </div>`;
  }

  function bindDetail(s, initialTab) {
    const main = detailBody.querySelector("#g-main");
    const thumbs = detailBody.querySelector("#g-thumbs");
    const tabs = detailBody.querySelectorAll(".tabs button");

    function showTab(tab, idx = 0) {
      const pics = s.photos[tab];
      tabs.forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
      if (!pics.length) {
        main.innerHTML = `<div class="no-photo">No interior photos on file yet.<a href="${mapsURL(s)}" target="_blank" rel="noopener">Browse the space on Google Maps</a></div>`;
        thumbs.innerHTML = "";
        return;
      }
      const credit = s.photos.credits?.[pics[idx]];
      main.innerHTML =
        `<img src="images/${pics[idx]}" alt="${tab === "space" ? "The space at" : "Food and drink at"} ${s.name}">` +
        (credit ? `<span class="credit">Photo: ${esc(credit)} via Google</span>` : "");
      thumbs.innerHTML =
        pics.length > 1
          ? pics.map((p, i) => `<button aria-current="${i === idx}" data-i="${i}" aria-label="Photo ${i + 1}"><img src="images/${p}" alt=""></button>`).join("")
          : "";
      thumbs.querySelectorAll("button").forEach((b) => (b.onclick = () => showTab(tab, +b.dataset.i)));
    }
    tabs.forEach((b) => (b.onclick = () => !b.disabled && showTab(b.dataset.tab)));
    if (!s.photos.space.length && s.photos.food.length) {
      // Make the absence of interior shots explicit, then show what we have.
      showTab("food");
    } else showTab(initialTab);

    const crowdEl = detailBody.querySelector("#crowd");
    const readEl = detailBody.querySelector("#crowd-read");
    const dayBtns = detailBody.querySelectorAll("#crowd-days button");
    function drawCrowd(day) {
      dayBtns.forEach((b) => b.setAttribute("aria-pressed", +b.dataset.day === day));
      const h = hoursOn(s, day);
      if (!h) {
        crowdEl.innerHTML = "";
        readEl.textContent = `Closed on ${DAYS[day]}.`;
        return;
      }
      const start = Math.max(6, Math.floor(h[0])), end = Math.min(24, Math.ceil(h[1]));
      let peak = 0;
      const cols = [];
      for (let t = start; t < end; t++) {
        const v = busyness(s, day, t + 0.5);
        peak = Math.max(peak, v);
        cols.push([t, v]);
      }
      const nowHour = Math.floor(state.hour);
      crowdEl.innerHTML = cols
        .map(([t, v], i) => {
          const cls = [v === 0 ? "closed" : "", v === peak && v > 0 ? "peak" : "", day === state.day && t === nowHour ? "now" : ""].join(" ");
          const lbl = i % 3 === 0 ? `<span class="lbl">${shortHour(t)}</span>` : "";
          return `<div class="col ${cls}" title="${fmtHour(t)}: ${busyLabel(v)}"><div class="bar" style="height:${Math.max(v, 2)}%"></div>${lbl}</div>`;
        })
        .join("");
      const isNowDay = day === state.day && isOpen(s, day, state.hour);
      const nowText = isNowDay ? `At ${fmtHour(nowHour)}: ${busyLabel(busyness(s, day, state.hour)).toLowerCase()}. ` : "";
      readEl.textContent = `${nowText}Peak on ${DAYS[day]}s is around ${peakWindow(s, day)}.`;
    }
    dayBtns.forEach((b) => (b.onclick = () => drawCrowd(+b.dataset.day)));
    drawCrowd(state.day);
  }

  // ---------- Controls ----------
  const sortEl = document.getElementById("sort");
  const dayEl = document.getElementById("when-day");
  const hourEl = document.getElementById("when-hour");

  const today = new Date().getDay();
  dayEl.innerHTML = DAYS.map((d, i) => `<option value="${i}">${i === today ? "Today" : d}</option>`).join("");
  hourEl.innerHTML =
    `<option value="now">Now</option>` +
    Array.from({ length: 19 }, (_, i) => i + 6).map((h) => `<option value="${h}">${fmtHour(h)}</option>`).join("");
  dayEl.value = String(today);

  dayEl.onchange = () => {
    state.day = +dayEl.value;
    if (hourEl.value === "now" && state.day !== today) (hourEl.value = "9"), (state.hour = 9.5);
    renderList();
  };
  hourEl.onchange = () => {
    if (hourEl.value === "now") {
      const n = new Date();
      state.day = n.getDay();
      dayEl.value = String(state.day);
      state.hour = n.getHours() + n.getMinutes() / 60;
    } else state.hour = +hourEl.value + 0.5;
    renderList();
  };

  sortEl.onchange = () => {
    if (sortEl.value === "distance" && !state.userPos) {
      if (!navigator.geolocation) return (sortEl.value = state.sort);
      countEl.textContent = "Finding your location…";
      navigator.geolocation.getCurrentPosition(
        (p) => {
          state.userPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          state.sort = "distance";
          if (map) L.circleMarker([state.userPos.lat, state.userPos.lng], { radius: 6, color: "#9a7442", fillOpacity: 1 }).addTo(map);
          renderList();
        },
        () => {
          sortEl.value = state.sort;
          renderList();
          countEl.textContent = "Location unavailable — showing previous sort.";
        }
      );
      return;
    }
    state.sort = sortEl.value;
    renderList();
  };

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
    chip.onclick = () => {
      const f = chip.dataset.filter;
      state.filters.has(f) ? state.filters.delete(f) : state.filters.add(f);
      chip.setAttribute("aria-pressed", state.filters.has(f));
      renderList();
    };
  });

  const layout = document.querySelector(".layout");
  document.querySelectorAll(".view-toggle button").forEach((b) => {
    b.onclick = () => {
      state.view = b.dataset.view;
      layout.dataset.view = state.view;
      document.querySelectorAll(".view-toggle button").forEach((x) => x.setAttribute("aria-selected", x === b));
      if (state.view === "map" && map) setTimeout(() => map.invalidateSize(), 50);
    };
  });

  // ---------- Live Google data ----------
  // With a browser key in config.js, ratings, review counts and hours come from Google on
  // each visit (kept for 30 minutes per browser tab); otherwise the values in data.js are used.
  const LIVE_TTL = 30 * 60 * 1000;

  function googleHours(periods) {
    const days = [null, null, null, null, null, null, null];
    periods.forEach(({ open: o, close: c }) => {
      if (!c) return (days[o.day] = [0, 24]);
      const start = o.hour + o.minute / 60;
      const end = c.hour + c.minute / 60 + (c.day !== o.day ? 24 : 0);
      days[o.day] = [start, end];
    });
    return days;
  }

  async function loadLive() {
    const key = window.GOOGLE_BROWSER_KEY;
    if (!key) return;
    let cache = null;
    try { cache = JSON.parse(sessionStorage.getItem("live-google")); } catch {}
    if (!cache || Date.now() - cache.t > LIVE_TTL) {
      const results = await Promise.all(
        SHOPS.map((s) =>
          fetch(`https://places.googleapis.com/v1/places/${s.placeId}`, {
            headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,regularOpeningHours" },
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      if (!results.some(Boolean)) return;
      cache = { t: Date.now(), data: Object.fromEntries(SHOPS.map((s, i) => [s.id, results[i]])) };
      try { sessionStorage.setItem("live-google", JSON.stringify(cache)); } catch {}
    }
    SHOPS.forEach((s) => {
      const d = cache.data[s.id];
      if (!d) return;
      if (d.rating) s.rating = d.rating;
      if (d.userRatingCount) s.reviews = d.userRatingCount;
      if (d.regularOpeningHours?.periods) s.hours = googleHours(d.regularOpeningHours.periods);
      const pin = markers[s.id]?.getElement()?.querySelector(".pin");
      if (pin) pin.textContent = s.rating.toFixed(1);
    });
    renderList();
  }

  initMap();
  renderList();
  loadLive();
})();
