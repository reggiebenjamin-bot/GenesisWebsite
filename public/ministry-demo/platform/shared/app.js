/* Genesis Ministry design preview: the Genesis OS shell and shared helpers (window.GM).
   Load order at the end of <body>: shared/data.js, shared/charts.js, shared/app.js, then the page script.

   Church and Genesis pages get the real Genesis OS shell (the markup and class names of
   v2/app.js and v2/shell.js, styled by the copied stylesheets in shared/os/): the 215px
   sidebar, Jump to (Ctrl K), one gold action, WORK / ASSISTANT / INTELLIGENCE, the account
   row, the optional second-level column, the phone top bar and menu sheet, the sample strip,
   the floating orb and the Hope dock. Member pages get the church-branded phone.

   The page declares itself on <body>:
     data-side    "church" | "member" | "genesis"
     data-page    the nav key that is current (see NAV below; a view key also works)
     data-module  optional plan module key (D.modules). Defaults to the nav item's module.
     data-title   optional short title, used in the browser tab
     data-locked  "custom" when the page draws its own locked state (ctx.locked tells it)
     data-tabbar  "off" on member pages without the bottom tabs (sign in, welcome)
     data-viewer  optional staff id to view as (defaults: s-lead on church, g-victor on genesis)
   and keeps its content in <main id="v2-main" class="v2-main"> (older pages: id="gm-main";
   member pages: class="m-main").

   State: ?church=<slug> and ?plan=1|2|3 live in the URL and in sessionStorage, and every
   link to a platform page carries them forward. Theme lives in localStorage ("gm.theme"). */
