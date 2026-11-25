/* Genesis Ministry story pages: the front door, the journey and the template gallery.
   Theme, the phone menu, the demo church and plan that every platform link carries,
   the assistant's name, and the calm step highlight on the journey diagrams.
   Nothing is fetched and nothing is sent. */
(function () {
  "use strict";

  /* The church edition's AI employee. Rename here and every story page follows. */
  var ASSISTANT = "Hope";
  /* Where Book a Call goes: the church consultation on geai.us, as a walkthrough of the demo. */
  var GENESIS_CONTACT_URL = "/contact?topic=ministry-demo";

  var D = window.GM_DATA || {};
  var FALLBACK = [
    { slug: "bright-modern", name: "Lightwell Church", short: "Lightwell", city: "Raleigh", state: "NC", look: "Bright and Modern", leadPastor: "Pastor Theo" },
    { slug: "bold-dark", name: "Lampstand Church", short: "Lampstand", city: "Columbus", state: "OH", look: "Bold and Dark", leadPastor: "Pastor Andre" },
    { slug: "classic-timeless", name: "Calder Hill Chapel", short: "Calder Hill", city: "Richmond", state: "VA", look: "Classic and Timeless", leadPastor: "Pastor Samuel" },
    { slug: "warm-community", name: "Goldenrod Commons Church", short: "Goldenrod Commons", city: "Des Moines", state: "IA", look: "Warm Community", leadPastor: "Pastor Marcus" }
  ];
  var CHURCHES = (D.churches && D.churches.length) ? D.churches : FALLBACK;
  var DEFAULT_CHURCH = D.defaultChurch || "bright-modern";
  var DEFAULT_PLAN = D.defaultPlan || 3;

  var params = new URLSearchParams(location.search);
  function sGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function lGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function bySlug(s) { for (var i = 0; i < CHURCHES.length; i++) if (CHURCHES[i].slug === s) return CHURCHES[i]; return null; }

  var church = bySlug(params.get("church")) || bySlug(sGet("gm.church")) || bySlug(DEFAULT_CHURCH) || CHURCHES[0];
  var plan = parseInt(params.get("plan") || sGet("gm.plan") || DEFAULT_PLAN, 10);
  if (!(plan >= 1 && plan <= 3)) plan = DEFAULT_PLAN;
  sSet("gm.church", church.slug);
  sSet("gm.plan", String(plan));

  var root = document.documentElement;

  /* The public copy has no presenter mode. */
  var present = false;
  root.removeAttribute("data-present");

  var STORY = window.STORY = { assistant: ASSISTANT, church: church, plan: plan, churches: CHURCHES, present: present, contact: GENESIS_CONTACT_URL };

  /* ------------------------------------------------------------------ theme */
  function theme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    root.style.backgroundColor = t === "light" ? "#faf7f2" : "#08090e";
    lSet("gm.theme", t);
    document.querySelectorAll("[data-story-theme]").forEach(function (b) {
      b.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
      b.setAttribute("title", t === "light" ? "Dark theme" : "Light theme");
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#faf7f2" : "#08090e");
  }
  setTheme(theme());

  /* ------------------------------------------------------------------ text */
  function fillText() {
    document.querySelectorAll("[data-an]").forEach(function (el) { el.textContent = ASSISTANT; });
    document.querySelectorAll("[data-church]").forEach(function (el) {
      var k = el.getAttribute("data-church");
      var v = k === "place" ? church.city + ", " + church.state : church[k];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-plan-text]").forEach(function (el) { el.textContent = ["Care","Shepherd","Plus"][plan - 1]; });
  }

  /* ------------------------------------------------------------------ links and images */
  /* Platform links carry the demo church and plan, the way the app's own links do.
     A link that names its own plan keeps it. */
  function withParams(href, setPlan) {
    var hash = "", q = "", path = href;
    var h = path.indexOf("#"); if (h >= 0) { hash = path.slice(h); path = path.slice(0, h); }
    var i = path.indexOf("?"); if (i >= 0) { q = path.slice(i + 1); path = path.slice(0, i); }
    var sp = new URLSearchParams(q);
    sp.set("church", church.slug);
    if (setPlan || !sp.has("plan")) sp.set("plan", sp.get("plan") || String(plan));
    return path + "?" + sp.toString() + hash;
  }
  function paintLinks() {
    document.querySelectorAll("a[data-carry]").forEach(function (a) {
      var base = a.getAttribute("data-href") || a.getAttribute("href");
      if (!a.getAttribute("data-href")) a.setAttribute("data-href", base);
      a.setAttribute("href", withParams(base));
    });
    document.querySelectorAll("a[data-contact]").forEach(function (a) { a.setAttribute("href", GENESIS_CONTACT_URL); });
    document.querySelectorAll("a[data-site]").forEach(function (a) {
      a.setAttribute("href", a.getAttribute("data-site").replace("{slug}", church.slug));
    });
    document.querySelectorAll("img[data-src-pattern]").forEach(function (img) {
      var src = img.getAttribute("data-src-pattern").replace("{slug}", church.slug);
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      var alt = img.getAttribute("data-alt-pattern");
      if (alt) img.setAttribute("alt", alt.replace("{name}", church.name).replace("{pastor}", church.leadPastor || "the lead pastor"));
    });
    document.querySelectorAll("[data-slug-current]").forEach(function (el) {
      el.classList.toggle("is-current", el.getAttribute("data-slug-current") === church.slug);
    });
  }

  /* ------------------------------------------------------------------ the demo church switcher */
  function paintSwitcher() {
    document.querySelectorAll("[data-tenant]").forEach(function (b) {
      var on = b.getAttribute("data-tenant") === church.slug;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
  }
  function choose(slug, focus) {
    var c = bySlug(slug); if (!c) return;
    church = STORY.church = c;
    sSet("gm.church", c.slug);
    try {
      var sp = new URLSearchParams(location.search); sp.set("church", c.slug);
      history.replaceState(null, "", location.pathname + "?" + sp.toString() + location.hash);
    } catch (e) {}
    fillText(); paintLinks(); paintSwitcher();
    if (focus) { var b = document.querySelector('[data-tenant="' + c.slug + '"]'); if (b) b.focus(); }
    var live = document.getElementById("tenant-live");
    if (live) live.textContent = "Showing the demo as " + c.name + ".";
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tenant]");
    if (t) { choose(t.getAttribute("data-tenant")); return; }
    if (e.target.closest("[data-story-theme]")) { setTheme(theme() === "dark" ? "light" : "dark"); return; }
    var m = e.target.closest("[data-story-menu]");
    if (m) { setMenu(m.getAttribute("aria-expanded") !== "true"); return; }
    if (e.target.closest("#story-menu a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target.closest && e.target.closest("[data-tenant]");
    if (t && /^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
      e.preventDefault();
      var all = Array.prototype.slice.call(document.querySelectorAll("[data-tenant]"));
      var i = all.indexOf(t) + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1);
      i = (i + all.length) % all.length;
      choose(all[i].getAttribute("data-tenant"), true);
    }
    if (e.key === "Escape") {
      /* Escape closes the menu and gives focus back to its toggle, never to the page under it. */
      var mb = document.querySelector("[data-story-menu]"), mm = document.getElementById("story-menu");
      var was = mm && !mm.hidden && (mm.contains(document.activeElement) || document.activeElement === mb);
      setMenu(false);
      if (was && mb) mb.focus();
    }
    if (e.key === "Tab") menuTab(e);
  });

  /* ------------------------------------------------------------------ the phone menu */
  function setMenu(open) {
    var btn = document.querySelector("[data-story-menu]");
    var menu = document.getElementById("story-menu");
    if (!btn || !menu) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  /* While the menu is open, Tab stays with the toggle and the menu's links, as the four church sites'
     menus do, so focus never moves under the open panel (WCAG 2.4.11). */
  function menuTab(e) {
    var btn = document.querySelector("[data-story-menu]");
    var menu = document.getElementById("story-menu");
    if (!btn || !menu || menu.hidden) return;
    var items = [btn].concat([].filter.call(menu.querySelectorAll("a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex='-1'])"), function (n) { return n.offsetParent !== null; }));
    var i = items.indexOf(document.activeElement);
    if (i < 0) { e.preventDefault(); items[0].focus(); return; }
    var to = e.shiftKey ? (i === 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
    e.preventDefault();
    items[to].focus();
  }
  window.addEventListener("resize", function () { if (innerWidth > 920) setMenu(false); });

  /* ------------------------------------------------------------------ diagram steps */
  /* Every diagram is complete at rest. As the reader scrolls through one, its steps
     take a gold edge in order. A wide diagram on a phone opens at its start and stays
     where the reader puts it; Follow the Path (under it) pans it to each step as it
     lights, until the reader pans it by hand. Reduced motion: no highlight. */
  var reduce = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var diagrams = [];
  function setupDiagrams() {
    document.querySelectorAll("[data-steps]").forEach(function (d) {
      var scroller = d.closest(".dg-scroll");
      var rec = { el: d, n: +d.getAttribute("data-steps"), now: -1, scroller: scroller, follow: false, btn: null };
      if (scroller && d.getAttribute("data-pan") !== "off") {
        var foot = scroller.parentNode && scroller.parentNode.querySelector(".dg-foot");
        if (foot) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "dg-follow"; b.setAttribute("aria-pressed", "false");
          b.textContent = "Follow the Path";
          b.addEventListener("click", function () { setFollow(rec, !rec.follow); if (rec.follow) pan(rec); });
          foot.appendChild(b);
          rec.btn = b;
        }
        ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
          scroller.addEventListener(ev, function () { setFollow(rec, false); }, { passive: true });
        });
        scroller.addEventListener("keydown", function (e) { if (/^Arrow|^Home$|^End$|^Page/.test(e.key)) setFollow(rec, false); });
      }
      diagrams.push(rec);
    });
  }
  function setFollow(rec, on) {
    rec.follow = !!on;
    if (rec.btn) rec.btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  function pan(rec) {
    if (!rec.scroller || rec.scroller.scrollWidth <= rec.scroller.clientWidth + 4) return;
    var cur = rec.el.querySelector('.is-now[data-step][data-x]') || rec.el.querySelector(".is-now[data-step]");
    if (!cur) return;
    var x = +(cur.getAttribute("data-x") || 0);
    var vb = rec.el.viewBox && rec.el.viewBox.baseVal;
    var scale = vb && vb.width ? rec.el.getBoundingClientRect().width / vb.width : 1;
    var target = Math.max(0, x * scale - rec.scroller.clientWidth * 0.3);
    rec.scroller.scrollTo({ left: target, behavior: reduce.matches ? "auto" : "smooth" });
  }
  function light(rec, now) {
    if (rec.now === now) return;
    rec.now = now;
    rec.el.querySelectorAll("[data-step]").forEach(function (n) {
      var s = +n.getAttribute("data-step");
      n.classList.toggle("is-lit", now > 0 && s <= now);
      n.classList.toggle("is-now", now > 0 && s === now);
    });
    if (now > 0 && rec.follow) pan(rec);
  }
  var raf = 0;
  function tick() {
    raf = 0;
    var vh = innerHeight;
    diagrams.forEach(function (rec) {
      if (reduce.matches) { light(rec, 0); return; }
      var r = rec.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { return; }
      var start = vh * 0.8;
      var span = Math.max(240, r.height * 0.7 + vh * 0.25);
      var p = (start - r.top) / span;
      p = Math.max(0, Math.min(1, p));
      var now = p <= 0 ? 0 : Math.min(rec.n, 1 + Math.floor(p * rec.n));
      light(rec, now);
    });
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(tick); }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    fillText();
    paintLinks();
    paintSwitcher();
    setupDiagrams();
    if (diagrams.length) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      if (reduce.addEventListener) reduce.addEventListener("change", schedule);
      schedule();
    }
  }
  STORY.url = withParams;
  STORY.choose = choose;
  /* The Hope circle shows on a phone once the first screen is passed (story.css), or while a tour runs. */
  function pastHero() { document.documentElement.classList.toggle("gm-past-hero", window.scrollY > window.innerHeight * 0.5 || document.documentElement.classList.contains("hd-tour-on")); }
  window.addEventListener("scroll", pastHero, { passive: true });
  window.addEventListener("resize", pastHero);
  pastHero();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
