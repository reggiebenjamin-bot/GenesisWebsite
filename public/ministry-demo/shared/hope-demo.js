/*
  Hope, guided demo edition (Genesis Ministry)

  One script for every template preview and for the Genesis Ministry platform preview. It adds:
  1. A chat circle that opens Hope (a sheet on phones, a panel on desktop).
  2. A guided tour: Hope walks the visitor through the page, one highlighted
     section at a time, explaining what a church gets and why it matters.
  3. Smooth scripted answers for the demo church and for questions about the
     Genesis Ministry package. No server, no tracking, no network calls.

  Each page sets window.HOPE_DEMO before loading this file:

    window.HOPE_DEMO = {
      look: "Bright & Modern",
      church: { name, short, city, address, phone, times, mapUrl, pastors, kids,
                students, groups, startHere, give, watch, prayer, values },
      brand: { accent, accentInk, accentText, ink, surface, surface2, line, font, radius, buttonRadius },
      selectors: { hero, announce, pastors, nextSteps, strip, message,
                   reviews, newsletter, footer },
      links: { brandBoard: "brand-board.html", socialPlan: "social-plan.html" },
      tour: [{ sel, k, h, p }],   // optional; sel may also be a list (the first visible one wins)
      removeSelectors: [],         // simpler chats to remove, so there is only one assistant
      bottomOffset: 0,             // extra space when a pinned bar sits at the bottom
      autoInvite: true             // the small "Want a tour?" card after a moment
    };

  Optional settings (every one defaults to the template behavior above):

      assistantName: "Hope",       the assistant's name everywhere in this script
      greeting: "text",            what the assistant says first when the chat opens
      menu: [{ label, key | href, cta }],       the chips under the greeting
      answers: { key: { t, c } },  extra scripted answers, merged over the defaults
      match: [[/regex/, "key"]],   extra keyword rules, checked before the defaults
      autoStartParam: "tour",      start the tour when the address has ?tour=1
      next: { label, href, note }, shown on the last tour card and in the finale, so a
                                   tour can continue on the next page (the link gets
                                   ?tour=1 and keeps the current ?church and ?plan)
      guideName: "Hope",           the name on the tour card (defaults to assistantName)
      tourTitle: "Home",           a short name for this page's tour
      finale: { text, chips },     what the assistant says when the tour ends
                                   (Genesis skin: links: [{ label, href }] adds buttons to the Done card)
      tour steps may also carry:   before: function () {}  runs before the step is drawn, so a step can
                                   open the panel it points at (the step is kept even if its target
                                   is not on screen yet); place: "edge-left" keeps the card at the left
                                   edge on wide screens
      note: "text",                the line under the chat
      invite: { text },            the invite's question
      launcher: false,             no chat circle (HopeDemo.open() still opens the chat)
      skin: "genesis",             draw the tour with the host page's Genesis OS guide
                                   (.v2-guide, .v2-guide-ring, .v2-button). No chat circle;
                                   openChat(prompt) opens the host's own assistant.
      openChat: function (prompt) {},
      placement: "side",           on wide screens put the card beside a narrow target
      topInset: 0 | function (scroller) { return px; },   room to keep clear at the top
      keepParams: ["church", "plan"]

  Copy rules: warm, plain, short sentences, no em dashes, no emojis.
*/
(function () {
  "use strict";
  if (window.__hopeDemoLoaded) return;
  window.__hopeDemoLoaded = true;

  var CFG = window.HOPE_DEMO || {};
  var CH = CFG.church || {};
  var BR = CFG.brand || {};
  var SEL = CFG.selectors || {};
  var LINKS = CFG.links || {};
  var LOOK = CFG.look || "this template";
  var NAME = CH.name || "our church";
  var SHORT = CH.short || NAME;
  var AN = CFG.assistantName || "Hope";
  var GUIDE = CFG.guideName || AN;
  var GENESIS = CFG.skin === "genesis";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function store(key, val) { try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; } }
  function val(v) { return typeof v === "function" ? v() : v; }
  /* On screen or reachable by scrolling: drawn, not hidden, and not parked off to the side (a closed menu sheet). */
  function visible(n) {
    if (!n || !n.getClientRects || !n.getClientRects().length) return false;
    var r = n.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0) || r.right <= 0 || r.left >= window.innerWidth) return false;
    try { if (getComputedStyle(n).visibility === "hidden") return false; } catch (e) {}
    return true;
  }
  /* A step's target: a selector or a list of them. The first one on screen wins. */
  function pick(sel) {
    var list = Array.isArray(sel) ? sel : [sel];
    for (var i = 0; i < list.length; i++) {
      if (!list[i]) continue;
      var all; try { all = document.querySelectorAll(list[i]); } catch (e) { continue; }
      for (var j = 0; j < all.length; j++) if (visible(all[j])) return all[j];
    }
    return null;
  }

  /* ---------------------------------------------------------------- styles */
  var css = [
    ":root{--hd-accent:" + (BR.accent || "#2f5bea") + ";--hd-accent-ink:" + (BR.accentInk || "#ffffff") + ";--hd-accent-text:" + (BR.accentText || BR.accent || "#2f5bea") + ";--hd-ink:" + (BR.ink || "#14161a") +
      ";--hd-surface:" + (BR.surface || "#ffffff") + ";--hd-surface2:" + (BR.surface2 || "#f3f4f6") + ";--hd-line:" + (BR.line || "rgba(0,0,0,.12)") +
      ";--hd-font:" + (BR.font || "system-ui,-apple-system,Segoe UI,Roboto,sans-serif") + ";--hd-radius:" + (BR.radius || "18px") + ";--hd-btn-radius:" + (BR.buttonRadius || "999px") + ";--hd-bottom:" + (Number(CFG.bottomOffset) || 0) + "px}",
    ".hd-launch{position:fixed;right:20px;bottom:calc(20px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483000;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:var(--hd-accent);color:var(--hd-accent-ink);box-shadow:0 12px 30px -10px rgba(0,0,0,.45);display:grid;place-items:center;transition:transform .25s cubic-bezier(.2,.7,.2,1)}",
    ".hd-launch:hover{transform:translateY(-2px)}.hd-launch:focus-visible{outline:3px solid var(--hd-ink);outline-offset:3px}",
    ".hd-launch svg{width:24px;height:24px}",
    ".hd-invite{position:fixed;right:20px;bottom:calc(88px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:290px;background:var(--hd-surface);color:var(--hd-ink);border:1px solid var(--hd-line);border-radius:var(--hd-radius);padding:16px 16px 14px;font:15px/1.5 var(--hd-font);box-shadow:0 24px 50px -24px rgba(0,0,0,.45);opacity:0;transform:translateY(8px);transition:opacity .35s ease,transform .35s cubic-bezier(.2,.7,.2,1)}",
    ".hd-invite.on{opacity:1;transform:none}",
    ".hd-invite p{margin:0 0 12px;padding-right:28px}.hd-invite b{font-weight:700}",
    ".hd-invite .hd-x{position:absolute;top:6px;right:6px;width:32px;height:32px;border:0;background:none;color:inherit;opacity:.6;cursor:pointer;font-size:18px;line-height:1}",
    ".hd-row{display:flex;flex-wrap:wrap;gap:8px}",
    ".hd-btn{font:600 14px/1 var(--hd-font);min-height:40px;padding:10px 16px;border-radius:var(--hd-btn-radius);border:1.5px solid var(--hd-accent);background:var(--hd-accent);color:var(--hd-accent-ink);cursor:pointer;transition:transform .2s ease,opacity .2s ease}",
    ".hd-btn.ghost{background:transparent;color:var(--hd-ink);border-color:var(--hd-line)}",
    ".hd-btn:hover{transform:translateY(-1px)}.hd-btn:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    ".hd-panel{position:fixed;right:20px;bottom:calc(88px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483001;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100vh - 130px));display:flex;flex-direction:column;background:var(--hd-surface);color:var(--hd-ink);border:1px solid var(--hd-line);border-radius:var(--hd-radius);box-shadow:0 30px 70px -24px rgba(0,0,0,.5);font:15px/1.5 var(--hd-font);overflow:hidden;opacity:0;visibility:hidden;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .25s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s .3s}",
    ".hd-panel.on{opacity:1;visibility:visible;transform:none;transition-delay:0s}",
    ".hd-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 12px 14px 18px;border-bottom:1px solid var(--hd-line)}",
    ".hd-head .t{font-weight:700;font-size:15px;line-height:1.2}.hd-head small{display:block;font-weight:400;font-size:12px;opacity:.7}",
    ".hd-dot{width:9px;height:9px;border-radius:50%;background:var(--hd-accent);display:inline-block;margin-right:10px;vertical-align:middle}",
    ".hd-head button{width:40px;height:40px;border:0;background:none;color:inherit;cursor:pointer;font-size:18px;border-radius:10px}",
    ".hd-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}",
    ".hd-msg{max-width:88%;padding:10px 14px;border-radius:16px;white-space:pre-line;animation:hdIn .35s cubic-bezier(.2,.7,.2,1) both}",
    ".hd-bot{background:var(--hd-surface2);border-bottom-left-radius:6px;align-self:flex-start}",
    ".hd-user{background:var(--hd-accent);color:var(--hd-accent-ink);border-bottom-right-radius:6px;align-self:flex-end}",
    ".hd-from{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.6;margin:4px 2px -4px}",
    ".hd-chips{display:flex;flex-wrap:wrap;gap:8px;animation:hdIn .35s .05s cubic-bezier(.2,.7,.2,1) both}",
    ".hd-chip{font:600 13.5px/1.2 var(--hd-font);padding:9px 13px;min-height:40px;border-radius:var(--hd-btn-radius);border:1.5px solid var(--hd-line);background:var(--hd-surface);color:var(--hd-ink);cursor:pointer;text-align:left}",
    ".hd-chip.cta{background:var(--hd-accent);border-color:var(--hd-accent);color:var(--hd-accent-ink)}",
    ".hd-chip:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    ".hd-typing{display:inline-flex;gap:5px;padding:14px 16px}.hd-typing i{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.35;animation:hdDot 1s infinite}",
    ".hd-typing i:nth-child(2){animation-delay:.15s}.hd-typing i:nth-child(3){animation-delay:.3s}",
    ".hd-foot{display:flex;gap:8px;padding:12px;border-top:1px solid var(--hd-line)}",
    ".hd-foot input{flex:1;min-width:0;font:16px var(--hd-font);padding:11px 15px;border-radius:999px;border:1.5px solid var(--hd-line);background:var(--hd-surface);color:var(--hd-ink)}",
    ".hd-foot input:focus{outline:none;border-color:var(--hd-accent)}",
    ".hd-foot button{width:44px;height:44px;flex:none;border-radius:50%;border:0;background:var(--hd-accent);color:var(--hd-accent-ink);cursor:pointer;display:grid;place-items:center}",
    ".hd-note{font-size:12px;opacity:.65;text-align:center;padding:0 16px 10px}",
    "@keyframes hdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "@keyframes hdDot{0%,80%,100%{opacity:.25;transform:none}40%{opacity:.9;transform:translateY(-3px)}}",
    /* tour */
    ".hd-spot{position:fixed;z-index:2147482998;border-radius:var(--hd-radius);box-shadow:0 0 0 9999px rgba(10,10,12,.62),0 0 0 3px var(--hd-accent);pointer-events:none;transition:top .45s cubic-bezier(.2,.7,.2,1),left .45s cubic-bezier(.2,.7,.2,1),width .45s cubic-bezier(.2,.7,.2,1),height .45s cubic-bezier(.2,.7,.2,1),opacity .3s ease;opacity:0}",
    ".hd-spot.on{opacity:1}",
    ".hd-card{position:fixed;z-index:2147482999;width:min(380px,calc(100vw - 32px));background:var(--hd-surface);color:var(--hd-ink);border-radius:var(--hd-radius);padding:20px 20px 16px;font:15px/1.55 var(--hd-font);box-shadow:0 30px 70px -20px rgba(0,0,0,.55);opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .35s cubic-bezier(.2,.7,.2,1),top .45s cubic-bezier(.2,.7,.2,1),left .45s cubic-bezier(.2,.7,.2,1)}",
    ".hd-card.on{opacity:1;transform:none}",
    ".hd-card .k{font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--hd-accent-text);margin:0 0 6px}",
    ".hd-card h3{font:700 19px/1.25 var(--hd-font);margin:0 0 8px}",
    ".hd-card p{margin:0 0 14px}",
    ".hd-card .hd-cnote{font-size:13px;line-height:1.5;opacity:.8;margin:-6px 0 14px}",
    ".hd-card .bar{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".hd-card .hd-next,.hd-end{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;margin-top:12px;text-decoration:none;text-align:center;line-height:1.2}.hd-end{margin-top:8px}",
    ".hd-dots{display:flex;gap:6px}.hd-dots i{width:7px;height:7px;border-radius:50%;background:var(--hd-line)}.hd-dots i.on{background:var(--hd-accent);width:18px;border-radius:4px}",
    ".hd-skip{background:none;border:0;color:inherit;opacity:.65;font:600 13px var(--hd-font);cursor:pointer;padding:8px 4px}",
    ".hd-skip:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px;opacity:1}",
    "@media (max-width:640px){",
    "  .hd-panel{right:0;left:0;bottom:0;width:auto;height:min(86vh,640px);border-radius:var(--hd-radius) var(--hd-radius) 0 0;transform-origin:bottom center;padding-bottom:env(safe-area-inset-bottom,0px)}",
    "  .hd-panel.on~.hd-launch,.hd-tour-on .hd-launch{opacity:0;pointer-events:none}",
    "  .hd-tour-on.hd-step-launch .hd-launch{opacity:1}",
    "  .hd-step-launch .hd-card{top:calc(12px + env(safe-area-inset-top,0px))!important;bottom:auto}",
    "  .hd-card{left:12px!important;right:12px;width:auto;top:auto!important;bottom:calc(12px + env(safe-area-inset-bottom,0px))}",
    "  .hd-invite{left:16px;right:16px;max-width:none}",
    "}",
    /* the Genesis OS guide (skin: "genesis") uses the host page's own .v2-guide styles; only these few extras */
    ".hd-g.v2-guide{z-index:2147482999}.hd-g-ring.v2-guide-ring{z-index:2147482998}",
    ".hd-g .v2-guide-controls .v2-button{min-height:32px}",
    ".hd-g .hd-g-next{gap:6px}",
    ".hd-g .v2-guide-foot [data-guide=\"back\"]{margin-left:0}",
    "@media (max-width:860px){.hd-g.v2-guide.is-top{top:calc(12px + env(safe-area-inset-top,0px))}}",
    "@media (prefers-reduced-motion:reduce){.hd-launch,.hd-invite,.hd-panel,.hd-msg,.hd-chips,.hd-spot,.hd-card,.hd-g,.hd-g-ring{transition:none!important;animation:none!important}.hd-typing i{animation:none}}",
  ].join("\n");
  var style = el("style"); style.id = "hope-demo-style"; style.textContent = css; document.head.appendChild(style);

  /* ------------------------------------------------------------- the chat */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.45-8.02a.5.5 0 0 0 0-.9L3.4 3.46a.5.5 0 0 0-.7.62L5 11.5l9 .5-9 .5-2.3 6.92a.5.5 0 0 0 .7.98z"/></svg>';
  var ICON_ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_GX = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // Remove any simpler chat the template shipped with, so there is only one Hope.
  (CFG.removeSelectors || []).forEach(function (s) { try { document.querySelectorAll(s).forEach(function (n) { n.remove(); }); } catch (e) {} });

  var launch = null, panel = null, body = null, input = null, closeBtn = null;
  var isOpen = false, started = false, busy = false;
  if (!GENESIS) {
    launch = el("button", "hd-launch"); launch.type = "button"; launch.setAttribute("aria-label", "Chat with " + AN + ", the " + SHORT + " assistant"); launch.innerHTML = ICON_CHAT;
    panel = el("div", "hd-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", AN + ", the " + SHORT + " assistant");
    var head = el("div", "hd-head");
    var ttl = el("div", "t"); ttl.innerHTML = '<span class="hd-dot" aria-hidden="true"></span><span class="hd-name"></span><small></small>'; ttl.querySelector(".hd-name").textContent = AN; ttl.querySelector("small").textContent = "Automated assistant for " + SHORT;
    closeBtn = el("button"); closeBtn.type = "button"; closeBtn.setAttribute("aria-label", "Close chat"); closeBtn.innerHTML = ICON_X;
    head.appendChild(ttl); head.appendChild(closeBtn);
    body = el("div", "hd-body"); body.setAttribute("aria-live", "polite");
    var note = el("div", "hd-note", CFG.note || "Demo: answers are scripted for this sample church.");
    var foot = el("form", "hd-foot");
    input = el("input"); input.type = "text"; input.placeholder = "Ask " + AN + " a question"; input.setAttribute("aria-label", "Ask " + AN + " a question"); input.autocomplete = "off";
    var send = el("button"); send.type = "submit"; send.setAttribute("aria-label", "Send"); send.innerHTML = ICON_SEND;
    foot.appendChild(input); foot.appendChild(send);
    panel.appendChild(head); panel.appendChild(body); panel.appendChild(note); panel.appendChild(foot);
    document.body.appendChild(panel);
    if (CFG.launcher !== false) document.body.appendChild(launch); else launch = null;

    if (launch) launch.addEventListener("click", function () { setOpen(!isOpen); });
    closeBtn.addEventListener("click", function () { setOpen(false); if (launch) launch.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen && !touring) setOpen(false); });
    foot.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q || busy) return;
      input.value = ""; addUser(q);
      if (CRISIS.test(q)) { say("I am an automated assistant, and I want you to be safe. If you are in danger, call 911 now. You can call or text 988 any time to reach the Suicide and Crisis Lifeline." + (CH.phone ? " You can also call the church at " + CH.phone + "." : ""), [{ label: "Back to the menu", key: "menu" }]); return; }
      for (var i = 0; i < MATCH.length; i++) { if (MATCH[i][0].test(q)) { answer(MATCH[i][1]); return; } }
      say(CFG.fallback || "Good question. On a live church site I would answer that from the church's own facts, or pass it to a real person on the team. For this demo, try one of these.", MENU);
    });
  }

  function setOpen(v) {
    if (!panel) { if (v && CFG.openChat) CFG.openChat(); return; }
    isOpen = v; panel.classList.toggle("on", v); if (launch) launch.innerHTML = v ? ICON_X : ICON_CHAT;
    if (launch) launch.setAttribute("aria-expanded", v ? "true" : "false");
    if (v) { hideInvite(); if (!started) { started = true; greet(); } setTimeout(function () { input.focus({ preventScroll: true }); }, 280); }
  }
  function openChat(prompt) {
    if (CFG.openChat) { CFG.openChat(prompt); return; }
    setOpen(true);
  }

  function scrollDown() { if (body) body.scrollTop = body.scrollHeight; }
  function addUser(text) { var m = el("div", "hd-msg hd-user", text); body.appendChild(m); scrollDown(); }
  function addChips(chips) {
    if (!chips || !chips.length) return;
    var row = el("div", "hd-chips");
    chips.forEach(function (c) {
      if (!c || (!c.key && !c.href && !c.go && !c.run)) return;
      var b = el("button", "hd-chip" + (c.cta ? " cta" : ""), c.label); b.type = "button";
      b.addEventListener("click", function () { onChip(c); });
      row.appendChild(b);
    });
    body.appendChild(row); scrollDown();
  }
  // Hope "types": a short pause that grows with the answer, then the reply slides in.
  function say(text, chips, done) {
    if (!body) { if (done) done(); return; }
    busy = true;
    var from = el("div", "hd-from", AN);
    var dots = el("div", "hd-msg hd-bot hd-typing"); dots.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(dots); scrollDown();
    var wait = REDUCE ? 150 : Math.min(1300, 420 + text.length * 5);
    setTimeout(function () {
      dots.remove();
      body.appendChild(from);
      body.appendChild(el("div", "hd-msg hd-bot", text));
      addChips(chips); scrollDown(); busy = false;
      if (done) done();
    }, wait);
  }

  /* ------------------------------------------------------------ answers */
  var A = {
    times: { t: "We gather " + (CH.times || "every Sunday") + " at " + (CH.address || "our building") + (CH.city ? ", " + CH.city : "") + ". Plan for about " + (CH.length || "75 minutes") + ", and wear whatever is comfortable.", c: [{ label: "Get Directions", href: CH.mapUrl, cta: true }, { label: "I am new here", key: "newhere" }] },
    newhere: { t: CH.startHere || ("So glad you are here. The best first step is to visit on a Sunday, then come to Start Here to meet the team and find where you fit."), c: [{ label: "Service times", key: "times", cta: true }, { label: "Kids", key: "kids" }] },
    kids: { t: CH.kids || "Kids are welcome every Sunday, with a safe, fun class and a nursery for little ones.", c: [{ label: "Students", key: "students" }, { label: "Service times", key: "times" }] },
    students: { t: CH.students || "Students have their own time together during the month, with events through the year.", c: [{ label: "Small groups", key: "groups" }, { label: "Service times", key: "times" }] },
    groups: { t: CH.groups || "Small groups meet during the week in homes across the city. It is the best way to make church feel like family.", c: [{ label: "I am new here", key: "newhere" }] },
    give: { t: CH.give || "You can give securely online in about a minute, once or every month.", c: [{ label: "Watch a message", key: "watch" }] },
    watch: { t: CH.watch || "Every message is online after Sunday, and the late gathering is live each week.", c: [{ label: "Service times", key: "times" }] },
    prayer: { t: CH.prayer || "We would be honored to pray with you. Share your request and our pastors and prayer team will stand with you. If you are in crisis, call or text 988, or 911 in an emergency.", c: [{ label: "Back to the menu", key: "menu" }] },
    pastors: { t: CH.pastors || "Our pastors would love to meet you on a Sunday.", c: [{ label: "Service times", key: "times" }] },
    values: { t: CH.values || "We are ordinary people learning to love God and one another.", c: [{ label: "I am new here", key: "newhere" }] },
    /* questions a church leader asks about the product */
    package: { t: "Every Genesis Ministry church gets four things: a website in one of four looks (this one is " + LOOK + "), a brand board, a social marketing plan, and " + AN + ", an assistant like me trained on your church's own facts. Depending on your plan, you also get the back office, where your team cares for people: prayer, messages and spiritual gifts in one place.", c: [{ label: "What is the back office?", key: "backoffice", cta: true }, { label: "Can we customize it?", key: "custom" }, { label: "See the brand board", href: LINKS.brandBoard }, { label: "See the social plan", href: LINKS.socialPlan }] },
    custom: { t: "Every template is filled with your church's content, photos and colors. Changes beyond the template, such as new page layouts or special features, are available for an additional cost.", c: [{ label: "How does " + AN + " work?", key: "hope" }, { label: "Take the tour", key: "tour", cta: true }] },
    price: { t: "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.", c: [{ label: "Book a Consultation", href: "/contact?topic=ministry", go: true, cta: true }, { label: "What do we get?", key: "package" }] },
    hope: { t: "On your live site, " + AN + " answers questions day and night from facts your team approves: times, kids, next steps, giving. " + AN + " hands prayer requests and personal questions to a real person, and gives crisis numbers right away when someone is hurting. " + AN + " never makes things up.", c: [{ label: "What do we get?", key: "package" }, { label: "Take the tour", key: "tour", cta: true }] },
    backoffice: { t: "The back office comes with it depending on your plan. Each person gets one private record: prayer requests with a history, message threads with your staff, and a spiritual gifts conversation. Your staff get one shared inbox and follow up reminders, and your pastor sees a picture of the gifts across the whole church.", c: [{ label: "What do we get?", key: "package" }, { label: "Can we customize it?", key: "custom" }] },
    menu: null,
  };
  if (AN === "Hope") A.hope.t = "On your live site, Hope answers questions day and night from facts your team approves: times, kids, next steps, giving. She hands prayer requests and personal questions to a real person, and she gives crisis numbers right away when someone is hurting. She never makes things up.";
  if (CFG.answers) for (var ak in CFG.answers) if (Object.prototype.hasOwnProperty.call(CFG.answers, ak)) A[ak] = CFG.answers[ak];
  var MENU = CFG.menu && CFG.menu.length ? CFG.menu : [
    { label: "Take the guided demo", key: "tour", cta: true },
    { label: "What does a church get?", key: "package" },
    { label: "Service times", key: "times" },
    { label: "I am new here", key: "newhere" },
    { label: "Kids and students", key: "kids" },
    { label: "Can we customize it?", key: "custom" },
  ];
  // Most specific first. Patterns allow plurals and word stems. A page's own rules come first.
  var MATCH = (CFG.match || []).map(function (m) { return Array.isArray(m) ? m : [m.match || m.re, m.key]; }).filter(function (m) { return m[0] && m[0].test; }).concat([
    [/\b(tours?|demos?|walk ?through|show me)\b/i, "tour"],
    [/\b(prices?|pricing|costs?|fees?)\b|\bhow much (does|is|will|would) (it|this|genesis|the (template|website|site|platform))\b/i, "price"],
    [/\b(custom\w*|change|edit|colou?rs?|logos?|fonts?)\b/i, "custom"],
    [/\b(packages?|includ\w*|offers?|brand ?boards?|social|marketing|templates?|what do (we|i) get)\b/i, "package"],
    [/\b(hope|chat ?bots?|assistants?|ai)\b/i, "hope"],
    [/\b(back ?office|crm|spiritual gifts?|gifts? (assessment|test|conversation)|care (inbox|team)|staff inbox|care)\b/i, "backoffice"],
    [/\b(kids?|child\w*|nursery|bab(y|ies)|toddlers?|vbs|vacation bible)\b/i, "kids"],
    [/\b(students?|youth|teens?|teenagers?|middle school|high school|young adults?|college)\b/i, "students"],
    [/\b(small groups?|groups?|bible stud(y|ies)|life groups?)\b/i, "groups"],
    [/\b(giv(e|ing)|gifts?|tith\w*|donat\w*|offerings?)\b/i, "give"],
    [/\b(watch\w*|online|live|stream\w*|sermons?|messages?|podcasts?)\b/i, "watch"],
    [/\b(pray\w*|hurting|sick|struggl\w*)\b/i, "prayer"],
    [/\b(pastors?|leaders?|who runs|staff)\b/i, "pastors"],
    [/\b(believ\w*|beliefs?|values?|mission|denomination\w*)\b/i, "values"],
    [/\b(times?|when|sundays?|services?|gatherings?|where|address|location|park\w*|directions?|wear)\b/i, "times"],
    [/\b(new|first time|start\w*|visit\w*|join\w*|members?|membership)\b/i, "newhere"],
  ]);
  // Same pattern as the live church site's crisis check. Word stems use \w* so "suicide",
  // "suicidal" and "overdosed" all match.
  var CRISIS = /\b(suicid\w*|kill(?:ing)? (?:myself|my self)|end(?:ing)? (?:my|my own) life|end it all|take my (?:own )?life|want(?:ed)? to die|wanna die|don'?t want to (?:live|be alive|be here)|hurt(?:ing)? myself|harm(?:ing)? myself|self[- ]?harm\w*|cut(?:ting)? myself|overdos\w*|no reason to live|better off (?:dead|without me)|not safe at home|(?:hits|hit|beats|beating|abus\w+) me|being abused|(?:i am|i'?m|we are|we'?re) in danger)\b/i;

  function onChip(c) {
    addUser(c.label);
    if (c.run) { c.run(); return; }
    if (c.go) { location.href = c.go === true ? c.href : c.go; return; }
    if (c.href) { window.open(c.href, "_blank", "noopener"); say("Opened in a new tab. Anything else I can show you?", MENU.slice(0, 4)); return; }
    answer(c.key);
  }
  function answer(key) {
    if (key === "tour") { say(CFG.tourIntro || "Great. I will walk you through the page one section at a time. Use Next to move on, or press Escape any time to stop.", null, function () { setTimeout(startTour, REDUCE ? 50 : 600); }); return; }
    if (key === "menu" || !A[key]) { say("Here are a few things I can help with.", MENU); return; }
    say(val(A[key].t), val(A[key].c));
  }
  function greet() {
    say(val(CFG.greeting) || ("Hi, I am " + AN + ", the assistant for " + NAME + ". This is a live preview of the " + LOOK + " template from Genesis Ministry. Want a quick guided demo of the site, or do you have a question?"), MENU);
  }

  /* ------------------------------------------------------------- invite */
  var invite = null;
  var INVITE_KEY = CFG.inviteKey || "hd-invited";
  function hideInvite() { if (invite) { invite.classList.remove("on"); var n = invite; invite = null; setTimeout(function () { n.remove(); }, GENESIS ? 0 : 400); } }
  function showInvite() {
    if (isOpen || touring || store(INVITE_KEY)) return;
    store(INVITE_KEY, "1");
    if (GENESIS) {
      /* The real Genesis OS offer: a guide card docked at the bottom, Start and Not Now. */
      invite = el("section", "v2-guide hd-g"); invite.setAttribute("aria-label", "Guided demo with " + GUIDE);
      invite.innerHTML = '<div class="v2-guide-head"><span class="v2-guide-eyebrow"></span></div><p class="v2-guide-say" role="status"></p><p class="v2-guide-caption"></p>' +
        '<div class="v2-guide-controls"><button class="v2-button v2-button-primary" type="button" data-guide="start">Start the Tour</button><button class="v2-button v2-button-quiet" type="button" data-guide="later">Not Now</button></div>';
      invite.querySelector(".v2-guide-eyebrow").textContent = GUIDE;
      invite.querySelector(".v2-guide-say").textContent = (CFG.invite && CFG.invite.text) || "Want a short guided demo of this screen?";
      invite.querySelector(".v2-guide-caption").textContent = (CFG.invite && CFG.invite.caption) || "A few short steps on this screen. Sample data only. Nothing is sent.";
      document.body.appendChild(invite);
      invite.addEventListener("click", function (e) {
        var b = e.target.closest("[data-guide]"); if (!b) return;
        var a = b.getAttribute("data-guide"); hideInvite();
        if (a === "start") startTour();
      });
      return;
    }
    invite = el("div", "hd-invite"); invite.setAttribute("role", "status");
    var p = el("p"); p.innerHTML = "<b></b> "; p.querySelector("b").textContent = "Hi, I am " + AN + "."; p.appendChild(document.createTextNode((CFG.invite && CFG.invite.text) || "Want a 60 second tour of this template?"));
    var x = el("button", "hd-x"); x.type = "button"; x.setAttribute("aria-label", "Dismiss"); x.textContent = "×";
    var row = el("div", "hd-row");
    var go = el("button", "hd-btn", "Start the Tour"); go.type = "button";
    var ask = el("button", "hd-btn ghost", "Ask " + AN); ask.type = "button";
    row.appendChild(go); row.appendChild(ask);
    invite.appendChild(x); invite.appendChild(p); invite.appendChild(row);
    document.body.appendChild(invite);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (invite) invite.classList.add("on"); }); });
    x.addEventListener("click", hideInvite);
    go.addEventListener("click", function () { hideInvite(); startTour(); });
    ask.addEventListener("click", function () { hideInvite(); setOpen(true); });
  }
  if (GENESIS ? CFG.autoInvite === true : CFG.autoInvite !== false) setTimeout(showInvite, 2200);

  /* --------------------------------------------------------------- tour */
  var DEFAULT_STEPS = [
    { sel: SEL.hero, k: "First impression", h: "Everything a guest needs on the first screen", p: "Service times, the address and one clear next step, over a calm moving photo or film. Most people decide in a few seconds whether to visit, so this screen does the most work." },
    { sel: SEL.announce, k: "Announcements", h: "One big thing, without a pop-up", p: "A building campaign, a conference or Easter. One line, one button, and it opens a video when you want it. Your team changes it in a minute." },
    { sel: SEL.pastors, k: "Your people", h: "Put faces and a mission up front", p: "Guests want to know who leads and what the church is about before they walk in. Real photos of your pastors do more than any paragraph." },
    { sel: SEL.nextSteps, k: "Next steps", h: "A clear path for every visitor", p: "Plan a visit, get to know us, give, then Start Here, small groups, events and prayer. Each one gently moves as you scroll, so the page feels alive without being busy." },
    { sel: SEL.strip, k: "Church life", h: "Show what a Sunday really feels like", p: "A slow moving strip of your own photos. It pauses when someone hovers, and it stays still for anyone who prefers less motion." },
    { sel: SEL.message, k: "Messages", h: "Your latest message, updated for you", p: "On the live site this pulls the newest message from YouTube automatically, so the home page is never out of date." },
    { sel: SEL.reviews, k: "Trust", h: "Real words from real people", p: "Your Google reviews rotate here. A short quote from a neighbor is often what turns a maybe into a visit." },
    { sel: SEL.newsletter, k: "Stay connected", h: "Grow a list you own", p: "A simple newsletter sign up, so people who are not ready to visit can still hear from you." },
    { sel: ".hd-launch", k: AN, h: "An assistant that never sleeps", p: "That is me. On your site I answer questions from your church's own facts, take prayer requests to your team, and give crisis numbers right away when someone is hurting." },
    { sel: SEL.footer, k: "Every page", h: "Built around your Sunday", p: "Times, address and directions sit in the footer of every page, and on phones a slim bar keeps them one tap away." },
  ];
  /* Steps are worked out when the tour starts, so a page can draw its sections first. */
  function resolveSteps() {
    var raw = typeof CFG.tour === "function" ? CFG.tour() : (CFG.tour && CFG.tour.length ? CFG.tour : DEFAULT_STEPS);
    return (raw || []).filter(function (s) { return s && (s.sel === ".hd-launch" ? !!launch : (typeof s.before === "function" || !!pick(s.sel))); });
  }

  /* The next page of the demo: the link keeps the church and plan and starts that page's tour. */
  var NEXT = val(CFG.next) || null;
  function nextHref() {
    if (!NEXT || !NEXT.href) return "";
    var href = NEXT.href, hash = "", q = "";
    var hi = href.indexOf("#"); if (hi >= 0) { hash = href.slice(hi); href = href.slice(0, hi); }
    var qi = href.indexOf("?"); if (qi >= 0) { q = href.slice(qi + 1); href = href.slice(0, qi); }
    var p = new URLSearchParams(q), cur = new URLSearchParams(location.search);
    (CFG.keepParams || ["church", "plan"]).forEach(function (k) { if (!p.has(k) && cur.get(k)) p.set(k, cur.get(k)); });
    if (NEXT.tour !== false) p.set(CFG.autoStartParam || "tour", "1");
    var qs = p.toString();
    return href + (qs ? "?" + qs : "") + hash;
  }

  var STEPS = [];
  var WIDE = 560; // wider than this, a Genesis guide card prefers to sit under or over its target
  var touring = false, idx = 0, spot = null, card = null, rafId = 0, returnTo = null, settleTimer = 0;
  function startTour() {
    if (touring) endTour(false);
    if (card) { card.remove(); card = null; }
    if (spot) { spot.remove(); spot = null; }
    STEPS = resolveSteps();
    NEXT = val(CFG.next) || null; // worked out again each time, so it can follow a choice made on the page
    if (!STEPS.length) {
      if (GENESIS) { openChat(); return; }
      setOpen(true); say("This page has no sections tagged for the tour yet.", MENU); return;
    }
    returnTo = document.activeElement;
    if (panel) setOpen(false);
    hideInvite(); touring = true; idx = 0;
    document.documentElement.classList.add("hd-tour-on");
    if (GENESIS) {
      spot = el("div", "v2-guide-ring hd-g-ring"); spot.setAttribute("aria-hidden", "true"); spot.hidden = true;
      card = el("section", "v2-guide hd-g"); card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Guided demo with " + GUIDE);
    } else {
      spot = el("div", "hd-spot"); spot.setAttribute("aria-hidden", "true");
      card = el("div", "hd-card"); card.setAttribute("role", "dialog"); card.setAttribute("aria-live", "polite"); card.setAttribute("aria-label", "Guided demo");
    }
    document.body.appendChild(spot); document.body.appendChild(card);
    document.addEventListener("scroll", place, { passive: true, capture: true }); window.addEventListener("resize", place);
    document.addEventListener("keydown", tourKeys);
    if (typeof CFG.onTourStart === "function") try { CFG.onTourStart(); } catch (e) {}
    show(0);
  }
  function endTour(finale) {
    if (!touring && !finale) return;
    touring = false;
    clearTimeout(settleTimer);
    document.documentElement.classList.remove("hd-tour-on", "hd-step-launch");
    document.removeEventListener("scroll", place, { capture: true }); window.removeEventListener("resize", place);
    document.removeEventListener("keydown", tourKeys);
    cancelAnimationFrame(rafId);
    if (GENESIS) {
      if (spot) spot.remove();
      if (finale && card) { showDone(); return; }
      if (card) card.remove();
      spot = card = null;
      if (returnTo && returnTo.focus && document.contains(returnTo)) try { returnTo.focus({ preventScroll: true }); } catch (e) {}
      if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(!!finale); } catch (e) {}
      return;
    }
    [spot, card].forEach(function (n) { if (n) { n.classList.remove("on"); setTimeout(function () { n.remove(); }, 350); } });
    spot = card = null;
    if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(!!finale); } catch (e) {}
    if (finale) {
      started = true;
      setOpen(true);
      var fin = val(CFG.finale) || {};
      var chips = fin.chips || [
        { label: "See the brand board", href: LINKS.brandBoard, cta: true },
        { label: "See the social plan", href: LINKS.socialPlan },
        { label: "What is the back office?", key: "backoffice" },
        { label: "How does " + AN + " work?", key: "hope" },
        { label: "Take the tour again", key: "tour" },
      ];
      if (NEXT && NEXT.href) chips = [{ label: NEXT.label || "Continue the Demo", href: nextHref(), go: true, cta: true }].concat(chips.map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; o.cta = false; return o; }));
      say(fin.text || ("That is the tour. Every Genesis Ministry church gets this website in its own content and photos, plus a brand board, a social marketing plan, and me. Depending on your plan, the back office comes too. Customization beyond the template is available for an additional cost.") + (NEXT && NEXT.note ? "\n\n" + NEXT.note : ""), chips);
    } else if (returnTo && returnTo.focus && document.contains(returnTo) && returnTo !== document.body) {
      try { returnTo.focus({ preventScroll: true }); } catch (e) {}
    } else if (launch) launch.focus();
  }
  function tourKeys(e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (e.key === "Escape") { e.preventDefault(); endTour(false); }
    else if (typing) return;
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  }
  function next() { if (!touring) return; if (idx < STEPS.length - 1) show(idx + 1); else endTour(true); }
  function back() { if (!touring) return; if (idx > 0) show(idx - 1); }
  function target() { return STEPS[idx] ? pick(STEPS[idx].sel) : null; }
  function isPhone() { return window.innerWidth <= (GENESIS ? 860 : 640); }

  /* The element that scrolls a target: a scrolling ancestor, or the page itself (null). */
  function scrollParent(n) {
    for (var p = n && n.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var oy = getComputedStyle(p).overflowY;
      if ((oy === "auto" || oy === "scroll" || oy === "overlay") && p.scrollHeight > p.clientHeight + 1) return p;
    }
    return null;
  }
  function inset(sp) { var v = CFG.topInset; return Math.max(0, Number(typeof v === "function" ? v(sp) : v) || 0); }
  /* Bring the target into view so it and the card both fit. With no scroll container and no
     inset this is the same arithmetic the template tour has always used. */
  function bringIntoView(t, cardH, cardW) {
    var sp = scrollParent(t), vh = window.innerHeight, vw = window.innerWidth;
    var box = sp ? sp.getBoundingClientRect() : { top: 0, bottom: vh };
    var rTop = Math.max(0, box.top) + inset(sp), rBottom = Math.min(vh, box.bottom), rH = Math.max(80, rBottom - rTop);
    var r = t.getBoundingClientRect(), phone = isPhone(), desired;
    var beside = !phone && (GENESIS || CFG.placement === "side") && !(GENESIS && r.width > WIDE && r.height + cardH + 56 <= rH) && (r.right + 16 + cardW <= vw - 12 || r.left - 16 - cardW >= 12);
    if (phone) {
      var room = rH - cardH - 24;
      desired = r.height <= room ? rTop + Math.max(GENESIS ? 12 : 16, Math.min(80, (room - r.height) / 2)) : rTop + (GENESIS ? 8 : 16);
    } else if (beside) {
      desired = r.height + 48 <= rH ? rTop + (rH - r.height) / 2 : rTop + 24;
    } else if (r.height + cardH + 56 <= rH) {
      desired = rTop + Math.max(24, (rH - r.height - cardH - 16) / 2);
    } else {
      desired = rTop + (GENESIS ? 24 : 90);
    }
    var delta = r.top - desired;
    if (Math.abs(delta) < 3) return;
    var how = REDUCE ? "auto" : "smooth";
    if (sp) sp.scrollTo({ top: Math.max(0, sp.scrollTop + delta), behavior: how });
    else window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior: how });
  }

  function show(i) {
    idx = i;
    if (STEPS[i] && typeof STEPS[i].before === "function") { try { STEPS[i].before(); } catch (e) {} }
    var s = STEPS[i], t = target(), last = i === STEPS.length - 1, nh = last ? nextHref() : "";
    document.documentElement.classList.toggle("hd-step-launch", s.sel === ".hd-launch");
    if (GENESIS) paintGenesis(s, i, last, nh); else paintSite(s, i, last, nh);
    if (t && s.sel !== ".hd-launch") bringIntoView(t, card.offsetHeight || 230, GENESIS && !isPhone() ? 340 : (card.offsetWidth || 360));
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      place();
      if (!card) return;
      if (GENESIS) { if (spot) spot.hidden = false; card.style.visibility = ""; } else { if (spot) spot.classList.add("on"); card.classList.add("on"); }
      var f = card.querySelector("[data-hd-focus]"); if (f) f.focus({ preventScroll: true });
    }, REDUCE ? 60 : 520);
  }
  function paintSite(s, i, last, nh) {
    card.classList.remove("on");
    card.innerHTML = "";
    var kk = s.k || (CFG.tourTitle ? GUIDE + " · " + CFG.tourTitle : GUIDE);
    var k = el("p", "k", kk + "  ·  " + (i + 1) + " of " + STEPS.length);
    var h = el("h3", null, s.h);
    var p = el("p", null, s.p);
    var bar = el("div", "bar");
    var dots = el("div", "hd-dots"); STEPS.forEach(function (_, j) { dots.appendChild(el("i", j === i ? "on" : "")); });
    var ctr = el("div", "hd-row");
    var skip = el("button", "hd-skip", "End Tour"); skip.type = "button";
    var bk = el("button", "hd-btn ghost", "Back"); bk.type = "button"; bk.disabled = i === 0; if (i === 0) bk.style.visibility = "hidden";
    var nx = el("button", "hd-btn" + (last && nh ? " ghost" : ""), last ? "Finish" : "Next"); nx.type = "button";
    ctr.appendChild(bk); ctr.appendChild(nx);
    bar.appendChild(skip); bar.appendChild(ctr);
    card.appendChild(k); card.appendChild(h); card.appendChild(p);
    if (s.note) card.appendChild(el("p", "hd-cnote", s.note));
    card.appendChild(dots); card.appendChild(bar);
    dots.style.margin = "0 0 12px";
    if (last && nh) {
      var a = el("a", "hd-btn hd-next"); a.href = nh; a.setAttribute("data-hd-focus", "");
      a.appendChild(document.createTextNode(NEXT.label || "Continue the Demo")); a.insertAdjacentHTML("beforeend", ICON_ARROW);
      card.appendChild(a);
      if (CFG.endLink) { var ea = el("a", "hd-btn ghost hd-end"); ea.href = CFG.endLink.href; ea.textContent = CFG.endLink.label; card.appendChild(ea); }
    } else nx.setAttribute("data-hd-focus", "");
    skip.addEventListener("click", function () { endTour(false); });
    bk.addEventListener("click", back); nx.addEventListener("click", next);
  }
  function guideHead(count, closeLabel) {
    return '<div class="v2-guide-head"><span class="v2-guide-eyebrow"></span>' + (count ? '<span class="v2-guide-count"></span>' : "") +
      (closeLabel ? '<button class="v2-guide-icon v2-guide-close" type="button" data-guide="exit" aria-label="' + closeLabel + '" title="' + closeLabel + '">' + ICON_GX + "</button>" : "") + "</div>";
  }
  function paintGenesis(s, i, last, nh) {
    /* The card keeps its place between steps, so it glides to the next target the way Genesis OS does.
       The first step stays out of sight until it has a place. */
    if (i === 0 && !card.hasAttribute("data-placed")) card.style.visibility = "hidden";
    var title = CFG.tourTitle || s.k || "";
    card.innerHTML = guideHead(false, "End Tour") +
      '<h2 class="v2-guide-title"></h2><p class="v2-guide-say" role="status" aria-live="polite"></p>' + (s.note ? '<p class="v2-guide-note"></p>' : "") +
      '<div class="v2-guide-foot"><span class="v2-guide-count"></span>' +
      (i > 0 ? '<button class="v2-button v2-button-quiet" type="button" data-guide="back">Back</button>' : "") +
      '<button class="v2-button' + (last && nh ? "" : " v2-button-primary") + ' v2-guide-next" type="button" data-guide="next"' + (last && nh ? "" : " data-hd-focus") + ">" + (last ? "Finish" : "Next") + "</button></div>" +
      (last && nh ? '<div class="v2-guide-controls"><a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a>' + (CFG.endLink ? '<a class="v2-button hd-g-end"></a>' : "") + "</div>" : "");
    card.querySelector(".v2-guide-eyebrow").textContent = GUIDE + (title ? " · " + title : "");
    card.querySelector(".v2-guide-title").textContent = s.h;
    card.querySelector(".v2-guide-say").textContent = s.p;
    if (s.note) card.querySelector(".v2-guide-note").textContent = s.note;
    card.querySelector(".v2-guide-count").textContent = (i + 1) + " of " + STEPS.length;
    if (last && nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }
    var ea = card.querySelector(".hd-g-end"); if (ea) { ea.href = CFG.endLink.href; ea.textContent = CFG.endLink.label; }
    card.onclick = function (e) {
      var b = e.target.closest("[data-guide]"); if (!b) return;
      var act = b.getAttribute("data-guide");
      if (act === "next") next(); else if (act === "back") back(); else if (act === "exit") endTour(false);
    };
  }
  /* The finale on Genesis screens: the real guide's "Done" card, docked at the bottom. */
  function showDone() {
    var fin = val(CFG.finale) || {}, nh = nextHref();
    card.className = "v2-guide hd-g";
    card.removeAttribute("data-side");
    card.style.left = card.style.top = "";
    card.style.removeProperty("--v2-guide-arrow");
    card.innerHTML = guideHead(true, "") + '<p class="v2-guide-say" role="status"></p>' + (NEXT && NEXT.note ? '<p class="v2-guide-note"></p>' : "") +
      '<div class="v2-guide-controls">' + (nh ? '<a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a>' : "") +
      (fin.links || []).map(function (l, li) { return '<a class="v2-button" data-guide-link="' + li + '"></a>'; }).join("") +
      (CFG.openChat ? '<button class="v2-button" type="button" data-guide="ask"></button>' : "") +
      '<button class="v2-button' + (nh ? " v2-button-quiet" : " v2-button-primary") + '" type="button" data-guide="close"' + (nh ? "" : " data-hd-focus") + ">Close</button>" +
      '<button class="v2-button v2-button-quiet" type="button" data-guide="again">Take the Tour Again</button></div>';
    var title = CFG.tourTitle || "";
    card.querySelector(".v2-guide-eyebrow").textContent = GUIDE + (title ? " · " + title : "");
    card.querySelector(".v2-guide-count").textContent = "Done";
    card.querySelector(".v2-guide-say").textContent = fin.text || "That is the tour of this screen.";
    if (NEXT && NEXT.note) card.querySelector(".v2-guide-note").textContent = NEXT.note;
    if (nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }
    (fin.links || []).forEach(function (l, li) { var la = card.querySelector('[data-guide-link="' + li + '"]'); if (la) { la.href = l.href; la.textContent = l.label; } });
    var ask = card.querySelector('[data-guide="ask"]'); if (ask) ask.textContent = fin.askLabel || ("Ask " + AN);
    var doneCard = card;
    function closeDone() { doneCard.remove(); if (card === doneCard) card = null; spot = null; if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(true); } catch (e) {} }
    card.onclick = function (e) {
      var b = e.target.closest("[data-guide]"); if (!b) return;
      var act = b.getAttribute("data-guide");
      if (act === "close") { closeDone(); if (returnTo && returnTo.focus && document.contains(returnTo)) try { returnTo.focus({ preventScroll: true }); } catch (x) {} }
      else if (act === "ask") { closeDone(); openChat(fin.askPrompt || ""); }
      else if (act === "again") { closeDone(); startTour(); }
    };
    card.onkeydown = function (e) { if (e.key === "Escape") { e.preventDefault(); closeDone(); } };
    var f = card.querySelector("[data-hd-focus]"); if (f) f.focus({ preventScroll: true });
  }

  function place() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () {
      if (!touring || !spot || !card) return;
      var t = target(); if (!t) return;
      if (GENESIS) { placeGenesis(t); return; }
      var r = t.getBoundingClientRect(), pad = 10, vw = window.innerWidth, vh = window.innerHeight;
      var top = Math.max(8, r.top - pad), left = Math.max(8, r.left - pad);
      var bottom = Math.min(vh - 8, r.bottom + pad), right = Math.min(vw - 8, r.right + pad);
      spot.style.top = top + "px"; spot.style.left = left + "px";
      spot.style.width = Math.max(0, right - left) + "px"; spot.style.height = Math.max(0, bottom - top) + "px";
      if (vw <= 640) return; // the card docks to the bottom on phones
      var cw = card.offsetWidth, chh = card.offsetHeight, gap = 16;
      var stp = STEPS[idx];
      if (stp && stp.place === "edge-left") { card.style.top = Math.max(16, Math.min(vh - chh - 16, (top + bottom) / 2 - chh / 2)) + "px"; card.style.left = "16px"; return; }
      if (CFG.placement === "side") {
        var cyS = Math.max(16, Math.min(vh - chh - 16, (top + bottom) / 2 - chh / 2));
        if (right + gap + cw <= vw - 12) { card.style.top = cyS + "px"; card.style.left = (right + gap) + "px"; return; }
        if (left - gap - cw >= 12) { card.style.top = cyS + "px"; card.style.left = (left - gap - cw) + "px"; return; }
      }
      var below = bottom + gap + chh < vh, above = top - gap - chh >= 8;
      var cy = below ? bottom + gap : above ? top - gap - chh : vh - chh - 24;
      var cx = below || above ? Math.min(vw - cw - 16, Math.max(16, left)) : vw - cw - 24;
      /* In the corner, keep the card clear of the chat circle so Next is never covered. */
      if (!below && !above && launch && launch.isConnected) { var lr = launch.getBoundingClientRect(); if (lr.width && lr.left < cx + cw && lr.top < cy + chh) cy = Math.max(8, lr.top - chh - 12); }
      card.style.top = cy + "px"; card.style.left = cx + "px";
    });
  }
  /* Ring and card the way Genesis OS guided-session.js draws them: the card beside the target,
     to the right when there is room, then the left, below and above, with its arrow on the
     middle of the target. A phone, or a target with no room around it, keeps the card docked
     at the bottom, or at the top when the target sits under it. */
  function placeGenesis(t) {
    card.setAttribute("data-placed", "");
    var r = t.getBoundingClientRect(), pad = 6, vw = window.innerWidth, vh = window.innerHeight;
    var top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
    var bottom = Math.min(vh - 4, r.bottom + pad), right = Math.min(vw - 4, r.right + pad);
    spot.style.top = top + "px"; spot.style.left = left + "px";
    spot.style.width = Math.max(0, right - left) + "px"; spot.style.height = Math.max(0, bottom - top) + "px";
    var box = { top: top, left: left, right: right, bottom: bottom, width: right - left, height: bottom - top };
    if (vw > 860) {
      card.classList.add("is-anchored"); card.classList.remove("is-top");
      var w = card.offsetWidth || 340, h = card.offsetHeight || 180, gap = 16, m = 12;
      var cx = box.left + box.width / 2, cy = box.top + box.height / 2, side = "", L = 0, T = 0;
      var fits = {
        right: function () { if (box.right + gap + w <= vw - m) { side = "right"; L = box.right + gap; T = cy - h / 2; } },
        left: function () { if (box.left - gap - w >= m) { side = "left"; L = box.left - gap - w; T = cy - h / 2; } },
        bottom: function () { if (box.bottom + gap + h <= vh - m) { side = "bottom"; T = box.bottom + gap; L = cx - w / 2; } },
        top: function () { if (box.top - gap - h >= m) { side = "top"; T = box.top - gap - h; L = cx - w / 2; } }
      };
      /* A wide section reads best with the card under it (or over it); a narrow one, beside it. */
      (box.width > WIDE ? ["bottom", "top", "right", "left"] : ["right", "left", "bottom", "top"]).forEach(function (k) { if (!side) fits[k](); });
      if (side) {
        L = Math.max(m, Math.min(L, vw - m - w)); T = Math.max(m, Math.min(T, vh - h - m));
        var across = side === "right" || side === "left";
        var arrow = Math.max(18, Math.min(across ? cy - T : cx - L, (across ? h : w) - 18));
        card.style.left = Math.round(L) + "px"; card.style.top = Math.round(T) + "px";
        card.style.setProperty("--v2-guide-arrow", Math.round(arrow) + "px");
        card.setAttribute("data-side", side);
        return;
      }
    }
    card.classList.remove("is-anchored"); card.removeAttribute("data-side");
    card.style.left = card.style.top = "";
    var cw = card.offsetWidth || 440, ch = card.offsetHeight || 160, g = 12;
    var cl = vw / 2 - cw / 2, cb = vh - (vw <= 860 ? 12 : 20);
    var under = box.right + g > cl && box.left - g < cl + cw && box.bottom + g > cb - ch;
    card.classList.toggle("is-top", under && box.top > ch + 24);
  }

  // Let the page open the demo from its own buttons: data-hope-tour or data-hope-open.
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-hope-tour],[data-hope-open]");
    if (!t) return; e.preventDefault();
    if (t.hasAttribute("data-hope-tour")) startTour(); else openChat();
  });

  /* ?tour=1 starts the tour once the page has drawn, then leaves the address clean. */
  if (CFG.autoStartParam) {
    var sp0 = new URLSearchParams(location.search);
    if (sp0.get(CFG.autoStartParam) === "1") {
      var go = function () {
        setTimeout(function () {
          startTour();
          try { var p = new URLSearchParams(location.search); p.delete(CFG.autoStartParam); var qs = p.toString(); history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash); } catch (e) {}
        }, REDUCE ? 100 : (CFG.autoStartDelay || 700));
      };
      if (document.readyState === "complete") go(); else window.addEventListener("load", go);
    }
  }

  window.HopeDemo = {
    open: function () { openChat(); },
    tour: startTour,
    end: function () { endTour(false); },
    ask: function (q) {
      if (!panel) { openChat(q); return; }
      setOpen(true);
      (function trySend() {
        if (busy) { setTimeout(trySend, 200); return; }
        input.value = q;
        if (input.form.requestSubmit) input.form.requestSubmit(); else input.form.dispatchEvent(new Event("submit", { cancelable: true }));
      })();
    },
    isTouring: function () { return touring; }
  };
})();
