/* Genesis Ministry design preview: the Notes page on a church's own website, in each of the four looks.
   Each template's notes block (between <!-- notes-view:start --> and <!-- notes-view:end -->) sets
   window.NOTES_SITE = { slug, cls: { wrap, label, h1, h2, btn, btnOutline }, times, address } and its own
   look in CSS: the --nv-* tokens on .nv and any touch of its own. This file draws the page from
   ../../shared/notes-data.js (GM_NOTES) and routes it inside index.html:
     #/notes         the index: search, today's devotional (Shepherd and Plus), every Sunday's notes
     #/notes/<id>    one message's notes: scripture with its translation, key points, questions
     #/notes/today   today's devotional (Shepherd and Plus; on Care it returns to the index with a note)
     #/notes/preview/<id>  the pastor's own preview of a draft, as shaped in the editor (this tab only)
   Any other address shows the home page again. Nothing is fetched, sent or stored, and a search never
   shows the typed words back. */
(function () {
  "use strict";
  var CFG = window.NOTES_SITE || {}, N = window.GM_NOTES;
  if (!N || !CFG.slug || !N.church(CFG.slug)) return;
  var NC = N.church(CFG.slug), K = CFG.cls || {};
  var main = document.querySelector("main");
  if (!main) return;
  var PLAN = (function () { try { return +(new URLSearchParams(location.search).get("plan") || sessionStorage.getItem("gm.plan") || 3); } catch (e) { return 3; } })();
  var SHEP = PLAN >= 2;
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function cls(k, extra) { return ((K[k] || "") + " " + (extra || "")).trim(); }
  function decided(id) { return N.decision(id).state; }
  function book(ref) { return String(ref).replace(/\s+\d[\d:,-]*$/, ""); }
  function speaker(n) { return N.speaker(n, NC.pastors); }
  /* What the site shows: the published Sundays, plus the draft once the pastor tapped Schedule or Publish. */
  function sermons() {
    var list = NC.sermons.slice();
    if (/^(?:scheduled|published)$/.test(decided(NC.draft.id))) list.unshift(N.shaped(NC.draft));
    return list;
  }
  var ARROW = '<svg class="nv-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Base layout (each look adds its own tokens and touches) ---------- */
  var css = document.createElement("style");
  css.textContent = [
    "html.nv-on main>:not(#nv){display:none!important}",
    ".nv[hidden]{display:none!important}",
    ".nv{color:var(--nv-text);font-family:var(--nv-body)}",
    ".nv-sec{padding-block:clamp(40px,6vw,88px)}",
    ".nv-sec+.nv-sec{padding-top:0}",
    /* Find a message gets a real section gap under the page's head, as the other sections do. */
    ".nv-head+.nv-sec{padding-top:clamp(32px,4vw,56px)}",
    ".nv-keep{white-space:nowrap}",
    ".nv h1,.nv h2,.nv h3{font-family:var(--nv-display);color:var(--nv-text);margin:0}",
    ".nv-head p{max-width:62ch;margin:14px 0 0;font-size:18px;line-height:1.6;color:var(--nv-muted)}",
    ".nv-facts{display:flex;flex-wrap:wrap;gap:6px 18px;margin:16px 0 0;padding:0;list-style:none;font-weight:600;color:var(--nv-text)}",
    /* Two actions are one even pair from 480px; below that each takes the full width. */
    ".nv-actions{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:24px}",
    "@media (min-width:480px){.nv-actions{grid-template-columns:repeat(2,minmax(0,1fr));max-width:600px}.nv-actions>:only-child{grid-column:1/-1;max-width:300px}}",
    ".nv-actions>*{width:100%;min-height:44px;margin:0;justify-content:center;text-align:center;box-sizing:border-box}",
    ".nv-split{display:grid;gap:24px}",
    "@media (min-width:900px){.nv-split{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:56px;align-items:start}}",
    ".nv-split p{margin:10px 0 0;color:var(--nv-muted);line-height:1.6}",
    ".nv-field{display:grid;gap:8px}",
    ".nv-field label{display:block;padding-block:10px 0;font-weight:700;font-size:15px}",
    ".nv-field input{width:100%;min-height:48px;padding:10px 14px;border:1.5px solid var(--nv-line-strong,var(--nv-line));border-radius:var(--nv-r);background:var(--nv-surface);color:var(--nv-text);font:inherit;font-size:16px}",
    ".nv-field input:focus-visible{outline:3px solid var(--nv-accent);outline-offset:2px}",
    /* The search box says what it takes, with a magnifier, so it never reads as an empty box. */
    ".nv-search{position:relative}.nv-search svg{position:absolute;left:14px;top:50%;width:20px;height:20px;margin-top:-10px;color:var(--nv-muted);pointer-events:none}",
    ".nv-search input{padding-left:44px}.nv-search input::placeholder{color:var(--nv-muted);opacity:1}",
    ".nv-chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;list-style:none}",
    ".nv-chip{min-height:44px;padding:8px 16px;border:1.5px solid var(--nv-line);border-radius:999px;background:transparent;color:var(--nv-text);font:inherit;font-size:15px;font-weight:600;cursor:pointer}",
    ".nv-chip[aria-pressed=\"true\"]{border-color:var(--nv-accent);background:var(--nv-accent);color:var(--nv-on-accent)}",
    ".nv-count{margin:12px 0 0;color:var(--nv-muted);font-size:15px}",
    ".nv-list{margin:0;padding:0;list-style:none;border-top:1px solid var(--nv-line)}",
    ".nv-row{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:16px;align-items:center;padding:20px 4px;border-bottom:1px solid var(--nv-line);color:inherit;text-decoration:none}",
    ".nv-row:hover .nv-title,.nv-row:focus-visible .nv-title{text-decoration:underline;text-underline-offset:4px}",
    ".nv-date{display:grid;justify-items:center;line-height:1}",
    ".nv-date b{font-family:var(--nv-display);font-size:34px;color:var(--nv-accent-ink,var(--nv-accent))}",
    ".nv-date small{margin-top:4px;font-size:12.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--nv-muted)}",
    ".nv-title{display:block;font-family:var(--nv-display);font-size:clamp(22px,2.4vw,30px);line-height:1.15;color:var(--nv-text)}",
    ".nv-row-sub{display:block;margin-top:6px;color:var(--nv-muted);font-size:15px;line-height:1.5}",
    ".nv-arrow{width:22px;height:22px;color:var(--nv-accent-ink,var(--nv-accent))}",
    ".nv-band{padding:clamp(22px,3vw,34px);border-radius:var(--nv-r-lg,var(--nv-r));background:var(--nv-surface);border:1px solid var(--nv-line)}",
    ".nv-band h2{font-size:clamp(26px,3vw,38px);line-height:1.1}",
    ".nv-band p{margin:10px 0 0;color:var(--nv-muted);line-height:1.6}",
    ".nv-verse{margin:0;padding:18px 20px;border-left:4px solid var(--nv-accent);background:var(--nv-surface);border-radius:0 var(--nv-r) var(--nv-r) 0}",
    ".nv-verse+.nv-verse{margin-top:12px}",
    ".nv-verse b{display:block;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--nv-accent-ink,var(--nv-accent))}",
    /* Scripture is upright and 20px or larger on a phone: long KJV passages in italic are hard to read at 6 AM. */
    ".nv-verse p{margin:8px 0;font-family:var(--nv-verse-font,var(--nv-display));font-style:normal!important;font-size:clamp(20px,2.2vw,26px);line-height:1.5;color:var(--nv-text)}",
    ".nv-verse small{color:var(--nv-muted);font-size:13.5px}",
    ".nv-points{margin:0;padding:0;list-style:none;counter-reset:nv;display:grid;gap:14px}",
    ".nv-points li{position:relative;padding-left:52px;font-size:18px;line-height:1.55;counter-increment:nv}",
    ".nv-points li::before{content:counter(nv);position:absolute;left:0;top:-2px;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:var(--nv-accent);color:var(--nv-on-accent);font-family:var(--nv-display);font-size:18px}",
    ".nv-qs{margin:0;padding:0 0 0 22px;display:grid;gap:10px;font-size:17px;line-height:1.55}",
    ".nv-art{display:grid;gap:clamp(26px,3vw,40px);max-width:820px}",
    ".nv-art h2{font-size:clamp(24px,2.6vw,32px);margin-bottom:14px}",
    ".nv-meta{margin:12px 0 0;color:var(--nv-muted);font-size:16px}",
    ".nv-week{padding:16px 18px;border-radius:var(--nv-r);background:var(--nv-surface);border:1px solid var(--nv-line);font-size:17px;line-height:1.55}",
    ".nv-week b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--nv-accent-ink,var(--nv-accent))}",
    ".nv-back{display:inline-flex;align-items:center;gap:8px;min-height:44px;color:var(--nv-text);font-weight:700;text-decoration:none}",
    ".nv-back svg{transform:rotate(180deg)}",
    ".nv-note{margin:0 0 18px;padding:12px 16px;border-radius:var(--nv-r);background:var(--nv-surface);border:1px dashed var(--nv-line-strong,var(--nv-line));color:var(--nv-text);font-size:15px}",
    ".nv-empty{padding:26px 0}",
    ".nv-empty p{margin:0 0 16px;font-size:18px;font-weight:700}",
    ".nv-doors{display:grid;gap:10px}",
    "@media (min-width:700px){.nv-doors{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    ".nv-doors>*{width:100%;justify-content:center;text-align:center}",
    ".nv-prayer{font-style:normal;font-size:18px}",
    /* "From the message": its own labelled block, set in from the points, so it never reads as the last point. */
    ".nv-more{margin:22px 0 0;padding:16px 0 0 52px;border-top:1px solid var(--nv-line)}",
    ".nv-more b{display:block;margin-bottom:6px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--nv-accent-ink,var(--nv-accent))}",
    ".nv-more p{margin:0;font-size:17px;line-height:1.6;color:var(--nv-text)}",
    ".nv-reading p{font-size:18px;line-height:1.65;margin:0 0 14px;max-width:34em}",
    ".nv-soon{display:inline-block;margin-top:6px;font-size:14px;font-weight:700;color:var(--nv-accent-ink,var(--nv-accent))}",
    ".nv-novideo{margin:0;color:var(--nv-muted);font-size:16px;align-self:center}",
    ".nv-key{display:block;margin-bottom:4px;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--nv-muted)}",
    /* On a phone the devotional label is one line and its date a second, even where the look's label is a flex row. */
    "@media (max-width:480px){.nv-label{flex-wrap:wrap;row-gap:2px}.nv-dsep{display:none}.nv-ddate{display:block;flex-basis:100%}}",
    /* Links inside a footer's lines of text get a 44px row; links a look already stacks keep their own layout. */
    "html.nv-on footer :is(p,li,small,span)>a{display:inline-flex;align-items:center;min-height:44px}",
    "@media (max-width:600px){.nv-row{grid-template-columns:52px minmax(0,1fr) auto;gap:12px}.nv-date b{font-size:28px}.nv-points li{font-size:17px}.nv-more{padding-left:0}}",
    /* A phone on its side: less hero padding, and the Hope circle keeps clear of the words. */
    "@media (max-height:500px){.nv-head{padding-top:24px}.nv-sec{padding-block:28px}.nv-head .nv-actions{margin-top:16px}html.nv-on .hd-launch{right:calc(12px + env(safe-area-inset-right,0px))!important;bottom:calc(12px + env(safe-area-inset-bottom,0px))!important}.nv-head>div{padding-right:max(64px,env(safe-area-inset-right,0px))}}"
  ].join("\n");
  document.head.appendChild(css);

  var root = document.createElement("div");
  root.id = "nv"; root.className = "nv"; root.hidden = true;
  root.setAttribute("tabindex", "-1");
  main.appendChild(root);

  function wrap(inner, extra) { return '<section class="nv-sec ' + (extra || "") + '"><div class="' + cls("wrap") + '">' + inner + "</div></section>"; }
  function label(t) { return '<p class="' + cls("label", "nv-label") + '">' + esc(t) + "</p>"; }
  function visitBtn(primary) { return '<a class="' + cls(primary ? "btn" : "btnOutline") + '" href="#plan-a-visit">Plan Your Visit</a>'; }
  /* key: "Key verse" when only part of the passage named is printed (GM_NOTES.keyLabel). */
  function verseHTML(v, key) { return '<blockquote class="nv-verse">' + (typeof key === "string" && key ? '<span class="nv-key">' + esc(key) + "</span>" : "") + "<b>" + esc(v.ref) + "</b><p>" + esc(v.text) + "</p><small>" + esc(N.translation) + "</small></blockquote>"; }
  /* A label with a date that never leaves its day number alone on a line; on a narrow phone the date takes its own line. */
  function labelDate(t, iso) { return '<p class="' + cls("label", "nv-label") + '">' + esc(t) + '<span class="nv-dsep"> · </span><span class="nv-ddate">' + esc(N.dateLong(iso)).replace(/ (\d+)$/, "&nbsp;$1") + "</span></p>"; }
  function closing() {
    return wrap('<div class="nv-band"><h2>Come and hear the next one</h2><p>We gather ' + esc(CFG.times || "every Sunday") + (CFG.address ? " at " + esc(CFG.address) : "") + ". Come as you are.</p>" +
      '<div class="nv-actions">' + visitBtn(true) + '<a class="' + cls("btnOutline") + '" href="#/notes">All Sermon Notes</a></div></div>');
  }

  /* ---------- The index ---------- */
  var state = { q: "", chip: "" };
  function rowsHTML(list) {
    return list.map(function (n) {
      return '<li><a class="nv-row" href="#/notes/' + esc(n.id) + '"><span class="nv-date" aria-hidden="true"><b>' + N.dayNum(n.date) + "</b><small>" + esc(N.dateShort(n.date).slice(0, 3)) + "</small></span>" +
        '<span><span class="nv-title">' + esc(n.title) + '</span><span class="nv-row-sub">' + N.refHTML(n.ref) + esc(" · " + speaker(n) + " · ") + '<span class="nv-keep">' + esc(n.series + ", " + n.part.toLowerCase()) + "</span></span>" + '<span class="sr-only">, ' + esc(N.dateLong(n.date)) + "</span>" + soon(n) + "</span>" + ARROW + "</a></li>";
    }).join("");
  }
  /* A scheduled draft shows in this demo before its time, so its row says when it really goes up. */
  function soon(n) {
    if (n.status !== "draft") return "";
    var d = N.decision(n.id);
    return '<span class="nv-soon">' + esc(d.state === "published" ? "Demo preview: published just now" : "Demo preview: goes up " + (d.when || N.dateLong(n.date) + " at " + NC.sundayAt).replace(/^(\w+), \w+ \d+ at /, "$1 at ")) + "</span>";
  }
  function matches(n) {
    if (state.chip && n.series !== state.chip && book(n.ref) !== state.chip) return false;
    if (!state.q) return true;
    var hay = (n.title + " " + n.ref + " " + n.series + " " + speaker(n) + " " + n.points.join(" ") + " " + N.dateLong(n.date)).toLowerCase();
    return state.q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function paintList() {
    var list = sermons().filter(matches);
    var box = root.querySelector("#nv-results"), count = root.querySelector("#nv-count");
    if (!box) return;
    count.textContent = list.length ? list.length + (list.length === 1 ? " note" : " notes") : "No notes match your search.";
    box.innerHTML = list.length ? '<ol class="nv-list">' + rowsHTML(list) + "</ol>"
      : '<div class="nv-empty"><p>No notes match your search.</p><div class="nv-doors">' +
        '<a class="' + cls("btnOutline") + '" href="' + esc(NC.watch) + '">Watch the Latest Message</a>' +
        '<a class="' + cls("btnOutline") + '" href="#plan-a-visit">Plan Your Visit</a>' +
        '<button type="button" class="' + cls("btnOutline") + '" data-nv-ask>Ask a Question</button></div></div>';
  }
  function index(note) {
    var all = sermons(), chips = [];
    all.forEach(function (n) { if (chips.indexOf(n.series) < 0) chips.push(n.series); });
    all.forEach(function (n) { var b = book(n.ref); if (chips.indexOf(b) < 0) chips.push(b); });
    var td = N.todays(CFG.slug);
    var h = wrap((note ? '<p class="nv-note" role="note">' + esc(note) + "</p>" : "") + label("Sermon notes") +
      '<h1 class="' + cls("h1", "nv-h1") + '" id="nv-h1">Notes from Sunday</h1>' +
      "<p>Every message from " + esc(NC.short) + ", with the scripture, the key points and questions for small groups. Shaped from our pastors' own words.</p>" +
      '<ul class="nv-facts"><li>' + esc(CFG.times || "Sundays") + "</li>" + (CFG.address ? "<li>" + esc(CFG.address) + "</li>" : "") + "</ul>" +
      '<div class="nv-actions">' + visitBtn(true) + '<a class="' + cls("btnOutline") + '" href="' + esc(NC.watch) + '">Watch the Latest Message</a></div>', "nv-head");
    h += wrap('<div class="nv-split"><div><h2 class="' + cls("h2", "nv-h2") + '" id="nv-find">Find a message</h2><p>Search by title, scripture or series, or tap a series or a book of the Bible.</p></div>' +
      '<div><div class="nv-field" role="search"><label for="nv-q">Search notes</label><div class="nv-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input id="nv-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Title, scripture or series"></div></div>' +
      '<ul class="nv-chips" aria-label="Series and books">' + chips.map(function (ch) { return '<li><button type="button" class="nv-chip" data-nv-chip="' + esc(ch) + '" aria-pressed="false">' + esc(ch) + "</button></li>"; }).join("") + "</ul>" +
      '<p class="nv-count" id="nv-count" aria-live="polite"></p></div></div>');
    if (SHEP && td) {
      h += wrap('<div class="nv-band nv-today" data-nv-today>' + labelDate("Today's devotional", td.date) + '<h2>' + esc(td.title) + "</h2>" +
        "<p>" + esc(td.verses[0].ref) + ": " + esc(td.verses[0].text) + "</p>" +
        '<div class="nv-actions"><a class="' + cls("btn") + '" href="#/notes/today">Read Today\'s Devotional</a></div></div>');
    }
    h += wrap('<h2 class="' + cls("h2", "nv-h2") + '" id="nv-all">Recent Messages</h2><div id="nv-results" style="margin-top:20px"></div>');
    h += closing();
    root.innerHTML = h;
    var q = root.querySelector("#nv-q");
    q.value = ""; state.q = ""; state.chip = "";
    q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); paintList(); });
    paintList();
  }

  /* ---------- One message ---------- */
  function backToEditor() { var b = ""; try { b = sessionStorage.getItem("gm.notes.back") || ""; } catch (e) {} if (!b) b = "../../platform/church-note.html?church=" + encodeURIComponent(CFG.slug) + "&plan=" + PLAN + "&step=review"; else if (!/^(?:[a-z]+:|\/)/i.test(b)) b = "../../platform/" + b; return b; }
  function previewNote() { return '<p class="nv-note" role="note">Preview: members see this after the pastor taps Schedule. Demo only. Nothing was sent. <a href="' + esc(backToEditor()) + '">Back to the Editor</a></p>'; }
  function article(n, preview) {
    var dec = n.status === "draft" ? N.decision(n.id) : { state: "" };
    var note = preview ? previewNote()
      : dec.state ? '<p class="nv-note" role="note">' + (dec.state === "published" ? "Demo preview: published just now." : "Demo preview: scheduled for " + esc(dec.when || N.dateLong(n.date) + " at " + NC.sundayAt) + ". On a real church site it goes up then.") + "</p>" : "";
    /* The site's player plays the latest message only, so only the latest notes say Watch the Message. */
    var watch = n.id === NC.sermons[0].id ? '<button type="button" class="' + cls("btn") + '" data-nv-watch>Watch the Message</button>'
      : n.status === "draft" ? '<p class="nv-novideo">The video goes up after Sunday, when the message is online.</p>'
      : '<button type="button" class="' + cls("btn") + '" data-nv-watch>Watch the Latest Message</button>';
    var h = wrap(note +
      '<a class="nv-back" href="#/notes">' + ARROW + "Back to All Notes</a>" +
      '<div class="nv-art" style="margin-top:18px"><header>' + label(n.series + " · " + n.part) + '<h1 class="' + cls("h1", "nv-h1") + '" id="nv-h1">' + esc(n.title) + "</h1>" +
      '<p class="nv-meta">' + esc(speaker(n) + " · " + N.dateLong(n.date) + (n.length ? " · " + n.length : "") + " · " + (N.keyLabel(n) ? "Passage: " : "")) + N.refHTML(n.ref) + "</p></header>" +
      "<section aria-label=\"Scripture\">" + n.verses.map(function (v) { return verseHTML(v, N.keyLabel(n)); }).join("") + "</section>" +
      '<section aria-labelledby="nv-pts"><h2 id="nv-pts">Key points</h2><ol class="nv-points">' + n.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol>" +
        (n.more && n.more.length ? '<div class="nv-more"><b>From the message</b><p>' + esc(n.more.join(" ")) + "</p></div>" : "") + "</section>" +
      '<section aria-labelledby="nv-qs"><h2 id="nv-qs">For small groups</h2><ol class="nv-qs">' + n.questions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ol></section>" +
      '<p class="nv-week"><b>For this week</b>' + esc(n.week) + "</p>" +
      '<div class="nv-actions">' + watch + '<a class="' + cls("btnOutline") + '" href="#/notes">Back to All Notes</a></div>' +
      "</div>");
    root.innerHTML = h + closing();
  }
  function devotional(d, preview) {
    var isToday = d.date === N.today;
    var h = wrap((preview ? previewNote() : "") + '<a class="nv-back" href="#/notes">' + ARROW + "Back to All Notes</a>" +
      '<div class="nv-art" style="margin-top:18px"><header>' + labelDate(isToday ? "Today's devotional" : "Devotional", d.date) + '<h1 class="' + cls("h1", "nv-h1") + '" id="nv-h1">' + esc(d.title) + "</h1>" +
      '<p class="nv-meta">Read time: <span style="white-space:nowrap">' + N.readMins(d) + " min</span> · From " + esc(speaker(d)) + "</p></header>" +
      "<section aria-label=\"Scripture\">" + d.verses.map(verseHTML).join("") + "</section>" +
      '<section class="nv-reading" aria-label="The reading">' + d.paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>" +
      '<p class="nv-week nv-prayer"><b>A prayer for today</b>' + esc(d.prayer) + "</p>" +
      '<div class="nv-actions"><a class="' + cls("btn") + '" href="#/notes/' + esc(NC.sermons[0].id) + '">Read Sunday\'s Notes</a><a class="' + cls("btnOutline") + '" href="#/notes">Back to All Notes</a></div>' +
      "</div>");
    root.innerHTML = h + closing();
  }

  /* ---------- Routing ---------- */
  var on = false;
  /* While a notes page shows, the home page's own h1 (hidden) is not a heading, so the page has one title. */
  function homeH1s() { return Array.prototype.filter.call(document.querySelectorAll("main h1"), function (h) { return !root.contains(h); }); }
  /* While the notes show, the home page's own H1 becomes a div (with everything it had), so each route
     has one H1; leaving the notes puts the H1 back. */
  var parked = [];
  function retag(from, tag) {
    var to = document.createElement(tag);
    for (var i = 0; i < from.attributes.length; i++) to.setAttribute(from.attributes[i].name, from.attributes[i].value);
    while (from.firstChild) to.appendChild(from.firstChild);
    from.parentNode.replaceChild(to, from);
    return to;
  }
  /* The site menu and the header say where the reader is: Notes on the notes, Home everywhere else. */
  function markNav(onNotes) {
    document.querySelectorAll(".mlist, header nav").forEach(function (nav) {
      var home = nav.querySelector('a[href="#top"]'), notes = nav.querySelector('a[href="#/notes"]');
      if (!notes) return;
      var here = nav.querySelector("a .here");
      var from = onNotes ? home : notes, to = onNotes ? notes : home;
      if (onNotes) notes.setAttribute("aria-current", "page"); else notes.removeAttribute("aria-current");
      if (home && nav.classList.contains("mlist")) { if (onNotes) home.removeAttribute("aria-current"); else home.setAttribute("aria-current", "page"); }
      if (here && to && from && here.parentNode === from) { to.appendChild(document.createTextNode(" ")); to.appendChild(here); }
    });
  }
  function leave() {
    if (!on) return; on = false; root.hidden = true; root.innerHTML = ""; document.documentElement.classList.remove("nv-on");
    parked.forEach(function (d) { if (d.parentNode) retag(d, "h1"); }); parked = [];
    markNav(false);
  }
  function enter() {
    on = true; root.hidden = false; document.documentElement.classList.add("nv-on");
    if (!parked.length) parked = homeH1s().map(function (h) { return retag(h, "div"); });
    markNav(true);
  }
  function route() {
    var h = decodeURIComponent(location.hash || "");
    if (h.indexOf("#/notes") !== 0) {
      if (on) { leave(); var el = h.length > 1 ? document.getElementById(h.slice(1)) : null; if (el) el.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0); }
      return;
    }
    var id = h.replace(/^#\/notes\/?/, "");
    enter();
    if (!id) index();
    else if (id === "today") { var td = N.todays(CFG.slug); if (SHEP && td) devotional(td); else index("Demo: daily devotionals come with the Shepherd plan. Sunday's notes are here every week."); }
    else if (id.indexOf("preview/") === 0) {
      var pid = id.slice(8), pd = N.find(CFG.slug, pid);
      if (pd && pd.status === "draft" && pd.kind === "sermon") article(N.shaped(pd), true);
      else if (pd && pd.status === "draft" && SHEP) devotional(N.shaped(pd), true);
      else index("That preview is not available. Here is every Sunday so far.");
    }
    else {
      var n = sermons().filter(function (x) { return x.id === id; })[0];
      var d = !n && SHEP ? NC.devotionals.filter(function (x) { return x.id === id && x.date <= N.today; })[0] : null;
      if (n) article(n); else if (d) devotional(d); else index("That message's notes are not up yet. Here is every Sunday so far.");
    }
    window.scrollTo(0, 0);
    var t = root.querySelector("#nv-h1");
    if (t) { t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (e) {} }
    document.title = (root.querySelector("#nv-h1") || {}).textContent + " · " + NC.name;
  }
  var baseTitle = document.title;
  window.addEventListener("hashchange", function () { route(); if (!on) document.title = baseTitle; });

  root.addEventListener("click", function (e) {
    var chip = e.target.closest("[data-nv-chip]");
    if (chip) {
      var v = chip.getAttribute("data-nv-chip"), was = chip.getAttribute("aria-pressed") === "true";
      root.querySelectorAll("[data-nv-chip]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      if (!was) chip.setAttribute("aria-pressed", "true");
      state.chip = was ? "" : v; paintList(); return;
    }
    if (e.target.closest("[data-nv-ask]")) { if (window.HopeDemo && HopeDemo.open) HopeDemo.open(); return; }
    if (e.target.closest("[data-nv-watch]")) {
      /* The site's own message player opens its video window; the way back is the notes. */
      var player = document.querySelector(NC.watch + " [data-modal]");
      if (player) { player.click(); return; }
      location.hash = NC.watch;
      return;
    }
  });
  /* The site's own NAV and footer reach the notes with plain #/notes links; the hash does the rest. */
  route();
  window.NotesSite = { route: route, leave: leave, isOn: function () { return on; } };
})();