(function () {
  "use strict";

  /* The assistant's name in this edition. Rename it here and every label follows. */
  var ASSISTANT = { name: "Hope" };

  var D = window.GM_DATA;
  var GM = window.GM = window.GM || {};
  /* Reports a demo event to the page's tag manager or gtag, if one is loaded, and does nothing
     otherwise (the analytics provider is the owner's choice). Never breaks the page. */
  GM.track = function (event, props) {
    try {
      var p = {}; for (var k in (props || {})) p[k] = props[k];
      if (Array.isArray(window.dataLayer)) { var row = { event: event }; for (var j in p) row[j] = p[j]; window.dataLayer.push(row); }
      if (typeof window.gtag === "function") window.gtag("event", event, p);
    } catch (e) {}
  };
  var body = document.body;
  var html = document.documentElement;
  GM.assistant = ASSISTANT;

  /* Where this file lives, so shared assets resolve from any page depth. */
  var SHARED = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (!s) { var all = document.getElementsByTagName("script"); for (var i = all.length - 1; i >= 0; i--) if (/shared\/app\.js/.test(all[i].src)) { s = all[i].src; break; } }
    return s ? s.replace(/app\.js(?:[?#].*)?$/, "") : "shared/";
  })();
  var OS = SHARED + "os/";
  var MARK = SHARED + "brand/genesis-mark.svg";
  var MARK_LIGHT = SHARED + "brand/genesis-mark-light.svg";

  /* ------------------------------------------------------------------ storage */
  function sGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function lGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ------------------------------------------------------------------ state */
  var params = new URLSearchParams(location.search);
  var churchSlug = params.get("church") || sGet("gm.church") || D.defaultChurch;
  if (!D.churches.some(function (c) { return c.slug === churchSlug; })) churchSlug = D.defaultChurch;
  var plan = parseInt(params.get("plan") || sGet("gm.plan") || D.defaultPlan, 10);
  if (!(plan >= 1 && plan <= 3)) plan = D.defaultPlan;
  sSet("gm.church", churchSlug);
  sSet("gm.plan", String(plan));
  var themeParam = params.get("theme");
  if (themeParam === "light" || themeParam === "dark") lSet("gm.theme", themeParam);
  /* The public copy has no presenter mode. */
  GM.presenting = false;
  /* The church-side plans view: the overview's plans. */
  var LEVELS_HREF = "index.html#levels";
  GM.levelsHref = LEVELS_HREF;

  GM.data = D;
  GM.params = params;
  GM.church = D.churches.filter(function (c) { return c.slug === churchSlug; })[0];
  GM.plan = plan;
  /* The gifts conversation comes with Plus, so below Plus Kwame's message does not mention a gifts result. */
  if (plan < 3) (D.threads || []).forEach(function (t) { if (t.id === "t-02" && t.messages && t.messages[0]) t.messages[0].text = "I would like to help with setup on Sundays. Who do I talk to?"; });
  GM.side = body.getAttribute("data-side") || "church";
  GM.page = body.getAttribute("data-page") || "";
  GM.now = parseDate(D.now);

  /* Keep the address shareable: church and plan in the URL, theme param dropped. */
  (function () {
    var p = new URLSearchParams(location.search);
    var changed = false;
    if (p.get("church") !== churchSlug) { p.set("church", churchSlug); changed = true; }
    if (p.get("plan") !== String(plan)) { p.set("plan", String(plan)); changed = true; }
    if (p.has("theme")) { p.delete("theme"); changed = true; }
    if (p.has("desk")) { p.delete("desk"); changed = true; }
    if (p.has("present")) { p.delete("present"); changed = true; }
    if (changed && history.replaceState) {
      try { history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash); } catch (e) {}
    }
  })();

  /* ------------------------------------------------------------------ basics */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  GM.esc = esc;

  function parseDate(s) {
    if (!s) return null;
    if (s instanceof Date) return s;
    var m = String(s).match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return new Date(s);
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  }
  GM.parseDate = parseDate;

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dayDiff(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }

  GM.fmt = {
    date: function (s) { var d = parseDate(s); if (!d) return ""; return MONTHS[d.getMonth()].slice(0, 3) + " " + d.getDate() + (d.getFullYear() !== GM.now.getFullYear() ? ", " + d.getFullYear() : ""); },
    dateLong: function (s) { var d = parseDate(s); return d ? MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() : ""; },
    day: function (s) { var d = parseDate(s || GM.now); return DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate(); },
    weekday: function (s) { var d = parseDate(s); return d ? DAYS[d.getDay()].slice(0, 3) : ""; },
    weekdayLong: function (s) { var d = parseDate(s); return d ? DAYS[d.getDay()] : ""; },
    time: function (s) { var d = parseDate(s); if (!d) return ""; var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM"); },
    when: function (s) {
      var d = parseDate(s), diff = dayDiff(GM.now, d);
      if (diff === 0) return "Today, " + GM.fmt.time(s);
      if (diff === 1) return "Yesterday, " + GM.fmt.time(s);
      if (diff > 1 && diff < 7) return DAYS[d.getDay()].slice(0, 3) + ", " + GM.fmt.time(s);
      return GM.fmt.date(s);
    },
    ago: function (s) {
      var d = parseDate(s), mins = Math.round((GM.now - d) / 60000);
      if (mins < 60) return mins <= 1 ? "just now" : mins + " minutes ago";
      var hrs = Math.round(mins / 60);
      if (hrs < 24) return hrs === 1 ? "1 hour ago" : hrs + " hours ago";
      var days = dayDiff(GM.now, d);
      return days === 1 ? "1 day ago" : days + " days ago";
    },
    waiting: function (s) {
      var d = parseDate(s), hrs = (GM.now - d) / 3600000;
      if (hrs < 24) return "Waiting " + Math.max(1, Math.round(hrs)) + (Math.round(hrs) === 1 ? " hour" : " hours");
      var days = Math.floor(hrs / 24);
      return "Waiting " + days + (days === 1 ? " day" : " days");
    },
    due: function (s) {
      if (!s) return { text: "No date", tone: "neutral", days: null };
      var diff = dayDiff(parseDate(s), GM.now);
      if (diff < 0) return { text: (-diff) + (diff === -1 ? " day" : " days") + " overdue", tone: "danger", days: diff };
      if (diff === 0) return { text: "Due today", tone: "warning", days: 0 };
      if (diff === 1) return { text: "Due tomorrow", tone: "neutral", days: 1 };
      if (diff < 7) return { text: "Due " + GM.fmt.weekday(s), tone: "neutral", days: diff };
      return { text: "Due " + GM.fmt.date(s), tone: "neutral", days: diff };
    },
    count: function (n) { return n >= 1 && n <= 4 ? "fewer than 5" : String(n); },
    plural: function (n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  };
  /* "Good morning" at the demo clock. */
  GM.greeting = function () { var h = GM.now.getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  /* ------------------------------------------------------------------ lookups */
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  GM.person = function (id) { var p = byId(D.people, id); if (p && !p.first) p.first = p.name.split(" ")[0]; return p; };
  GM.staff = function (id) {
    var s = byId(D.staff, id);
    if (!s) return null;
    var out = {}; for (var k in s) out[k] = s[k];
    if (s.pastorSlot != null) {
      var first = GM.church.pastors[s.pastorSlot];
      out.name = "Pastor " + first; out.first = first; out.initials = first.charAt(0);
    } else out.first = s.name.split(" ")[0];
    return out;
  };
  GM.team = function (id) { var t = byId(D.genesisTeam, id); if (t && !t.first) t.first = t.name.split(" ")[0]; return t; };
  GM.who = function (id) {
    if (!id) return null;
    if (id === "system") return { id: "system", name: "System", initials: "S", role: "Automatic", tone: 6 };
    if (id === "member") return null;
    if (id.indexOf("s-") === 0) return GM.staff(id);
    if (id.indexOf("p-") === 0) return GM.person(id);
    if (id.indexOf("g-") === 0) return GM.team(id);
    return null;
  };
  GM.guest = function (id) { return byId(D.guests, id); };
  GM.guestByPerson = function (pid) { for (var i = 0; i < D.guests.length; i++) if (D.guests[i].personId === pid) return D.guests[i]; return null; };
  GM.thread = function (id) { return byId(D.threads, id); };
  GM.prayerRequest = function (id) { return byId(D.prayer, id); };
  GM.draftById = function (id) { return byId(D.drafts.concat(D.genesisDrafts), id); };
  GM.deal = function (id) { return byId(D.sales.deals, id); };
  GM.gift = function (key) { for (var i = 0; i < D.gifts.list.length; i++) if (D.gifts.list[i].key === key) return D.gifts.list[i]; return null; };
  GM.churchBySlug = function (slug) { for (var i = 0; i < D.churches.length; i++) if (D.churches[i].slug === slug) return D.churches[i]; return null; };
  GM.stage = function (key) { var all = D.guestStages.concat(D.sales.stages, D.sales.afterStages); for (var i = 0; i < all.length; i++) if (all[i].key === key) return all[i]; return { key: key, label: key }; };
  GM.level = function (n) { return D.levels[(n || GM.plan) - 1]; };
  GM.viewer = function () {
    var id = body.getAttribute("data-viewer") || (GM.side === "genesis" ? D.viewer.genesis : D.viewer.church);
    return GM.who(id);
  };
  GM.member = function () { return GM.person(D.memberId); };

  /* Care waiting on us: prayer and threads, oldest first. */
  GM.waitingCare = function () {
    var items = [];
    D.prayer.forEach(function (p) { if (p.waitingOnUs) items.push({ type: "prayer", id: p.id, personId: p.personId, since: p.received, owner: p.owner, visibility: p.visibility, label: p.topic, item: p }); });
    D.threads.forEach(function (t) { if (t.status === "waiting-on-us") items.push({ type: "thread", id: t.id, personId: t.personId, since: t.started, owner: t.owner, visibility: t.kind === "private" ? "pastors" : "staff", label: t.subject, item: t }); });
    return items.sort(function (a, b) { return parseDate(a.since) - parseDate(b.since); });
  };
  /* Guest follow-ups due today or overdue, most overdue first. */
  GM.dueFollowUps = function () {
    return D.guests.filter(function (g) { return g.due && dayDiff(parseDate(g.due), GM.now) <= 0; })
      .sort(function (a, b) { return parseDate(a.due) - parseDate(b.due); });
  };

  /* ------------------------------------------------------------------ text fill */
  GM.fill = function (s) {
    var c = GM.church, lv = GM.level(), v = GM.viewer() || {}, m = GM.member() || {};
    var map = {
      "church.name": c.name, "church.short": c.short, "church.city": c.city, "church.state": c.state,
      "church.leadPastor": c.leadPastor, "church.carePastor": c.carePastor, "church.email": c.email,
      "church.phone": c.phone, "church.times": c.times, "church.look": c.look, "church.size": c.size,
      "church.kidsCheckIn": c.kidsCheckIn, "church.visitGathering": c.visitGathering,
      "church.welcomeSpot": c.welcomeSpot, "church.parking": c.parking, "church.baptism": c.baptism,
      "church.shortPoss": GM.poss(c.short), "church.namePoss": GM.poss(c.name),
      "plan.code": lv.code, "plan.name": lv.name, "plan.n": String(lv.n),
      "viewer.name": v.name, "viewer.first": v.first, "viewer.role": v.role,
      "member.name": m.name, "member.first": m.first, "assistant.name": ASSISTANT.name
    };
    return String(s == null ? "" : s).replace(/\{([a-zA-Z.]+)\}/g, function (all, key) { return map[key] != null ? map[key] : all; });
  };
  /* "Goldenrod Commons'" and "Lightwell's": a name that ends in s takes an apostrophe only. */
  GM.poss = function (n) { n = String(n == null ? "" : n); return /s$/i.test(n) ? n + "'" : n + "'s"; };
  /* The sample data is shared by the four churches. Its church placeholders (kids check-in, the
     gathering a guest comes to, the church's name) are filled once here, so a page that prints a
     note, a message or a draft as it is still shows the selected church's own facts. */
  (function fillData() {
    var c = GM.church;
    var map = { name: c.name, short: c.short, city: c.city, state: c.state, leadPastor: c.leadPastor, carePastor: c.carePastor, email: c.email, phone: c.phone, times: c.times, kidsCheckIn: c.kidsCheckIn, visitGathering: c.visitGathering };
    map.welcomeSpot = c.welcomeSpot; map.parking = c.parking;
    function f(v) {
      if (typeof v !== "string" || v.indexOf("{") < 0) return v;
      return v.replace(/\{church\.([a-zA-Z]+)\}/g, function (all, k) { return map[k] != null ? map[k] : all; }).replace(/\{assistant\.name\}/g, ASSISTANT.name);
    }
    (D.guests || []).forEach(function (g) { g.note = f(g.note); g.next = f(g.next); });
    (D.threads || []).forEach(function (t) { t.subject = f(t.subject); (t.messages || []).forEach(function (m) { m.text = f(m.text); }); });
    (D.prayer || []).forEach(function (p) { p.text = f(p.text); (p.replies || []).forEach(function (r) { r.text = f(r.text); }); });
    (D.drafts || []).forEach(function (d) { d.subject = f(d.subject); d.body = f(d.body); d.why = f(d.why); });
  })();
  /* A guest source inside a sentence: "a Plan a Visit form", "a Hope conversation", "the newsletter". */
  GM.sourceText = function (src) {
    var map = { "Plan a Visit form": "a Plan a Visit form", "Hope conversation": "a " + ASSISTANT.name + " conversation", "Connect card": "a connect card", "Event sign-up": "an event sign-up", "Newsletter": "the newsletter" };
    return map[src] || String(src).charAt(0).toLowerCase() + String(src).slice(1);
  };
  /* A guest source as an option or filter label, in Title Case as Genesis OS writes options:
     "Plan a Visit Form", "Hope Conversation", "Event Sign-Up". Badges keep the sentence case value. */
  var SMALL_WORDS = /^(a|an|and|as|at|by|for|in|of|on|or|the|to)$/i;
  function titleSource(src) {
    return String(src == null ? "" : src).split(" ").map(function (w, i) {
      if (i > 0 && SMALL_WORDS.test(w)) return w.toLowerCase();
      return w.split("-").map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join("-");
    }).join(" ");
  }
  GM.sourceLabel = titleSource;
  function applyText(rootEl) {
    (rootEl || document).querySelectorAll("[data-gm-text]").forEach(function (n) {
      n.textContent = GM.fill("{" + n.getAttribute("data-gm-text") + "}");
    });
  }
  GM.applyText = applyText;

  /* ------------------------------------------------------------------ links */
  var PAGE_RE = /^(?:\.\/)?[a-z0-9-]+\.html(?:[?#].*)?$/i;
  GM.url = function (href, extra) {
    if (!href || !PAGE_RE.test(href)) return href;
    var hash = "", q = "", path = href;
    var hi = path.indexOf("#"); if (hi >= 0) { hash = path.slice(hi); path = path.slice(0, hi); }
    var qi = path.indexOf("?"); if (qi >= 0) { q = path.slice(qi + 1); path = path.slice(0, qi); }
    var p = new URLSearchParams(q);
    if (!p.has("church")) p.set("church", churchSlug);
    if (!p.has("plan")) p.set("plan", String(plan));
    /* A guided demo run keeps its pace on every link and every
       address a page rewrites (Care rewrites its own when the tour opens Sarah's request). */
    var cur = new URLSearchParams(location.search);
    ["from", "pace"].forEach(function (k) { var v = cur.get(k); if (v && !p.has(k)) p.set(k, v); });
    if (extra) for (var k in extra) p.set(k, extra[k]);
    return path + "?" + p.toString() + hash;
  };
  function carry(a) {
    var raw = a.getAttribute("href");
    if (raw && PAGE_RE.test(raw) && !a.hasAttribute("data-gm-carried")) {
      a.setAttribute("href", GM.url(raw));
      a.setAttribute("data-gm-carried", "");
    }
  }
  function carryAll(rootEl) { (rootEl || document).querySelectorAll("a[href]").forEach(carry); }
  GM.carryLinks = carryAll;
  GM.go = function (href) { location.href = GM.url(href); };
  function currentFile() { return location.pathname.split("/").pop() || "church-today.html"; }
  function sameWith(key, value) {
    var p = new URLSearchParams(location.search);
    p.set(key, value);
    return currentFile() + "?" + p.toString();
  }
  GM.sameWith = sameWith;

  /* ------------------------------------------------------------------ plan gating */
  GM.moduleLevel = function (key) { var m = D.modules[key]; return m ? m.level : 1; };
  GM.isIncluded = function (key, p) { return GM.moduleLevel(key) <= (p || GM.plan); };

  /* ------------------------------------------------------------------ icons */
  /* The first block is v2/app.js icon() verbatim; the rest are Ministry additions in the same 24px, 1.7 stroke style. */
  var ICONS = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    today: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/>',
    leads: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.7-3.3 2.5-5 5.5-5s4.8 1.7 5.5 5M16 8h5m-2.5-2.5v5"/>',
    deals: '<path d="M4 7h16v12H4zM8 7V4h8v3M4 12h16"/>',
    pipeline: '<path d="M5 4h4v16H5zM10 4h4v10h-4zM15 4h4v13h-4z"/>',
    content: '<path d="M4 5h16v14H4z"/><path d="M7 9h10M7 12h10M7 15h6"/>',
    "my-deals": '<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    outreach: '<path d="M20.5 3.5 3.5 10.2a.5.5 0 0 0 0 .95l6.3 2.2 2.2 6.3a.5.5 0 0 0 .95 0Z"/><path d="M20.5 3.5 9.8 13.35"/>',
    reports: '<path d="M5 20V10m7 10V4m7 16v-7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 13.5a7.4 7.4 0 0 0 0-3l2-1.5-2-3.4-2.5 1a7 7 0 0 0-2.5-1.5L13.7 2h-4L9 5.1a7 7 0 0 0-2.5 1.5l-2.5-1L2 9l2 1.5a7.4 7.4 0 0 0 0 3L2 15l2 3.4 2.5-1A7 7 0 0 0 9 18.9l.7 3.1h4l.8-3.1a7 7 0 0 0 2.5-1.5l2.5 1 2-3.4z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.5 2c-.9.5-1.3 1-1.3 2M12 17h.01"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
    agents: '<circle cx="9" cy="9" r="3.1"/><path d="M3.4 19.2a5.9 5.9 0 0 1 11.2 0"/><circle cx="17.4" cy="10.6" r="2.3"/><path d="M15.6 19.2a4.6 4.6 0 0 1 5.4-4.1"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    phone: '<path d="M7.2 3.8 10 8l-2.1 2a15 15 0 0 0 6.1 6.1l2-2.1 4.2 2.8-1.1 3.1c-.4 1-1.5 1.6-2.6 1.3C9.6 19.4 4.6 14.4 2.8 7.5c-.3-1.1.3-2.2 1.3-2.6z"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    external: '<path d="M14 5h5v5m0-5-8 8"/><path d="M19 14v5H5V5h5"/>',
    send: '<path d="m5 12 14-7-4 14-3-5-5-2z"/><path d="m12 14 2-3"/>',
    chevron: '<path d="m9 7 5 5-5 5"/>',
    note: '<path d="M5 4h14v13H9l-4 4z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
    message: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
    back: '<path d="m14 6-6 6 6 6M8 12h12"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    genesis: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="1.35"/><circle cx="18.1" cy="8.5" r="1.35"/><circle cx="18.1" cy="15.5" r="1.35"/><circle cx="12" cy="19" r="1.35"/><circle cx="5.9" cy="15.5" r="1.35"/><circle cx="5.9" cy="8.5" r="1.35"/><path d="M12 6.35v2.65m4.93.85-2.3 1.33m0 1.64 2.3 1.33M12 15v2.65m-4.93-2.5 2.3-1.33m0-1.64-2.3-1.33"/>',
    sidebar: '<path d="M4 5h16v14H4zM9 5v14M13 9l3 3-3 3"/>',
    command: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    /* Ministry additions */
    guests: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.7-3.3 2.5-5 5.5-5s4.8 1.7 5.5 5M16 8h5m-2.5-2.5v5"/>',
    care: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    people: '<circle cx="9" cy="9" r="3.1"/><path d="M3.4 19.2a5.9 5.9 0 0 1 11.2 0"/><circle cx="17.4" cy="10.6" r="2.3"/><path d="M15.6 19.2a4.6 4.6 0 0 1 5.4-4.1"/>',
    gifts: '<path d="M12 21v-9"/><path d="M12 12c0-4 2.5-7 7-7 0 4-2.5 7-7 7z"/><path d="M12 14c0-3-2-5.5-6-5.5 0 3 2 5.5 6 5.5z"/>',
    chart: '<path d="M4 4v16h16"/><path d="m7 15 4-4 3 3 5-6"/>',
    team: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16.5c.8-1.8 2.2-2.7 4-2.7s3.2.9 4 2.7"/>',
    access: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><circle cx="12" cy="11" r="2"/><path d="M12 13v3"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    device: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    call: '<path d="M7.2 3.8 10 8l-2.1 2a15 15 0 0 0 6.1 6.1l2-2.1 4.2 2.8-1.1 3.1c-.4 1-1.5 1.6-2.6 1.3C9.6 19.4 4.6 14.4 2.8 7.5c-.3-1.1.3-2.2 1.3-2.6z"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    brand: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><circle cx="12" cy="16" r="3"/>',
    find: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    report: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5V5h6V3.5"/><path d="m9 13 2 2 4-4"/>',
    accounts: '<path d="M4 7h16v12H4zM8 7V4h8v3M4 12h16"/>',
    onboarding: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>',
    levels: '<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>',
    prayer: '<path d="M12 3c-1 2.5-3 4-3 7a3 3 0 0 0 6 0c0-3-2-4.5-3-7z"/><path d="M8 21h8M12 13v8"/>',
    give: '<path d="M3 14h3l3.5 3H14a2 2 0 0 0 0-4h-3"/><path d="M6 14v6H3M14 13l4.5-2.2a1.8 1.8 0 0 1 1.6 3.2L14 18H9.5"/><path d="M15 3.5a2 2 0 0 1 2.8 2.8L15 9l-2.8-2.7a2 2 0 0 1 2.8-2.8z"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.9-3.8 3.4-5.8 7-5.8s6.1 2 7 5.8"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    upload: '<path d="M12 15V4m-4.5 4.5L12 4l4.5 4.5"/><path d="M5 14v5h14v-5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    "hide-rail": '<path d="M4 5h16v14H4zM9 5v14M16 9l-3 3 3 3"/>'
  };
  /* For page content: gm-icon sizes. For shell parts: the real .v2-icon. */
  GM.icon = function (name, cls) { return '<svg class="gm-icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.more) + "</svg>"; };
  function vIcon(name) { return '<svg class="v2-icon" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.more) + "</svg>"; }
  GM.v2Icon = vIcon;
  /* The Genesis G: the path of brand/gold-mark/mark-gold.svg, byte for byte. Its gradient stops take
     --gm-mark-a and --gm-mark-b (genesis.css), the kit's gold for the ground the G sits on. Each call
     gets its own gradient id, so a G never borrows a gradient from another one that is hidden. */
  var GOLD_D = "M762.252175,302.341551C760.43862,301.676536 760.2725,301.270614 758.847656,302.585006C754.150179,306.918342 753.697251,306.354657 747.246094,306.426853C714.525616,306.793034 714.618829,306.187009 681.854959,306.414353C674.82505,306.463133 483.621199,305.881603 479.383546,306.601672C473.858392,307.540515 477.681955,310.019182 478.367941,310.852663C472.977693,314.187875 340.553568,498.227089 306.846159,543.000588C302.109008,549.292938 305.542746,550.023433 314.363534,561.953801C322.146215,572.480099 409.916778,691.19229 411.405199,693.710987C412.659377,695.833298 411.630283,696.027282 394.479685,719.461417C310.353543,834.409206 311.753766,835.420499 303.989854,845.069476C302.113778,847.40106 301.458325,845.044587 283.769497,820.339521C135.905424,613.825455 90.064923,552.263697 88.449615,549.791244C86.437064,546.710753 100.464405,531.800989 115.066792,511.736839C124.521023,498.746422 147.820311,467.65924 150.684159,463.838138C248.678417,333.088846 375.47291,153.385278 380.367528,149.447094C380.837463,149.068986 380.944198,148.71839 561.620833,148.76195C871.601431,148.836685 872.549844,147.6464 873.377971,149.445109C874.341097,151.53704 780.043053,278.733523 762.252175,302.341551ZM480.410996,694.284995C730.190394,693.865845 731.468851,695.659749 734.189047,692.082979C736.143173,689.513508 792.649681,612.186608 812.208721,586.600316C815.489448,582.308611 815.006947,581.888456 814.915768,555.291037C814.913776,554.70995 814.892773,548.582929 813.608505,548.146017C811.796121,547.529438 479.167189,548.409195 478.506833,547.671594C477.174681,546.183613 494.760767,525.01189 511.354542,501.757251C516.402444,494.683084 516.502081,494.846046 575.705773,414.23741C580.984383,407.050332 582.724108,409.107547 596.42422,409.109117C967.967898,409.151672 968.304079,408.357376 969.784418,409.746823C970.786385,410.68727 970.852095,645.841004 969.748906,648.08478C968.140965,651.355172 899.246561,740.500077 893.065751,748.497646C857.309687,794.763681 858.298593,795.397887 822.755631,841.848229C818.009181,848.051264 815.547732,846.229811 803.143719,846.252615C768.312038,846.316651 368.86334,847.051018 367.747004,846.076916C366.861966,845.304642 367.773415,844.946666 416.613648,777.444269C433.470179,754.14675 433.659446,754.405018 450.462412,731.11323C451.706878,729.388186 462.836712,713.96033 466.081893,709.59624C476.144711,696.063849 475.719481,695.007788 480.410996,694.284995Z";
  var goldN = 0;
  GM.genesisMark = function (cls) { var id = "gm-gold-" + (++goldN); return '<svg class="gm-mark' + (cls ? " " + cls : "") + '" viewBox="84 144 891 707" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-482.416666,-391.32204,391.32204,-482.416666,950.916661,888.833322)"><stop class="a" offset="0" stop-color="#f1d898"/><stop class="b" offset="1" stop-color="#c8a562"/></linearGradient></defs><path fill="url(#' + id + ')" fill-rule="evenodd" d="' + GOLD_D + '"/></svg>'; };

  /* ------------------------------------------------------------------ small HTML helpers */
  GM.avatar = function (who, size) {
    if (typeof who === "string") who = GM.who(who) || { name: who, initials: who.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2), tone: 1 };
    if (!who) return "";
    return '<span class="gm-avatar' + (size ? " gm-avatar--" + size : "") + '" data-tone="' + (who.tone || 1) + '" aria-hidden="true">' + esc(who.initials || "") + "</span>";
  };
  /* Status: the real Genesis OS badge. Tones: gold, positive, warning, danger, info, neutral. */
  var BADGE_TONE = { gold: "priority", priority: "priority", positive: "positive", warning: "warning", danger: "danger", info: "info", neutral: "" };
  GM.pill = function (text, tone, opts) {
    opts = opts || {};
    var t = BADGE_TONE[tone || "neutral"];
    return '<span class="v2-badge' + (t ? " v2-badge-" + t : "") + '">' + (opts.icon ? GM.icon(opts.icon, "gm-icon--sm") : "") + esc(text) + "</span>";
  };
  GM.badge = GM.pill;
  GM.duePill = function (date) { var d = GM.fmt.due(date); return GM.pill(d.text, d.tone); };
  GM.lock = function (kind, text) {
    var label = text || (kind === "pastors" ? "Pastors only" : kind === "staff" ? "Staff" : "Pastors and prayer team");
    return '<span class="gm-lock' + (kind === "pastors" ? " gm-lock--pastors" : "") + '" title="Who can see this">' + GM.icon("lock") + esc(label) + "</span>";
  };

  /* Draft decisions persist for this browser tab, so approving on Today shows on the board. */
  var draftState = {};
  try { draftState = JSON.parse(sGet("gm.drafts") || "{}") || {}; } catch (e) { draftState = {}; }
  GM.draftStatus = function (id) { return draftState[id] || "waiting"; };
  function setDraftStatus(id, st) {
    draftState[id] = st; sSet("gm.drafts", JSON.stringify(draftState));
    document.querySelectorAll('.gm-draft[data-draft-id="' + id + '"]').forEach(function (n) { paintDraft(n, id); });
    updateDraftCounts();
    document.dispatchEvent(new CustomEvent("gm:draft", { detail: { id: id, status: st } }));
  }
  GM.setDraftStatus = setDraftStatus;
  GM.waitingDrafts = function (side) {
    var list = (side || GM.side) === "genesis" ? D.genesisDrafts : D.drafts;
    return list.filter(function (d) { return GM.draftStatus(d.id) === "waiting"; });
  };

  /* A labeled Hope draft that waits for a person. opts: { hideWhy } */
  GM.draft = function (d, opts) {
    opts = opts || {};
    if (typeof d === "string") d = GM.draftById(d);
    if (!d) return "";
    var to = GM.who(d.to);
    var meta = [];
    if (to) meta.push("To " + esc(to.name) + (d.channel ? " by " + esc(d.channel.toLowerCase()) : ""));
    if (!opts.hideWhy && d.why) meta.push("Why: " + esc(d.why));
    return '<section class="gm-draft" data-draft-id="' + esc(d.id) + '" aria-label="' + esc(ASSISTANT.name) + ' draft waiting for approval">' +
      '<div class="gm-draft-head"><span class="gm-draft-tag">' + GM.icon("genesis") + esc(ASSISTANT.name) + " draft</span>" +
      '<span class="gm-draft-status">' + GM.pill("Waiting for approval", "warning") + "</span></div>" +
      (meta.length ? '<p class="gm-draft-meta">' + meta.join(" · ") + "</p>" : "") +
      '<div class="gm-draft-body">' + (d.subject ? "<b>" + esc(GM.fill(d.subject)) + "</b>\n\n" : "") + esc(GM.fill(d.body)) + (d.footer ? '\n\n<span class="gm-draft-foot">' + esc(d.footer) + "</span>" : "") + "</div>" +
      '<div class="gm-draft-actions">' +
      '<button type="button" class="v2-button v2-button-primary" data-gm-action="approve-draft">' + vIcon("send") + "Approve and Send</button>" +
      '<button type="button" class="v2-button" data-gm-action="edit-draft">Edit</button>' +
      '<button type="button" class="v2-button v2-button-quiet" data-gm-action="dismiss-draft">Not Now</button></div>' +
      '<p class="gm-draft-note">Nothing goes out until a person approves it.</p></section>';
  };
  function paintDraft(n, id) {
    var st = GM.draftStatus(id);
    /* One gold action per screen: where a next-move panel holds the gold action, Approve and Send is outlined. */
    var approve = n.querySelector('[data-gm-action="approve-draft"]');
    if (approve) approve.classList.toggle("v2-button-primary", !document.querySelector(".v2-next-move:not([hidden]), .v2-outreach-next:not([hidden]), .v2-report-diagnostic"));
    n.classList.toggle("is-approved", st === "approved");
    n.classList.toggle("is-dismissed", st === "dismissed");
    var status = n.querySelector(".gm-draft-status"), actions = n.querySelector(".gm-draft-actions"), note = n.querySelector(".gm-draft-note");
    if (!status || !actions || !note) return;
    if (st === "approved") {
      status.innerHTML = GM.pill("Approved", "positive");
      actions.hidden = true;
      note.textContent = "Approved by " + ((GM.viewer() || {}).name || "you") + ". In the real product it sends now. This is a preview, so nothing was sent.";
    } else if (st === "dismissed") {
      status.innerHTML = GM.pill("Kept for later", "neutral");
      actions.hidden = true;
      note.textContent = "Kept for later. " + ASSISTANT.name + " will not send it.";
    }
  }
  function paintAllDrafts(rootEl) { (rootEl || document).querySelectorAll(".gm-draft[data-draft-id]").forEach(function (n) { paintDraft(n, n.getAttribute("data-draft-id")); }); }
  GM.paintDrafts = paintAllDrafts;
  function updateDraftCounts() {
    var n = GM.side === "church" && !GM.isIncluded("genesis") ? 0 : GM.waitingDrafts().length;
    document.querySelectorAll("[data-gm-draft-count]").forEach(function (c) { c.textContent = n; c.hidden = n === 0; });
    /* The orb's count is named, so a screen reader hears it and a mouse gets a tooltip. */
    document.querySelectorAll(".v2-genesis-opener").forEach(function (b) {
      var label = "Ask " + ASSISTANT.name + " about this screen" + (n ? ". " + n + (n === 1 ? " draft waits" : " drafts wait") + " for approval" : "");
      b.setAttribute("aria-label", label); b.setAttribute("title", label);
    });
  }

  /* The calm "Included in the Plus plan" card for a module outside the selected plan. */
  GM.lockedState = function (key, opts) {
    opts = opts || {};
    var m = D.modules[key] || { label: "This", level: 3, adds: "", points: [] };
    var lv = D.levels[m.level - 1], cur = GM.level();
    var target = sameWith("plan", String(m.level));
    /* A page can name its own picture (the Guest Report shows locked-guests-report-<slug>.jpg). */
    var thumb = opts.thumb || LOCKED_THUMB[key];
    return '<section class="v2-card gm-locked-card' + (thumb ? " has-thumb" : "") + '" aria-labelledby="gm-locked-' + esc(key) + '">' +
      '<div class="gm-locked-copy"><div class="gm-locked-icon">' + vIcon("lock") + "</div>" +
      '<div class="v2-eyebrow">Included in the ' + esc(lv.name) + " plan</div>" +
      '<h2 id="gm-locked-' + esc(key) + '">' + esc(opts.title || m.label) + "</h2>" +
      '<p class="gm-fold-note" style="font-size:13px;margin:6px 0 18px">' + esc(GM.fill(m.adds.replace(/\bHope\b/g, ASSISTANT.name))) + "</p>" +
      (m.points && m.points.length ? '<ul class="gm-checks">' + m.points.map(function (p) { return "<li>" + GM.icon("check") + "<span>" + esc(p.replace(/\bHope\b/g, ASSISTANT.name)) + "</span></li>"; }).join("") + "</ul>" : "") +
      '<div class="gm-locked-actions"><a class="' + (opts.quiet ? "v2-button" : "v2-button v2-button-primary") + '" href="' + esc(target) + '">Preview the ' + esc(lv.name) + " Plan</a>" +
      '<a class="v2-button' + (opts.quiet ? " v2-button-quiet" : "") + '" href="' + LEVELS_HREF + '">Compare Plans</a></div>' +
      '<p class="gm-locked-foot">This preview is showing the ' + esc(cur.name) + " plan, " + esc(cur.price) + ". The " + esc(lv.name) + " plan, " + esc(lv.price) + ", adds this view.</p></div>" +
      /* The picture is the selected church's own screen (locked-<module>-<slug>.jpg), so a pastor looking
         at Goldenrod never sees another church's name; the shared picture is the fallback. */
      (thumb ? '<figure class="gm-locked-thumb" aria-hidden="true"><img src="' + esc(SHARED + "previews/locked-" + thumb + "-" + GM.church.slug + ".jpg") + '" data-fallback="' + esc(SHARED + "previews/locked-" + thumb + ".jpg") + '" alt="" loading="lazy" decoding="async" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.removeAttribute(\'data-fallback\')}else{this.closest(\'figure\').remove()}"><figcaption>The ' + esc(lv.name) + " plan</figcaption></figure>" : "") +
      "</section>";
  };
  /* A dimmed picture of the real screen inside the locked card, so the calm state also shows what it adds. */
  var LOCKED_THUMB = { today: "today", guests: "guests", care: "care", people: "people", access: "access", gifts: "gifts", reports: "reports", team: "team", devotionals: "devotionals" };
  function lockedPage(key, item) {
    var m = D.modules[key] || { label: item ? item.label : "This" };
    var lv = D.levels[(m.level || 3) - 1];
    return '<div class="v2-page v2-page-narrow gm-locked-page"><header class="v2-page-head"><div><div class="v2-eyebrow">' + esc(item ? item.label : m.label) + " · " + esc(GM.church.short) + "</div><h1>" + esc(m.label) + "</h1><p>The " + esc(lv.name) + " plan adds this to " + esc(GM.church.name) + ".</p></div></header>" + GM.lockedState(key) + "</div>";
  }

  /* ------------------------------------------------------------------ toasts (the real .v2-toast) */
  GM.toast = function (msg, tone) {
    var region = document.getElementById("v2-toast-region");
    if (!region) return;
    var t = document.createElement("div");
    t.className = "v2-toast";
    t.dataset.tone = tone || "";
    t.setAttribute("role", "status");
    t.textContent = msg;
    region.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  };

  /* ------------------------------------------------------------------ theme */
  function currentTheme() { return html.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function syncThemeChrome() {
    var t = currentTheme();
    html.style.colorScheme = t;
    html.style.backgroundColor = t === "light" ? "#f6f4ef" : "#0d0e10";
    document.querySelectorAll("[data-gm-theme-label]").forEach(function (b) { b.textContent = t === "dark" ? "Light Theme" : "Dark Theme"; });
    document.querySelectorAll("[data-gm-theme-icon]").forEach(function (b) { b.innerHTML = ICONS[t === "dark" ? "sun" : "moon"]; });
    document.querySelectorAll(".gm-theme-btn").forEach(function (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      b.innerHTML = GM.icon(t === "dark" ? "sun" : "moon");
    });
    /* The sidebar stays dark in both themes, so its mark keeps the gold file for dark grounds. */
    document.querySelectorAll("img[data-brand-mark]").forEach(function (img) {
      var onDark = t === "dark" || !!img.closest(".v2-sidebar");
      img.setAttribute("src", onDark ? MARK : MARK_LIGHT);
    });
  }
  function themeButtonHTML() {
    var t = currentTheme();
    return '<button type="button" class="gm-icon-btn gm-theme-btn" data-gm-action="toggle-theme" aria-label="' + (t === "dark" ? "Switch to light theme" : "Switch to dark theme") + '">' + GM.icon(t === "dark" ? "sun" : "moon") + "</button>";
  }
  GM.setTheme = function (t) {
    t = t === "light" ? "light" : "dark";
    html.setAttribute("data-theme", t);
    lSet("gm.theme", t);
    syncThemeChrome();
    document.dispatchEvent(new CustomEvent("gm:theme", { detail: { theme: t } }));
  };

  /* ------------------------------------------------------------------ navigation model */
  /* Sidebar per workspace, in the Genesis OS order: WORK, ASSISTANT, INTELLIGENCE.
     An item may carry views: the optional second-level column (the real workspace rail).
     A view may carry a module, so a view outside the plan shows a lock. "match" lists
     data-page keys that belong to this item (old page keys and record pages). */
  var NAV = {
    church: {
      label: "Church workspace", brand: "Ministry", home: "church-today.html",
      action: { key: "add-guest", label: "Add a Guest", icon: "plus" },
      work: [
        { key: "today", label: "Today", href: "church-today.html", icon: "today", module: "today", hint: "What needs a person today", sepAfter: true },
        { key: "guests", label: "Guests", href: "church-guests.html", icon: "guests", module: "guests", hint: "The front office guest pipeline",
          views: [
            { key: "attention", label: "Needs You", href: "church-guests.html", also: ["church-guest.html"] },
            { key: "all", label: "All Guests", href: "church-guests.html?view=all" },
            { key: "board", label: "By Stage", href: "church-guests.html?view=board" },
            { key: "drafts", label: "Drafts Waiting", href: "church-guests.html?view=drafts" },
            { key: "quiet", label: "Gone Quiet", href: "church-guests.html?view=quiet" },
            { key: "report", label: "Guest Report", href: "church-guests-report.html", module: "reports" }
          ] },
        { key: "care", label: "Care Inbox", href: "church-care.html", icon: "care", module: "care", hint: "Prayer and messages, one shared inbox",
          views: [
            { key: "waiting", label: "Waiting on Us", href: "church-care.html" },
            { key: "prayer", label: "Prayer", href: "church-care.html?view=prayer" },
            { key: "messages", label: "Messages", href: "church-care.html?view=messages" },
            { key: "archived", label: "Archived", href: "church-care.html?view=archived" }
          ] },
        { key: "people", label: "People", href: "church-person.html", icon: "people", module: "people", hint: "One record per person" },
        { key: "notes", label: "Notes", href: "church-notes.html", icon: "note", module: "notes", hint: "Sermon notes and daily devotionals", match: ["note"],
          views: [
            { key: "all", label: "All Notes", href: "church-notes.html", also: ["church-note.html"] },
            { key: "sermons", label: "Sermon Notes", href: "church-notes.html?view=sermons" },
            { key: "devotionals", label: "Devotionals", href: "church-notes.html?view=devotionals", module: "devotionals" },
            { key: "scheduled", label: "Scheduled", href: "church-notes.html?view=scheduled" }
          ] },
        { key: "website", label: "Website", href: "church-website.html", icon: "website", module: "website", hint: "The website, brand board, social plan and form emails" }
      ],
      intelligence: [
        { key: "gifts", label: "Gifts", href: "church-gifts.html", icon: "gifts", module: "gifts", hint: "The spiritual gifts picture, pastors only" },
        { key: "reports", label: "Reports", href: "church-reports.html", icon: "reports", module: "reports", hint: "Guests and care, counts only" }
      ],
      /* SYSTEM in the Genesis OS order: Help first. */
      system: [
        { key: "help", label: "Help", action: "start-tour", icon: "help", hint: "A short guided tour of this screen" },
        { key: "team", label: "Team", href: "church-team.html", icon: "team", module: "team", hint: "Roles, logins and the access record", match: ["access"],
          views: [
            { key: "roles", label: "Team Roles", href: "church-team.html" },
            { key: "access", label: "Access Record", href: "church-access.html", module: "access", page: "access" }
          ] },
        { key: "settings", label: "Settings", href: "church-settings.html", icon: "settings", module: "settings", hint: "Your tools, alerts and support access" }
      ],
      more: [
        { key: "member-app", label: "Member App", href: "member-home.html", icon: "device", hint: "What members see on their phones" },
        { key: "website", label: "Church Website", hrefFn: function () { return GM.church.site; }, icon: "website", hint: "The website in its chosen look" },
        { key: "levels", label: "Compare Plans", href: LEVELS_HREF, icon: "levels", hint: "Care, Shepherd, Plus, Enterprise" },
        { key: "consult", label: "Book a Call", href: "/contact?topic=ministry-demo", icon: "call", hint: "A free conversation with Genesis about your church" }
      ]
    },
    member: [
      { key: "home", label: "Home", href: "member-home.html", icon: "home", module: "member-app" },
      { key: "prayer", label: "Prayer", href: "member-prayer.html", icon: "prayer", module: "member-app" },
      { key: "messages", label: "Messages", href: "member-messages.html", icon: "message", module: "member-app" },
      { key: "give", label: "Give", href: "member-give.html", icon: "give", module: "member-app" },
      { key: "gifts", label: "My Gifts", href: "member-gifts.html", icon: "gifts", module: "member-gifts" }
    ]
  };
  GM.nav = NAV;

  function sideItems(side) { var n = NAV[side]; return n && n.work ? n.work.concat(n.intelligence, (n.system || []).filter(function (it) { return it.href; })) : []; }
  /* The sidebar item a data-page key belongs to. */
  function findItem(side, key) {
    if (side === "member") { for (var j = 0; j < NAV.member.length; j++) if (NAV.member[j].key === key) return NAV.member[j]; return null; }
    var items = sideItems(side);
    for (var i = 0; i < items.length; i++) if (items[i].key === key || (items[i].match && items[i].match.indexOf(key) >= 0)) return items[i];
    return null;
  }
  GM.findNavItem = function (key) { return findItem(GM.side, key); };
  /* The rail view that is current: the page file and ?view= decide. */
  function currentView(item) {
    if (!item || !item.views) return null;
    var file = currentFile(), v = params.get("view") || "";
    var hit = null;
    item.views.forEach(function (view) {
      var vf = view.href.split("?")[0], vq = new URLSearchParams(view.href.split("?")[1] || "").get("view") || "";
      if (vf === file && vq === v) hit = view;
    });
    if (!hit) item.views.forEach(function (view) { if (!hit && view.page && view.page === GM.page) hit = view; });
    if (!hit) item.views.forEach(function (view) { if (!hit && view.also && view.also.indexOf(file) >= 0) hit = view; });
    if (!hit) item.views.forEach(function (view) { if (!hit && view.href.split("?")[0] === file && !/view=/.test(view.href)) hit = view; });
    return hit;
  }
  GM.currentView = function () { return currentView(findItem(GM.side, GM.page)); };

  function lockFor(module) {
    if (!module || GM.side !== "church" || GM.isIncluded(module)) return "";
    var lv = D.levels[GM.moduleLevel(module) - 1];
    return '<em class="gm-nav-lock" title="Included in the ' + esc(lv.name) + ' plan"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.lock + "</svg>" + esc(lv.code) + '</em><span class="sr-only">, included in the ' + esc(lv.name) + " plan</span>";
  }
  function navLink(item, currentKey) {
    if (item.key === "today" && GM.side === "church" && GM.plan === 1) item = Object.assign({}, item, { label: "Home", module: null, hint: "Your website and its forms" });
    if (item.action) return '<a href="#" data-gm-action="' + esc(item.action) + '" data-route="' + esc(item.key) + '" aria-label="' + esc(item.label) + ', ' + esc(item.hint || "") + '">' + vIcon(item.icon) + "<span>" + esc(item.label) + "</span></a>";
    var cur = item.key === currentKey;
    var locked = item.module && GM.side === "church" && !GM.isIncluded(item.module);
    return '<a href="' + esc(item.href) + '" data-route="' + esc(item.key) + '" aria-label="' + esc(item.label) + (locked ? ", included in the " + esc(D.levels[GM.moduleLevel(item.module) - 1].name) + " plan" : "") + '"' + (cur ? ' aria-current="page"' : "") + (locked ? ' class="is-locked"' : "") + ">" +
      vIcon(item.icon) + "<span>" + esc(item.label) + "</span>" + lockFor(item.module) + "</a>" + (item.sepAfter ? '<div class="v2-nav-sep" aria-hidden="true"></div>' : "");
  }

  /* ------------------------------------------------------------------ the member-side switchers (stage bar) */
  function switcherHTML(side, compact) {
    var c = GM.church;
    var name = side === "genesis" ? "Genesis AI" : (compact ? c.short : c.name);
    var meta = side === "genesis" ? "Genesis" : side === "member" ? "Member app, " + c.city + ", " + c.state : "Church workspace, " + c.city + ", " + c.state;
    var churchHref = function (slug) {
      var p = new URLSearchParams(location.search);
      p.set("church", slug); p.set("plan", String(plan)); p.delete("id");
      return currentFile() + "?" + p.toString();
    };
    var items = D.churches.map(function (ch) {
      var on = ch.slug === c.slug;
      return '<a role="menuitem" href="' + esc(churchHref(ch.slug)) + '" data-gm-carried' + (on ? ' aria-current="true"' : "") + '><span class="gm-tenant-mark">' + ch.mark + "</span><span><b>" + esc(ch.name) + "</b><small>" + esc(ch.city + ", " + ch.state + " · " + ch.look) + "</small></span>" + (on ? '<span class="gm-menu-check">' + GM.icon("check") + "</span>" : "") + "</a>";
    }).join("");
    return '<div class="gm-switcher" data-tour="shell.switcher"><button type="button" class="gm-switcher-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="gm-switcher-menu" data-gm-action="toggle-switcher">' +
      '<span class="gm-tenant-mark">' + c.mark + "</span><span><b>" + esc(name) + "</b><small>" + esc(meta) + "</small></span>" + GM.icon("chevron-down", "gm-icon--sm") + "</button>" +
      '<div class="gm-menu" id="gm-switcher-menu" role="menu" aria-label="Switch church" hidden><p class="gm-menu-label">Show the member app for</p>' + items +
      /* On phones the stage bar has no room for the theme button, so it lives here (member.css shows it). */
      (side === "member" ? '<button role="menuitem" type="button" class="gm-menu-theme" data-gm-action="toggle-theme"><svg class="gm-icon" viewBox="0 0 24 24" aria-hidden="true" data-gm-theme-icon>' + ICONS[currentTheme() === "dark" ? "sun" : "moon"] + '</svg><span data-gm-theme-label>' + (currentTheme() === "dark" ? "Light Theme" : "Dark Theme") + "</span></button>" : "") + "</div></div>";
  }
  function planHTML() {
    return '<nav class="gm-plan" aria-label="Plan shown in this preview" data-tour="shell.plan"><span class="gm-plan-label">Plan</span>' + D.levels.slice(0, 3).map(function (lv) {
      var on = lv.n === plan;
      return '<a href="' + esc(sameWith("plan", String(lv.n))) + '" data-gm-carried' + (on ? ' aria-current="true"' : "") + ' aria-label="' + esc(lv.name + ", " + lv.price + (on ? ", shown now" : "")) + '" title="' + esc(lv.name + ", " + lv.price) + '"><b>' + esc(lv.name) + "</b><span>" + esc(lv.price) + "</span></a>";
    }).join("") + "</nav>";
  }
  var PREVIEW_LABEL = '<span class="gm-preview-label" role="note">Design preview. Sample data shown.</span>';
  /* The sample strip at the top of every workspace and member screen. */
  GM.previewStripHTML = function () {
    return '<div class="v2-fixture-badge gm-preview-strip" role="note"><span aria-hidden="true"></span><span class="gm-strip-words">Design preview<span class="gm-strip-long">. Sample data shown</span>.</span>' + talkLinkHTML() + "</div>";
  };
  /* Book a Call, always in view in the sample strip: a pastor who lands deep in the demo can still reach a person. */
  function talkLinkHTML() {
    return D.genesisContact ? '<a class="gm-strip-talk" href="' + esc(D.genesisContact) + '">Book a Call</a>' : "";
  }

  /* ------------------------------------------------------------------ shell: church and genesis (Genesis OS) */
  /* Account-menu links. */
  function moreItems(side) { return NAV[side].more.filter(function (m) { return !m.presenter || GM.presenting; }); }
  function accountItems(side, where) {
    var out = "";
    if (side === "church") {
      /* One line per church: its mark and short name, the city as a tooltip. */
      out += '<div class="gm-menu-label" role="presentation">Church workspace</div>';
      out += D.churches.map(function (ch) {
        var on = ch.slug === GM.church.slug;
        var p = new URLSearchParams(location.search); p.set("church", ch.slug); p.set("plan", String(plan)); p.delete("id");
        return '<a role="menuitemradio" aria-checked="' + on + '" href="' + esc(currentFile() + "?" + p.toString()) + '" data-gm-carried title="' + esc(ch.name + ", " + ch.city + ", " + ch.state) + '" aria-label="' + esc(ch.name + ", " + ch.city + ", " + ch.state) + '"><span class="gm-tenant-mark">' + ch.mark + '</span><span class="gm-menu-copy gm-menu-one">' + esc(ch.short) + "</span>" + (on ? '<span class="gm-menu-tick" aria-hidden="true">' + vIcon("check") + "</span>" : "") + "</a>";
      }).join("");
      out += '<div class="v2-account-menu-sep" role="separator"></div>';
      if (planNoteText()) out += '<p class="gm-menu-note" role="presentation">' + esc(planNoteText()) + "</p>";
      /* The plan list, for when the plan switch is out of sight (the folded sidebar, phones). */
      out += '<div class="gm-menu-plan' + (where === "top" ? " is-always" : "") + '" role="group" aria-label="Plan shown"><div class="gm-menu-label" role="presentation">Plan shown</div>';
      out += D.levels.slice(0, 3).map(function (lv) {
        var on = lv.n === plan;
        return '<a role="menuitemradio" aria-checked="' + on + '" href="' + esc(sameWith("plan", String(lv.n))) + '" data-gm-carried><span class="gm-menu-copy gm-menu-one">' + esc(lv.name + ", " + lv.price) + "</span>" + (on ? '<span class="gm-menu-tick" aria-hidden="true">' + vIcon("check") + "</span>" : "") + "</a>";
      }).join("") + '<div class="v2-account-menu-sep" role="separator"></div></div>';
    } else {
      out += '<div class="gm-menu-label" role="presentation">Open a church workspace</div>';
      out += D.churches.map(function (ch) {
        return '<a role="menuitem" href="' + esc(GM.url("church-today.html", { church: ch.slug })) + '" data-gm-carried title="' + esc(ch.name + ", " + ch.city + ", " + ch.state + " · " + ch.look) + '" aria-label="' + esc(ch.name + ", " + ch.city + ", " + ch.state) + '"><span class="gm-tenant-mark">' + ch.mark + '</span><span class="gm-menu-copy gm-menu-one">' + esc(ch.short) + "</span></a>";
      }).join("");
      out += '<div class="v2-account-menu-sep" role="separator"></div>';
    }
    out += moreItems(side).map(function (m) { return '<a role="menuitem" href="' + esc(m.hrefFn ? m.hrefFn() : m.href) + '">' + vIcon(m.icon) + "<span>" + esc(m.label) + "</span></a>"; }).join("");
    out += '<div class="v2-account-menu-sep" role="separator"></div>';
    out += '<button role="menuitem" type="button" data-gm-action="start-tour">' + vIcon("help") + "<span>Take the Tour</span></button>";
    out += '<button role="menuitem" type="button" data-gm-action="toggle-theme"><svg class="v2-icon" viewBox="0 0 24 24" aria-hidden="true" data-gm-theme-icon>' + ICONS[currentTheme() === "dark" ? "sun" : "moon"] + '</svg><span data-gm-theme-label>' + (currentTheme() === "dark" ? "Light Theme" : "Dark Theme") + "</span></button>";
    return out;
  }

  /* The church's real account level, when it differs from the plan this preview shows. */
  function accountDeal() { var d = null; D.sales.deals.forEach(function (x) { if (x.church === GM.church.slug) d = x; }); return d; }
  function planNoteText() {
    var d = accountDeal();
    if (!d || !d.level || d.level === plan) return "";
    var lv = d.level === 4 ? "Enterprise" : "the " + D.levels[d.level - 1].name + " plan";
    return (d.stage === "proposal" ? GM.poss(GM.church.short) + " proposal is " + lv : GM.church.short + " is on " + lv) + ". This preview shows the " + D.levels[plan - 1].name + " plan.";
  }
  GM.planNote = planNoteText;
  function planNoteHTML() { var t = planNoteText(); return t ? '<p class="gm-plan-note">' + esc(t) + "</p>" : ""; }

  function tenantAvatar(side) {
    if (side === "genesis") return '<span class="v2-avatar gm-avatar-mark gm-avatar-mark--genesis">' + GM.genesisMark() + "</span>";
    return '<span class="v2-avatar gm-avatar-mark">' + GM.church.mark + "</span>";
  }

  function buildDesk(main, moduleKey, locked) {
    var side = GM.side, cfg = NAV[side];
    var v = GM.viewer() || { name: "", role: "", initials: "" };
    var item = findItem(side, GM.page);
    var curKey = item ? item.key : GM.page;
    var hopeLocked = side === "church" && !GM.isIncluded("genesis");

    /* As in Genesis OS: WORK, ASSISTANT (Ask Hope, no count badge, as Ask Hawk has none), INTELLIGENCE, SYSTEM. */
    var nav = '<div class="v2-nav-group"><div class="v2-nav-label">' + (side === "church" ? "Your Week" : "Work") + '</div>' + cfg.work.map(function (it) { return navLink(it, curKey); }).join("") + "</div>" +
      '<div class="v2-nav-group v2-genesis-nav"><div class="v2-nav-label">Assistant</div><a href="#v2-genesis-panel" data-route="genesis" data-gm-action="open-hope" data-tour="shell.genesis" aria-label="Ask ' + esc(ASSISTANT.name) + (hopeLocked ? ", included in the Shepherd plan" : "") + '">' + vIcon("genesis") + "<span>Ask " + esc(ASSISTANT.name) + "</span>" +
      (hopeLocked ? lockFor("genesis") : "") + "</a></div>" +
      '<div class="v2-nav-group"><div class="v2-nav-label">' + (side === "church" ? "Your People" : "Intelligence") + '</div>' + cfg.intelligence.map(function (it) { return navLink(it, curKey); }).join("") + "</div>" +
      (cfg.system ? '<div class="v2-nav-group"><div class="v2-nav-label">' + (side === "church" ? "Settings" : "System") + '</div>' + cfg.system.map(function (it) { return navLink(it, curKey); }).join("") + "</div>" : "");

    /* A page shown as another person (data-viewer: Nadia on Guests, Renee on Find) says so in the account
       row, so the change of greeting and of what is shown reads as a deliberate role preview. */
    var vid = body.getAttribute("data-viewer"), defId = side === "genesis" ? D.viewer.genesis : D.viewer.church;
    var asOther = !!vid && vid !== defId;
    var who = (asOther ? "Viewing as " : "") + (v.name || "");
    var accountCopy = side === "church"
      /* The short name fits the row ("Goldenrod Commons"); the button's label and title keep the full one. */
      ? "<b>" + esc(GM.church.short || GM.church.name) + "</b><small>" + esc(who) + "</small>"
      : "<b>Genesis AI</b><small>" + esc(who) + "</small>";
    /* The plan switch. The church's real account level, when it differs, is said once: in the
       account menu, and here as a tooltip and to screen readers. */
    var note = planNoteText();
    var planSwitch = side === "church" ? '<nav class="gm-plan-switch" aria-label="Plan shown in this preview"' + (note ? ' aria-describedby="gm-plan-note" title="' + esc(note) + '"' : "") + ' data-tour="shell.plan"><span>Plan</span>' + D.levels.slice(0, 3).map(function (lv) {
      var on = lv.n === plan;
      return '<a href="' + esc(sameWith("plan", String(lv.n))) + '" data-gm-carried' + (on ? ' aria-current="true"' : "") + ' aria-label="' + esc(lv.name + (on ? ", shown now" : "")) + '" title="' + esc(lv.name + (note ? ". " + note : "")) + '">' + esc(lv.code) + "</a>";
    }).join("") + (note ? '<span class="sr-only" id="gm-plan-note">' + esc(note) + "</span>" : "") + "</nav>" : "";

    /* On the Care plan there is no guest pipeline, so the one gold action opens the church's website instead.
       Each shell control carries its own name, so it still has one when the sidebar folds to icons. */
    var actionLocked = side === "church" && !GM.isIncluded("guests");
    var actionHTML = actionLocked
      ? '<a class="v2-sidebar-action" href="church-website.html" data-tour="shell.add" aria-label="Open Your Website" title="Open Your Website">' + vIcon("website") + "<span>Open Your Website</span></a>"
      : '<button class="v2-sidebar-action" type="button" data-gm-action="' + esc(cfg.action.key) + '" data-tour="shell.add" aria-label="' + esc(cfg.action.label) + '" title="' + esc(cfg.action.label) + '">' + vIcon(cfg.action.icon) + "<span>" + esc(cfg.action.label) + "</span></button>";
    var brandName = "Genesis " + cfg.brand + ", " + (side === "church" ? "Today" : "Find");
    /* "Nadia K." ends with its own period, so the sentence after it never doubles one. */
    var whoLine = asOther && v.role ? "viewing as " + (v.name || "") + ", " + noDot(v.role) : (asOther ? "viewing as " : "") + noDot(v.name);
    var accountName = side === "church"
      ? GM.church.name + ", " + whoLine + ". Switch church and plan"
      : "Genesis AI, " + whoLine + ". Open a church workspace";
    var sidebar = '<aside class="v2-sidebar" id="v2-sidebar" aria-label="' + esc(cfg.label) + ' navigation">' +
      '<a class="v2-brand" href="' + esc(cfg.home) + '" data-route="home" aria-label="' + esc(brandName) + '" title="' + esc(brandName) + '"><span class="v2-brand-mark"><img data-brand-mark src="' + esc(MARK) + '" alt=""></span><span class="v2-brand-copy"><b>Genesis</b><small>' + esc(cfg.brand) + "</small></span></a>" +
      /* On phones the sidebar is the menu sheet: a visible Close Menu control in its head. */
      '<button class="v2-button v2-icon-button v2-button-quiet gm-sheet-close" type="button" data-gm-action="close-nav" aria-label="Close Menu" title="Close Menu">' + vIcon("close") + "</button>" +
      '<button class="v2-sidebar-toggle v2-button v2-button-quiet" type="button" data-shell-action="toggle-sidebar" aria-label="Show navigation labels" aria-pressed="false">' + vIcon("sidebar") + "<span>Show Labels</span></button>" +
      '<button class="v2-command-trigger" type="button" data-command-trigger data-tour="shell.jump" aria-label="Open command menu" aria-haspopup="dialog">' + vIcon("command") + "<span>Jump to…</span><kbd>Ctrl K</kbd></button>" +
      actionHTML +
      '<nav class="v2-nav">' + nav + "</nav>" +
      '<div class="v2-sidebar-foot">' + planSwitch +
      '<button class="v2-account" id="v2-account" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="v2-account-menu" data-tour="shell.switcher" aria-label="' + esc(accountName) + '" title="' + esc(accountName) + '">' + tenantAvatar(side) + '<span class="v2-account-copy">' + accountCopy + "</span>" + vIcon("chevron") + "</button>" +
      '<div class="v2-account-menu" id="v2-account-menu" role="menu" aria-label="' + (side === "church" ? "Church workspace and plan" : "Workspaces") + '" hidden>' + accountItems(side, "sidebar") + "</div></div>" +
      /* On phones a second Close Menu at the foot of the sheet, within thumb reach. */
      '<button class="gm-sheet-close-foot" type="button" data-gm-action="close-nav">Close Menu</button></aside>';

    var tenantLink = side === "church"
      ? '<a href="' + esc(cfg.home) + '" data-route="home"><span class="gm-tenant-mark">' + GM.church.mark + '</span><span class="gm-tenant-name">' + esc(GM.church.short) + "</span></a>"
      : '<a href="' + esc(cfg.home) + '" data-route="home"><img data-brand-mark src="' + esc(MARK) + '" alt="">Genesis</a>';
    var mobileTop = '<div class="v2-mobile-top"><button class="v2-button v2-icon-button v2-button-quiet" id="v2-menu-button" type="button" aria-label="Open navigation" aria-controls="v2-sidebar" aria-expanded="false">' + vIcon("menu") + "</button>" + tenantLink +
      '<div class="v2-mobile-utilities"><button class="v2-button v2-icon-button v2-button-quiet v2-mobile-command" type="button" data-command-trigger aria-label="Jump to a workspace or view" aria-haspopup="dialog">' + vIcon("search") + "</button>" +
      '<div class="v2-mobile-account"><button class="v2-avatar" id="v2-mobile-account" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="v2-mobile-account-menu" aria-label="Open account menu">' + esc((v.initials || "").slice(0, 2)) + "</button>" +
      '<div class="v2-mobile-account-menu" id="v2-mobile-account-menu" role="menu" aria-label="Account" hidden><b>' + esc(v.name) + "</b><small>" + esc(v.role || "") + (side === "church" ? ", " + esc(GM.church.short) : ", Genesis") + "</small>" + accountItems(side, "top") + "</div></div></div></div>";

    /* The page's own <main> becomes the real .v2-main. */
    main.id = "v2-main";
    main.classList.remove("gm-main");
    main.classList.add("v2-main");
    main.setAttribute("tabindex", "-1");
    main.setAttribute("aria-label", (body.getAttribute("data-title") || (item && item.label) || "Workspace"));

    var root = document.createElement("div");
    root.id = "v2-root";
    root.innerHTML =
      '<button class="v2-genesis-opener" type="button" data-genesis-trigger data-gm-action="open-hope" data-tour="shell.hope" aria-controls="v2-genesis-panel" aria-expanded="false" aria-label="Ask ' + esc(ASSISTANT.name) + ' about this screen"><span class="hawk-fab-core hawk-core hawk-core--mini" aria-hidden="true"><img class="hawk-core-mark" src="' + esc(MARK) + '" alt="" decoding="async" draggable="false"></span><em class="v2-genesis-opener-count" data-gm-draft-count hidden></em></button>' +
      '<div class="v2-shell">' + sidebar + '<button class="v2-mobile-scrim" id="v2-mobile-scrim" type="button" tabindex="-1" aria-hidden="true" aria-label="Close navigation"></button>' + mobileTop +
      '<aside class="v2-workspace-rail" id="v2-workspace-rail" hidden></aside></div>' +
      '<div class="v2-drawer-layer" id="v2-drawer-layer" data-open="false" hidden></div>' +
      '<div class="v2-genesis-layer" id="v2-genesis-layer" data-open="false" hidden><button class="v2-genesis-scrim" type="button" tabindex="-1" aria-hidden="true" aria-label="Close ' + esc(ASSISTANT.name) + '"></button><aside class="v2-genesis-panel" id="v2-genesis-panel" role="dialog" aria-label="' + esc(ASSISTANT.name) + '"><div data-genesis-mount="panel"></div></aside></div>' +
      commandLayerHTML();
    root.querySelector(".v2-shell").appendChild(main);
    body.insertBefore(root, body.firstChild);
    body.insertAdjacentHTML("afterbegin", '<a class="v2-skip-link" href="#v2-main">Skip to workspace</a>');
    body.insertAdjacentHTML("beforeend", GM.previewStripHTML());
    body.classList.add("v2-showing-sample");

    /* The round Genesis button floats over the page, so it comes after the page in Tab order (WCAG 2.4.3). */
    var opener = root.querySelector(".v2-genesis-opener");
    if (opener) root.querySelector(".v2-shell").insertAdjacentElement("afterend", opener);

    renderRail(item);
    syncSidebar();
    syncSheet();
    mountDock();
    loadOrbs();
    watchColumn(main);
    watchNav();
  }
  /* A nav list taller than the sidebar shows that it scrolls: its last rows fade at the foot until the
     list reaches the end (Team and Settings at 1440 x 900, Settings in the phone menu). */
  function watchNav() {
    var nav = document.querySelector(".v2-sidebar .v2-nav");
    if (!nav) return;
    var set = function () { nav.classList.toggle("gm-nav-more", nav.scrollHeight - nav.scrollTop - nav.clientHeight > 4); nav.classList.toggle("gm-nav-top", nav.scrollTop > 4); };
    /* Each screen is its own page, so the nav starts at the top. When the current row would sit under the
       44px fade at the foot, its group label scrolls to the top (never a half row under the action
       button), as far as keeps the row itself clear of the foot. */
    var cur = nav.querySelector('[aria-current="page"]');
    if (cur) {
      var cr = cur.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      if (cr.bottom > nr.bottom - 44) {
        var grp = cur.closest(".v2-nav-group") || cur, gr = grp.getBoundingClientRect();
        var top = nav.scrollTop + gr.top - nr.top - 8, rowTop = nav.scrollTop + cr.top - nr.top;
        /* The row must end above the fade: if the group is too tall, scroll only as far as the row needs. */
        if (rowTop + cur.offsetHeight - top > nav.clientHeight - 44) top = rowTop + cur.offsetHeight - nav.clientHeight + 52;
        nav.scrollTop = Math.max(0, top);
      }
    }
    nav.addEventListener("scroll", set, { passive: true });
    window.addEventListener("resize", set);
    if ("ResizeObserver" in window) new ResizeObserver(function () { requestAnimationFrame(set); }).observe(nav);
    set();
  }
  /* The page column, whatever narrows it (the dock, the rail, the window). Under 760px the full record
     head stacks (body.gm-col-narrow); under 540px the page head and the next-move panel stack too
     (body.gm-col-tight), as Genesis OS keeps them side by side down to a column of about 580px. */
  function watchColumn(main) {
    if (!("ResizeObserver" in window) || !main) return;
    var set = function () {
      var cs = getComputedStyle(main);
      var col = main.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      body.classList.toggle("gm-col-narrow", col > 0 && col < 760 && innerWidth > 860);
      body.classList.toggle("gm-col-tight", col > 0 && col < 540 && innerWidth > 860);
    };
    new ResizeObserver(function () { requestAnimationFrame(set); }).observe(main);
    main.addEventListener("transitionend", function (e) { if (e.target === main) set(); });
    set();
  }

  /* ------------------------------------------------------------------ the second-level column */
  function railKey(item) { return "gm.rail." + GM.side + "." + item.key; }
  /* Record pages have no workspace rail, as Genesis OS record pages (/v2/leads/:id, /v2/deals/:id)
     have none: the record gets the room, and its back link and Jump to reach the views. */
  var RECORD_FILES = ["church-guest.html"];
  function isRecordPage() { return RECORD_FILES.indexOf(currentFile()) >= 0; }
  function renderRail(item) {
    var rail = document.getElementById("v2-workspace-rail");
    if (!rail) return;
    var lockedHere = item && item.module && GM.side === "church" && !GM.isIncluded(item.module);
    if (!item || !item.views || isRecordPage() || lockedHere) { rail.hidden = true; rail.innerHTML = ""; body.classList.remove("v2-has-workspace-rail", "v2-rail-collapsed"); return; }
    var cur = currentView(item);
    var hidden = lGet(railKey(item)) === "hidden";
    body.classList.add("v2-has-workspace-rail");
    body.classList.toggle("v2-rail-collapsed", hidden);
    rail.hidden = hidden;
    rail.innerHTML = '<div class="v2-rail-head"><div class="v2-rail-title">' + esc(item.label) + '</div><button class="v2-icon-button v2-button v2-button-quiet" type="button" data-shell-action="hide-rail" aria-controls="v2-workspace-rail" aria-expanded="true" aria-label="Hide ' + esc(item.label) + ' views">' + vIcon("hide-rail") + "</button></div>" +
      '<nav class="v2-rail-nav" aria-label="' + esc(item.label) + ' views" data-tour="shell.views">' + item.views.map(function (view) {
        return '<a href="' + esc(view.href) + '" data-shell-view="' + esc(view.key) + '"' + (cur && cur.key === view.key ? ' aria-current="page"' : "") + "><span>" + esc(view.label) + "</span>" + lockFor(view.module) + "</a>";
      }).join("") + "</nav>";
    syncRailRestore(item);
  }
  /* With the rail hidden, the way back sits at the start of the page header, as in Genesis OS. */
  function syncRailRestore(item) {
    var main = document.getElementById("v2-main");
    if (!main) return;
    var chip = main.querySelector(".v2-rail-show");
    var head = body.classList.contains("v2-rail-collapsed") ? main.querySelector(".v2-page-head,.gm-head") : null;
    if (!head) { if (chip) chip.remove(); return; }
    if (chip) return;
    chip = document.createElement("button");
    chip.type = "button"; chip.className = "v2-button v2-button-quiet v2-rail-show";
    chip.setAttribute("data-shell-action", "show-rail");
    chip.setAttribute("aria-controls", "v2-workspace-rail"); chip.setAttribute("aria-expanded", "false");
    chip.setAttribute("aria-label", "Show " + item.label + " views");
    chip.innerHTML = vIcon("sidebar") + "<span>Views</span>";
    head.insertBefore(chip, head.firstChild);
  }
  function setRail(hidden) {
    var item = findItem(GM.side, GM.page);
    if (!item || !item.views || isRecordPage()) return;
    railFolded = false;
    lSet(railKey(item), hidden ? "hidden" : "shown");
    renderRail(item);
    var next = hidden ? document.querySelector(".v2-rail-show") : document.querySelector('#v2-workspace-rail a[aria-current="page"],#v2-workspace-rail a');
    if (next) next.focus({ preventScroll: true });
  }
  /* A page that draws its own head after load calls this so the Views chip lands in it. */
  GM.refreshRail = function () { renderRail(findItem(GM.side, GM.page)); };

  /* ------------------------------------------------------------------ sidebar labels (861 to 1279px) */
  function syncSidebar() {
    var on = lGet("gm.sidebar") === "expanded" && innerWidth >= 861 && innerWidth < 1280;
    body.classList.toggle("v2-sidebar-expanded", on);
    document.querySelectorAll("[data-shell-action='toggle-sidebar']").forEach(function (b) {
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Hide navigation labels" : "Show navigation labels");
      var s = b.querySelector("span"); if (s) s.textContent = on ? "Hide Labels" : "Show Labels";
    });
  }

  /* ------------------------------------------------------------------ Jump to (Ctrl K) */
  function commandLayerHTML() {
    return '<div class="v2-command-layer" id="v2-command-layer" data-open="false" hidden><button class="v2-command-scrim" type="button" tabindex="-1" aria-hidden="true" aria-label="Close command menu"></button>' +
      '<section class="v2-command-dialog" role="dialog" aria-modal="true" aria-labelledby="v2-command-title"><h2 class="sr-only" id="v2-command-title">Jump to a Genesis workspace</h2>' +
      '<label class="v2-command-input" for="v2-command-input">' + vIcon("command") + '<span class="sr-only">Jump to a workspace or view</span><input id="v2-command-input" type="search" role="combobox" aria-expanded="true" aria-controls="v2-command-results" aria-autocomplete="list" autocomplete="off" placeholder="Jump to a workspace or view…"><kbd aria-hidden="true">Esc</kbd></label>' +
      '<div class="v2-command-results" id="v2-command-results" role="listbox" aria-label="Navigation commands"></div><footer>Navigation only · Search records inside their workspace</footer></section></div>';
  }
  function commandEntries() {
    var side = GM.side, cfg = NAV[side], groups = [];
    var ws = [];
    var all = cfg.work.concat(cfg.intelligence, (cfg.system || []).filter(function (it) { return it.href; }));
    all.forEach(function (it, i) {
      /* The same names and locks as the sidebar (navLink): on Care, Today is Home, and Ask Hope says its plan. */
      if (it.key === "today" && side === "church" && GM.plan === 1) it = Object.assign({}, it, { label: "Home", module: null, hint: "Your website and its forms" });
      var lk = it.module && side === "church" && !GM.isIncluded(it.module);
      ws.push({ label: it.label, hint: lk ? "Included in " + D.levels[GM.moduleLevel(it.module) - 1].code : (it.hint || ""), href: it.href });
      var hopeLk = side === "church" && !GM.isIncluded("genesis");
      if (i === cfg.work.length - 1) ws.push({ label: "Ask " + ASSISTANT.name, hint: hopeLk ? "Included in " + D.levels[GM.moduleLevel("genesis") - 1].code : "Open " + ASSISTANT.name + " beside this screen", action: "open-hope" });
    });
    groups.push({ name: "Workspaces", items: ws });
    var views = [];
    all.forEach(function (it) { (it.views || []).forEach(function (view) { views.push({ label: view.label, hint: it.label, href: view.href }); }); });
    groups.push({ name: "Views", items: views });
    groups.push({ name: "More", items: [{ label: "Take the Tour", hint: "A short guided tour of this screen", action: "start-tour" }].concat(moreItems(side).map(function (m) { return { label: m.label, hint: m.hint || "", href: m.hrefFn ? m.hrefFn() : m.href }; }), [{ label: currentTheme() === "dark" ? "Light Theme" : "Dark Theme", hint: "Change how this preview looks", action: "toggle-theme" }]) });
    return groups;
  }
  var cmdIndex = 0, cmdFlat = [];
  function renderCommand(q) {
    var box = document.getElementById("v2-command-results");
    if (!box) return;
    q = (q || "").trim().toLowerCase();
    cmdFlat = [];
    var htmlOut = "";
    commandEntries().forEach(function (g, gi) {
      var items = g.items.filter(function (it) { return !q || (it.label + " " + it.hint).toLowerCase().indexOf(q) >= 0; });
      if (!items.length) return;
      htmlOut += '<div role="group" aria-labelledby="v2-command-group-' + gi + '"><div class="v2-command-group" id="v2-command-group-' + gi + '">' + esc(g.name) + "</div>";
      items.forEach(function (it) {
        var i = cmdFlat.length; cmdFlat.push(it);
        htmlOut += '<button type="button" role="option" id="v2-command-option-' + i + '" aria-selected="' + (i === 0) + '" data-command-index="' + i + '"><span><b>' + esc(it.label) + "</b><small>" + esc(it.hint) + '</small></span><kbd aria-hidden="true">↵</kbd></button>';
      });
      htmlOut += "</div>";
    });
    if (!cmdFlat.length) htmlOut = '<p class="v2-command-group" style="padding:14px 16px">Nothing matches. Try Guests, Care or Reports.</p>';
    box.innerHTML = htmlOut;
    cmdIndex = 0;
    var input = document.getElementById("v2-command-input");
    if (input) input.setAttribute("aria-activedescendant", cmdFlat.length ? "v2-command-option-0" : "");
  }
  function moveCommand(delta) {
    if (!cmdFlat.length) return;
    cmdIndex = (cmdIndex + delta + cmdFlat.length) % cmdFlat.length;
    document.querySelectorAll("#v2-command-results [role=option]").forEach(function (b) { b.setAttribute("aria-selected", String(+b.getAttribute("data-command-index") === cmdIndex)); });
    var cur = document.getElementById("v2-command-option-" + cmdIndex);
    if (cur) cur.scrollIntoView({ block: "nearest" });
    var input = document.getElementById("v2-command-input");
    if (input) input.setAttribute("aria-activedescendant", "v2-command-option-" + cmdIndex);
  }
  function runCommand(i) {
    var it = cmdFlat[i];
    if (!it) return;
    closeCommand();
    if (it.action === "open-hope") { openHope(); return; }
    if (it.action === "toggle-theme") { GM.setTheme(currentTheme() === "dark" ? "light" : "dark"); return; }
    if (it.action === "start-tour") { GM.startTour(); return; }
    if (it.href) GM.go(it.href);
  }
  var cmdReturn = null;
  function openCommand() {
    var layer = document.getElementById("v2-command-layer");
    if (!layer) return;
    cmdReturn = document.activeElement;
    setNav(false);
    layer.hidden = false; layer.dataset.open = "true";
    body.classList.add("v2-command-open");
    var input = document.getElementById("v2-command-input");
    input.value = "";
    renderCommand("");
    setTimeout(function () { input.focus(); }, 0);
  }
  function closeCommand() {
    var layer = document.getElementById("v2-command-layer");
    if (!layer || layer.hidden) return;
    layer.dataset.open = "false"; layer.hidden = true;
    body.classList.remove("v2-command-open");
    if (cmdReturn && cmdReturn.focus) cmdReturn.focus({ preventScroll: true });
  }
  GM.openJump = openCommand;

  /* ------------------------------------------------------------------ the drawer: Add a Guest, Add a Church */
  function openDrawer(kind) {
    var layer = document.getElementById("v2-drawer-layer");
    if (!layer) return;
    var side = GM.side;
    if (kind === "add-guest" && !GM.isIncluded("guests")) { GM.go("church-guests.html"); return; }
    var title, sub, fields, submit, eyebrow;
    var opt = function (list) { return list.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join(""); };
    if (kind === "add-guest") {
      eyebrow = "Front office"; title = "Add a guest"; submit = "Add a Guest";
      sub = "A first-time guest you met in person or on the phone. They start at New with an owner and a next step.";
      var owners = D.staff.filter(function (s) { return s.roleKey !== "admin" && s.caps.indexOf("guests") >= 0 || s.pastorSlot != null; }).map(function (s) { return GM.staff(s.id).name; });
      /* Demo only: the free-text fields are read-only samples, so nothing typed is ever shown back. */
      fields = '<label class="v2-field"><span>Name</span><input class="v2-input" name="name" autocomplete="off" value="Jordan R." readonly></label>' +
        '<label class="v2-field"><span>Email</span><input class="v2-input" name="email" type="email" autocomplete="off" value="jordan.r@example.com" readonly></label>' +
        '<label class="v2-field"><span>How they found us</span><select class="v2-select v2-nselect" name="source">' + D.guestSources.concat(["Met on a Sunday"]).map(function (x) { return '<option value="' + esc(x) + '">' + esc(titleSource(x)) + "</option>"; }).join("") + "</select></label>" +
        '<label class="v2-field"><span>Owner</span><select class="v2-select v2-nselect" name="owner">' + opt(owners) + "</select></label>" +
        '<label class="v2-field"><span>Next step</span><input class="v2-input" name="next" value="Send a welcome note" readonly></label>' +
        '<p class="gm-drawer-note gm-demo-note">Demo only: sample details are filled in, and they cannot be changed here. Nothing is saved.</p>' +
        '<p class="gm-drawer-note">' + esc(D.guestSettings.textingNote) + " " + esc(ASSISTANT.name) + " drafts the welcome note, and it waits for a person's approval.</p>";
    }
    layer.innerHTML = '<button class="v2-drawer-scrim" type="button" tabindex="-1" aria-hidden="true" data-gm-action="close-drawer" aria-label="Close"></button>' +
      '<aside class="v2-drawer" role="dialog" aria-modal="true" aria-labelledby="gm-drawer-title"><header class="v2-drawer-head"><div class="v2-drawer-title"><div><div class="v2-eyebrow">' + esc(eyebrow) + '</div><h2 id="gm-drawer-title">' + esc(title) + "</h2><p>" + esc(sub) + '</p></div><button class="v2-button v2-icon-button v2-button-quiet" type="button" data-gm-action="close-drawer" aria-label="Close">' + vIcon("close") + "</button></div></header>" +
      '<div class="v2-drawer-body"><form class="gm-drawer-form" data-gm-drawer-form="' + esc(kind) + '">' + fields + '<div class="gm-drawer-foot"><button class="v2-button v2-button-primary" type="submit">' + esc(submit) + '</button><button class="v2-button v2-button-quiet" type="button" data-gm-action="close-drawer">Cancel</button></div></form></div></aside>';
    drawerReturn = document.activeElement;
    layer.hidden = false;
    behindInert(true, [".v2-shell", ".v2-genesis-opener", ".v2-skip-link", ".v2-genesis-layer"]);
    requestAnimationFrame(function () { layer.dataset.open = "true"; var f = layer.querySelector("input,select"); if (f) f.focus(); });
  }
  var drawerReturn = null;
  function closeDrawer() {
    var layer = document.getElementById("v2-drawer-layer");
    if (!layer || layer.hidden) return;
    behindInert(false, [".v2-shell", ".v2-genesis-opener", ".v2-skip-link", ".v2-genesis-layer"]);
    /* The dock stays modal on phones if it is still open under the drawer. */
    var gl = document.getElementById("v2-genesis-layer");
    if (gl && !gl.hidden && gl.dataset.open === "true" && matchMedia("(max-width:860px)").matches) behindInert(true);
    layer.dataset.open = "false";
    setTimeout(function () { if (layer.dataset.open !== "true") { layer.hidden = true; layer.innerHTML = ""; } }, 180);
    if (drawerReturn && drawerReturn.focus) drawerReturn.focus({ preventScroll: true });
  }
  GM.openDrawer = openDrawer;

  /* ------------------------------------------------------------------ the phone menu sheet */
  /* While a modal surface is open (the phone menu sheet, the dock on phones, the add drawer), what is
     behind it is inert, so Tab and a screen reader's cursor stay inside it. */
  function behindInert(on, list) {
    (list || [".v2-shell", ".v2-genesis-opener", ".v2-skip-link"]).forEach(function (s) {
      var n = document.querySelector(s); if (n) n.inert = !!on;
    });
  }
  function setNav(open) {
    var sidebar = document.getElementById("v2-sidebar");
    if (!sidebar) return;
    var phone = innerWidth <= 860;
    var wasOpen = body.classList.contains("v2-nav-open");
    open = !!open && phone;
    body.classList.toggle("v2-nav-open", open);
    var b = document.getElementById("v2-menu-button");
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    var main = document.getElementById("v2-main");
    if (main) main.inert = open;
    /* The closed sheet sits off screen: keep it, and its scrim, out of the tab order. */
    sidebar.inert = phone && !open;
    /* The open sheet is modal on phones (what is behind it is inert), so it says so to screen readers. */
    if (open) { sidebar.setAttribute("role", "dialog"); sidebar.setAttribute("aria-modal", "true"); }
    else { sidebar.removeAttribute("role"); sidebar.removeAttribute("aria-modal"); }
    var scrim = document.getElementById("v2-mobile-scrim");
    if (scrim) scrim.inert = !open;
    behindInert(open, [".v2-mobile-top", ".v2-workspace-rail", ".v2-genesis-opener", ".v2-skip-link"]);
    if (open) { var f = document.querySelector("#v2-sidebar .gm-sheet-close") || document.querySelector("#v2-sidebar .v2-nav a,#v2-sidebar a"); if (f) f.focus(); }
    else if (wasOpen && b && (sidebar.contains(document.activeElement) || document.activeElement === body || document.activeElement === scrim)) b.focus({ preventScroll: true });
  }
  /* A swipe toward the left edge closes the open menu sheet, as a phone's own sheets do. */
  (function () {
    var x0 = null, y0 = 0;
    document.addEventListener("touchstart", function (e) {
      if (!body.classList.contains("v2-nav-open") || !e.target.closest || !e.target.closest("#v2-sidebar")) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (dx < -60 && Math.abs(dy) < 50) setNav(false);
    }, { passive: true });
  })();
  /* On load and on resize: the closed sheet stays out of the tab order on phones, and in it on wider screens. */
  function syncSheet() {
    var sidebar = document.getElementById("v2-sidebar");
    if (!sidebar || body.classList.contains("v2-nav-open")) return;
    sidebar.inert = innerWidth <= 860;
    var scrim = document.getElementById("v2-mobile-scrim");
    if (scrim) scrim.inert = true;
  }

  /* ------------------------------------------------------------------ menus */
  /* The account menus and the member stage switcher: [trigger, menu]. */
  function menuPairs() {
    return [[document.getElementById("v2-account"), document.getElementById("v2-account-menu")],
      [document.getElementById("v2-mobile-account"), document.getElementById("v2-mobile-account-menu")],
      [document.querySelector('[data-gm-action="toggle-switcher"]'), document.getElementById("gm-switcher-menu")]];
  }
  /* Closing a menu that holds focus hands focus back to its trigger, so it never drops to the page. */
  function closeMenus(except) {
    menuPairs().forEach(function (p) {
      var b = p[0], m = p[1];
      if (!b || !m || m.hidden || m.id === except) return;
      var had = m.contains(document.activeElement);
      m.hidden = true; b.setAttribute("aria-expanded", "false");
      if (had) b.focus({ preventScroll: true });
    });
  }
  function menuItems(m) { return [].filter.call(m.querySelectorAll('[role^="menuitem"]'), function (n) { return n.offsetParent !== null; }); }
  function openMenu(b, m) {
    closeMenus(m.id);
    m.hidden = false; b.setAttribute("aria-expanded", "true");
    var f = m.querySelector('[aria-checked="true"]') || m.querySelector('[aria-current="true"]') || menuItems(m)[0];
    if (f) f.focus();
  }
  function toggleMenu(btnId, menuId) {
    var b = document.getElementById(btnId), m = document.getElementById(menuId);
    if (!b || !m) return;
    if (m.hidden) openMenu(b, m); else closeMenus();
  }
  /* Arrow keys, Home and End move through an open menu; Tab leaves it and closes it. */
  function menuKeys(e) {
    var pair = null;
    menuPairs().forEach(function (p) { if (p[1] && !p[1].hidden && p[1].contains(document.activeElement)) pair = p; });
    if (!pair) return false;
    var items = menuItems(pair[1]), i = items.indexOf(document.activeElement);
    var to = null;
    if (e.key === "ArrowDown") to = items[(i + 1) % items.length];
    else if (e.key === "ArrowUp") to = items[(i - 1 + items.length) % items.length];
    else if (e.key === "Home") to = items[0];
    else if (e.key === "End") to = items[items.length - 1];
    else if (e.key === "Tab") { pair[0].focus({ preventScroll: true }); pair[1].hidden = true; pair[0].setAttribute("aria-expanded", "false"); return false; }
    else if (e.key === "Escape") { e.preventDefault(); closeMenus(); return true; }
    if (to) { e.preventDefault(); to.focus(); return true; }
    return false;
  }

  /* ------------------------------------------------------------------ Hope: the floating orb and the dock */
  /* Answers in this preview come from the sample data, in counts and owners only.
     Pages and the tour can add their own with GM.hope.addAnswers([{ match: /regex/, answer: "text" or fn }]). */
  /* One crisis rule for every Hope. The pattern and the reply are the live church site's, the same
     as ../shared/hope-demo.js (the website and member app Hope). The workspace dock also hears a
     staff member writing about someone else, and adds one line for staff. Never reword the reply. */
  /* The crisis words come from ../shared/crisis-words.js (window.HOPE_WORDS), the one list every Hope
     reads: the pattern, a staff member writing about someone else, the everyday words set aside first,
     and the last net. Every page loads it before this file. */
  var WORDS = window.HOPE_WORDS;
  if (!WORDS) throw new Error("Genesis Ministry: load ../shared/crisis-words.js before shared/app.js. Every Hope needs the crisis words.");
  var CRISIS = WORDS.crisis, CRISIS_OTHERS = WORDS.staff, CRISIS_NET = WORDS.net, calm = WORDS.calm;
  /* Curly apostrophes ("can’t") read as straight ones, so a phone keyboard never hides a crisis. */
  function plainText(t) { return String(t == null ? "" : t).replace(/[\u2018\u2019\u02bc\u2032]/g, "'"); }
  /* Before anything else, on every plan and on both sides. */
  function isCrisisText(t) {
    var s = WORDS.safety(plainText(t));
    return s === "crisis" || s === "leadersafety";
  }
  /* Before a fallback: the site's full check (it includes the last net), or our own net. */
  function crisisNet(t) {
    t = plainText(t);
    try { if (window.HopeDemo && typeof window.HopeDemo.isCrisis === "function") return !!window.HopeDemo.isCrisis(t); } catch (e) {}
    return CRISIS_NET.test(calm(t));
  }
  /* The fixed reply, from ../shared/crisis-words.js: one source of the words. */
  function crisisReply(phone) { return WORDS.reply(phone); }
  /* Which safety reply a text gets, before any topic: "crisis", "leadersafety", "policy" or null. */
  function safetyOf(t) { return WORDS.safety(plainText(t)); }
  window.HOPE_CRISIS = { pattern: CRISIS, others: CRISIS_OTHERS, net: CRISIS_NET, test: isCrisisText, reply: crisisReply, safety: safetyOf, leaderReply: function (phone) { return WORDS.leaderReply(phone); } };
  GM.crisis = window.HOPE_CRISIS;
  function listNames(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  /* A name that ends with an initial ("Maya T.") never doubles the period in a sentence. */
  function noDot(s) { return String(s == null ? "" : s).replace(/\.$/, ""); }
  GM.noDot = noDot;
  function tidy(s) { return String(s == null ? "" : s).replace(/\b([A-Z])\.\.(?=\s|$)/g, "$1.").replace(/\b([A-Z])\.\s*\.(?=\s|$)/g, "$1."); }
  GM.tidy = tidy;
  /* The guest Today, the briefing and the next-move panel start with: the first guest whose welcome note waits. */
  function firstGuest() {
    var g = D.guests.filter(function (x) { return x.draft && GM.draftStatus(x.draft) === "waiting"; })[0];
    if (g) return g;
    return GM.dueFollowUps()[0] || null;
  }
  /* A rule that hears its words only in a question about the sample data: "waiting", "today", "how many",
     or a short question of four words or fewer ("New guests?"). */
  var DATA_ASK = /\b(waiting|today|tonight|this week|right now|who needs|how many|summary|oldest|any new|new (guests?|people|visitors?)|list|show (me )?(the |our )?(care|guests?|prayer|messages?|new)|what('?s| is) (new|waiting|open)|status|count|arrived|came)\b/i;
  function dataAsk(re) { return { source: re.source, test: function (t) { t = String(t || ""); return re.test(t) && (DATA_ASK.test(t) || t.trim().split(/\s+/).length <= 4); } }; }
  /* A short thank-you or "got it" gets a short reply, not the menu. */
  var THANKS = /^\s*(?:thanks?(?: you)?(?: so much| very much)?|thank you(?: so much| very much)?|thx|ty|great|perfect|got it|ok(?:ay)?|cool|nice)[\s.!,]*(?:hope)?[\s.!]*$/i;
  function thanksAnswer() { return "You are welcome. I am here whenever something needs a person."; }
  function churchAnswers() {
    return [
      { match: THANKS, answer: thanksAnswer },
      { match: /\b(owner|they|someone|nadia|hector|staff|leader|volunteer)\b.*\b(away|vacation|out of (the )?office|sick|on leave|travel\w*|gone for)\b|\bowner away\b/i, answer: function () {
        var away = D.staff.filter(function (x) { return x.away; })[0], a = away && GM.staff(away.id), by = away && GM.staff(away.away.coveredBy);
        return "Owner Away hands an absent owner's guests to someone else until they are back, so nobody waits on an empty desk." + (a && by ? " This week " + a.name + " is away, so " + by.name + " has his guests until " + GM.fmt.weekdayLong(away.away.until) + ", " + GM.fmt.date(away.away.until) + "." : "") + " Every change lands in the guest's timeline.";
      } },
      { match: /gone quiet|go(es)? quiet|stops? (replying|answering|responding)|(no|never) (reply|response|answer)|(does not|doesn'?t|did not|didn'?t) (reply|respond|answer|come|show)|missed (the|a|her|his|their) (visit|sunday)|no[- ]show|ghost\w*/i, answer: function () {
        var q = D.guests.filter(function (g) { return g.quiet; });
        return "A guest goes quiet after two emails with no reply, or a planned visit missed. Gone Quiet catches them, and each gets one gentle last note that a person sends. Then the owner can close it with a reason: moved, found another church or asked us to stop. It is archived, never deleted." + (q.length ? " Right now " + listNames(q.map(function (g) { return GM.person(g.personId).name; })) + (q.length === 1 ? " is" : " are") + " in Gone Quiet." : "");
      } },
      { match: /\bwho (owns|is the owner of|is following up (with|on)|has)\b/i, answer: function (text) {
        /* A guest by name ("Who owns Grace C.?"): their owner and next step, never what they wrote. */
        var low = String(text || "").toLowerCase(), hit = null;
        D.guests.forEach(function (g) { var p = GM.person(g.personId); if (!hit && p && (low.indexOf(p.name.toLowerCase().replace(/\.$/, "")) >= 0 || new RegExp("\\b" + p.first.toLowerCase() + "\\b").test(low))) hit = { g: g, p: p }; });
        if (!hit) return "Every guest has one owner and one next step. Guests lists each one, and Needs You shows the ones due first.";
        var o = GM.staff(hit.g.owner);
        return (o ? o.name : "No one yet") + " owns " + hit.p.name + ". Next: " + hit.g.next.charAt(0).toLowerCase() + hit.g.next.slice(1) + ", " + GM.fmt.due(hit.g.due).text.toLowerCase() + ".";
      } },
      /* "Who is Maya?", "Who is Nadia?": who a guest, a person or a team member is, in owners and next
         steps only, never what anyone wrote. A name it does not know passes the question on. */
      { match: /\bwho(?:'s| is| was)\s+(?!on call\b|my\b|our\b|the\b|your\b|in\b|away\b|next\b|due\b|waiting\b|first\b|genesis\b)[a-z]/i, answer: function (text) {
        var low = String(text || "").toLowerCase().replace(/[?.!]+\s*$/, "");
        var named = function (name, first) { name = String(name || "").toLowerCase().replace(/\.$/, ""); first = String(first || "").toLowerCase(); return (name && low.indexOf(name) >= 0) || (first && new RegExp("\\b" + first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(low)); };
        var g = D.guests.filter(function (x) { var p = GM.person(x.personId); return p && named(p.name, p.first); })[0];
        if (g) {
          var gp = GM.person(g.personId), go = GM.staff(g.owner), due = g.due ? GM.fmt.due(g.due).text.toLowerCase() : "";
          var what = g.stage === "new" ? " is a new guest from " + GM.sourceText(g.source) + "." : " is on the guest path, at " + GM.stage(g.stage).label + ".";
          return gp.name + what + " " + (go ? go.name + " owns the next step: " : "The next step: ") + g.next.charAt(0).toLowerCase() + g.next.slice(1) + (due ? ", " + due : "") + ". I share owners and next steps, never what anyone wrote.";
        }
        var st = D.staff.map(function (x) { return GM.staff(x.id); }).filter(function (x) { return x && named(x.name, x.first); })[0];
        if (st) {
          var owns = D.guests.filter(function (x) { return x.owner === st.id; }).length;
          return st.name + (/^prayer team$/i.test(st.role) ? " is on the prayer team" : " is the " + st.role) + " at " + GM.church.short + "." + (owns ? " " + st.name + " owns " + owns + (owns === 1 ? " guest" : " guests") + " right now." : "");
        }
        var pp = (D.people || []).filter(function (x) { return x.status !== "guest" && named(x.name, x.name.split(" ")[0]); })[0];
        if (pp) {
          var sh = pp.shepherd && GM.staff(pp.shepherd);
          return pp.name + " is " + (pp.status === "member" ? "a member" : "a regular") + " at " + GM.church.short + "." + (sh ? " " + sh.name + " is the shepherd." : "") + (GM.isIncluded("people") ? " The person page in People has the rest, for the people allowed to see it." : "");
        }
        return null;
      } },
      { match: /summar|brief|how was (the|this) week|this week'?s numbers|the week in counts/i, answer: function () { return GM.fill(D.summaries[0].body); } },
      { match: /\b(first|start with|what should (i|we) do|where (do|should) (i|we) (start|begin))\b/i, answer: function () {
        var g = firstGuest(), p = g && GM.person(g.personId);
        var late = GM.dueFollowUps().filter(function (x) { return GM.fmt.due(x.due).days < 0 && x !== g; })[0], lp = late && GM.person(late.personId);
        if (!p) return "Start with the care that has waited longest.";
        var why = g.draft && GM.draftStatus(g.draft) === "waiting"
          ? "The welcome note is ready to approve" + (g.visitDate ? ", and the visit is " + GM.fmt.weekdayLong(g.visitDate) : "") + "."
          : g.next.charAt(0).toUpperCase() + g.next.slice(1) + " is " + GM.fmt.due(g.due).text.toLowerCase() + ".";
        return "Start with " + noDot(p.name) + ". " + why + (lp ? " Then " + lp.name + ": " + late.next.charAt(0).toLowerCase() + late.next.slice(1) + ", " + GM.fmt.due(late.due).text.toLowerCase() + ". " + GM.staff(late.owner).name + " owns it." : "");
      } },
      /* "Follow-ups due", never "someone keeps following me". */
      { match: /\bfollow[- ]?ups?\b|\bdue\b|\boverdue\b/i, answer: function () {
        var due = GM.dueFollowUps();
        return due.length + " follow-ups are due today or overdue. " + due.slice(0, 4).map(function (g) { var p = GM.person(g.personId); return p.name + " (" + g.next.toLowerCase() + ", " + GM.fmt.due(g.due).text.toLowerCase() + ")"; }).join("; ") + (due.length > 4 ? "; and " + (due.length - 4) + " more." : ".");
      } },
      { match: /check (in )?on|who (needs (care|a call|a visit|prayer|a pastor)|should (i|we) (call|visit|reach|see|check))|reach out to|who is hurting|who needs care/i, answer: function () {
        var caps = (GM.viewer() || {}).caps || [];
        if (caps.indexOf("pastor") < 0) {
          var due = GM.dueFollowUps().slice(0, 3).map(function (g) { return GM.person(g.personId).name + " (" + g.next.toLowerCase() + ")"; });
          return "For guests: " + listNames(due) + ". Care conversations stay with the pastors, the prayer team and the staff they name, so I only point you to what you can open.";
        }
        var by = {}, order = [];
        GM.waitingCare().forEach(function (w) { if (!by[w.personId]) { by[w.personId] = []; order.push(w.personId); } by[w.personId].push(w); });
        var lines = [];
        var sarah = GM.person("p-sarah");
        if (sarah) lines.push("Start with " + noDot(sarah.name) + ". " + GM.church.carePastor + " promised to call her tonight at 7.");
        var rest = order.filter(function (id) { return id !== "p-sarah"; }).slice(0, 3).map(function (id) { var o = GM.who(by[id][0].owner); return ((GM.person(id) || {}).name || "Someone") + " (" + (o ? o.name : "no owner yet") + ")"; });
        if (rest.length) lines.push("Then " + listNames(rest) + ", who are waiting on a reply.");
        lines.push("I name people and owners only. What they wrote stays in the care inbox for the people allowed to read it.");
        return lines.join(" ");
      } },
      { match: /draft|approv|welcome note/i, answer: function () {
        var d = GM.waitingDrafts("church");
        return d.length ? d.length + " drafts are waiting for approval, for " + listNames(d.map(function (x) { var p = GM.who(x.to); return p ? p.first || p.name : "a guest"; })) + ". Nothing goes out until a person approves it." : "Every draft has been handled. Nice work.";
      } },
      /* The sample counts answer a question about the data ("What is waiting in care?", "Any new guests?"),
         never a policy question that only says "prayer" or "guest" ("If a prayer request mentions abuse,
         does Hope report it?"). */
      { match: dataAsk(/care|waiting|prayer|message/i), answer: function () {
        var w = GM.waitingCare();
        return w.length + " care items are waiting on us. The oldest has waited " + GM.fmt.waiting(w[0].since).replace("Waiting ", "") + ". I list counts and owners only. Prayer words stay inside the care inbox for pastors and the prayer team.";
      } },
      { match: dataAsk(/guest|new|visit|welcome/i), answer: function () {
        var n = D.guests.filter(function (g) { return g.stage === "new"; });
        return n.length + " new guests arrived this week: " + listNames(n.map(function (g) { return GM.person(g.personId).name + " from " + GM.sourceText(g.source); })) + ". Each one has an owner and a next step.";
      } },
      { match: /this week|week\b/i, answer: function () { return GM.fill(D.summaries[0].body); } },
      { match: /price|cost|pricing|custom/i, answer: D.pricingLine + " Enterprise, for more than one campus, is scoped on a call. Every look is filled with your church's content, photos and colors, and changes beyond the template are available for an additional cost." },
      { match: /\b(?:levels?|plans?(?! to\b)|tiers?|includ\w*|packages?|pricing)\b|\bwhat do (?:we|i) get\b/i, answer: D.pricingLine + " Care is the website in one of four looks, a brand board, a social marketing plan and " + ASSISTANT.name + " on the website. The Shepherd plan adds this workspace, the guest pipeline, the member app and the care inbox. The Plus plan adds person pages, the Access Record screen, the gifts picture and reports." },
      { match: /hope|assistant|ai\b/i, answer: "On your website I answer from facts your team approved: times, kids, next steps, giving. In this workspace I draft welcome notes and summaries, and a person approves everything. I never draft a reply to prayer or a personal message, and I never set a gifts score." }
    ];
  }
  function genesisAnswers() { return []; }
  /* extraAnswers: a page's own (checked first). baseAnswers: the guided demo's product answers
     (shared/demo.js), checked before the built-in ones and answered on every plan. */
  var extraAnswers = [], baseAnswers = [];
  /* An answer is text, or { text, link: { label, href } } for one link under it (Book a Call).
     An answer function that returns null passes the question on to the next rule. */
  function pickAnswer(list, text) {
    for (var i = 0; i < list.length; i++) {
      if (!list[i].match.test(text)) continue;
      var a = list[i].answer, r = typeof a === "function" ? a(text) : a;
      if (r != null && r !== "") return r;
    }
    return null;
  }
  function answerFor(text) {
    var a = rawAnswer(text);
    return a && typeof a === "object" ? Object.assign({}, a, { text: tidy(a.text) }) : tidy(a);
  }
  /* The crisis reply's numbers, one tap each, as on the church's own site and the member app. */
  function crisisLinks() {
    var links = [{ label: "Call 988", href: "tel:988", primary: true }, { label: "Text 988", href: "sms:988" }, { label: "Call 911", href: "tel:911" }];
    if (GM.side !== "genesis" && GM.church && GM.church.phone && !/ 555-/.test(GM.church.phone)) links.push({ label: "Call " + GM.church.short, href: "tel:" + String(GM.church.phone).replace(/[^\d+]/g, "") });
    return links;
  }
  function crisisAnswer() {
    if (GM.side === "genesis") return { text: crisisReply(""), links: crisisLinks() };
    /* The fixed reply word for word, then one line for staff. On the Care plan there is no Care screen and no
       pastor on call setting yet, so the line names a pastor instead. */
    var staffLine = GM.plan === 1 ? "If this is about someone in your church, call a pastor now."
      : "If this is about someone in your church, reach the pastor on call from the Care Inbox now.";
    var links = crisisLinks();
    if (GM.plan >= 2 && GM.side === "church") links.push({ label: "Open Care Inbox", href: GM.url("church-care.html") });
    return { text: crisisReply(GM.church.phone) + "\n\n" + staffLine, links: links };
  }
  /* Harm by someone at church: the separate fixed reply, with 911 and 988 and help outside the church,
     never only the church's own people. In the workspace a staff line follows. */
  function leaderAnswer() {
    var links = [{ label: "Call 911", href: "tel:911", primary: true }, { label: "Call 988", href: "tel:988" }, { label: "Text 988", href: "sms:988" }];
    if (GM.side === "genesis") return { text: WORDS.leaderReply(""), links: links };
    return { text: WORDS.leaderReply("") + "\n\nIf this is about someone in your church, do not handle it alone or only inside the church: call 911 if anyone is in danger, and follow your child protection and reporting policy.", links: links };
  }
  /* Round 5: a first-person statement no answer took ("I need to get out", "I can't anymore") is someone
     telling about their life, not asking about the product: the numbers, one tap each, and no sales link. */
  var SELF_WORDS = /\b(?:i|i'?m|im|i'?ve|i'?d|i'?ll|my|myself|we'?re)\b/i;
  var PRODUCT_ASK = /\b(?:genesis|hope|plans?|price|cost|workspace|dashboard|guests?|care inbox|inbox|drafts?|reports?|seats?|team|roles?|app|website|site|screen|export|data|settings?|members?|staff|volunteers?|summary|follow[- ]?ups?)\b/i;
  function aboutSelf(t) { t = String(t || ""); return SELF_WORDS.test(t) && !/\?\s*$/.test(t) && !/^\s*(?:how|what|which|who|where|when|why|can|could|do|does|did|is|are|will|would|should|show|tell|give|open|help me (?:find|see|with))\b/i.test(t) && !PRODUCT_ASK.test(t); }
  function selfAnswer() {
    return { text: "Thank you for telling me. In danger or crisis? Call 911, or call or text 988. Please reach a person you trust today.", links: [{ label: "Call 988", href: "tel:988", primary: true }, { label: "Text 988", href: "sms:988" }, { label: "Call 911", href: "tel:911" }] };
  }
  /* Every fallback ends with the numbers, so a crisis no rule heard still sees 988 and 911. */
  var CRISIS_LINE = " In danger or crisis? Call 911, or call or text 988.";
  function rawAnswer(text) {
    text = plainText(text);
    /* The safety pre-check (../shared/crisis-words.js) comes before everything, on every plan and on
       both sides: danger, self-harm, abuse or harm by anyone, a church leader included, never reaches a
       topic answer. A question about how abuse is handled, with no disclosure in it, goes on to the
       answer on reporting. */
    var safe = safetyOf(text);
    if (safe === "crisis") return crisisAnswer();
    if (safe === "leadersafety") return leaderAnswer();
    /* Round 5: the last net before any topic answer too ("I have a gun"), never after it. */
    if (WORDS.last && WORDS.last.test(calm(text))) return crisisAnswer();
    var hopeLocked = GM.side === "church" && !GM.isIncluded("genesis");
    if (hopeLocked) {
      var product = pickAnswer(baseAnswers, text);
      if (product != null) return product;
      if (THANKS.test(text)) return thanksAnswer();
      if (crisisNet(text)) return crisisAnswer();
      /* A buying question never gets the lock line: what each plan includes, with its price. The name
         Genesis alone ("Is Genesis a Christian company?") is not a buying question. */
      if (/\b(plans?|tiers?|levels?|prices?|pricing|cost|pay|buy|upgrade|cancel|discount|contract|trial|sign ?up|get started|start|shepherd|plus)\b|\$/i.test(text)) {
        var plans = pickAnswer(baseAnswers, "What does each plan include?");
        if (plans != null) return plans;
      }
      /* Someone telling about their own life gets the numbers, never a sales call. */
      if (aboutSelf(text)) return selfAnswer();
      /* An honest line and a person, as on every other plan. */
      return { text: "I would rather not guess about that one. A person at Genesis can answer it on a call. On the " + GM.level().code + " plan I answer questions on " + GM.poss(GM.church.short) + " website, and " + ASSISTANT.name + " in this workspace, with drafts and summaries, comes with the Shepherd plan." + CRISIS_LINE, link: { label: "Book a Call", href: D.genesisContact } };
    }
    /* Trust and policy answers come before a screen's own answers; then the screen's, the rest of the
       guided demo's and the built-in ones. */
    var first = baseAnswers.filter(function (a) { return a.first; }), rest = baseAnswers.filter(function (a) { return !a.first; });
    var found = pickAnswer(first.concat(extraAnswers, rest, GM.side === "genesis" ? genesisAnswers() : churchAnswers()), text);
    if (found != null) return found;
    /* The last net, as on the church's own site: a crisis word no answer took still gets the reply. */
    if (crisisNet(text) || (WORDS.last && WORDS.last.test(calm(text)))) return crisisAnswer();
    if (GM.side !== "genesis" && aboutSelf(text)) return selfAnswer();
    return GM.side === "genesis"
      ? "In this preview I answer from the sample data."
      /* A pastor's question no answer covers gets an honest line and a person, never a list of what I can do. */
      : { text: "I would rather not guess about that one. A person at Genesis can answer it on a call. In this workspace I can also help with this week's summary, follow-ups due, care waiting on us and drafts waiting for approval." + CRISIS_LINE, link: { label: "Book a Call", href: D.genesisContact } };
  }

  /* How Hope greets the viewer: pastors by title ("Pastor Theo"), everyone else by first name ("Nadia"). */
  function greetName(v) { v = v || {}; return v.pastorSlot != null ? v.name : (v.first || noDot(v.name) || ""); }
  function defaultBriefing() {
    var v = GM.viewer() || {}, first = v.first || v.name || "";
    var hello = GM.greeting() + ", ";
    if (!GM.isIncluded("genesis")) {
      return { name: greetName(v), line: hello + "{name}. On the Care plan I answer questions on " + GM.poss(GM.church.short) + " website.",
        chips: [{ label: "Preview Shepherd", href: sameWith("plan", "2"), primary: true }, { label: "Compare Plans", href: LEVELS_HREF }] };
    }
    var newG = D.guests.filter(function (g) { return g.stage === "new"; }).length;
    var care = GM.waitingCare().length;
    var g1 = D.guests.filter(function (g) { return g.draft && GM.draftStatus(g.draft) === "waiting"; })[0];
    var p1 = g1 && GM.person(g1.personId);
    return { name: greetName(v), line: hello + "{name}. " + newG + " new guests and " + care + " care items wait." + (p1 ? " Start with " + noDot(p1.name) + "." : ""),
      chips: (p1 ? [{ label: "Welcome " + p1.first, href: "church-guest.html?id=" + g1.id + "#draft", primary: true }] : []).concat([{ label: "Open Guests", href: "church-guests.html", primary: !p1 }]) };
  }
  /* The dock's welcome fits above the composer at 1440 by 900, as in Genesis OS, whose greeting is
     about 80 characters on three lines: a line of whole sentences up to about 95 characters, and at
     most two chips (one primary) on one row. The greeting, the first sentence after it (the count)
     and the sentence that says what to do ("Start with", "Next") always stay. */
  var BRIEF_MAX = 95;
  var ACT = /^\s*(Start with|Next\b|Then\b|Review\b|Open\b)/;
  /* Whole sentences; a part that ends on an initial ("Maya T.") joins the next part. */
  function sentences(line) {
    var parts = String(line).match(/[^.!?]+(?:[.!?]+|$)(?:\s+|$)/g) || [String(line)];
    var sent = [];
    parts.forEach(function (p) { if (sent.length && /(?:\b[A-Z]\.|\bNo\.|\bSt\.)\s*$/.test(sent[sent.length - 1])) sent[sent.length - 1] += p; else sent.push(p); });
    return sent;
  }
  /* Which sentences must stay: the greeting, the first one after it, and the action sentence. */
  function keepIndex(sent) {
    var keep = {}; keep[0] = true; if (sent.length > 1) keep[1] = true;
    for (var j = sent.length - 1; j > 1; j--) if (ACT.test(sent[j])) { keep[j] = true; break; }
    return keep;
  }
  function fitLine(line, name) {
    line = tidy(line);
    var len = function (t) { return t.replace(/\{name\}/g, name || "").trim().length; };
    if (len(line) <= BRIEF_MAX) return line;
    var sent = sentences(line), keep = keepIndex(sent);
    var used = 0; sent.forEach(function (x, i) { if (keep[i]) used += len(x) + 1; });
    var out = sent.filter(function (x, i) {
      if (keep[i]) return true;
      if (used + len(x) + 1 > BRIEF_MAX) return false;
      used += len(x) + 1; return true;
    });
    return out.join("").trim();
  }
  /* Once the dock is on screen: the chips keep to one row and the line drops its optional sentences
     until the voice row and the approval line clear the composer. Works for any page's briefing and width. */
  /* A last initial stays with its name ("Maya T." never ends a line on "T."). */
  function keepInitials(t) { return String(t == null ? "" : t).replace(/(\w) ([A-Z]\.)(?=\s|$|[,;:!?])/g, "$1\u00a0$2"); }
  function lineHTML(b, text) {
    var name = b.name || "";
    return keepInitials(text).split("{name}").map(esc).join(name ? "<em>" + esc(keepInitials(name)) + "</em>" : "");
  }
  function setOrb(w, size) {
    var orb = w.querySelector(".hawk-core-orb"), stage = w.querySelector(".hawk-core-stage"), status = w.querySelector(".hawk-core-status");
    if (!orb || !stage) return;
    stage.hidden = size === 0;
    if (status) status.hidden = size > 0 && size < 120;
    var px = Math.max(size, 96) + "px";
    if (orb.style.width !== px) {
      orb.style.width = orb.style.height = px; orb.style.flex = "0 0 " + px;
      if (dock) dock.cores.forEach(function (c) { if (c && c.resize) try { c.resize(); } catch (e) {} });
    }
  }
  function fitWelcome() {
    if (!dock || !dock.brief) return;
    var w = dock.thread.querySelector(".aria-welcome");
    var comp = dock.root.querySelector(".gm-dock-qs");
    if (!w || w.hidden || !comp || !comp.getClientRects().length) return;
    var chips = w.querySelector(".hawk-briefing-chips"), line = w.querySelector(".hawk-briefing-line");
    var bs = chips ? [].slice.call(chips.querySelectorAll(".hawk-chip")) : [];
    var size = orbSize();
    /* A short window (200 percent zoom, a phone on its side): no orb, no voice row and no approval line,
       only the optional sentences' room given back, and the one gold chip, so the action clears the
       composer at rest. The voice row returns in a taller window. */
    var short = innerHeight < 560;
    w.classList.toggle("gm-short", short);
    setOrb(w, size);
    bs.forEach(function (b, n) { b.hidden = short && n > 0; });
    var rowH = bs.length ? bs[0].offsetHeight : 0;
    for (var i = bs.length - 1; i > 0 && chips.offsetHeight > rowH * 1.5; i--) bs[i].hidden = true;
    var sent = sentences(dock.brief.line), keep = keepIndex(sent);
    var shown = sent.map(function (x, k) { return { t: x, keep: !!keep[k] }; });
    if (short) shown = shown.filter(function (x) { return x.keep; });
    var paint = function () { line.innerHTML = lineHTML(dock.brief, shown.map(function (x) { return x.t; }).join("").trim()); };
    paint();
    var ok = w.querySelector(".hawk-ok-line"), voice = w.querySelector(".hawk-voice-row");
    var last = ok && ok.getClientRects().length && getComputedStyle(ok).display !== "none" ? ok : voice;
    if (short || !last || !last.getClientRects().length) last = chips && chips.getClientRects().length ? chips : line;
    var limit = comp.getBoundingClientRect().top;
    var over = function () { return last && last.getBoundingClientRect().bottom > limit - 2; };
    /* First the optional sentences go, last one first. */
    for (var j = shown.length - 1; j > 0 && over(); j--) if (!shown[j].keep) { shown.splice(j, 1); paint(); }
    /* Then a smaller orb, then none: the words matter more than the picture. */
    var steps = [160, 120, 96, 0].filter(function (x) { return x < size; });
    for (var k = 0; k < steps.length && over(); k++) setOrb(w, steps[k]);
    /* Last of all the count sentence, and only when that makes the welcome fit: when it cannot fit
       anyway (a very short window), it scrolls with the count still in it. Never the greeting or what to do. */
    var before = shown.slice();
    for (var m = shown.length - 1; m > 0 && over(); m--) if (!ACT.test(shown[m].t) && shown.length > 2) { shown.splice(m, 1); paint(); }
    if (over() && shown.length < before.length) { shown = before; paint(); }
  }
  function fitChips(chips) {
    chips = (chips || []).slice();
    var prim = chips.filter(function (c) { return c.primary; })[0];
    var out = prim ? [prim] : [];
    chips.forEach(function (c) { if (out.length < 2 && c !== prim) out.push(c); });
    if (!prim && out[0]) out[0] = Object.assign({}, out[0], { primary: true });
    /* Keep the primary first, as Genesis OS orders them. */
    return out;
  }

  var dock = null;
  var DOCK_ICONS = {
    newChat: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M11.995 4.999c3.86 0 7 3.14 7 7v.28c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-.28c0-3.04-2.46-5.5-5.5-5.5s-5.5 2.46-5.5 5.5c0 1.14.34 2.19.93 3.07.14.2.16.46.08.69l-.55 1.43 1.86-.44c.18-.04.37-.02.54.07.78.43 1.69.68 2.65.68h.26c.41 0 .75.34.75.75 0 .39-.29.71-.67.75h-.34c-1.11 0-2.17-.26-3.11-.73l-2.97.71a.741.741 0 0 1-.74-.24.753.753 0 0 1-.14-.76l.92-2.41a6.995 6.995 0 0 1-.97-3.57c0-3.86 3.14-7 7-7Zm4.01 8c.41 0 .75.34.75.75v1.5h1.5c.41 0 .75.34.75.75s-.34.75-.75.75h-1.5v1.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-1.5h-1.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5v-1.5c0-.41.34-.75.75-.75Z"/></svg>',
    history: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12.219 5.002c3.66.11 6.7 3.18 6.78 6.84a7 7 0 0 1-7 7.16c-3.58 0-6.53-2.68-6.95-6.15-.05-.45.3-.85.75-.85.37 0 .7.27.74.64.31 2.73 2.65 4.86 5.46 4.86a5.51 5.51 0 0 0 5.36-6.74c-.45-2.04-2.1-3.69-4.14-4.13a5.488 5.488 0 0 0-5.453 1.87h1.483c.41 0 .75.34.75.75s-.34.75-.75.75h-3.25c-.55 0-1-.45-1-1v-3.25c0-.41.34-.75.75-.75s.75.34.75.75v1.923a6.962 6.962 0 0 1 5.72-2.673Z"/><path d="M11.845 8.976a.75.75 0 0 1 .75.75v2.268l2.436 1.088a.751.751 0 0 1-.611 1.37l-2.88-1.287a.75.75 0 0 1-.445-.685V9.726a.75.75 0 0 1 .75-.75Z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8" width="8" height="8" aria-hidden="true"><path d="M6.636.246a.775.775 0 0 1 1.097 0 .778.778 0 0 1 0 1.1L5.101 3.98l2.672 2.692a.778.778 0 0 1 0 1.1.775.775 0 0 1-1.098 0L4.003 5.08 1.325 7.764a.775.775 0 0 1-1.098 0 .778.778 0 0 1 0-1.1l2.679-2.683L.292 1.327a.778.778 0 0 1 0-1.1.775.775 0 0 1 1.098 0l2.613 2.655L6.636.246Z"/></svg>',
    speakOn: '<svg class="hawk-speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h3.2L12 5.2v13.6L7.2 15H4V9z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M16 8.6a4.8 4.8 0 0 1 0 6.8M18.4 6.2a8 8 0 0 1 0 11.6"/></svg>',
    speakOff: '<svg class="hawk-speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h3.2L12 5.2v13.6L7.2 15H4V9z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M15 9l6 6M21 9l-6 6"/></svg>'
  };

  function defineDock() {
    if (!window.customElements || customElements.get("hope-dock")) return;
    customElements.define("hope-dock", class extends HTMLElement {
      connectedCallback() { if (this._built) return; this._built = true; buildDock(this); }
    });
  }
  function buildDock(host) {
    var root = host.attachShadow({ mode: "open" });
    var b = normBriefing(defaultBriefing());
    root.innerHTML = '<style>:host{display:flex;height:100%;contain:layout style;}:host([hidden]){display:none;}.gx-root{display:contents;}' +
      '.gm-dock-note{margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a4977f;font-weight:700}' +
      '[hidden]{display:none!important}.msg-assistant .rt p,.msg-user__bubble .rt p{margin:0}.msg-assistant .rt p+p{margin-top:8px}' +
      '.gm-dock-link-row{margin:10px 0 0;display:flex;flex-wrap:wrap;gap:8px}.gm-dock-link{display:inline-flex;align-items:center;min-height:32px;padding:0 14px;border:1px solid rgba(242,216,149,.42);border-radius:999px;color:#f2d895;font-weight:600;font-size:13px;text-decoration:none}' +
      '.gm-dock-link:hover{border-color:#f2d895;background:rgba(242,216,149,.08)}.gm-dock-link:focus-visible{outline:2px solid #f2d895;outline-offset:2px}' +
      '.gm-dock-link-primary{background:#f2d895;color:#08090e;border-color:#f2d895}.gm-dock-link-primary:hover{background:#f5e2ad;color:#08090e}' +
      /* Tap to ask only: the questions where the composer was, then the demo note and the 911 and 988 line. */
      '.gm-dock-qs{display:flex;flex-direction:column;gap:8px;padding:10px 4px 2px}.gm-dock-qs-row{display:flex;flex-wrap:wrap;gap:6px}' +
      /* The questions scroll inside a cap, so the conversation always keeps most of the dock, and the demo
         note and the 911 and 988 line under them never leave the screen. A fade shows there is more below. */
      '.gm-dock-qs-list{display:flex;flex-direction:column;gap:8px;max-height:min(34vh,300px);overflow-y:auto;overscroll-behavior:contain}' +
      '.gm-dock-qs-list.gm-more-below{-webkit-mask-image:linear-gradient(#000 78%,transparent);mask-image:linear-gradient(#000 78%,transparent)}' +
      '.gm-dock-q{display:inline-flex;align-items:center;min-height:32px;padding:6px 12px;border:1px solid rgba(242,216,149,.42);border-radius:999px;background:rgba(8,9,14,.35);color:#f4efe8;font:600 12.5px/1.25 inherit;text-align:left;cursor:pointer}' +
      '.gm-dock-q:hover{border-color:#f2d895;background:rgba(242,216,149,.08)}.gm-dock-q:focus-visible,.gm-dock-more:focus-visible,.gm-dock-help a:focus-visible{outline:2px solid #f2d895;outline-offset:2px}' +
      '.gm-dock-more{align-self:flex-start;min-height:32px;padding:4px 2px;border:0;background:none;color:#f2d895;font:600 12.5px/1.2 inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
      '.gm-dock-qs-more{display:flex;flex-direction:column;gap:6px}.gm-dock-qs-more[hidden]{display:none}' +
      '.gm-dock-qs-h{margin:4px 0 0;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#a4977f;font-weight:700}' +
      '.gm-dock-demo{margin:2px 0 0;font-size:11.5px;line-height:1.45;color:#b9b0a1}.gm-dock-help{margin:0;padding:7px 10px;border-radius:8px;background:rgba(242,216,149,.08);font-size:13px;line-height:1.45;color:#f4efe8}.gm-dock-help b{font-weight:700}.gm-dock-help a{position:relative;z-index:1;color:#f2d895;font-weight:700}.gm-dock-help a::after{content:"";position:absolute;top:-14px;bottom:-14px;left:-16px;right:-10px}.gm-dock-help a[href="tel:988"]::after{left:-10px;right:-13px}.gm-dock-help a[href^="sms:"]::after{left:-4px;right:-6px}' +
      '@media (pointer:coarse){.gm-dock-q,.gm-dock-more{min-height:44px}}@media (max-height:500px){.gm-dock-demo{display:none}.gm-dock-qs-list{max-height:24vh}}' +
      '@media (pointer:coarse){.gm-dock-link{min-height:44px}}.gm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
      /* Short windows (200 percent zoom, a phone on its side): the welcome keeps the line and the gold chip
         clear of the composer; the voice row and the approval line wait for a taller window. */
      '.aria-welcome.gm-short{padding-bottom:0}.aria-welcome.gm-short .hawk-briefing-chips{margin-bottom:0}.aria-welcome.gm-short .hawk-voice-row,.aria-welcome.gm-short .hawk-ok-line{display:none}.aria-thread:has(> .aria-welcome.gm-short:not([hidden])){padding-top:10px;padding-bottom:12px}.aria-chat:has(.aria-welcome.gm-short:not([hidden])) .aria-footer{display:none}</style>' +
      '<link rel="stylesheet" href="' + esc(OS) + 'genesis-assistant.css">' +
      '<div class="gx-root"><aside class="aria-panel" id="aria-panel" data-open="true" data-surface="page" style="--ai-assistant-panel-width:100%"><div class="aria-panel__body"><div class="aria-shell" data-color-scheme="dark" data-brand="genesis">' +
      '<div class="aria-actions-row"><div class="hawk-header-orb hawk-core hawk-core--orb" aria-hidden="true"><img class="hawk-core-mark" src="' + esc(MARK) + '" alt="" decoding="async" draggable="false"></div><span class="aria-actions-row__title">' + esc(ASSISTANT.name) + "</span>" +
      '<div class="aria-actions-row__group"><button class="icon-btn icon-btn--tiny" type="button" data-dock="new" aria-label="New conversation" title="New conversation">' + DOCK_ICONS.newChat + '</button><button class="icon-btn icon-btn--tiny" type="button" data-dock="history" aria-label="Conversation history" title="Conversation history">' + DOCK_ICONS.history + '</button><button class="icon-btn icon-btn--tiny" type="button" data-dock="close" aria-label="Close" title="Close">' + DOCK_ICONS.close + "</button></div></div>" +
      '<div class="aria-chat-wrapper" data-avatar-character="hawk" style="--aria-avatar-size:44px"><div class="cloud-bg"><div class="cloud-bg__far"><div class="cloud-bg__blur"><div class="cloud-bg__fill"></div></div></div><div class="cloud-bg__near"><div class="cloud-bg__blur"><div class="cloud-bg__fill"></div></div></div></div>' +
      '<div class="aria-chat"><div class="aria-chat__inner"><div class="aria-scroll"><div class="aria-thread" aria-live="polite">' + welcomeHTML(b) + "</div></div>" +
      '<div class="aria-control-panel"><div class="aria-control-panel__inner">' + dockQuestionsHTML() + "</div></div>" +
      '<div class="aria-footer" hidden><span>' + esc(ASSISTANT.name) + " only sees what you can see, and never sends anything without a person's approval.</span></div></div></div>" +
      "</div></div></div></div></aside></div>" +
      '<link rel="stylesheet" href="' + esc(OS) + 'refine-hawk-core.css">' +
      /* Ministry layer, after the real dock sheets: the big orb's gold G at the size the old mark showed
         (see "The gold G boxes" in genesis.css); on phones and touch screens the composer is 16px
         (no page zoom on focus) and every dock button is a 44px tap target. No G has a glow, and the
         header orb shows the gold G on a darkened centre, like the round Genesis button (genesis.css). */
      '<style>.hawk-core-mark{width:28.4%}@media (max-width:860px),(pointer:coarse){.composer__input{font-size:16px}}' +
      '@media (max-width:860px),(pointer:coarse){.aria-actions-row .icon-btn--tiny,.composer .icon-btn--small{width:44px;height:44px;min-width:44px;min-height:44px}}' +
      /* Short windows during a conversation too (a phone on its side, 200 and 400 percent zoom): the
         approval line and the header orb step aside so the replies have room; at 400 percent the
         composer is one line (Enter sends) and the header is compact, so the log never shrinks to nothing. */
      '@media (max-height:500px){.aria-footer{display:none!important}.aria-actions-row .hawk-header-orb{display:none}}' +
      /* Phones (review of November 24): the dock's buttons line up. The briefing actions share one row in two
         equal halves across the full width of the dock, Hear the Sample Briefing takes the full row under them, and every question is a
         full-width row, so no group wraps into a ragged run of pill widths. Each is 44px or taller. */
      '@media (max-width:640px){.aria-welcome{width:100%;max-width:none;padding-left:0;padding-right:0;box-sizing:border-box}.hawk-briefing-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;box-sizing:border-box}.hawk-briefing-chips>.hawk-chip:only-child,.hawk-briefing-chips>.hawk-chip:last-child:nth-child(odd){grid-column:1/-1}.hawk-chip{width:100%;min-height:44px;padding:0 10px;justify-content:center;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.hawk-voice-row{width:100%;box-sizing:border-box}.hawk-hear{width:100%;min-height:44px;justify-content:center}' +
      '.gm-dock-qs-row{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.gm-dock-q{width:100%;min-height:44px;padding:10px 14px;box-sizing:border-box}}' +
      '@media (max-height:320px){.composer__toolbar{display:none!important}.aria-actions-row{min-height:0;padding-top:0;padding-bottom:0}.aria-control-panel,.aria-control-panel__inner{padding-top:0;padding-bottom:4px}}' +
      '.hawk-core .hawk-core-mark,.hawk-core[data-state] .hawk-core-mark{filter:none}.hawk-core--orb .hawk-core-mark{width:21.73px}.hawk-core--orb::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle closest-side,rgba(8,9,14,.92) 0%,rgba(8,9,14,.88) 56%,rgba(8,9,14,.45) 72%,rgba(8,9,14,0) 88%);pointer-events:none}</style>';
    dock = { host: host, root: root, thread: root.querySelector(".aria-thread"), scroll: root.querySelector(".aria-scroll"), qs: root.querySelector(".gm-dock-qs"), cores: [] };
    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-dock],[data-chip],[data-q]");
      if (!t) return;
      var act = t.getAttribute("data-dock");
      if (act === "close") { closeHope(); return; }
      if (act === "new") { resetDock(); return; }
      if (act === "history") { GM.toast("Conversation history is not part of this preview."); return; }
      if (act === "mic" || act === "talk") { sayInDock("Voice is not part of this preview. Tap a question below instead."); return; }
      if (act === "more") {
        var more = root.getElementById(t.getAttribute("aria-controls")), opening = more.hidden;
        setDockMore(opening);
        if (opening) {
          /* The new groups come into view at the top of the question list, then the first one takes focus. */
          var list = root.querySelector(".gm-dock-qs-list");
          if (list) list.scrollTop = Math.max(0, list.scrollTop + more.getBoundingClientRect().top - list.getBoundingClientRect().top - 4);
          var f = more.querySelector("[data-q]"); if (f) f.focus({ preventScroll: true });
          dockFade();
        }
        return;
      }
      if (t.hasAttribute("data-q")) {
        /* A tapped question closes More, so the answer has the room. */
        setDockMore(false);
        askInDock(t.getAttribute("data-q")); return;
      }
      if (act === "hear") { hearBriefing(); return; }
      if (act === "speak") { toggleSpeak(t); return; }
      if (act === "orb") { focusFirstQuestion(); return; }
      var chip = t.getAttribute("data-chip");
      if (chip != null) {
        var c = (dock.chips || [])[+chip];
        if (!c) return;
        if (c.href) { GM.go(c.href); return; }
        if (c.ask) { askInDock(c.ask); return; }
        if (c.action && typeof c.action === "function") { c.action(); return; }
      }
    });
    root.addEventListener("keydown", function (e) {
      var orb = e.target.closest && e.target.closest('[data-dock="orb"]');
      if (orb && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusFirstQuestion(); }
    });
    dock.chips = b.chips;
    dock.brief = b;
    var qlist = root.querySelector(".gm-dock-qs-list");
    if (qlist) { qlist.addEventListener("scroll", dockFade, { passive: true }); addEventListener("resize", dockFade); }
    attachDockOrbs();
  }
  /* More Questions open or closed: the toggle's words, its count and the list's fade. Closing takes the list back to its top. */
  function setDockMore(open) {
    if (!dock) return;
    var t = dock.root.querySelector('[data-dock="more"]'), more = t && dock.root.getElementById(t.getAttribute("aria-controls"));
    if (!t || !more) return;
    more.hidden = !open; t.setAttribute("aria-expanded", String(open));
    t.textContent = open ? "Fewer Questions" : "More Questions (" + more.querySelectorAll("[data-q]").length + ")";
    if (!open) { var list = dock.root.querySelector(".gm-dock-qs-list"); if (list) list.scrollTop = 0; }
    dockFade();
  }
  function dockFade() {
    var list = dock && dock.root.querySelector(".gm-dock-qs-list");
    if (list) list.classList.toggle("gm-more-below", list.scrollHeight - list.scrollTop - list.clientHeight > 4);
  }
  function normBriefing(b) {
    b = b || {};
    var name = String(b.name || "");
    var line = String(b.line || "");
    /* "{name}." after a name that ends with an initial ("Nadia K.") would print two periods. */
    if (/\.$/.test(name)) line = line.replace(/\{name\}\./g, "{name}");
    return { name: name, line: fitLine(line, name), chips: fitChips(b.chips) };
  }
  /* The big orb: 220px from 861px wide, as Genesis OS draws it at every height it supports, 120px only
     on short desktop windows. Phones get 160px, 96px on small phones or short screens (and no
     "Standing by" label), and none under 560px tall (a phone on its side, or 200 percent zoom), so the
     greeting is the first thing in view. 0 means hidden. */
  function orbSize() {
    var w = innerWidth, h = innerHeight;
    if (w >= 861) return h < 820 ? 120 : 220;
    if (h < 560) return 0;
    if (w <= 380 || h < 780) return 96;
    return 160;
  }
  /* Spoken replies, as in Genesis OS: the speaker under Hear Briefing and Talk. In this preview it starts
     off (a demo in a meeting should not talk on its own), and when it is on, each reply is read aloud
     with the browser's own speech. Its name stays "Spoken Replies"; aria-pressed carries the state. */
  var speakReplies = false;
  function canSpeak() { return "speechSynthesis" in window && !!window.SpeechSynthesisUtterance; }
  function speakButton() {
    return '<button type="button" class="hawk-speak" data-dock="speak" aria-pressed="' + speakReplies + '" aria-label="Spoken Replies" title="' + (speakReplies ? "Spoken replies are on" : "Spoken replies are off") + '">' + (speakReplies ? DOCK_ICONS.speakOn : DOCK_ICONS.speakOff) + "</button>";
  }
  function toggleSpeak(btn) {
    if (!canSpeak()) { GM.toast("This browser cannot speak. Read the replies on screen."); return; }
    speakReplies = !speakReplies;
    if (!speakReplies) try { speechSynthesis.cancel(); } catch (e) {}
    if (dock) dock.root.querySelectorAll(".hawk-speak").forEach(function (b) {
      b.setAttribute("aria-pressed", String(speakReplies));
      b.title = speakReplies ? "Spoken replies are on" : "Spoken replies are off";
      b.innerHTML = speakReplies ? DOCK_ICONS.speakOn : DOCK_ICONS.speakOff;
    });
    GM.toast(speakReplies ? ASSISTANT.name + " will read each reply aloud." : "Spoken replies are off.");
  }
  function speakReply(text) {
    if (!speakReplies || !canSpeak()) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(String(text || "")); u.lang = "en-US"; setDockState("speaking"); u.onend = function () { setDockState("idle"); }; speechSynthesis.speak(u); } catch (e) {}
  }
  function welcomeHTML(b) {
    var name = b.name || "";
    var parts = keepInitials(b.line).split("{name}");
    var line = parts.map(esc).join(name ? "<em>" + esc(name) + "</em>" : esc(""));
    var size = orbSize(), os = Math.max(size, 96);
    return '<div class="aria-welcome" data-hook="welcome-screen"><div class="hawk-core-stage"' + (size ? "" : " hidden") + '><div class="hawk-core hawk-core-orb" data-dock="orb" role="button" tabindex="0" aria-label="Ask ' + esc(ASSISTANT.name) + '" style="width:' + os + 'px;height:' + os + 'px;flex:0 0 ' + os + 'px"><img class="hawk-core-mark" src="' + esc(MARK) + '" alt="" aria-hidden="true" decoding="async" draggable="false"></div><div class="hawk-core-status"' + (size && size < 120 ? " hidden" : "") + '>Standing by</div></div>' +
      '<p class="hawk-briefing-line">' + line + "</p>" +
      '<div class="hawk-briefing-chips">' + (b.chips || []).map(function (c, i) { return '<button type="button" class="hawk-chip' + (c.primary ? " hawk-chip-primary" : "") + '" data-chip="' + i + '">' + esc(c.label) + "</button>"; }).join("") + "</div>" +
      /* Tap to ask only: no composer, so no Talk, mic or Spoken Replies. Hear the Sample Briefing reads the
         sample line above aloud with the browser's own voice, and nothing else. */
      '<div class="hawk-voice-row"><button type="button" class="hawk-hear" data-dock="hear" aria-label="Hear the sample briefing, read aloud by this browser">Hear the Sample Briefing</button></div>' +
      '<p class="hawk-ok-line">' + esc(ASSISTANT.name) + " never sends anything without a person's OK.</p></div>";
  }
  function attachDockOrbs() {
    if (!dock || !window.HawkCore) return;
    var fn = (window.HawkCoreGL && window.HawkCoreGL.attach) || window.HawkCore.attach;
    var phone = matchMedia("(max-width:860px)").matches;
    dock.root.querySelectorAll(".hawk-core-orb,.hawk-header-orb").forEach(function (host) {
      if (host.querySelector(".hawk-core-canvas")) return;
      var small = host.classList.contains("hawk-header-orb");
      if (!small) { var os = Math.max(orbSize(), 96) + "px"; host.style.width = os; host.style.height = os; host.style.flex = "0 0 " + os; }
      // The small header orb spreads its sparkles wider, so a ring of them shows around the darkened
      // center behind the G (the same as Genesis OS).
      var core = fn(host, { points: small ? 800 : (phone ? 3000 : 9000), fallbackPoints: small ? 80 : 260, spread: small ? 1.3 : 1 });
      if (core && core.setState) core.setState("idle");
      dock.cores.push(core);
    });
  }
  function setDockState(s) {
    if (!dock) return;
    dock.cores.forEach(function (c) { if (c && c.setState) c.setState(s); });
    var st = dock.root.querySelector(".hawk-core-status");
    if (st) st.textContent = s === "working" ? "Thinking" : s === "speaking" ? "Speaking" : "Standing by";
  }
  function rt(text) { return '<div class="rt">' + keepInitials(text).split(/\n{2,}/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>"; }
  function appendUser(text) {
    var w = dock.thread.querySelector(".aria-welcome");
    if (w) w.hidden = true;
    dock.thread.insertAdjacentHTML("beforeend", '<div><div class="msg"><div class="msg-user__row"><div class="msg-user__bubble">' + rt(text) + "</div></div></div></div>");
  }
  function appendAssistant(ans) {
    var text = ans && typeof ans === "object" ? ans.text : ans, links = ans && typeof ans === "object" ? (ans.links || (ans.link ? [ans.link] : [])) : [];
    /* One or more links under the answer: Book a Call, or the crisis reply's numbers a phone can dial. */
    var linkHTML = links.filter(function (l) { return l && l.href; }).map(function (l) {
      /* Book a Call opens in the same tab: the demo's place is in its address, and Back returns to it. */
      var ext = /^https?:/i.test(l.href) && !/\/contact\b/.test(l.href);
      return '<a class="gm-dock-link' + (l.primary ? " gm-dock-link-primary" : "") + '" href="' + esc(l.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.label) + (ext ? '<span class="gm-sr"> (opens in a new tab)</span>' : "") + "</a>";
    }).join("");
    if (linkHTML) linkHTML = '<p class="gm-dock-link-row">' + linkHTML + "</p>";
    dock.thread.insertAdjacentHTML("beforeend", '<div class="msg-group--anchored"><div class="msg-assistant" role="article" aria-roledescription="message"><div class="msg-assistant__stack"><div>' + rt(tidy(text)) + linkHTML + "</div></div></div></div>");
    /* The reply's first words are in view (988 and 911 in a crisis), even in a short window: its top
       goes to the top of the log, not the end of the log's padding. */
    var reply = dock.thread.lastElementChild, sc = dock.scroll;
    sc.scrollTop = Math.max(0, sc.scrollTop + reply.getBoundingClientRect().top - sc.getBoundingClientRect().top - 8);
  }
  function askInDock(text) {
    if (!dock || !text) return;
    appendUser(text);
    setDockState("working");
    dock.scroll.scrollTop = dock.scroll.scrollHeight;
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(function () { var a = answerFor(text); setDockState("idle"); appendAssistant(a); speakReply(a && typeof a === "object" ? a.text : a); }, reduce ? 50 : 650);
  }
  function sayInDock(text) { if (!dock) return; var w = dock.thread.querySelector(".aria-welcome"); if (w) w.hidden = true; appendAssistant(text); }
  function focusFirstQuestion() { var q = dock && dock.qs && dock.qs.querySelector("[data-q]"); if (q) q.focus({ preventScroll: true }); }
  /* Tap to ask only (owner decision, November 23, 2026): the public demo has no box to type in. A
     visitor taps a question, and the dock answers that exact question with the answer it already has
     (answerFor). Typing comes back only on a real AI with safety screening. Each question is checked by
     shared/hope-check.html. The first group shows; More Questions opens the rest. */
  function dockQuestions() {
    if (GM.side === "genesis") return [{ title: "", items: ["How much does it cost?", "What does each plan include?"] }];
    if (!GM.isIncluded("genesis")) return [
      { title: "", items: ["How much does it cost?", "What does each plan include?", "Does Care include text messaging?", "Can we add one more staff seat on Care?", "Do sermon notes come with Care?", "Is there a devotional today?"] },
      { title: "On the Care Plan", more: true, items: ["Will the email a member gets show the text of their prayer request?", "Can the office manager see guest phone numbers on Care?", "Can two staff members share one login?", "Can we import people from Planning Center?"] },
      { title: "Data and Trust", more: true, items: ["Is Genesis HIPAA compliant?", "Will you delete our data if we leave Genesis?", "Is this a real church I can visit?"] }
    ];
    return [
      { title: "", items: ["Who should I call first today?", "What is waiting in care?", "What follow-ups are overdue?", "What does each plan include?"] },
      { title: "Care and Privacy", more: true, items: ["Who can see how much each family gives?", "Who can see members' phone numbers?", "If a prayer request mentions abuse, does Hope report it to the police?", "Does Hope learn from our members' private messages?"] },
      { title: "Notes", more: true, items: ["What was Sunday's message about?", "Is there a devotional today?", "What is scheduled to go out?", "Can Hope write my sermon?"] },
      { title: "Plans and Data", more: true, items: ["How much does it cost?", "Can we keep Planning Center?", "Do you share our data with third parties?", "Will you delete our data if we leave Genesis?", "Is this a real church I can visit?"] }
    ].map(function (g) { return { title: g.title, more: g.more, items: g.items.map(function (q) { return q.replace(/\bHope\b/g, ASSISTANT.name); }) }; });
  }
  function dockQuestionsHTML() {
    var groups = dockQuestions(), top = "", more = "", moreCount = 0;
    var chip = function (q) { return '<button type="button" class="gm-dock-q" data-q="' + esc(q) + '">' + esc(q) + "</button>"; };
    groups.forEach(function (g) {
      var row = (g.title ? '<p class="gm-dock-qs-h">' + esc(g.title) + "</p>" : "") + '<div class="gm-dock-qs-row">' + g.items.map(chip).join("") + "</div>";
      if (g.more) { more += row; moreCount += g.items.length; } else top += row;
    });
    /* The demo note says what this demo does, and on Care that the workspace Hope comes with Shepherd. It
       promises no typing: typing comes back later, only on a real AI with safety screening. */
    var N = esc(ASSISTANT.name), care = GM.side === "church" && !GM.isIncluded("genesis");
    return '<div class="gm-dock-qs" role="group" aria-label="Questions you can ask ' + N + '"><div class="gm-dock-qs-list">' + top +
      (more ? '<button type="button" class="gm-dock-more" data-dock="more" aria-expanded="false" aria-controls="gm-dock-qs-more">More Questions (' + moreCount + ')</button><div class="gm-dock-qs-more" id="gm-dock-qs-more" hidden>' + more + "</div>" : "") +
      "</div>" +
      '<p class="gm-dock-demo">Demo: ' + N + " answers sample questions only." + (care ? " On the Care plan, " + N + " works on your church's website. The workspace " + N + " comes with the Shepherd plan." : "") + "</p>" +
      '<p class="gm-dock-help"><b>In danger or crisis?</b> Call <a href="tel:911">911</a>, or <a href="tel:988">call</a> or <a href="sms:988">text 988</a>.</p></div>';
  }
  function resetDock() {
    if (!dock) return;
    dock.thread.querySelectorAll(":scope > :not(.aria-welcome)").forEach(function (n) { n.remove(); });
    setDockMore(false);
    var w = dock.thread.querySelector(".aria-welcome"); if (w) w.hidden = false;
    fitWelcome();
    focusFirstQuestion();
  }
  function hearBriefing() {
    var line = dock && dock.root.querySelector(".hawk-briefing-line");
    var text = line ? line.textContent : "";
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) { GM.toast("This browser cannot speak. Read the briefing on screen."); return; }
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; setDockState("speaking"); u.onend = function () { setDockState("idle"); }; speechSynthesis.speak(u); } catch (e) { setDockState("idle"); }
  }
  function mountDock() {
    defineDock();
    var mount = document.querySelector('[data-genesis-mount="panel"]');
    if (mount && !mount.querySelector("hope-dock")) mount.appendChild(document.createElement("hope-dock"));
  }
  var hopeReturn = null;
  function dockIsOverlay() { return matchMedia("(max-width:860px), (pointer:coarse) and (max-width:1180px)").matches; }
  /* With the dock open beside the work, a page column that would drop under about 560px folds the views
     rail for as long as the dock is open (the Views chip in the page head brings it back), as in Genesis OS,
     where the page reflows rather than sitting under the panel. Nothing is saved: closing the dock
     puts the rail back. */
  var railFolded = false;
  function foldRailForDock() {
    var rail = document.getElementById("v2-workspace-rail"), main = document.getElementById("v2-main");
    if (!rail || !main || rail.hidden || dockIsOverlay() || !body.classList.contains("v2-genesis-panel-open")) return;
    /* The column the page will have once the dock's room is made (the padding eases in, so it is
       worked out rather than read): the main's width less its left padding and the dock's room. */
    var cs = getComputedStyle(main), rs = getComputedStyle(html);
    var room = (parseFloat(rs.getPropertyValue("--v2-genesis-dock")) || 380) + 2 * (parseFloat(rs.getPropertyValue("--v2-genesis-inset")) || 14);
    var col = main.clientWidth - (parseFloat(cs.paddingLeft) || 0) - room;
    if (col >= 560) return;
    railFolded = true;
    rail.hidden = true;
    body.classList.add("v2-rail-collapsed");
    syncRailRestore(findItem(GM.side, GM.page) || {});
  }
  function unfoldRailForDock() {
    if (!railFolded) return;
    railFolded = false;
    var item = findItem(GM.side, GM.page);
    if (item) renderRail(item);
  }
  GM.dockIsOverlay = dockIsOverlay;
  function openHope(prompt) {
    var layer = document.getElementById("v2-genesis-layer"), panel = document.getElementById("v2-genesis-panel");
    if (!layer || !panel) return;
    setNav(false); closeCommand(); closeMenus();
    if (layer.hidden) hopeReturn = document.activeElement;
    layer.hidden = false; layer.dataset.open = "true";
    body.classList.add("v2-genesis-open", "v2-genesis-panel-open");
    /* On phones, and on touch tablets up to 1180px, the dock covers the screen and is modal: what is
       behind it goes inert. A tablet would otherwise keep a column too narrow to read. */
    var modal = dockIsOverlay();
    if (modal) panel.setAttribute("aria-modal", "true"); else panel.removeAttribute("aria-modal");
    behindInert(modal);
    document.querySelectorAll("[data-genesis-trigger]").forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    if (dock && dock.cores.length) dock.cores.forEach(function (c) { if (c && c.resize) try { c.resize(); } catch (e) {} });
    requestAnimationFrame(function () { requestAnimationFrame(function () { foldRailForDock(); fitWelcome(); }); });
    /* Again once the dock's italic face has loaded, since it sets the line's length. */
    setTimeout(fitWelcome, 360);
    /* And once the panel and the composer have finished easing in, so the fit uses where they settle. */
    setTimeout(fitWelcome, 800);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fitWelcome, 0); });
    setTimeout(function () { if (dock) { if (prompt) askInDock(prompt); focusFirstQuestion(); } }, 30);
  }
  function closeHope() {
    var layer = document.getElementById("v2-genesis-layer");
    if (!layer || layer.hidden) return;
    layer.dataset.open = "false";
    body.classList.remove("v2-genesis-open", "v2-genesis-panel-open");
    behindInert(false);
    unfoldRailForDock();
    document.querySelectorAll("[data-genesis-trigger]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    setTimeout(function () { if (layer.dataset.open !== "true") layer.hidden = true; }, 160);
    if (hopeReturn && hopeReturn.focus && document.contains(hopeReturn)) hopeReturn.focus({ preventScroll: true });
  }
  GM.hope = {
    name: ASSISTANT.name,
    open: openHope,
    close: closeHope,
    ask: function (text) { openHope(); setTimeout(function () { askInDock(text); }, 60); },
    say: function (text) { openHope(); setTimeout(function () { sayInDock(text); }, 60); },
    /* { line: "Good morning, {name}. ...", name: "Pastor Theo", chips: [{ label, href | ask | action, primary }] } */
    setBriefing: function (b) {
      if (!dock) return;
      var cur = defaultBriefing();
      var next = normBriefing({ line: b.line || cur.line, name: b.name != null ? b.name : cur.name, chips: b.chips || cur.chips });
      var w = dock.thread.querySelector(".aria-welcome");
      var hiddenNow = w && w.hidden;
      var tmp = document.createElement("div"); tmp.innerHTML = welcomeHTML(next);
      var fresh = tmp.firstChild; if (hiddenNow) fresh.hidden = true;
      if (w) w.replaceWith(fresh); else dock.thread.prepend(fresh);
      dock.chips = next.chips; dock.brief = next; dock.cores = [];
      attachDockOrbs();
      requestAnimationFrame(fitWelcome);
    },
    /* The questions the dock shows ([{ title, more, items: ["text"] }]), for shared/hope-check.html. */
    questions: function () { return dockQuestions(); },
    addAnswers: function (list, where) { if (where === "base") baseAnswers = baseAnswers.concat(list || []); else extraAnswers = (list || []).concat(extraAnswers); },
    answer: answerFor
  };
  GM.openGenesis = openHope;
  GM.closeGenesis = closeHope;

  /* The orb engines (copied from Genesis OS) load once, then the floating orb and the dock orbs start. */
  var orbsLoading = false;
  function loadScript(src, cb) { var s = document.createElement("script"); s.src = src; s.async = false; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }
  function loadOrbs() {
    if (orbsLoading) return; orbsLoading = true;
    var go = function () {
      if (!window.HawkCore) return;
      var fn = (window.HawkCoreGL && window.HawkCoreGL.attach) || window.HawkCore.attach;
      document.querySelectorAll(".v2-genesis-opener .hawk-fab-core").forEach(function (host) {
        if (host.querySelector(".hawk-core-canvas")) return;
        // The round Genesis button spreads its sparkles wider, so a ring of them shows around the
        // darkened center behind the G (the same as Genesis OS).
        var core = fn(host, { points: 800, fallbackPoints: 80, spread: 1.3 });
        if (core && core.setState) core.setState("idle");
      });
      attachDockOrbs();
    };
    if (window.HawkCore) { go(); return; }
    loadScript(OS + "hawk-core.js", function () { loadScript(OS + "hawk-core-gl.js", go); });
  }

  /* ------------------------------------------------------------------ shell: member app */
  function memberVars(t) {
    return "--m-bg:" + t.bg + ";--m-surface:" + t.surface + ";--m-surface-2:" + t.surface2 + ";--m-surface-3:" + t.surface3 +
      ";--m-text:" + t.text + ";--m-muted:" + t.muted + ";--m-line:" + t.line + ";--m-line-strong:" + t.lineStrong +
      ";--m-accent:" + t.accent + ";--m-accent-press:" + t.accentPress + ";--m-on-accent:" + t.onAccent + ";--m-accent-ink:" + t.accentInk + ";--m-accent-soft:" + t.accentSoft +
      ";--m-focus:" + t.focus + ";--m-display:" + t.display + ";--m-body:" + t.body + ";--m-display-weight:" + t.displayWeight + ";--m-display-tracking:" + t.displayTracking +
      ";--m-display-case:" + t.displayCase + ";--m-radius:" + t.radius + ";--m-radius-lg:" + t.radiusLg + ";--m-btn-radius:" + t.btnRadius + ";color-scheme:" + t.scheme;
  }
  function buildMember(main) {
    var c = GM.church, m = GM.member();
    if (c.fontsUrl && !document.getElementById("gm-church-fonts")) {
      var l = document.createElement("link");
      l.id = "gm-church-fonts"; l.rel = "stylesheet"; l.href = c.fontsUrl;
      document.head.appendChild(l);
    }
    var tabsOn = body.getAttribute("data-tabbar") !== "off";
    var tabbar = tabsOn ? '<nav class="m-tabbar" aria-label="Member app">' + NAV.member.map(function (it) {
      var locked = !GM.isIncluded(it.module);
      return '<a href="' + esc(it.href) + '"' + (it.key === GM.page ? ' aria-current="page"' : "") + ">" + GM.icon(it.icon) + "<span>" + esc(it.label) + "</span>" + (locked ? '<svg class="gm-icon m-tab-lock" viewBox="0 0 24 24" aria-label="Locked">' + ICONS.lock + "</svg>" : "") + "</a>";
    }).join("") + "</nav>" : "";
    var top = '<header class="m-top"><a class="m-church" href="' + (tabsOn ? "member-home.html" : "member-signin.html") + '"><span class="m-church-mark">' + c.mark + '</span><span class="m-church-name">' + esc(c.short) + "</span></a>" +
      (tabsOn && m ? '<span class="m-me" aria-label="Signed in as ' + esc(m.name) + '">' + esc(m.initials) + "</span>" : "") + "</header>";

    var stagebar = '<header class="m-stagebar">' +
      '<a class="m-stage-brand" href="church-today.html">' + GM.genesisMark() + "<span><b>Genesis Ministry</b><small>Member app preview</small></span></a>" +
      switcherHTML("member", true) + planHTML() + '<span class="gm-spacer"></span>' + PREVIEW_LABEL +
      '<a class="gm-btn gm-btn--sm m-stage-desk" href="church-today.html">' + GM.icon("accounts", "gm-icon--sm") + "Church Workspace</a>" + themeButtonHTML() + "</header>";

    var stage = document.createElement("div");
    stage.className = "m-stage";
    stage.innerHTML = stagebar + '<div class="m-device"><div class="m-app" data-church="' + esc(c.slug) + '" data-scheme="' + c.theme.scheme + '" style="' + esc(memberVars(c.theme)) + '">' + top + tabbar + "</div></div>" +
      '<p class="m-caption">What members of ' + esc(c.name) + " see on their phones. It wears the church's own brand.</p>";
    var app = stage.querySelector(".m-app");
    var tb = app.querySelector(".m-tabbar");
    if (tb) app.insertBefore(main, tb); else app.appendChild(main);
    main.insertAdjacentHTML("beforeend", '<p class="m-powered">Powered by Genesis</p>');
    body.insertBefore(stage, body.firstChild);
    body.insertAdjacentHTML("afterbegin", '<a class="v2-skip-link" href="#' + esc(main.id || "gm-main") + '">Skip to content</a>');
  }

  /* ------------------------------------------------------------------ guided tour */
  /* A page registers steps with GM.setTour([{ target: '[data-tour="today.next"]', title, text }]).
     A "Take the Tour" button appears in the page head. The guided demo (shared/demo.js, loaded at
     boot) runs every tour with the real Genesis OS guide, chains the demo path and starts on ?tour=1.
     If demo.js cannot load, the simple tour below runs the page's own steps. */
  var tourSteps = null, tourIndex = 0, tourEls = null;
  GM.addTourButton = function () {
    if (document.querySelector(".gm-tour-btn")) return;
    var headActions = document.querySelector("#v2-main .v2-page-actions, #v2-main .gm-head-actions, #gm-main .gm-head-actions");
    /* Page actions in Genesis OS never wrap: beside two or more actions the tour is an icon button
       (it is also in Jump to, the account menu and Help). */
    var others = headActions ? [].filter.call(headActions.children, function (n) { return !n.hidden && n.offsetParent !== null; }).length : 0;
    var btn = others >= 2
      ? '<button type="button" class="v2-button v2-icon-button v2-button-quiet gm-tour-btn" data-gm-action="start-tour" aria-label="Take the Tour" title="Take the Tour">' + vIcon("help") + "</button>"
      : '<button type="button" class="v2-button v2-button-quiet gm-tour-btn" data-gm-action="start-tour">' + vIcon("help") + "<span>Take the Tour</span></button>";
    if (headActions) headActions.insertAdjacentHTML("beforeend", btn);
    else {
      var head = document.querySelector("#v2-main .v2-page-head");
      if (head) head.insertAdjacentHTML("beforeend", '<div class="v2-page-actions">' + btn + "</div>");
    }
  };
  GM.setTour = function (steps) {
    tourSteps = steps;
    GM.addTourButton();
  };
  GM.tourSteps = function () { return tourSteps; };
  window.addEventListener("load", function () { if (params.get("tour") === "1" && !GM.demo) setTimeout(GM.startTour, 400); });
  GM.startTour = function () {
    if (GM.demo && GM.demo.start) { GM.demo.start(); return; }
    if (!tourSteps || !tourSteps.length) return;
    tourIndex = 0;
    if (!tourEls) {
      body.insertAdjacentHTML("beforeend", '<div class="gm-tour-ring" aria-hidden="true"></div><div class="gm-tour-card" role="dialog" aria-modal="false" aria-labelledby="gm-tour-title"><div class="v2-eyebrow" id="gm-tour-step"></div><h2 id="gm-tour-title"></h2><p class="gm-tour-text"></p><div class="gm-tour-actions"><button type="button" class="v2-button" data-gm-action="tour-back">Back</button><button type="button" class="v2-button v2-button-primary" data-gm-action="tour-next">Next</button><button type="button" class="v2-button v2-button-quiet" data-gm-action="tour-end">End Tour</button></div></div>');
      tourEls = { ring: document.querySelector(".gm-tour-ring"), card: document.querySelector(".gm-tour-card") };
    }
    showTourStep();
  };
  function showTourStep() {
    var st = tourSteps[tourIndex];
    var t = document.querySelector(st.target);
    tourEls.card.querySelector("#gm-tour-step").textContent = "Step " + (tourIndex + 1) + " of " + tourSteps.length;
    tourEls.card.querySelector("#gm-tour-title").textContent = GM.fill(st.title);
    tourEls.card.querySelector(".gm-tour-text").textContent = GM.fill(st.text);
    tourEls.card.querySelector('[data-gm-action="tour-back"]').disabled = tourIndex === 0;
    tourEls.card.querySelector('[data-gm-action="tour-next"]').textContent = tourIndex === tourSteps.length - 1 ? "Finish" : "Next";
    tourEls.ring.classList.add("is-on"); tourEls.card.classList.add("is-on");
    if (t) {
      t.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      setTimeout(function () { placeTour(t); }, 350);
    } else placeTour(null);
    tourEls.card.querySelector('[data-gm-action="tour-next"]').focus();
  }
  function placeTour(t) {
    var r = t ? t.getBoundingClientRect() : { left: innerWidth / 2 - 100, top: innerHeight / 2 - 40, width: 200, height: 80 };
    var ring = tourEls.ring, card = tourEls.card;
    ring.style.left = (r.left - 6) + "px"; ring.style.top = (r.top - 6) + "px";
    ring.style.width = (r.width + 12) + "px"; ring.style.height = (r.height + 12) + "px";
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var top = r.top + r.height + 14;
    if (top + ch > innerHeight - 12) top = Math.max(12, r.top - ch - 14);
    var left = Math.min(innerWidth - cw - 12, Math.max(12, r.left));
    card.style.left = left + "px"; card.style.top = top + "px";
  }
  function endTour() { if (!tourEls) return; tourEls.ring.classList.remove("is-on"); tourEls.card.classList.remove("is-on"); }

  /* ------------------------------------------------------------------ events */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (a) carry(a);
    if (e.target.closest("[data-command-trigger]")) { openCommand(); return; }
    var cmdOpt = e.target.closest("#v2-command-results [role=option]");
    if (cmdOpt) { runCommand(+cmdOpt.getAttribute("data-command-index")); return; }
    if (e.target.closest(".v2-command-scrim")) { closeCommand(); return; }
    if (e.target.closest(".v2-genesis-scrim")) { closeHope(); return; }
    if (e.target.closest("#v2-menu-button")) { setNav(!body.classList.contains("v2-nav-open")); return; }
    if (e.target.closest("#v2-mobile-scrim")) { setNav(false); return; }
    if (e.target.closest("#v2-account")) { toggleMenu("v2-account", "v2-account-menu"); return; }
    if (e.target.closest("#v2-mobile-account")) { toggleMenu("v2-mobile-account", "v2-mobile-account-menu"); return; }
    var shellAct = e.target.closest("[data-shell-action]");
    if (shellAct) {
      var sa = shellAct.getAttribute("data-shell-action");
      if (sa === "toggle-sidebar") { lSet("gm.sidebar", body.classList.contains("v2-sidebar-expanded") ? "compact" : "expanded"); syncSidebar(); }
      if (sa === "hide-rail") setRail(true);
      if (sa === "show-rail") setRail(false);
      return;
    }
    if (!e.target.closest(".v2-account-menu,.v2-mobile-account-menu,.gm-switcher")) closeMenus();
    var act = e.target.closest("[data-gm-action]");
    if (!act) return;
    var name = act.getAttribute("data-gm-action");
    var draftEl = act.closest(".gm-draft");
    switch (name) {
      case "toggle-theme": GM.setTheme(currentTheme() === "dark" ? "light" : "dark"); break;
      case "toggle-switcher": {
        var m = document.getElementById("gm-switcher-menu");
        if (m.hidden) openMenu(act, m); else closeMenus();
        break;
      }
      case "open-hope": case "open-genesis": e.preventDefault(); openHope(act.getAttribute("data-gm-prompt") || ""); break;
      case "close-hope": case "close-genesis": closeHope(); break;
      case "ask-hope": e.preventDefault(); GM.hope.ask(act.getAttribute("data-gm-prompt") || act.textContent.trim()); break;
      case "add-guest": case "add-church": setNav(false); openDrawer(name); break;
      case "close-drawer": closeDrawer(); break;
      case "open-nav": setNav(!body.classList.contains("v2-nav-open")); break;
      case "close-nav": setNav(false); break;
      case "approve-draft": if (draftEl) { setDraftStatus(draftEl.getAttribute("data-draft-id"), "approved"); GM.toast("Approved. This is a preview, so nothing was sent."); } break;
      case "dismiss-draft": if (draftEl) { setDraftStatus(draftEl.getAttribute("data-draft-id"), "dismissed"); } break;
      /* Demo only: the public demo has no box to type in, so a draft is not edited here. */
      case "edit-draft": if (draftEl) GM.toast("Demo only. Editing is off in this demo, and nothing was sent. In your workspace, a person edits every draft before it goes out."); break;
      case "toast": GM.toast(act.getAttribute("data-gm-toast") || "Preview only. Nothing was sent."); break;
      case "start-tour": e.preventDefault(); setNav(false); closeMenus(); GM.startTour(); break;
      case "tour-next": if (tourIndex < tourSteps.length - 1) { tourIndex++; showTourStep(); } else endTour(); break;
      case "tour-back": if (tourIndex > 0) { tourIndex--; showTourStep(); } break;
      case "tour-end": endTour(); break;
    }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target.closest("[data-gm-drawer-form]");
    if (!f) return;
    e.preventDefault();
    var kind = f.getAttribute("data-gm-drawer-form");
    closeDrawer();
    /* Nothing typed is ever echoed back: the toast says only that nothing was saved. */
    GM.toast("Demo only. Nothing was saved.");
  });
  document.addEventListener("auxclick", function (e) { var a = e.target.closest("a[href]"); if (a) carry(a); });
  document.addEventListener("keydown", function (e) {
    var cmd = document.getElementById("v2-command-layer");
    var cmdOpen = cmd && !cmd.hidden;
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K") && GM.side !== "member") { e.preventDefault(); if (cmdOpen) closeCommand(); else openCommand(); return; }
    if (cmdOpen) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveCommand(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); moveCommand(-1); return; }
      if (e.key === "Enter") { e.preventDefault(); runCommand(cmdIndex); return; }
      if (e.key === "Escape") { e.preventDefault(); closeCommand(); return; }
      return;
    }
    if (menuKeys(e)) return;
    if (e.key !== "Escape") return;
    var anyMenu = menuPairs().some(function (p) { return p[1] && !p[1].hidden; });
    closeMenus();
    if (anyMenu) return;
    var dr = document.getElementById("v2-drawer-layer");
    if (dr && !dr.hidden) { closeDrawer(); return; }
    var gl = document.getElementById("v2-genesis-layer");
    if (gl && !gl.hidden) { closeHope(); return; }
    setNav(false);
    endTour();
  });
  document.addEventListener("input", function (e) { if (e.target && e.target.id === "v2-command-input") renderCommand(e.target.value); });
  var resizeRaf = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      syncSidebar();
      if (innerWidth > 860 && body.classList.contains("v2-nav-open")) setNav(false);
      syncSheet();
      if (body.classList.contains("v2-genesis-panel-open")) { unfoldRailForDock(); foldRailForDock(); }
      fitWelcome();
      if (tourEls && tourEls.card.classList.contains("is-on")) { var st = tourSteps[tourIndex]; placeTour(document.querySelector(st.target)); }
    });
  });

  /* ------------------------------------------------------------------ boot */
  var readyFns = [];
  var ctx = null;
  GM.ready = function (fn) { if (ctx) { if (!ctx.locked || ctx.customLocked) fn(ctx); } else readyFns.push(fn); };

  /* If a page script stops early, the page still shows. */
  setTimeout(function () { html.classList.add("gm-booted"); }, 2500);
  function boot() {
    html.setAttribute("data-detail", "standard");
    var main = document.getElementById("v2-main") || document.getElementById("gm-main");
    if (!main) { main = document.createElement("main"); main.id = "v2-main"; body.appendChild(main); }
    main.setAttribute("tabindex", "-1");

    var item = findItem(GM.side, GM.page);
    var view = item ? currentView(item) : null;
    var moduleKey = body.getAttribute("data-module") || (view && view.module) || (item && item.module) || null;
    if (GM.side === "member" && !moduleKey) moduleKey = "member-app";
    var locked = !!moduleKey && GM.side !== "genesis" && !GM.isIncluded(moduleKey);
    var customLocked = body.getAttribute("data-locked") === "custom";

    if (locked && !customLocked) {
      main.innerHTML = GM.side === "member" ? memberLocked(moduleKey) : lockedPage(moduleKey, item);
    }

    if (GM.side === "member") buildMember(main); else buildDesk(main, moduleKey, locked);
    body.insertAdjacentHTML("beforeend", '<div id="v2-toast-region" class="v2-toast-region" aria-live="polite" aria-atomic="true"></div>');

    var t = body.getAttribute("data-title") || (item && item.label);
    if (t) document.title = t + " · " + (GM.side === "genesis" ? "Genesis" : GM.church.short + (GM.side === "member" ? " member app" : "")) + " · Design preview";

    applyText();
    carryAll();
    paintAllDrafts();
    updateDraftCounts();
    syncThemeChrome();

    if ("MutationObserver" in window) {
      new MutationObserver(function (list) {
        list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches("a[href]")) carry(n); carryAll(n); } }); });
      }).observe(body, { childList: true, subtree: true });
    }

    ctx = { side: GM.side, page: GM.page, view: view ? view.key : null, module: moduleKey, church: GM.church, plan: GM.plan, level: GM.level(), locked: locked, customLocked: customLocked, data: D, params: params, viewer: GM.viewer() };
    GM.ctx = ctx;
    readyFns.forEach(function (fn) { if (!locked || customLocked) fn(ctx); });
    readyFns = [];
    if (GM.side !== "member") { syncRailRestore(item || {}); }
    /* The guided demo: tours for every screen, the demo path and the scripted answers. */
    GM.sharedPath = SHARED;
    /* The sermon notes and devotionals (one source for the sites, the workspace and the member app), before
       the guided demo builds its answers from them. Pages that draw notes load it with their own script tag. */
    if (!window.GM_NOTES) loadScript(SHARED + "../../shared/notes-data.js", function () {});
    /* The page is drawn once the guided demo has arranged it too: show it then, in one step, so nothing on it
       jumps while its parts fill in. */
    loadScript(SHARED + "demo.js", function () { requestAnimationFrame(function () { html.classList.add("gm-booted"); }); });
  }

  function memberLocked(key) {
    var m = D.modules[key], lv = D.levels[m.level - 1], cur = GM.level();
    return '<section class="m-locked"><div class="m-locked-icon">' + GM.icon("lock", "gm-icon--lg") + '</div><p class="m-eyebrow">Included in the ' + esc(lv.name) + ' plan</p><h1 class="m-h1">' + esc(m.label) + '</h1><p class="m-lede">' + esc(m.adds) + "</p>" +
      '<ul class="m-checks">' + m.points.map(function (p) { return "<li>" + GM.icon("check") + "<span>" + esc(p) + "</span></li>"; }).join("") + "</ul>" +
      '<a class="m-btn m-btn--primary m-btn--block" href="' + esc(sameWith("plan", String(lv.n))) + '">Preview the ' + esc(lv.name) + ' Plan</a><a class="m-btn m-btn--block" href="' + LEVELS_HREF + '">Compare Plans</a>' +
      '<p class="m-note-quiet">This preview is showing the ' + esc(cur.name) + " plan, " + esc(cur.price) + ". The " + esc(lv.name) + " plan, " + esc(lv.price) + ", adds this.</p></section>";
  }

  boot();
})();
