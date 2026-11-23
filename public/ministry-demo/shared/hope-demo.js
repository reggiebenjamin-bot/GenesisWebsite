/*
  Hope, guided demo edition (Genesis Ministry)

  One script for every template preview and for the Genesis Ministry platform preview. It adds:
  1. A chat circle that opens Hope (a sheet on phones, a panel on desktop).
  2. A guided tour: Hope walks the visitor through the page, one highlighted
     section at a time, explaining what a church gets and why it matters.
  3. Smooth scripted answers for the demo church and for questions about the
     Genesis Ministry package. No server, no tracking, no network calls.
  4. Tap to ask only: a visitor taps a question and gets the answer written for it. There is no box
     to type in. Under the questions: a demo note and "In danger or crisis? Call 911, or call or text 988."

  Each page sets window.HOPE_DEMO before loading this file:

    window.HOPE_DEMO = {
      look: "Bright and Modern",
      church: { name, short, city, address, phone, times, length, parking, mapUrl, pastors, kids,
                students, groups, startHere, give, watch, prayer, values },
      brand: { accent, accentInk, accentText, ink, surface, surface2, line, font, radius, buttonRadius },
      selectors: { hero, announce, pastors, nextSteps, strip, message,
                   reviews, newsletter, footer },
      links: { brandBoard: "brand-board.html", socialPlan: "social-plan.html", prayer: "" },
      tour: [{ sel, k, h, p, focus }],   // optional; sel may also be a list (the first visible one wins)
      removeSelectors: [],         // simpler chats to remove, so there is only one assistant
      bottomOffset: 0,             // extra space when a pinned bar sits at the bottom
      autoInvite: true,            // the small "Want a tour?" card (phones: once the hero has scrolled away)
      avoid: ".m-device"           // on wide screens the chat narrows (down to 320px) to stay clear of this part
    };

  church.length (how long a gathering runs) and church.parking are said only when the page gives them.
  links.prayer is where Share a Prayer Request goes (the member app finds its own Prayer tab).
  In a frame, or with ?embed=1 in the address, the page never offers the tour on its own.

  Optional settings (every one defaults to the template behavior above):

      assistantName: "Hope",       the assistant's name everywhere in this script
      greeting: "text",            what the assistant says first when the chat opens
      menu: [{ label, key | href, cta }],       answer chips (its tour and startdemo entries sit above the questions)
      questions: [{ title, more, items: [["Question?", "key"]] }],   the questions a visitor can tap (tap to ask
                                   only: there is no box to type in); groups with more: true sit under More Questions
      answers: { key: { t, c } },  extra scripted answers, merged over the defaults
      match: [[/regex/, "key"]],   extra keyword rules, checked before the defaults; a rule's pattern
                                   may also be its text (["\\bbapti[sz]\\w*", "baptism"])
      matchPatterns: [["text", "key"]],  the same rules as text, as hope.json carries them
      autoStartParam: "tour",      start the tour when the address has ?tour=1
      next: { label, href, note }, shown on the last tour card and in the finale, so a
                                   tour can continue on the next page (the link gets
                                   ?tour=1 and keeps the current ?church and ?plan)
      guideName: "Hope",           the name on the tour card (defaults to assistantName)
      tourTitle: "Home",           a short name for this page's tour
      finale: { text, chips },     what the assistant says when the tour ends
                                   (Genesis skin: links: [{ label, href }] adds buttons to the Done card;
                                   chat: false ends the tour without opening the chat, for a page that
                                   shows its own last card)
      tour steps may also carry:   before: function () {}  runs before the step is drawn, so a step can
                                   open the panel it points at (the step is kept even if its target
                                   is not on screen yet); place: "edge-left" keeps the card at the left
                                   edge on wide screens; focus: "selector" names the part of a tall
                                   target the step talks about (matched inside the target first, every
                                   match counts; a list of selectors means the first one found wins), so
                                   that part is what stays in view beside the card; place: "beside-focus"
                                   puts the card beside that part on wide screens when the target is too
                                   tall for the card above or below it, on the clearest part of the screen
                                   (off the section's words; photos count at photoWeight, 0.25 unless the
                                   step sets it); phoneFocus: the focus on phones; scrollTop: true shows
                                   the page from the top on wide screens (the first screen's step)
      links.contact:               where "talk to someone at Genesis" goes on a page with no church
                                   (else the page's own a[data-contact])
      A church site with a sticky header and no topInset keeps the tour clear of that header.
      invite: { text },            the invite's question
      launcher: false,             no chat circle (HopeDemo.open() still opens the chat)
      skin: "genesis",             draw the tour with the host page's Genesis OS guide
                                   (.v2-guide, .v2-guide-ring, .v2-button). No chat circle;
                                   openChat(prompt) opens the host's own assistant.
      openChat: function (prompt) {},
      placement: "side",           on wide screens put the card beside a narrow target
      topInset: 0 | function (scroller) { return px; },   room to keep clear at the top
      keepParams: ["church", "plan"]

  window.HopeDemo: open(), tour(), end(), ask(text) (a fixed question from the page's own code), tap(key) (taps the
  question chip for that answer, as a visitor would), isTouring(), crisisReply(phone) (the fixed crisis
  reply, the one source of its words) and route(text) (where a question goes, for shared/hope-check.html,
  the answer check that lists the questions every Hope must get right).

  Copy rules: warm, plain, short sentences, no em dashes, no emojis. Chips and buttons in Title Case.
*/
(function () {
  "use strict";
  if (window.__hopeDemoLoaded) return;
  window.__hopeDemoLoaded = true;

  /* The crisis words: ../shared/crisis-words.js (window.HOPE_WORDS), one list for every Hope. */
  var WORDS = window.HOPE_WORDS;
  if (!WORDS) throw new Error("Hope: load shared/crisis-words.js before shared/hope-demo.js. Hope never runs without the crisis words.");
  var CFG = window.HOPE_DEMO || {};
  var CH = CFG.church || {};
  var BR = CFG.brand || {};
  var SEL = CFG.selectors || {};
  var LINKS = CFG.links || {};
  var LOOK = String(CFG.look || "this template").replace(/\s*&\s*/g, " and ");
  var NAME = CH.name || "our church";
  var SHORT = CH.short || NAME;
  var AN = CFG.assistantName || "Hope";
  var GUIDE = CFG.guideName || AN;
  var GENESIS = CFG.skin === "genesis";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* A page that is not a church site (the Genesis Ministry story pages) has no times or address. */
  var CHURCH = !!(CH.times || CH.address);
  var FRAMED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var EMBED = /[?&]embed=1(&|$)/.test(location.search);
  /* The short line under the questions. It promises no typing: typing comes back later, only on a real AI
     with safety screening (owner decision, November 23, 2026). The "Why Can't I Type a Question?" chip
     says the rest. */
  var DEMO_NOTE = "Demo: " + AN + " answers sample questions only.";

  function $(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function store(key, val) { try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; } }
  function val(v, arg) { return typeof v === "function" ? v(arg) : v; }
  /* On screen or reachable by scrolling: drawn, not hidden, and not parked off to the side (a closed menu sheet). */
  function visible(n) {
    if (!n || !n.getClientRects || !n.getClientRects().length) return false;
    var r = n.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0) || r.right <= 0 || r.left >= window.innerWidth) return false;
    try { if (getComputedStyle(n).visibility === "hidden") return false; } catch (e) {}
    return true;
  }
  /* Can take focus right now: visible and not switched off with pointer-events (a launcher hidden over a hero). */
  function focusable(n) {
    if (!n || !document.contains(n) || n === document.body || !visible(n)) return false;
    try { if (getComputedStyle(n).pointerEvents === "none") return false; } catch (e) {}
    return true;
  }
  function focusOn(n) { if (n && n.focus) try { n.focus({ preventScroll: true }); } catch (e) {} }
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
    ".hd-launch{position:fixed;right:20px;bottom:calc(20px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483000;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:var(--hd-accent);color:var(--hd-accent-ink);box-shadow:0 12px 30px -10px rgba(0,0,0,.45);display:grid;place-items:center;transition:transform .25s cubic-bezier(.2,.7,.2,1),opacity .25s ease}",
    ".hd-launch:hover{transform:translateY(-2px)}.hd-launch:focus-visible{outline:3px solid var(--hd-ink);outline-offset:3px}",
    ".hd-launch svg{width:24px;height:24px}",
    ".hd-invite{position:fixed;right:20px;bottom:calc(88px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:290px;background:var(--hd-surface);color:var(--hd-ink);border:1px solid var(--hd-line);border-radius:var(--hd-radius);padding:16px 16px 14px;font:15px/1.5 var(--hd-font);box-shadow:0 24px 50px -24px rgba(0,0,0,.45);opacity:0;transform:translateY(8px);transition:opacity .35s ease,transform .35s cubic-bezier(.2,.7,.2,1)}",
    ".hd-invite.on{opacity:1;transform:none}",
    ".hd-invite p{margin:0 0 12px;padding-right:28px}.hd-invite b{font-weight:700}",
    ".hd-invite .hd-x{position:absolute;top:6px;right:6px;width:32px;height:32px;border:0;background:none;color:inherit;opacity:.6;cursor:pointer;font-size:18px;line-height:1;border-radius:8px}",
    ".hd-invite .hd-x:focus-visible{outline:3px solid var(--hd-ink);outline-offset:0;opacity:1}",
    /* An open menu sheet keeps its own buttons: the invite and the circle step aside. */
    "body.menu-open .hd-invite,body.menu-open .hd-launch{opacity:0!important;visibility:hidden;pointer-events:none}",
    ".hd-row{display:flex;flex-wrap:wrap;gap:8px}",
    ".hd-btn{font:600 14px/1 var(--hd-font);min-height:40px;padding:10px 16px;border-radius:var(--hd-btn-radius);border:1.5px solid var(--hd-accent);background:var(--hd-accent);color:var(--hd-accent-ink);cursor:pointer;transition:transform .2s ease,opacity .2s ease}",
    ".hd-btn.ghost{background:transparent;color:var(--hd-ink);border-color:var(--hd-line)}",
    ".hd-btn:hover{transform:translateY(-1px)}.hd-btn:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    ".hd-panel{position:fixed;right:20px;bottom:calc(88px + var(--hd-bottom) + env(safe-area-inset-bottom,0px));z-index:2147483001;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100vh - 130px));display:flex;flex-direction:column;background:var(--hd-surface);color:var(--hd-ink);border:1px solid var(--hd-line);border-radius:var(--hd-radius);box-shadow:0 30px 70px -24px rgba(0,0,0,.5);font:15px/1.5 var(--hd-font);overflow:hidden;opacity:0;visibility:hidden;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .25s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s .3s}",
    ".hd-panel.on{opacity:1;visibility:visible;transform:none;transition-delay:0s}",
    ".hd-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 12px 14px 18px;border-bottom:1px solid var(--hd-line)}",
    ".hd-head .t{font-weight:700;font-size:15px;line-height:1.2}.hd-head small{display:block;font-weight:400;font-size:12px;opacity:.7}",
    ".hd-dot{width:9px;height:9px;border-radius:50%;background:var(--hd-accent);display:inline-block;margin-right:10px;vertical-align:middle}",
    ".hd-head button{width:44px;height:44px;border:0;background:none;color:inherit;cursor:pointer;font-size:18px;border-radius:10px}",
    ".hd-head button:focus-visible{outline:3px solid var(--hd-ink);outline-offset:-3px}",
    ".hd-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}",
    ".hd-msg{max-width:88%;padding:10px 14px;border-radius:16px;white-space:pre-line;animation:hdIn .35s cubic-bezier(.2,.7,.2,1) both}",
    ".hd-bot{background:var(--hd-surface2);border-bottom-left-radius:6px;align-self:flex-start}",
    ".hd-user{background:var(--hd-accent);color:var(--hd-accent-ink);border-bottom-right-radius:6px;align-self:flex-end}",
    /* Small type keeps 4.5:1 or more on every church's surface. */
    ".hd-from{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.8;margin:4px 2px -4px}",
    ".hd-chips{display:flex;flex-wrap:wrap;gap:8px;animation:hdIn .35s .05s cubic-bezier(.2,.7,.2,1) both}",
    ".hd-chip{font:600 13.5px/1.2 var(--hd-font);padding:9px 13px;min-height:40px;border-radius:var(--hd-btn-radius);border:1.5px solid var(--hd-line);background:var(--hd-surface);color:var(--hd-ink);cursor:pointer;text-align:left}",
    ".hd-chip.cta{background:var(--hd-accent);border-color:var(--hd-accent);color:var(--hd-accent-ink)}",
    ".hd-chip:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    ".hd-typing{display:inline-flex;gap:5px;padding:14px 16px}.hd-typing i{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.35;animation:hdDot 1s infinite}",
    ".hd-typing i:nth-child(2){animation-delay:.15s}.hd-typing i:nth-child(3){animation-delay:.3s}",
    /* The questions: a group heading, the chips, and More Questions to open the rest. */
    ".hd-qs{display:flex;flex-direction:column;gap:8px;animation:hdIn .35s .05s cubic-bezier(.2,.7,.2,1) both}",
    ".hd-qs-h{margin:6px 2px 0;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.8}",
    ".hd-qs-more{display:flex;flex-direction:column;gap:8px}.hd-qs-more[hidden]{display:none}",
    ".hd-more{align-self:flex-start;font:600 13.5px/1.2 var(--hd-font);min-height:40px;padding:9px 4px;border:0;background:none;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:6px}",
    ".hd-more:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    /* The foot: the 911 and 988 line first, as its own band, then the one-line demo note and All Questions. */
    ".hd-foot{display:flex;flex-direction:column;border-top:1px solid var(--hd-line)}",
    ".hd-foot-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 10px;padding:2px 12px 6px}",
    ".hd-note{font-size:12px;line-height:1.45;opacity:.8;text-align:center;margin:0}",
    ".hd-allq{font:600 12.5px/1.2 var(--hd-font);min-height:32px;padding:4px 2px;border:0;background:none;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:6px}",
    ".hd-allq:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px}",
    /* The 911 and 988 line: plain and calm, always in view under the questions. Each number has a 44px
       tap area without moving the words. */
    ".hd-help{font-size:13px;line-height:1.45;text-align:center;margin:0;padding:8px 16px;background:var(--hd-surface2)}",
    ".hd-help b{font-weight:700}",
    ".hd-help a{position:relative;color:inherit;font-weight:700;text-decoration:underline;text-underline-offset:2px}",
    ".hd-help a::after{content:\"\";position:absolute;inset:-14px -12px}",
    ".hd-help a:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px;border-radius:3px}",
    "@keyframes hdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "@keyframes hdDot{0%,80%,100%{opacity:.25;transform:none}40%{opacity:.9;transform:translateY(-3px)}}",
    /* tour */
    ".hd-spot{position:fixed;z-index:2147482998;border-radius:var(--hd-radius);box-shadow:0 0 0 9999px rgba(10,10,12,.62),0 0 0 3px var(--hd-accent);pointer-events:none;transition:top .45s cubic-bezier(.2,.7,.2,1),left .45s cubic-bezier(.2,.7,.2,1),width .45s cubic-bezier(.2,.7,.2,1),height .45s cubic-bezier(.2,.7,.2,1),opacity .3s ease;opacity:0}",
    ".hd-spot.on{opacity:1}",
    /* The card never grows past the window (400 percent zoom): it scrolls inside, and its foot (Back,
       Next, End Tour) stays in view at its bottom edge. */
    ".hd-card{position:fixed;z-index:2147482999;width:min(380px,calc(100vw - 32px));max-height:calc(100dvh - 60px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow-y:auto;overscroll-behavior:contain;background:var(--hd-surface);color:var(--hd-ink);border-radius:var(--hd-radius);padding:20px 20px 16px;font:15px/1.55 var(--hd-font);box-shadow:0 30px 70px -20px rgba(0,0,0,.55);opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .35s cubic-bezier(.2,.7,.2,1),top .45s cubic-bezier(.2,.7,.2,1),left .45s cubic-bezier(.2,.7,.2,1)}",
    ".hd-card.on{opacity:1;transform:none}",
    ".hd-card .k{font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--hd-accent-text);margin:0 0 6px}",
    ".hd-card h3{font:700 19px/1.25 var(--hd-font);margin:0 0 8px}",
    ".hd-card p{margin:0 0 14px}",
    ".hd-card .hd-cnote{font-size:13px;line-height:1.5;opacity:.8;margin:-6px 0 14px}",
    ".hd-card .bar{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".hd-card .hd-cfoot{position:sticky;bottom:-16px;background:var(--hd-surface);padding-bottom:16px;margin-bottom:-16px}",
    ".hd-card .hd-next{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;margin-top:12px;text-decoration:none;text-align:center;line-height:1.2}",
    ".hd-dots{display:flex;gap:6px}.hd-dots i{width:7px;height:7px;border-radius:50%;background:var(--hd-line)}.hd-dots i.on{background:var(--hd-accent);width:18px;border-radius:4px}",
    ".hd-skip{background:none;border:0;color:inherit;opacity:.8;font:600 13px var(--hd-font);cursor:pointer;padding:8px 4px;border-radius:6px}",
    ".hd-skip:focus-visible{outline:3px solid var(--hd-ink);outline-offset:2px;opacity:1}",
    "@media (max-width:640px){",
    "  .hd-panel{right:0;left:0;bottom:0;width:auto;height:min(86vh,640px);border-radius:var(--hd-radius) var(--hd-radius) 0 0;transform-origin:bottom center;padding-bottom:env(safe-area-inset-bottom,0px)}",
    "  .hd-panel.on~.hd-launch,.hd-tour-on .hd-launch{opacity:0;pointer-events:none}",
    "  .hd-tour-on.hd-step-launch .hd-launch{opacity:1}",
    "  .hd-step-launch .hd-card{top:calc(12px + env(safe-area-inset-top,0px))!important;bottom:auto}",
    "  .hd-card{left:12px!important;right:12px;width:auto;top:auto!important;bottom:calc(12px + env(safe-area-inset-bottom,0px))}",
    /* The invite is a compact card above the circle, never across the first screen. */
    "  .hd-invite{left:auto;right:16px;max-width:min(300px,calc(100vw - 32px))}",
    /* Phone tap targets: 44px. */
    "  .hd-card .hd-btn,.hd-card .hd-skip,.hd-invite .hd-btn,.hd-chip,.hd-allq,.hd-more{min-height:44px}",
    "  .hd-skip{padding:8px 10px}",
    "  .hd-invite .hd-x{top:2px;right:2px;width:44px;height:44px}",
    "  .hd-invite p{padding-right:34px}",
    /* While the invite is up it takes the circle's place, so the two never stack over the page. */
    "  html.hd-invite-on .hd-launch{opacity:0;visibility:hidden;pointer-events:none}",
    "  html.hd-invite-on .hd-invite{bottom:calc(16px + var(--hd-bottom) + env(safe-area-inset-bottom,0px))}",
    "}",
    /* Touch screens of any width (a tablet held in landscape): 44px targets too. */
    "@media (pointer:coarse){",
    "  .hd-card .hd-btn,.hd-card .hd-skip,.hd-invite .hd-btn,.hd-chip,.hd-allq,.hd-more{min-height:44px}",
    "  .hd-skip{padding:8px 10px}",
    "  .hd-invite .hd-x{top:2px;right:2px;width:44px;height:44px}",
    "  .hd-invite p{padding-right:34px}",
    "  .hd-g .v2-guide-foot .v2-button,.hd-g .v2-guide-controls .v2-button{min-height:44px}",
    "  .hd-g .v2-guide-close,.hd-g .hd-g-again{width:44px;height:44px;margin:-10px -12px -10px 0}",
    "}",
    /* the Genesis OS guide (skin: "genesis") uses the host page's own .v2-guide styles; only these few extras */
    ".hd-g.v2-guide{z-index:2147482999}.hd-g-ring.v2-guide-ring{z-index:2147482998}",
    /* Mouse screens only: a touch screen keeps the 44px controls set above. */
    "@media (pointer:fine){.hd-g .v2-guide-controls .v2-button{min-height:32px}}",
    /* A phone held on its side (short and wide): the card sits at the right, under the top bar, so the
       part of the screen a step names shows beside it instead of under it. */
    ".hd-g.v2-guide.hd-g-side{left:auto;right:12px;bottom:auto;margin:0;width:min(380px,46vw);overflow:auto}",
    ".hd-g.hd-g-side .v2-guide-say{font-size:13px}",
    /* ...and the workspace makes room for it, so a full-width part never sits under the card. */
    "html.hd-side-on .v2-main{padding-right:calc(min(380px,46vw) + 20px)}",
    ".hd-g .hd-g-next{gap:6px}",
    ".hd-g .hd-g-headr{display:inline-flex;align-items:center;gap:6px;flex:none}",
    ".hd-g .hd-g-again{margin:-6px -8px -6px 0}",
    /* Take the Tour Again beside Close: only the last icon reaches into the card's corner. */
    ".hd-g .hd-g-headr .hd-g-again:not(:last-child){margin-right:0}",
    ".hd-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
    ".hd-g .v2-guide-foot [data-guide=\"back\"]{margin-left:0}",
    "@media (max-width:860px){",
    "  .hd-g.v2-guide.is-top{top:calc(12px + env(safe-area-inset-top,0px))}",
    "  .hd-g .v2-guide-foot .v2-button,.hd-g .v2-guide-controls .v2-button{min-height:44px}",
    "  .hd-g .v2-guide-close,.hd-g .hd-g-again{width:44px;height:44px;margin:-10px -12px -10px 0}",
    /* A guide card docked at the bottom would sit on the Hope orb: the orb steps aside until the card is gone. */
    "  html.hd-invite-on .v2-genesis-opener,html.hd-tour-on:not(.hd-step-orb) .v2-genesis-opener{visibility:hidden;pointer-events:none}",
    "}",
    /* A short, wide window: the site and member tour card docks at the foot of the screen (shortDock). */
    "@media (max-height:500px) and (min-width:641px){",
    "  html.hd-tour-on .hd-card{left:12px!important;right:12px;width:auto;max-width:760px;margin:0 auto;top:auto!important;bottom:calc(10px + env(safe-area-inset-bottom,0px));padding:14px 18px 12px}",
    "  html.hd-tour-on .hd-card h3{font-size:17px;margin-bottom:4px}",
    "  html.hd-tour-on .hd-card p{margin-bottom:10px}",
    "  html.hd-tour-on .hd-card .hd-dots{display:none}",
    "  html.hd-tour-on.hd-step-launch .hd-card{top:10px!important;bottom:auto}",
    "  html.hd-tour-on .hd-launch{opacity:0;pointer-events:none}",
    "  html.hd-tour-on.hd-step-launch .hd-launch{opacity:1;pointer-events:auto}",
    "}",
    /* A short window (a phone on its side, 200 percent zoom): the chat takes the window's height and
       the note and subtitle step aside, so a reply, the crisis reply above all, has room to be read. */
    "@media (max-height:500px){",
    "  .hd-panel{top:8px;bottom:8px;height:auto}",
    "  .hd-note,.hd-head small{display:none}",
    "  .hd-head{padding:4px 8px 4px 16px}",
    "  .hd-help{padding:5px 12px}.hd-foot-row{padding:0 8px 2px}",
    "}",
    "@media (max-height:500px) and (max-width:640px){.hd-panel{top:0;bottom:0;border-radius:0}}",
    /* 400 percent zoom: the chat is the whole window, and the tour card drops its dots. */
    "@media (max-height:320px){",
    "  .hd-panel{top:0;left:0;right:0;bottom:0;width:auto;height:auto;border-radius:0}",
    "  .hd-card .hd-dots{display:none}.hd-card h3{font-size:16px}",
    "  .hd-card .bar,.hd-card .bar .hd-row{flex-wrap:nowrap}.hd-card .bar .hd-btn{min-height:36px;padding:6px 12px}.hd-card .hd-skip{padding:6px 2px;white-space:nowrap}",
    /* The chat circle the Hope step rings sits under the card, so the card's Next is never covered. */
    "  html.hd-tour-on.hd-step-launch .hd-launch{z-index:2147482990}",
    "}",
    "@media (prefers-reduced-motion:reduce){.hd-body{scroll-behavior:auto}.hd-launch,.hd-invite,.hd-panel,.hd-msg,.hd-chips,.hd-spot,.hd-card,.hd-g,.hd-g-ring{transition:none!important;animation:none!important}.hd-typing i{animation:none}}",
  ].join("\n");
  var style = el("style"); style.id = "hope-demo-style"; style.textContent = css; document.head.appendChild(style);

  /* ------------------------------------------------------------- the chat */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_AGAIN = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.4-3.4M3.2 2.6v2.6h2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_GX = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // Remove any simpler chat the template shipped with, so there is only one Hope.
  (CFG.removeSelectors || []).forEach(function (s) { try { document.querySelectorAll(s).forEach(function (n) { n.remove(); }); } catch (e) {} });

  var launch = null, panel = null, body = null, allQ = null, closeBtn = null, opener = null;
  var isOpen = false, started = false, busy = false;
  function phoneChat() { return window.innerWidth <= 640; }
  if (!GENESIS) {
    launch = el("button", "hd-launch"); launch.type = "button"; launch.setAttribute("aria-label", "Chat with " + AN + ", the " + SHORT + " assistant"); launch.innerHTML = ICON_CHAT;
    panel = el("div", "hd-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", AN + ", the " + SHORT + " assistant"); panel.setAttribute("aria-modal", "false");
    var head = el("div", "hd-head");
    var ttl = el("div", "t"); ttl.innerHTML = '<span class="hd-dot" aria-hidden="true"></span><span class="hd-name"></span><small></small>'; ttl.querySelector(".hd-name").textContent = AN; ttl.querySelector("small").textContent = "Automated assistant for " + SHORT;
    closeBtn = el("button"); closeBtn.type = "button"; closeBtn.setAttribute("aria-label", "Close chat"); closeBtn.innerHTML = ICON_X;
    head.appendChild(ttl); head.appendChild(closeBtn);
    body = el("div", "hd-body"); body.setAttribute("aria-live", "polite");
    /* Tap to ask only (owner decision, November 23, 2026): the public demo has no box to type in. A
       visitor taps one of the questions below, and Hope gives the answer written for that question.
       Typing comes back only on a real AI with safety screening. Under the questions, always in view:
       the demo note and the 911 and 988 line. */
    var foot = el("div", "hd-foot");
    var help = el("p", "hd-help");
    help.innerHTML = '<b>In danger or crisis?</b> Call <a href="tel:911">911</a>, or call or text <a href="tel:988">988</a>.';
    var footRow = el("div", "hd-foot-row");
    var note = el("p", "hd-note", DEMO_NOTE);
    /* All Questions brings the one question list to the end of the chat (never a second copy). */
    allQ = el("button", "hd-allq", "All Questions"); allQ.type = "button";
    allQ.addEventListener("click", function () { addQuestions(true); });
    footRow.appendChild(note); footRow.appendChild(allQ);
    foot.appendChild(help); foot.appendChild(footRow);
    panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);
    document.body.appendChild(panel);
    if (CFG.launcher !== false) document.body.appendChild(launch); else launch = null;

    if (launch) launch.addEventListener("click", function () { setOpen(!isOpen); });
    closeBtn.addEventListener("click", function () { setOpen(false, true); });
    /* Escape closes the chat. Focus goes back to the circle only when it was in the chat: from the page
       (Tab past Send), the chat steps aside and the focused part of the page keeps its place. */
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen && !touring) { e.preventDefault(); setOpen(false, panel.contains(document.activeElement)); } });
    /* On a phone the chat is a sheet over most of the screen: Tab stays inside it until it closes. */
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !phoneChat()) return;
      var all = [].filter.call(panel.querySelectorAll("button, input, a[href]"), function (n) { return !n.disabled && visible(n); });
      if (!all.length) return;
      var first = all[0], last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); focusOn(last); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); focusOn(first); }
    });
  }
  /* A question asked by the page's own code (HopeDemo.ask), never typed by a visitor: the same safety
     check and answers the router keeps for when typing returns. */
  function respond(q) {
    addUser(q);
    /* A phone types curly apostrophes ("don’t"): Hope reads them as straight ones everywhere. */
    q = WORDS.plain(q);
    var key = route(q);
    if (key === "crisis") { say(CRISIS_REPLY, CRISIS_CHIPS); return; }
    if (key === "leadersafety") { say(LEADER_REPLY, LEADER_CHIPS); return; }
    if (key === "fallback") { var fb = fallback(q); say(fb.t, fb.c); return; }
    answer(key, q);
  }

  /* restore: give focus back to whatever opened the chat (or the chat circle), as a dialog should. */
  function setOpen(v, restore) {
    if (!panel) { if (v && CFG.openChat) CFG.openChat(); return; }
    if (v && !isOpen) { var a = document.activeElement; opener = a && a !== document.body && !panel.contains(a) ? a : null; }
    if (v) fitBeside();
    isOpen = v; panel.classList.toggle("on", v); if (launch) launch.innerHTML = v ? ICON_X : ICON_CHAT;
    if (launch) launch.setAttribute("aria-expanded", v ? "true" : "false");
    panel.setAttribute("aria-modal", v && phoneChat() ? "true" : "false");
    /* Someone who has used the chat is never offered the tour invite again. */
    if (v) { store(INVITE_KEY, "1"); hideInvite(); if (!started) { started = true; greet(); } setTimeout(function () { focusOn(firstQuestion() || allQ); }, 280); }
    else if (restore) {
      var back = focusable(opener) ? opener : focusable(launch) ? launch : null;
      opener = null;
      if (back) focusOn(back);
    }
  }
  /* A page that names a part to keep in view (the member app's phone): on a wide screen the chat narrows
     to fit beside it, never under 320px. */
  function fitBeside() {
    if (!panel || !CFG.avoid) return;
    panel.style.width = "";
    var keep = $(CFG.avoid);
    if (phoneChat() || !keep || !visible(keep)) return;
    var room = window.innerWidth - 20 - 12 - keep.getBoundingClientRect().right;
    if (room >= 320 && room < 380) panel.style.width = Math.floor(room) + "px";
  }
  if (CFG.avoid) addEventListener("resize", function () { if (isOpen) fitBeside(); });
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
      if (!c || (!c.key && !c.href && !c.go && !c.run) || fakeTel(c.href)) return;
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
      addChips(chips); busy = false;
      /* The new reply starts at the top of the chat, so its first words (988 and 911 in a crisis) are in
         view even in a short window. A reply that fits leaves the chat at its end. */
      body.scrollTop = Math.max(0, body.scrollTop + from.getBoundingClientRect().top - body.getBoundingClientRect().top - 8);
      if (done) done();
    }, wait);
  }

  /* ------------------------------------------------------------ answers */
  /* The fixed crisis reply, word for word the live church site's, with this church's phone. It is
     never improvised. A page with no church (the story pages) ends after "You are not alone." */
  function crisisReply(phone) { return WORDS.reply(phone); }
  var CRISIS_REPLY = crisisReply(CH.phone);
  /* Harm by someone at church gets its own fixed reply (shared/crisis-words.js): 911, 988 and help
     outside the church, never only the church's own people. A made-up 555 number is never offered. */
  var LEADER_REPLY = WORDS.leaderReply(/ 555-/.test(CH.phone || "") ? "" : CH.phone);
  /* Each sample church's own parking words, from its site. A page can give church.parking instead. */
  var PARKING = {
    "Lightwell Church": "There is free parking in the lot behind the building, plus street parking on Brightwater. Look for the blue flags.",
    "Lampstand Church": "Park free in the lot behind the building or on the street. Look for the amber flags, and a greeter will meet you at the door.",
    "Calder Hill Chapel": "Park free on Calder Lane or in the lot behind the parish hall. A greeter at the side door will point you to coffee and the sanctuary.",
    "Goldenrod Commons Church": "Park in the lot off Wrenfield or along the street. The yellow umbrellas out front mark the way in, and a greeter will be right there."
  };
  var PARK = CH.parking || PARKING[NAME] || "";
  var TEL = CH.phone ? "tel:" + String(CH.phone).replace(/[^\d+]/g, "") : "";
  var BACK = { label: "Back to the Menu", key: "menu" };
  var DIRECTIONS = CH.mapUrl ? { label: "Get Directions", href: CH.mapUrl, cta: true } : null;
  /* A sample church's made-up 555 number is never a call button or link: nobody would answer. */
  var FAKE_PHONE = / 555-/.test(CH.phone || "");
  var CALL = TEL && !FAKE_PHONE ? { label: "Call " + SHORT, href: TEL, go: true } : null;
  function fakeTel(href) { var d = String(href || "").replace(/^tel:/i, "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, ""); return /^tel:/i.test(href || "") && d.length === 10 && d.substr(3, 3) === "555"; }
  /* The church's email: church.email, or the page's own mailto link. */
  var EMAIL = CH.email || (function () { var m = $('a[href^="mailto:"]'); return m ? m.getAttribute("href").replace(/^mailto:/i, "").split("?")[0] : ""; })();
  function chips() { return [].slice.call(arguments).filter(Boolean); }
  /* Where Share a Prayer Request goes: the page's own prayer form when it has one. */
  function prayerLink() {
    if (LINKS.prayer) return LINKS.prayer;
    var tab = $('.m-tabbar a[href*="member-prayer"]');
    if (tab) return tab.href;
    var form = $("#prayer-request, #prayer-form");
    return form ? "#" + form.id : "";
  }
  /* A chip that points to a part of this page: close the chat, bring that part up, and put the
     cursor in its first field when it is a form. */
  function goAnchor(hash) {
    var dest = null; try { dest = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) {}
    /* No element by that name: the page opens it from the address (a site's Plan a Visit form opens on
       #plan-a-visit). The chat steps aside, and the same address twice still opens it. */
    if (!dest) {
      setOpen(false);
      if (location.hash === hash) try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) {}
      location.hash = hash; return;
    }
    setOpen(false);
    dest.scrollIntoView({ block: "start", behavior: REDUCE ? "auto" : "smooth" });
    try { history.replaceState(history.state, "", hash); } catch (e) {}
    var field = dest.matches("input, textarea, select") ? dest : dest.querySelector("input:not([type=hidden]), textarea, select");
    if (field) setTimeout(function () { focusOn(field); }, REDUCE ? 0 : 450);
  }
  function sharePrayer() {
    var href = prayerLink();
    if (href && href.charAt(0) === "#") { goAnchor(href); return; }
    if (href) {
      var here = location.pathname.split("/").pop(), there = href.split("#")[0].split("?")[0].split("/").pop();
      if (here && here === there) {
        /* Already on the prayer form: close the chat and put the cursor in it. */
        setOpen(false);
        var box = $('[data-tour="prayer.form"] textarea') || $("main textarea") || $("textarea");
        if (box) { box.scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" }); setTimeout(function () { focusOn(box); }, REDUCE ? 0 : 400); }
        return;
      }
      location.href = href; return;
    }
    say("On a real church site, this opens a short prayer form that goes only to the pastors and the prayer team, and a real person reads every one. In this demo, nothing is sent." + CRISIS_LINE, [BACK]);
  }
  /* Genesis runs the site and a few providers process it: the same promise as the processors answer. */
  /* On the member app it is the app, not the website. The AI service behind Hope is named with the rest. */
  var IN_APP = /\/member-[\w-]+\.html$/.test(location.pathname) || !!$(".m-tabbar"), WHERE = IN_APP ? "app" : "website";
  var PROCESSORS_LINE = "Genesis, which runs this " + WHERE + (CHURCH ? " for " + SHORT : "") + ", never sells it or passes it on for anyone's marketing, and a few service providers, such as hosting, email delivery and the AI service behind " + AN + ", handle it under contract only to run the " + (IN_APP ? "app" : "site") + ". " + (CHURCH ? "None of it is ever used to train AI." : "The named list is shared in writing during scoping, and none of it is ever used to train AI.");
  var NOT_HERE = "That is a question for a church's own website. On each of the four sample sites I answer it from that church's own facts, like times, kids and parking.";
  /* The page's way to talk with Genesis (the story pages carry a[data-contact]), and the journey's
     getting started chapter. */
  function contactHref() { if (LINKS.contact) return LINKS.contact; var a = $("a[data-contact]"); return a ? a.href : ""; }
  function talkChip(cta) { var h = contactHref(); return h ? { label: "Talk With Genesis", href: h, cta: cta !== false } : null; }
  function startHref() {
    var present = document.documentElement.hasAttribute("data-present"), hash = present ? "#launch" : "#start";
    if (/(^|\/)journey\.html$/.test(location.pathname)) return hash;
    return (/\/platform\//.test(location.pathname) ? "" : "platform/") + "journey.html" + hash;
  }
  /* The site's own Plan a Visit form, when the page has one. */
  var PLAN_VISIT = $('a[href="#plan-a-visit"], #plan-a-visit') ? { label: "Plan Your Visit", href: "#plan-a-visit", go: true, cta: true } : null;
  /* The lead pastors by name ("Pastor Theo and Pastor Priya"), from church.pastorNames or the first
     words of church.pastors ("Theo and Priya lead Lightwell together."). */
  function pastorNames() {
    var n = CH.pastorNames;
    if (!n) { var m = /^([A-Z][\w'-]+) and ([A-Z][\w'-]+)\b/.exec(CH.pastors || ""); n = m ? [m[1], m[2]] : null; }
    if (!n) return ["our pastors"];
    if (typeof n === "string") return [n];
    return n.map(function (x) { return /^pastor\b/i.test(x) ? x : "Pastor " + x; });
  }
  function listOf(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  var SHARE = { label: "Share a Prayer Request", run: sharePrayer, cta: true };
  var CRISIS_LINE = " If you are in crisis, call or text 988, or 911 in an emergency.";
  /* Said after what a real church site would do: the demo sends nothing. */
  var DEMO_NOTE = " In this demo, nothing is sent.";
  /* The member app's Messages tab, when the page has one. */
  function messageChip() { var m = $('.m-tabbar a[href*="member-messages"]'); return m ? { label: "Send a Message", href: m.href, go: true } : null; }

  /* Someone hurting, in their own words: a death, a hard season or a heavy feeling, said about their
     own life (the sentence speaks in the first person). They get a person and the prayer form, never
     a product answer and never "Good question". */
  var PERSON = WORDS.PERSON;
  var FIRST_PERSON = /\b(?:i|i'?m|i'?ve|i'?d|i'?ll|me|my|mine|myself|we|we'?re|we'?ve|our|us)\b/i;
  var LOSS = new RegExp("\\b(?:passed away|passed on|funeral|memorial service|widow\\w*|miscarr\\w*|stillborn|bereave\\w*|death of (?:my|our)|lost (?:my|our) (?:" + PERSON.slice(3, -1) + "|dog|cat|pet)(?! (?:at|in|during|after|somewhere)\\b)|(?:" + PERSON.slice(3, -1) + "|dog|cat|pet)\\b.{0,24}\\b(?:died|passed|was killed|got killed|were killed)|(?:he|she|they) (?:just |recently )?(?:died|passed))\\b", "i");
  var HARD = /\b(?:grie\w*|lost (?:my|our|his|her|their) (?:job|work|home|house|apartment|income)|laid off|got fired(?! up)|been fired(?! up)|evicted|homeless|divorc\w*|separated|cancer|chemo\w*|hospice|diagnos\w*|terminal(?:ly)?|in (?:the )?hospital|in the icu|surgery|addiction|an addict|relaps\w*|in jail|in prison|arrested|(?:having|going through|had) a (?:really |very |pretty )?(?:hard|rough|tough|difficult|dark) (?:time|season|week|year|month|day))\b/i;
  var HEAVY = /\b(?:lonely|loneliness|hopeless|worthless|depress\w*|anxious|anxiety|panic attacks?|(?:so|all|completely|totally) alone|empty inside|no hope|lost (?:all )?hope|(?:giving|give|gave) up on (?:life|everything|myself|god|hope|living)|(?:ready|about|going|want(?:ing)?) to give up(?! (?:coffee|sugar|chocolate|meat|social media|caffeine|soda|alcohol|something|for lent))|(?:nobody|no one) (?:cares|loves|wants) (?:about )?me|feel(?:s|ing)? (?:so |really |very |completely |totally |all |kind of )?(?:alone|lost|empty|broken|ashamed|numb|invisible|overwhelmed|abandoned)|(?:i'?m|i am) (?:so |really |very )?(?:broken|ashamed|overwhelmed|struggling|not ok(?:ay)?|falling apart)|(?:i'?m|i am) (?:so |really |completely |totally )(?:lost|alone))\b/i;
  var HURT = { test: function (q) { q = String(q || ""); return FIRST_PERSON.test(q) && (LOSS.test(q) || HARD.test(q) || HEAVY.test(q)); } };
  var HEAVY_LINE = /depress|anxi|mental health|hopeless|panic|worthless|empty inside|feel(?:s|ing)? (?:so |really |very )?(?:empty|alone)|(?:so|all|completely|totally) alone|lonely|no hope|lost (?:all )?hope|give up|giving up|gave up on|falling apart/i;
  /* The first words of a reply to someone hurting. */
  function sorry(q) { q = String(q || ""); return LOSS.test(q) && FIRST_PERSON.test(q) ? "I am so sorry for your loss." : HURT.test(q) ? "I am so sorry you are going through that." : ""; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* The year a church began, from church.founded or the page's own words ("Gathering since 1891"). */
  function foundedYear() {
    if (CH.founded) return String(CH.founded);
    var text = ""; try { text = (document.querySelector("main") || document.body).innerText || ""; } catch (e) {}
    var re = /\b(?:since|founded in|established in|est\.?)\s+(1[6-9]\d\d|20[0-4]\d)\b/gi, m, best = 0;
    while ((m = re.exec(text))) { var y = +m[1]; if (!best || y < best) best = y; }
    return best ? String(best) : "";
  }
  var A = {
    times: { t: "We gather " + (CH.times || "every Sunday") + (CH.address ? " at " + CH.address + (CH.city ? ", " + CH.city : "") : CH.city ? " in " + CH.city : "") + "." + (CH.length ? " Plan for about " + CH.length + "." : "") + " Wear whatever is comfortable.", c: chips(DIRECTIONS, { label: "Where Do I Park?", key: "parking" }, { label: "I Am New Here", key: "newhere" }) },
    parking: { t: PARK || ("Parking details are on " + SHORT + "'s Plan Your Visit page, with directions." + (CH.phone ? " You can also call the church at " + CH.phone + "." : "")), c: chips(DIRECTIONS, { label: "Service Times", key: "times", cta: !DIRECTIONS }) },
    newhere: { t: CH.startHere || ("So glad you are here. The best first step is to visit on a Sunday, then come to Start Here to meet the team and find where you fit."), c: [{ label: "Service Times", key: "times", cta: true }, { label: "Kids", key: "kids" }] },
    kids: { t: CH.kids || "Kids are welcome every Sunday, with a safe, fun class and a nursery for little ones.", c: [{ label: "Students", key: "students" }, { label: "Service Times", key: "times" }] },
    students: { t: CH.students || "Students have their own time together during the month, with events through the year.", c: [{ label: "Small Groups", key: "groups" }, { label: "Service Times", key: "times" }] },
    groups: { t: CH.groups || "Small groups meet during the week in homes across the city. It is the best way to make church feel like family.", c: [{ label: "I Am New Here", key: "newhere" }] },
    give: { t: CH.give || "You can give securely online in about a minute, once or every month.", c: [{ label: "Watch a Message", key: "watch" }] },
    /* "Do you livestream?" gets a plain yes or no before the rest. */
    watch: { t: function (q) {
      var w = CH.watch || "Every message is online after Sunday, on the church's website.";
      if (/\blive ?stream\w*|\bstream\w* live\b|\bwatch\w* live\b|\blive online\b|\bstreamed\b/i.test(q || "") && !/\blive\b/i.test(w)) return "Sundays are not streamed live right now. " + w;
      return w;
    }, c: [{ label: "Service Times", key: "times" }] },
    /* Every prayer answer says what a real church site does, that the demo sends nothing, and ends with 988 and 911. */
    prayer: { t: CH.prayer || "On a real church site, our pastors and prayer team would be honored to pray with you: share your request, and a real person reads it." + DEMO_NOTE + CRISIS_LINE, c: [SHARE, BACK] },
    /* A sample site with no plan says only what every plan keeps; from the Shepherd plan (?plan=2 or 3) the
       reader choice is added below. */
    prayerwho: { t: "On a real church site, prayer requests go only to " + listOf(pastorNames().concat("our prayer team")) + ". Nobody else on staff reads them." + DEMO_NOTE + CRISIS_LINE, c: [SHARE, BACK] },
    pastors: { t: CH.pastors || "Our pastors would love to meet you on a Sunday.", c: [{ label: "Service Times", key: "times" }] },
    values: { t: CH.values || "We are ordinary people learning to love God and one another.", c: [{ label: "I Am New Here", key: "newhere" }] },
    /* A made-up 555 number is never offered to call: the answer says what a real church site gives instead. */
    contact: { t: FAKE_PHONE ? "On a real church site, I would give you the church's own phone number and email here, and someone on the team would help. " + NAME + " is a made-up church, so its number is a sample and nobody would answer." + DEMO_NOTE + CRISIS_LINE : CH.phone ? "You can call " + NAME + " at " + CH.phone + (EMAIL ? " or email " + EMAIL : "") + ", and someone on the team will help." : "Someone on the team would be glad to help. The fastest way is to plan a visit or share a request on this site.", c: chips(CALL && { label: CALL.label, href: CALL.href, go: true, cta: true }, PLAN_VISIT && { label: PLAN_VISIT.label, href: PLAN_VISIT.href, go: true }, BACK) },
    /* "Can I talk to a pastor this week?" gets a way to reach them, not only their story. */
    talkpastor: { t: function () { if (FAKE_PHONE) return "On a real church site, " + listOf(pastorNames()) + " would be glad to talk with you: call the church office to find a time, or share a prayer request and choose Pastors only." + DEMO_NOTE + CRISIS_LINE; return cap(listOf(pastorNames())) + " would be glad to talk with you. " + (CH.phone ? "Call " + CH.phone + " and the office will find a time with you" : "Ask on Sunday and the team will find a time with you") + ", or share a prayer request and choose Pastors only."; }, c: function () { return chips(CALL && { label: CALL.label, href: CALL.href, go: true, cta: true }, SHARE, BACK); } },
    /* Beliefs deserve a person, not a guess and never the care or crisis path. */
    beliefs: { t: function () { return "Thank you for asking. That deserves a real conversation, not a quick answer from me. " + cap(listOf(pastorNames())) + " would be glad to talk it through with you" + (CH.phone ? ". Call " + CH.phone + " to find a time." : "."); }, c: function () { return chips({ label: "What We Believe", key: "values" }, { label: "Talk to a Pastor", key: "talkpastor", cta: true }, BACK); } },
    wedding: { t: FAKE_PHONE ? "I do not want to guess about weddings. On a real church site, you would ask the church office, and the pastors would talk it through with you." + DEMO_NOTE + CRISIS_LINE : "I do not want to guess about weddings. Please ask " + SHORT + (CH.phone ? " at " + CH.phone : "") + ", and the pastors will talk it through with you.", c: chips(CALL, BACK) },
    /* Groceries or help with a bill: the church's own pantry when its page names one, and a person either way. */
    pantry: { t: function (q) {
      var page = ""; try { page = ((document.querySelector("main") || document.body).innerText || "") + " " + (CH.give || ""); } catch (e) {}
      var call = CH.phone ? "Call " + CH.phone : "Ask on Sunday";
      return /\b(pantry|food|groceries|meals?)\b/i.test(q || "") && /\bpantry\b/i.test(page) ?"Yes. " + SHORT + " has a food pantry, and the team would want to help. " + call + ", and someone will tell you when it is open." : SHORT + " would want to help. " + call + ", and someone on the team will talk with you about what you need.";
    }, c: function () { return chips(CALL && { label: CALL.label, href: CALL.href, go: true, cta: true }, SHARE, BACK); } },
    noapp: { t: "No. You do not need an app to visit, plan a visit or share a prayer request. Everything works right here on the website.", c: chips(PLAN_VISIT, { label: "Service Times", key: "times" }, BACK) },
    free: { t: "Coming on a Sunday is always free, and nobody will ask you for anything. Giving is for people who call " + SHORT + " home, when they are ready.", c: [{ label: "Service Times", key: "times", cta: true }, { label: "I Am New Here", key: "newhere" }] },
    visitchange: { t: "Of course. Plans change, and nobody minds. Fill in Plan Your Visit again with the new Sunday" + (CH.phone ? ", or call us at " + CH.phone : "") + ", and the welcome team will update it.", c: chips(PLAN_VISIT, CALL, BACK) },
    /* Asked about care ("Do you offer counseling?"), or told something heavy ("My husband just died"). */
    care: { t: function (q) {
      /* The numbers always close a care answer, so a heavy message no pattern heard still sees them. */
      var open = sorry(q), line = CRISIS_LINE;
      if (!open) return "Our pastors would be glad to talk with you about that, and they can point you to trusted help. Share a request or call " + (CH.phone || "the church") + ", and a real person will get back to you." + line;
      return open + " You do not have to carry it alone. " + cap(listOf(pastorNames())) + " would be glad to " + (LOSS.test(q || "") ? "walk with you through this and pray with you" : "talk with you and pray with you") + ". Share a prayer request" + (CH.phone ? " or call " + CH.phone : "") + ", and a real person will get back to you." + line;
    }, c: function () { return chips(SHARE, messageChip(), CALL, BACK); } },
    /* "Is there hope for someone like me?" gets a yes; "Will I be judged?" gets a welcome. */
    welcome: { t: function (q) {
      /* A faith or ethics question ("Does God still love me after an abortion?") gets a welcome and a
         pastor, never a word for the other members or a hint at the church's answer. */
      if (/\b(?:god|jesus|christ|lord|forgiv\w*|sin|sins|sinful|sinned|abortion|heaven|hell|saved|salvation|bible|scripture)\b/i.test(q || ""))
        return "You are welcome here, just as you are. A question like that deserves a real conversation, not a quick answer from me. Our pastors would be glad to talk it through with you, or pray with you.";
      var also = NAME + " is full of people who once asked that same question";
      if (/\bhope for\b/i.test(q || "")) return "Yes, there is. " + also + ". You are welcome here just as you are, with nothing to figure out first. If you would like, our pastors would be glad to talk or pray with you.";
      return "You are welcome here, just as you are. " + also + ", and nobody has to have it all figured out first. If you would like, our pastors would be glad to talk or pray with you.";
    }, c: [SHARE, { label: "I Am New Here", key: "newhere" }, { label: "Service Times", key: "times" }] },
    moved: { t: function () { return "I am so glad it spoke to you. " + cap(listOf(pastorNames())) + " would love to hear what stood out, and you are always welcome back on Sunday."; }, c: function () { return chips({ label: "Watch a Message", key: "watch", cta: true }, PLAN_VISIT && { label: PLAN_VISIT.label, href: PLAN_VISIT.href, go: true }, BACK); } },
    /* What a guest asks that the page already says. */
    /* Who handles what a guest shares: the church, and Genesis with its providers, as the processors answer says. */
    privacy: { t: "What you share here goes to the people at " + SHORT + " who need it. Plan Your Visit reaches the welcome team, and a prayer request goes only to " + listOf(pastorNames().concat("our prayer team")) + ". " + PROCESSORS_LINE, c: [{ label: "Who Sees My Prayer Request?", key: "prayerwho" }, BACK] },
    serve: { t: "We would love that. Most people start serving after a Sunday or two. Tell a greeter or one of the pastors you would like to help, and they will help you find a team that fits.", c: [{ label: "I Am New Here", key: "newhere", cta: true }, { label: "Service Times", key: "times" }] },
    history: { t: function () { var y = foundedYear(), p = CH.pastors || ""; return (y && p.indexOf(y) < 0 ? NAME + " has been gathering since " + y + ". " : "") + (p || "Our pastors would love to tell you the story on a Sunday."); }, c: [{ label: "I Am New Here", key: "newhere" }, { label: "Service Times", key: "times" }] },
    special: { t: function (q) {
      var holiday = /christmas|easter|good friday|maundy|thanksgiving|new year|holiday|ash wednesday|\blent\b|advent|candlelight/i.test(q || "");
      if (FAKE_PHONE) return (holiday
        ? "Holiday services, like Christmas Eve and Easter, have their own times each year. On a real church site, " + SHORT + " shares them ahead of time, and the church office answers questions."
        : "I do not want to guess about that. On a real church site, you would ask the church office, and someone on the team would tell you what they offer.") + DEMO_NOTE + CRISIS_LINE;
      if (holiday) return "Holiday services, like Christmas Eve and Easter, have their own times each year, and " + SHORT + " shares them ahead of time." + (CH.phone ? " You can also call " + CH.phone + " to ask." : "");
      return "I do not want to guess about that. Please ask " + SHORT + (CH.phone ? " at " + CH.phone : "") + ", and someone on the team will tell you what they offer.";
    }, c: chips({ label: "Service Times", key: "times" }, CALL, BACK) },
    /* A child-safety question gets its own plain answer, never the cheerful kids answer: the checks, the
       two-adult rule, the check-in tags, who to tell, and 911. */
    kidsafe: { t: function () { return "Yes. Every adult who serves with kids at " + SHORT + " is background checked and trained before they serve. There are always two adults in every room, and a child goes home only with the grown-up who holds the matching check-in tag. If you have a concern about a child's safety, tell " + listOf(pastorNames()) + (CH.phone && !FAKE_PHONE ? " or call " + CH.phone : "") + ". If a child is in danger, call 911."; }, c: chips({ label: "Kids and Students", key: "kids" }, BACK) },
    /* Why there is no box to type in (owner decision, November 23, 2026). */
    notyping: { t: "This demo answers only the questions it shows, so every answer here was written and checked ahead of time. Typing comes back later, only on a real AI service with a safety check before any answer." + CRISIS_LINE, c: [BACK] },
    real: { t: NAME + " is a made-up church for this preview. Its times, people and stories are samples, and a real church fills every part with its own.", c: [{ label: "What Does a Church Get?", key: "package", cta: true }, { label: "Take the Tour", key: "tour" }] },
    /* plain words about who is answering */
    human: { t: CHURCH ? "I am " + AN + ", an automated assistant for " + NAME + ". On a real church site, a real person on our team would help with anything I cannot answer" + (CH.phone && !FAKE_PHONE ? ", and you can call us at " + CH.phone + "." : ". In this demo, nothing is sent.") : "I am " + AN + ", an automated assistant for the Genesis Ministry preview. A real person at Genesis can answer anything I cannot, on a call.", c: CHURCH ? chips(CALL, BACK) : null },
    hello: { t: "Hi. I am " + AN + ", an automated assistant" + (CHURCH ? " for " + NAME : "") + ". Here is what I can help with.", c: null },
    thanks: { t: "You are welcome. Anything else I can help with?", c: null },
    /* questions a church leader asks about the product */
    /* The same plan contents as the plan cards and the workspace Hope (platform/shared/demo.js LEVELS_TEXT). */
    package: { t: "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month. Care is the website in one of four looks " + (CFG.look && CFG.look !== "Genesis Ministry" ? " (this one is " + LOOK + ")" : "") + ", the brand board, the social marketing plan, " + AN + " on the website (an assistant like me, answering from facts the church approves), Plan a Visit and prayer forms by email, and newsletter sign-up. Shepherd is everything in Care, plus Today, the guest pipeline, the member app, the care inbox and drafts that wait for approval, with up to 8 staff seats. Plus is everything in Shepherd, plus person pages, the Access Record screen, the spiritual gifts picture, reports, custom roles and named gift viewers, with up to 15 staff seats. Enterprise, for more than one campus, is scoped on a call.", c: chips({ label: "What Is the Back Office?", key: "backoffice", cta: true }, { label: "Can We Customize It?", key: "custom" }, LINKS.brandBoard && { label: "See the Brand Board", href: LINKS.brandBoard }, LINKS.socialPlan && { label: "See the Social Plan", href: LINKS.socialPlan }) },
    custom: { t: "Every template is filled with your church's content, photos and colors. Changes beyond the template, such as new page layouts or special features, are available for an additional cost.", c: [{ label: "What Does It Cost?", key: "price" }, { label: "How Does " + AN + " Work?", key: "hope" }, { label: "Take the Tour", key: "tour", cta: true }] },
    price: { t: "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month. Enterprise, for more than one campus, is scoped on a call. Customization beyond the template is available for an additional cost.", c: [{ label: "What Does a Church Get?", key: "package" }, { label: "Can We Customize It?", key: "custom" }] },
    /* What a real church site does, in honest terms: this demo screens no typed words, because nobody can type here. */
    hope: { t: "On a real church site, " + AN + " answers guests day and night from facts your team approves: times, kids, parking, next steps, giving. A guest taps a question, and every answer was written and checked ahead of time, as in this demo. " + AN + " points people to the prayer form, where they choose who reads it, hands personal questions to a real person, and shows 988 and 911 under its questions. Typing a question comes back later, only on a real AI service with a safety check before any answer. When it does, and " + AN + " does not know, it will say so and hand the question to a person.", c: [{ label: "What Do We Get?", key: "package" }, { label: "Take the Tour", key: "tour", cta: true }] },
    backoffice: { t: "The back office starts with the Shepherd plan, at $299 a month: Today, a front office where every first-time guest gets an owner and a next step, the care inbox for prayer and messages, the member app, and drafts that wait for approval. The Plus plan, at $499 a month, adds a page for each person, the Access Record screen, the spiritual gifts conversation with a picture of the gifts across the church, and reports.", c: [{ label: "What Do We Get?", key: "package" }, { label: "Can We Customize It?", key: "custom" }] },
    menu: null,
  };
  /* A buyer's questions on a church site go to Genesis, never to the made-up church's phone. */
  var ON_CALL = "settled with a person at Genesis on a call, before a church signs anything";
  A.gm = { t: "Genesis Ministry is the church edition of Genesis OS, from Genesis AI. It gives a church a website in one of four looks, with " + AN + " answering guests, and from the Shepherd plan a back office where every guest and prayer request has an owner. " + (CHURCH ? NAME + " is a made-up sample church in the " + LOOK + " look." : ""), c: [{ label: "What Does a Church Get?", key: "package", cta: true }, { label: "What Does It Cost?", key: "price" }, { label: "Take the Tour", key: "tour" }] };
  A.contract = { t: "Contract terms are " + ON_CALL + ". Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }); } };
  A.domain = { t: "A church's web address is settled during scoping, with a person at Genesis: which address the new site uses and how the move is handled.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }); } };
  A.trial = { t: "A trial is " + ON_CALL + ". Scoping includes a guided demo in the look a church chooses, like this " + LOOK + " sample.", c: function () { return chips(talkChip(), { label: "Take the Tour", key: "tour", cta: !talkChip() }); } };
  A.cancel = { t: "How a plan ends is " + ON_CALL + ". If a church leaves, its data is its own: Genesis hands over a full export, then deletes its copy once the church confirms it has it.", c: function () { return chips(talkChip(), { label: "What Does It Cost?", key: "price" }); } };
  A.fees = { t: "The monthly price is the plan: Care at $149, Shepherd at $299 and Plus at $499 a month. Anything more, like customization beyond the template, is quoted in writing before a church signs.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }, { label: "Can We Customize It?", key: "custom" }); } };
  /* Buyer questions every Hope answers the same way (the words of platform/shared/demo.js ANSWERS). */
  A.keepsite = { t: "Whether " + AN + " can be added to a website a church already has is " + ON_CALL + ". Every plan today comes with a new website in one of four looks, with " + AN + " built in.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }); } };
  A.references = { t: "A person at Genesis can talk with a church about other churches and references, on a call.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }); } };
  A.campus = { t: "Enterprise is for churches with more than one campus. One campus with several services is not Enterprise. Enterprise includes everything in Plus, and how the campuses share people, care and reports is scoped on a call.", c: function () { return chips(talkChip(), { label: "What Does It Cost?", key: "price" }); } };
  A.onecampus = { t: function (q) {
    q = String(q || "");
    if ((/^\s*(do|does|is|are|would|will|should|can)\b/i.test(q) && /\benterprise\b/i.test(q)) || /\b(do|does|would|will|should|must) (we|i|our church|a church|you)\b.{0,24}\benterprise\b|\bis (it|this|that) enterprise\b/i.test(q))
      return "No. One campus with several services is not Enterprise. Care, Shepherd and Plus each cover one campus, however many services it holds. Enterprise is for a church with more than one campus, and it is scoped on a call.";
    return "Any plan covers one campus, however many services it holds: Care, Shepherd or Plus. Enterprise is for a church with more than one campus, and it is scoped on a call.";
  }, c: [{ label: "What Does It Cost?", key: "price" }, { label: "What Does a Church Get?", key: "package" }] };
  /* Round 4: giving privacy, a phone number and app messages, in the church's own voice. */
  A.givingprivate = { t: "Genesis, which runs this " + WHERE + ", keeps no giving history, so " + AN + " and this " + WHERE + " never see what you give. Giving records stay with " + SHORT + "'s giving provider, and the church decides who on staff may see them." + (CH.phone ? " To ask who that is, call " + CH.phone + "." : ""), c: [{ label: "How Do I Give?", key: "give" }, BACK] };
  A.texting = { t: SHORT + " follows up with guests by email. A phone number you share is used only to reach you about your visit, and it is never sold or passed on for anyone's marketing.", c: [{ label: "Who Sees My Prayer Request?", key: "prayerwho" }, BACK] };
  A.appmessages = { t: "On a real church site, in " + SHORT + "'s member app, a private message is read only by the pastors, and a prayer request only by the people you choose. " + AN + " never reads either, and other members never see them." + DEMO_NOTE, c: [{ label: "Who Sees My Prayer Request?", key: "prayerwho" }, BACK] };
  A.gmdenom = { t: "Genesis Ministry is built for churches of any denomination, and it takes no side on doctrine. " + AN + " shares only what each church has written about its beliefs. A person at Genesis would be glad to tell you about the company and its team on a call.", c: function () { return chips(talkChip(), BACK); } };
  /* AI training, on every Hope, in the same words. */
  A.aitraining = { t: "No. Genesis never uses prayer, messages or member data to train AI. " + AN + " answers only from facts " + (CHURCH ? SHORT : "the church") + " approved.", c: [{ label: "How Does " + AN + " Work?", key: "hope" }, BACK] };
  /* "Does Hope read my prayer request?", "Do you share my data with third parties?" */
  A.aiprayer = { t: "No. " + AN + " never reads prayer words, never summarizes them and never writes a reply. A prayer request goes only to the people you choose, and a person writes every reply." + CRISIS_LINE, c: [SHARE, BACK] };
  A.processors = { t: "Genesis, which runs this " + WHERE + (CHURCH ? " for " + SHORT : "") + ", never sells what you share or passes it on for anyone's marketing. A few service providers, such as hosting, email delivery and the AI service behind " + AN + ", handle it under contract only to run the " + (IN_APP ? "app" : "site") + ". " + (CHURCH ? "None of it is ever used to train AI." : "The named list is shared in writing during scoping, and none of it is ever used to train AI."), c: chips(CHURCH ? { label: "Who Sees My Prayer Request?", key: "prayerwho" } : talkChip(), BACK) };
  /* "Is this chat private?", in a guest's own words. */
  A.chat = { t: "I am an automated assistant, and nobody at " + SHORT + " watches this chat. If you leave your name or ask for a person, the welcome team sees your question so they can follow up. For anything private, use the prayer form, where you choose who reads it." + CRISIS_LINE, c: [SHARE, BACK] };
  /* A pastor's question about abuse or danger: who acts, and the numbers. Hope reports to no one. */
  A.reporting = { t: CHURCH
    ? "Our pastors follow " + SHORT + "'s child protection and reporting policy, and a real person handles every report. I am an automated assistant, so please do not wait on me: if you or someone else is in danger, call 911, or call or text 988." + (CH.phone ? " You can call the church at " + CH.phone + "." : "")
    : AN + " never reports to anyone, and it never reads prayer words. Your pastors follow your child protection and reporting policy. On a real church site, every " + AN + " answer and every form shows 988 and 911, and from the Shepherd plan a prayer request or message that sounds like someone is in danger alerts the pastor on call, with no private words. In this demo, nothing is checked or sent.", c: function () { return CHURCH ? CRISIS_CHIPS : chips(talkChip(), BACK); } };
  /* Keeping a request from one pastor, who reads a member's messages at home, and what a pastor must report. */
  A.prayerfromstaff = { t: "A prayer request reaches all of our pastors, " + listOf(pastorNames()) + ", so it cannot be kept from one of them. If you would rather talk with just one pastor, " + (CH.phone ? "call " + CH.phone + " and ask for them." : "ask for them on Sunday.") + CRISIS_LINE, c: [SHARE, BACK] };
  A.messagesprivate = { t: "What you share with " + SHORT + " never goes to anyone in your family. A prayer request goes only to the pastors and the people they trust to pray. If someone at home can open your email or phone, keep that in mind before you write. If you are not safe at home, call 911, or call or text 988.", c: [SHARE, BACK] };
  A.confidential = { t: "A pastor can talk with you about what stays private and the few things they must report to keep someone safe." + (CH.phone ? " Call " + CH.phone + " to find a time." : "") + " If anyone is in danger right now, call 911, or call or text 988.", c: function () { return chips(CALL, BACK); } };
  A.careplan = { t: "Care is the first Genesis Ministry plan, at $149 a month: the website, " + AN + " on it and forms by email. The Care Inbox is a screen that comes with the Shepherd plan: one shared inbox for prayer and messages, with an owner on every thread and every open recorded.", c: function () { return chips(talkChip(), { label: "What Does a Church Get?", key: "package" }); } };
  /* Round 5: prayer is never printed or read aloud, and an age answer for a teenager on a church site. */
  A.prayerpublic = { t: function () { return "Your request is never printed or read aloud, and other members never see it. " + (CHURCH && +(new URLSearchParams(location.search).get("plan") || 0) === 1 ? "It goes by email to " + listOf(pastorNames()) + "." : "Only the people you choose read it: " + listOf(pastorNames().concat("our prayer team")) + ", or the pastors only.") + CRISIS_LINE; }, c: [SHARE, BACK] };
  if (CHURCH && !A.age) A.age = { t: "You are welcome here. Accounts and private messages are for adults 18 and older, so the best way to reach the student team is in person at Students, or with a parent or guardian" + (CH.phone ? " by calling " + CH.phone : "") + ". If you are ever not safe, call 911, or call or text 988.", c: [{ label: "Students", key: "students" }, BACK] };
  /* The Care plan of a church site (the Website screen passes ?plan=1): prayer forms go by email to the
     pastors, and there is no prayer team inbox yet. */
  var SITE_PLAN = +(new URLSearchParams(location.search).get("plan") || 0);
  if (CHURCH && SITE_PLAN === 1) {
    var CARE_PRAYER = "Your request goes by email to " + listOf(pastorNames()) + ". You choose who may read it, and they honor that.";
    A.prayer = { t: "On a real church site, the pastors would be honored to pray with you. " + CARE_PRAYER + DEMO_NOTE + CRISIS_LINE, c: [SHARE, BACK] };
    A.prayerwho = { t: "On a real church site, your request would go by email to " + listOf(pastorNames()) + ". You choose who may read it, and they honor that." + DEMO_NOTE + CRISIS_LINE, c: [SHARE, BACK] };
    A.privacy = { t: "What you share here goes to the people at " + SHORT + " who need it. Plan Your Visit reaches the church by email. " + CARE_PRAYER + " " + PROCESSORS_LINE, c: [{ label: "Who Sees My Prayer Request?", key: "prayerwho" }, BACK] };
    A.prayerfromstaff = { t: CARE_PRAYER + " If you would rather talk with just one pastor, " + (CH.phone && !FAKE_PHONE ? "call " + CH.phone + " and ask for them." : "ask for them on Sunday.") + CRISIS_LINE, c: [SHARE, BACK] };
  } else if (CHURCH && SITE_PLAN >= 2) {
    A.prayerwho = { t: "On a real church site, only " + listOf(pastorNames().concat("our prayer team")) + " read prayer requests. Nobody else on staff can open them, and when you share one, you choose who may read it." + DEMO_NOTE + CRISIS_LINE, c: [SHARE, BACK] };
    A.prayerfromstaff = { t: "When you share a request, you can choose Pastors only, so the prayer team does not read it. It still reaches every pastor, " + listOf(pastorNames()) + ". If you would rather talk with just one of them, " + (CH.phone && !FAKE_PHONE ? "call " + CH.phone + " and ask for them." : "ask for them on Sunday.") + CRISIS_LINE, c: [SHARE, BACK] };
  }
  /* The story pages speak for Genesis Ministry, not a church: a Sunday question points to the sample
     sites, and a buyer's questions (getting started, a call) get Genesis's own answers. */
  if (!CHURCH) {
    /* A church's own fact ("What time is your service?") belongs to a church's site. Anything else a
       pastor asks is honestly not known here, with a person at Genesis one tap away. */
    var CHURCH_FACT = /\b(your|y'?all'?s?)\s+(church|service|services|sunday|sundays|gathering|pastors?|kids|children|nursery|youth|students|small groups?|groups|building|address|parking|times?|worship|location|staff|sermons?|messages?)\b|\bwhat time\b|\bwhere (is|are) (the|your) (church|service|building|parking)\b|\b(service|sunday|worship|gathering) times?\b|\bwhere (are you|is it) located\b|\bcan i (give|join|visit|come|bring|park|serve|attend|watch)\b|\b(is there|do you have) (a |an )?(nursery|kids'? (ministry|program|church)|youth group|student ministry|small groups?|parking|coffee|food pantry|bible stud(y|ies))\b|\bpray for (me|my|us)\b/i;
    /* A question about Hope itself ("How do I know Hope won't make up a service time?") is not a church fact. */
    var churchFact = function (q) { q = String(q || ""); return CHURCH_FACT.test(q) && !new RegExp("\\bhow (?:do|can|would) (?:i|we) know\\b|\\b(?:will|does|would|could|can|won'?t|doesn'?t) " + AN_RE + "\\b|\\bmake (?:things|stuff|it|something|answers?|facts?|\\w+ times?) up\\b|\\bmade[- ]up\\b", "i").test(q); };
    var notHere = {
      t: function (q) { return churchFact(q) ? NOT_HERE : (CFG.fallback || "I am not sure about that one, and I would rather not guess. A person at Genesis can answer it on a call.") + CRISIS_LINE; },
      c: function (q) { return churchFact(q) ? MENU.slice(0, 4) : chips(talkChip(), MENU[1], MENU[2]); }
    };
    ["times", "parking", "newhere", "kids", "students", "groups", "give", "watch", "pastors", "values", "visitchange", "serve", "history", "special", "kidsafe", "privacy", "talkpastor", "wedding", "pantry", "noapp"].forEach(function (k) { A[k] = notHere; });
    A.beliefs = { t: "Each church answers that in its own words. On a church's own site, " + AN + " shares what the church has written and hands questions like this to a pastor rather than guessing.", c: null };
    A.moved = { t: "I am glad it spoke to you. A person at Genesis would be glad to walk you through it with your own church in mind.", c: function () { return chips(talkChip(), { label: "How Do We Get Started?", key: "start" }); } };
    /* Someone hurting on a page with no church: kind words, the crisis line and a way back, no product. */
    A.prayer = { t: "I am sorry you are carrying that. On a real church site, its pastors and prayer team would be honored to pray with you. This is the Genesis Ministry preview, so no one reads this chat, and nothing is sent." + CRISIS_LINE, c: [BACK] };
    A.care = { t: function (q) { return (sorry(q) || "I am sorry you are carrying that.") + " This is the Genesis Ministry preview, so no one reads this chat, but a pastor at your own church would be honored to walk with you." + CRISIS_LINE; }, c: [BACK] };
    A.welcome = { t: function (q) { return (/\bhope for\b/i.test(q || "") ? "Yes, there is." : "You are welcome, just as you are.") + " This is a software preview, so no one reads this chat, but a pastor at a church near you would be glad to talk with you." + CRISIS_LINE; }, c: [BACK] };
    A.free = A.price;
    A.chat = { t: "This is the Genesis Ministry preview. Its answers are scripted, nothing is sent in this demo, and no one reads this chat.", c: function () { return chips(talkChip(), BACK); } };
    A.real = { t: "Genesis Ministry is real software from Genesis AI. The four churches in this preview are made up, with sample data, so you can try every screen without touching anyone's real information.", c: function () { return chips(A.startdemo && { label: "Start the Guided Demo", key: "startdemo", cta: true }, { label: "How Do We Get Started?", key: "start" }); } };
    A.start = { t: "Every church starts the same way. Consultation is a free conversation. Scoping brings a guided demo and a proposal with a look and a plan. Implementation builds it with your content, Launch takes it live with your staff, and the Managed Platform keeps it running. Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.", c: function () { return chips(talkChip(), { label: "See Getting Started", href: startHref(), go: true }, { label: "What Does Each Plan Include?", key: "levels" }); } };
    A.talk = { t: function () { return "A person at Genesis would be glad to walk you through it with your own church in mind." + (contactHref() ? " Talk With Genesis opens a short form on geai.us, and someone writes back to find a time." : " Ask for a walkthrough at geai.us."); }, c: function () { return chips(talkChip(), { label: "How Do We Get Started?", key: "start" }); } };
    A.contact = A.talk;
    A.human.c = function () { return chips(talkChip(), { label: "How Do We Get Started?", key: "start" }, { label: "Take the Tour", key: "tour" }); };
  }
  if (CFG.answers) for (var ak in CFG.answers) if (Object.prototype.hasOwnProperty.call(CFG.answers, ak)) A[ak] = CFG.answers[ak];
  var MENU = CFG.menu && CFG.menu.length ? CFG.menu : [
    { label: "Take the Tour", key: "tour", cta: true },
    { label: "What Does a Church Get?", key: "package" },
    { label: "Service Times", key: "times" },
    { label: "I Am New Here", key: "newhere" },
    { label: "Kids and Students", key: "kids" },
    { label: "Can We Customize It?", key: "custom" },
  ];
  ["human", "hello", "thanks"].forEach(function (k) { if (A[k] && !A[k].c) A[k].c = k === "thanks" ? MENU.slice(0, 4) : MENU; });

  /* ------------------------------------------------------------ the questions */
  /* Tap to ask: the questions a visitor can tap, in groups. Each is [the question as shown, the answer
     it gets]. The first group shows; More Questions opens the rest. Every question goes to the answer
     written for it (shared/hope-check.html checks that each one routes to that same answer, so the
     words match the question). A page sets its own with questions: [{ title, more, items }]. */
  var QUESTIONS_CHURCH = [
    { title: "Popular Questions", items: [
      ["What Time Are Services?", "times"], ["Where Do I Park?", "parking"], ["I Am New Here. What Should I Expect?", "newhere"],
      ["Is There Child Care?", "kids"], ["Can I Talk to a Pastor?", "talkpastor"], ["Who Sees My Prayer Request?", "prayerwho"]] },
    { title: "Prayer", more: true, items: [
      ["Can Someone Pray With Me?", "prayer"]] },
    { title: "Kids and Groups", more: true, items: [
      ["Are Volunteers Background Checked?", "kidsafe"], ["Is There a Youth Group?", "students"], ["How Do I Join a Small Group?", "groups"]] },
    { title: "Sundays and Giving", more: true, items: [
      ["What Should I Wear?", "wear"], ["Can I Watch Online?", "watch"], ["How Do I Give Online?", "give"]] },
    { title: "About This Demo", more: true, items: [
      ["What Does a Church Get?", "package"], ["What Does It Cost?", "price"], ["Can We Customize It?", "custom"]] }
  ];
  var QUESTIONS = (CFG.questions || (CHURCH ? QUESTIONS_CHURCH : [{ title: "Questions", items: MENU.filter(function (c) { return c && c.key && c.key !== "tour"; }) }])).map(function (g) {
    return { title: g.title || "", more: !!g.more, items: (g.items || []).map(function (x) { return Array.isArray(x) ? { label: x[0], key: x[1] } : x; }).filter(function (x) { return x && x.key && A[x.key]; }) };
  }).filter(function (g) { return g.items.length; });
  /* Every Hope says why there is no box to type in, as the last question under More Questions. */
  (function () {
    var last = QUESTIONS.filter(function (g) { return g.more; }).pop() || QUESTIONS[QUESTIONS.length - 1];
    if (last && !QUESTIONS.some(function (g) { return g.items.some(function (x) { return x.key === "notyping"; }); })) last.items.push({ label: "Why Can't I Type a Question?", key: "notyping" });
  })();
  /* Above the questions: the tour and the guided demo, as before (never a question). */
  var Q_ACTIONS = MENU.filter(function (c) { return c && (c.key === "tour" || c.key === "startdemo"); });
  var qsMade = 0, qsBox = null;
  function firstQuestion() { return qsBox && qsBox.querySelector(".hd-q"); }
  /* Brings a part of the chat to the top of its view. */
  function toTop(n) { if (body && n) body.scrollTop = Math.max(0, body.scrollTop + n.getBoundingClientRect().top - body.getBoundingClientRect().top - 8); }
  function addQuestions(fromButton) {
    if (!body) return;
    /* There is one question list. Asked for again (All Questions, Back to the Menu), it moves to the end of
       the chat with the same chips, never a second copy. */
    if (qsBox) {
      body.appendChild(qsBox); toTop(qsBox);
      if (fromButton) focusOn(firstQuestion());
      return;
    }
    var box = qsBox = el("div", "hd-qs"); box.setAttribute("role", "group"); box.setAttribute("aria-label", "Questions you can ask " + AN);
    if (Q_ACTIONS.length) {
      var acts = el("div", "hd-chips");
      Q_ACTIONS.forEach(function (c) { var b = el("button", "hd-chip" + (c.cta ? " cta" : ""), c.label); b.type = "button"; b.addEventListener("click", function () { onChip(c); }); acts.appendChild(b); });
      box.appendChild(acts);
    }
    var more = null, moreId = "hd-qs-more-" + (++qsMade);
    QUESTIONS.forEach(function (g) {
      var host = box;
      if (g.more) { if (!more) { more = el("div", "hd-qs-more"); more.id = moreId; more.hidden = true; } host = more; }
      if (g.title) host.appendChild(el("p", "hd-qs-h", g.title));
      var row = el("div", "hd-chips");
      g.items.forEach(function (it) {
        var b = el("button", "hd-chip hd-q", it.label); b.type = "button"; b.setAttribute("data-hope-q", it.key);
        b.addEventListener("click", function () { addUser(it.label); answer(it.key, it.label); });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
    if (more) {
      var mb = el("button", "hd-more", "More Questions"); mb.type = "button";
      mb.setAttribute("aria-expanded", "false"); mb.setAttribute("aria-controls", moreId);
      mb.addEventListener("click", function () {
        var opening = more.hidden; more.hidden = !opening;
        mb.setAttribute("aria-expanded", String(opening)); mb.textContent = opening ? "Fewer Questions" : "More Questions";
        /* The new groups come into view at the top of the chat, then the first one takes focus. */
        if (opening) { var f = more.querySelector(".hd-q"); toTop(more); if (f) focusOn(f); }
      });
      box.appendChild(mb); box.appendChild(more);
    }
    body.appendChild(box);
    if (fromButton) { toTop(box); focusOn(firstQuestion()); } else scrollDown();
  }
  if (!CHURCH) ["times", "parking", "newhere", "kids", "students", "groups", "give", "watch", "pastors", "values", "contact", "visitchange", "serve", "history", "special", "kidsafe", "privacy", "beliefs"].forEach(function (k) { if (A[k] && !A[k].c) A[k].c = MENU.slice(0, 4); });
  /* Under the crisis reply (its words never change): numbers a phone can dial with one tap. */
  /* A sample church's made-up 555 number is never a button under the crisis reply: nobody would answer. */
  var CRISIS_CHIPS = chips({ label: "Call 988", href: "tel:988", go: true, cta: true }, { label: "Text 988", href: "sms:988", go: true }, { label: "Call 911", href: "tel:911", go: true }, / 555-/.test(CH.phone || "") ? null : CALL, !CHURCH && A.crisisinfo ? { label: "How Does " + AN + " Handle a Crisis?", key: "crisisinfo" } : null, BACK);
  /* Under the reply for harm by someone at church: the numbers only, never only the church. */
  var LEADER_CHIPS = chips({ label: "Call 911", href: "tel:911", go: true, cta: true }, { label: "Call 988", href: "tel:988", go: true }, { label: "Text 988", href: "sms:988", go: true }, BACK);
  /* When nothing fits, a church's own Hope offers the church's next steps, never the product. */
  var FALLBACK_CHIPS = !CHURCH ? MENU
    : A.talk ? chips({ label: "Talk to a Person", key: "talk", cta: true }, { label: "Service Times", key: "times" }, BACK)
    : chips({ label: "Talk to a Person", key: "contact", cta: true }, { label: "Service Times", key: "times" }, { label: "I Am New Here", key: "newhere" }, { label: "Kids and Students", key: "kids" }, BACK);
  /* Someone telling about their own life ("I", "my", "we"), not asking for something ("Show me the
     brand board"). */
  var ABOUT_SELF = /\b(?:i|i'?m|i'?ve|i'?d|i'?ll|my|mine|myself|we|we'?re|we'?ve|our)\b/i;
  var ASKING = /^\s*(?:please\s+)?(?:show|tell|give|send|find|let|help|take|open|walk)\s+(?:me|us)\b/i;
  /* A buyer's question on a church site: never the made-up church's phone. */
  var BUYER_WORDS = /\b(?:genesis|enterprise|campus(?:es)?|pricing|subscription|wordpress|squarespace|wix|references?|(?:web ?)?site like this|(?:care|shepherd|plus) plan|which plan|(?:our|my) (?:current|existing|old) (?:web ?site|site))\b/i;
  /* When nothing fits. Every fallback ends with the crisis line, so a crisis no rule heard still sees
     988 and 911. */
  function fallback(q) {
    q = WORDS.plain(q);
    /* Someone who told Hope about their own life is thanked and pointed to a person. */
    if (CHURCH && ABOUT_SELF.test(q) && !ASKING.test(q) && !/\?\s*$/.test(q) && !BUYER_WORDS.test(q))
      return { t: "Thank you for telling me. If you are in crisis, call or text 988, or 911 in an emergency. " + SHORT + " would want to help too" + (CH.phone && !/ 555-/.test(CH.phone) ? ": call " + CH.phone + ", and a real person will hear you out." : ", and a real person there would be glad to hear more."), c: chips({ label: "Call 988", href: "tel:988", go: true, cta: true }, { label: "Text 988", href: "sms:988", go: true }, { label: "Call 911", href: "tel:911", go: true }, { label: "Talk to a Person", key: A.talk ? "talk" : "contact" }, BACK) };
    if (CHURCH && BUYER_WORDS.test(q) && !CFG.fallback)
      return { t: "I am not sure about that one, and I would rather not guess. It is " + ON_CALL + "." + CRISIS_LINE, c: chips(talkChip(), { label: "What Does a Church Get?", key: "package", cta: !talkChip() }, { label: "What Does It Cost?", key: "price" }) };
    return { t: (CFG.fallback || (CHURCH
      ? "I am not sure about that one, and I would rather not guess. " + (CH.phone ? "Someone at " + SHORT + " can tell you at " + CH.phone + ", or try one of these." : "Try one of these, or ask someone at " + SHORT + " on Sunday.")
      : "I am not sure about that one, and I would rather not guess. Try one of these.")) + CRISIS_LINE, c: CHURCH ? FALLBACK_CHIPS : chips(talkChip(), MENU[1], MENU[2], MENU[3]) };
  }

  /* Asked first, before any page rule: who is answering, and a plain hello or thank you. */
  var FIRST = [
    [/\bwhy can'?t (?:i|we) type\b|\bwhy (?:is there|isn'?t there) (?:no|a) (?:box|text box|place) to type\b/i, "notyping"],
    [/\b(are you|am i (talking|speaking|chatting) (to|with)) (a |an )?(real|human|person|bot|robot|ai|machine|computer)\b|\b(is this|is that) (a |an )?(real person|human|person|bot|robot|ai|machine|computer)\b|\b(talk|speak|chat) (to|with) (a |an )?(real )?(person|human|someone|somebody)\b|\breal (person|human)\b/i, "human"],
    [/^\s*(hi|hello|hey|hiya|howdy|good (morning|afternoon|evening))( there| hope)?\s*[!.?]*\s*$/i, "hello"],
    [/^\s*(thanks?|thank you|thx|ty)( so much| very much| hope)?\s*[!.?]*\s*$/i, "thanks"],
  ];
  /* "Do you use my prayer request to train AI?", "Is Hope trained on my conversations?", "Is our data
     fed into an AI model?": AI training, before prayer or giving hears its words. Staff training
     ("Do you train our volunteers?") and "learn more about" are not. */
  var TRAIN_WORDS = /\b(?:train\w*|learn\w*|fine[- ]?tun\w*|feed\w*|fed (?:into|to)|improv\w*|smarter)\b/i;
  var AI_TRAIN = { test: function (q) {
    q = String(q || "");
    if (!TRAIN_WORDS.test(q)) return false;
    var staffOnly = /\b(?:train\w*|onboard\w*|teach\w*)\b.{0,20}\b(?:our|the|my|your)?\s?(?:staff|team|volunteers|people|pastors|leaders|admins?)\b|\bstaff training\b|\blearn (?:more|about|how)\b|\b(?:staff|team|volunteers?|we|i|pastors?)\b.{0,20}\b(?:learn|be trained|get trained)\b/i;
    var aiNamed = /\btrain\w*\b.{0,20}\b(?:ai|a\.i\.|models?|llms?)\b|\b(?:prayers?|messages?|data)\b.{0,60}\btrain/i;
    if (staffOnly.test(q) && !aiNamed.test(q)) return false;
    if (new RegExp("\\b(?:ai|a\\.i\\.|artificial intelligence|models?|llms?|chat ?gpt|openai|gpt|algorithms?|machine learning|" + AN_RE + ")\\b", "i").test(q)) return true;
    return /\b(?:prayers?|prayer requests?|requests?|messages?|threads?|data|information|records?|conversations?|notes?|chats?)\b/i.test(q) && /\btrain\w*\b.{0,30}\b(?:on|with|using|from)\b|\b(?:use|using|used|feed\w*|fed)\b.{0,40}\b(?:to|for|into) (?:train|training|fine|improve|make)/i.test(q);
  } };
  /* A buyer on a church site: Enterprise and campuses, a website like this one, and an existing website,
     before the church's own times, pastors and services hear their words. */
  var CAMPUS_Q = /\benterprise\b|\bmulti-?sites?\b|\b(?:more than one|multiple|several|two|three|four|second|another|new) campus(?:es)?\b|\bcampuses\b/i;
  var ONE_CAMPUS = { test: function (q) { q = String(q || ""); return /\b(?:enterprise|plan|tier)\b/i.test(q) && !/\b(?:more than|other than|beyond) one\b|\b(?:two|three|several|multiple|many|second|another|new) (?:campus|campuses|locations|sites)\b|\bmulti-?site\b/i.test(q) && /\b(?:one|a single|single|only one|just one) (?:campus|location|site|building)\b|\bsame (?:campus|location|building)\b|\b(?:two|three|four|five|several|multiple|many|\d) (?:sunday |weekend |worship )?(?:services|gatherings)\b|\b\w+ service and (?:an? )?\w+ service\b/i.test(q); } };
  var BUYER_PRICE = /\b(?:web ?site|site) like (?:this|yours)\b.{0,40}\b(?:cost|price|charge|pay)\w*\b|\b(?:cost|price|charge|pay)\w*\b.{0,40}\b(?:web ?site|site) like (?:this|yours)\b|\b(?:another|other|my|our) church\b.{0,60}\b(?:cost|price|pricing|charge|how much)\b|\b(?:cost|price|pricing|charge|how much)\b.{0,40}\b(?:for|to) (?:our|my|another) church\b/i;
  var KEEP_SITE = new RegExp("\\b(?:keep|use|stay with|stick with)\\b.{0,30}\\b(?:current|existing|own|old|present)\\s+(?:web ?site|site)\\b|\\b(?:current|existing|own|old) (?:web ?site|site)\\b.{0,40}\\b(?:add|keep|embed|plug|use)\\b|\\b(?:wordpress|squarespace|wix|ekklesia|nucleus)\\b", "i");
  /* Before the page's own rules: a hurting person and "is this real" never get a product answer.
     "Will I be judged?" is a welcome; "My husband just died" or "I feel hopeless" goes to a pastor.
     On the story pages, a buyer's "how do we start" and "can we talk" come first too. */
  var EARLY = [
    [/\bhope for (?:me|someone like me|people like me|us|my \w+)\b|\b(?:someone|people|a person) like me\b|\b(?:am i|would i be|will i be|could i be|can i be) (?:welcome|accepted|judged|wanted|allowed|loved|forgiven)\b|\btoo far gone\b|\bnot good enough\b|\btoo (?:late|broken|bad|messed up|sinful) for (?:me|someone like me|god)\b|\b(?:can|could|would|will|does|did) (?:god|jesus|christ|anyone) (?:really |still )?(?:love|forgive|accept|want|care (?:about|for)|die for) (?:me|us|someone like me)\b/i, "welcome"],
    /* Round 5: the afterlife, the Bible on a subject, tongues and the rapture are doctrine for a pastor,
       never the condolence or the values blurb. */
    [/\bwhat happens (?:after|when) (?:we|you|i|people|they|someone) (?:die|dies)\b|\bafter ?life\b|\b(?:where do (?:we|you|people|i|they) go|is there (?:life|anything)) (?:after|when) (?:we|you|i|people|they) (?:die|dies)\b|\bspeaking in tongues\b|\brapture\b|\bwhat (?:does )?(?:the )?bible says?\b|\bbible says? about\b|\b(?:does|do) (?:this|the|your) church believe in\b/i, "beliefs"],
    [HURT, "care"],
    /* Round 4: doctrine ("Can a woman be a pastor here?", "Will I go to heaven if I'm not baptized?") goes to a pastor. */
    [/\b(?:can|may|should|could|do you let|do you allow|are) (?:a )?wom[ae]n (?:be |become |serve as |allowed to )?(?:an? )?(?:pastors?|preach\w*|lead\w*|elders?|deacons?|teach\w*)\b|\b(?:go|get|going|end up) (?:to|into|in) (?:heaven|hell)\b|\bheaven or hell\b|\b(?:am i|will i be|can i be|are you|is he|is she) saved\b|\bsalvation\b|\bis it a sin\b|\bis (?:\w+ ){1,3}a sin\b|\btheolog\w*/i, CHURCH ? "beliefs" : "denomfit"],
    [/\bgenesis\b.{0,40}\b(?:denomination\w*|affiliat\w*)\b|\b(?:denomination\w*|affiliat\w*)\b.{0,40}\bgenesis\b/i, "gmdenom"],
    /* A holiday service has its own times: the regular Sunday times would read as a yes. */
    [/\b(?:christmas|easter|good friday|maundy thursday|thanksgiving|new year'?s? (?:eve|day)|ash wednesday|candlelight service)\b/i, "special"],
    [/\b(real church|is (this|it|that) (a )?real\b|made[- ]up|fake church|actual church|does (this|the) church (really )?exist|is (this|it) (a )?(sample|demo|fake))\b/i, "real"],
    [AI_TRAIN, "aitraining"],
  ].concat(CHURCH ? [
    /* Round 5: a guest's or member's privacy question, before a page's own rules or the kids, students,
       times and pastors answers hear one of its words. A key a page has no answer for passes it on. */
    [/\b(?:is|are) (?:an? |the )?(?:ai|a\.i\.|hope|bot|robot|computer|assistant|machine)\b.{0,15}\b(?:reading|seeing|watching|reads|sees|listening)\b|\b(?:ai|a\.i\.|bot|robot|assistant)\b.{0,20}\b(?:read|reads|reading|see|sees|seeing|open|opens)\b.{0,30}\b(?:messages?|prayers?|requests?|what i (?:write|send|type))\b/i, "aimine"],
    [/\b(?:is|are) (?:an? |the )?(?:ai|a\.i\.|hope|bot|robot|computer|assistant|machine)\b.{0,15}\b(?:reading|seeing|watching|reads|sees|listening)\b|\b(?:ai|a\.i\.|bot|robot|assistant)\b.{0,20}\b(?:read|reads|reading|see|sees|seeing|open|opens)\b.{0,30}\b(?:messages?|prayers?|requests?|what i (?:write|send|type))\b/i, "aiprayer"],
    [/\b(?:bulletin|out loud|aloud|read (?:it )?(?:out|on sunday)|on sunday|other members|anyone else|everyone|public(?:ly)?|announce\w*|on the screen|prayer wall)\b.{0,40}\b(?:prayers?|requests?|asked for prayer)\b|\b(?:prayers?|requests?|asked for prayer)\b.{0,40}\b(?:bulletin|out loud|aloud|other members|anyone else|everyone|public(?:ly)?|announce\w*|on the screen|prayer wall)\b/i, "prayerpublic"],
    [/\bprayer team only\b|\bmark\w* (?:it|my request|my prayer)?\s?(?:for )?(?:the )?prayer team\b/i, "prayerwho"],
    [/\b(?:compan(?:y|ies)|outside (?:the church|company|companies)|third[- ]part\w*|vendors?)\b.{0,40}\b(?:see|sees|read|reads|get|gets|access|have)\b|\b(?:see|sees|read|reads|access)\b.{0,40}\b(?:outside (?:the church|company)|a company|any company|third[- ]part\w*)\b/i, "processors"],
    [/\b(?:hide|private)\b.{0,20}\b(?:my )?(?:profile|name|phone|number|email|address)\b|\b(?:who|anyone|staff|other members)\b.{0,30}\b(?:see|sees|get|gets|has|have)\b.{0,30}\bmy (?:phone|number|cell|email|address|contact)\w*/i, "contactsee"],
    [/\bwho\b.{0,30}\b(?:see|sees|get|gets|has|have)\b.{0,30}\bmy (?:phone|number|cell|email|address|contact)\w*/i, "privacy"],
    [/\b(?:i'?m|i am|im|she'?s|he'?s|they'?re|my (?:son|daughter|kid|child) is) (?:only )?1[0-7]\b(?=.{0,60}\b(?:message|messaging|account|sign|app|log ?in|text|dm)\b)|\b(?:1[0-7]|\d) ?(?:years? old|yo)\b.{0,40}\b(?:message|account|sign|use|app|join)\b|\bteen\w*\b.{0,30}\b(?:use|account|sign|on (?:their|his|her) own)\b|\b(?:keep|store|collect|have)\w*\b.{0,20}\b(?:my )?(?:children|kids|child)'?s? (?:info\w*|data|details|records?)\b/i, "age"],
    [/\b(?:keep|track|stor|know|use|collect|sav)\w*\b.{0,20}\bmy (?:location|whereabouts)\b|\blocation (?:tracking|data|services)\b|\btrack\w* (?:me|where i)\b/i, "location"],
    [/\b(?:office|staff|admins?|anyone|someone|volunteers?)\b.{0,30}\b(?:see|sees|read|reads|open|opens|access)\b.{0,30}\bmy (?:private )?messages?\b/i, "messageswho"],
    [/\b(?:office|staff|admins?|anyone|someone|volunteers?)\b.{0,30}\b(?:see|sees|read|reads|open|opens|access)\b.{0,30}\bmy (?:private )?messages?\b/i, "appmessages"],
    [ONE_CAMPUS, "onecampus"],
    [CAMPUS_Q, "campus"],
    [BUYER_PRICE, "price"],
    [KEEP_SITE, "keepsite"],
  ] : [
    [/^(?!.*\bhow long\b).*(\bget(ting)? started\b|\bhow (do|can|would|should) (we|i) (start|begin|get going)\b|\bnext steps?\b|\bfirst steps?\b|\bwhere do (we|i) (start|begin)\b|\bhow (do|can) (we|i) sign (our church )?up\b|\bonboard\w*)/i, "start"],
    [/\b(book|schedule|set up|arrange) (a |an )?(call|meeting|demo|time|consultation|walk ?through)\b|\btalk (to|with) (genesis|sales|your team|someone at genesis|a person at genesis)\b|\b(contact|reach|email|call|phone) (genesis|you|sales|your team|someone)\b|\bget in touch\b|\bcontact (info|information|details|page)\b|\bhow (do|can) (i|we) (reach|contact) (you|genesis)\b|\b(buy|purchase)\b/i, "talk"],
  ]);
  /* A church site answers like a church first: guests ask about kids, times and prayer, and only a
     clear product question gets the Genesis Ministry answer. The story pages keep the product first. */
  var AN_RE = String(AN).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var PRODUCT = [
    [/\bdemos?\b(?!\s+(?:really|was|is|hit|felt|made|moved|got))|\bwalk ?through\b|\bguided (tour|demo)\b|\b(take|start) (the |a )?tour\b|\btour of (the|this) (site|page|website|template|app)\b|^\s*(a |the )?tours?\s*[.!?]*\s*$|\btours?\b(?! of (the|our|your|this) (building|church|campus|chapel|facilit\w*|grounds|sanctuary))/i, "tour"],
    [/\bwhat(?:'s| is) genesis( ministry)?\b|\bwho (makes|made|built) (this|genesis)\b|\babout genesis ministry\b|\bwhat is this\s*[?.!]*\s*$/i, "gm"],
    [/\bcontracts?\b|\b(sign|signing) (a |an )?(contract|agreement)\b/i, "contract"],
    [/\breferences?\b|\bcase stud\w*|\b(?:churches|anyone|who) (?:are |is )?(?:already )?using (?:it|this|genesis)\b|\bhow many churches\b/i, "references"],
    [/\bdomains?\b|\bweb address\b|\bdns\b/i, "domain"],
    [/\bfree trials?\b|\btrial (period|plan|month)\b|\btry (it|this|genesis( ministry)?) (free|for free|first|out)\b/i, "trial"],
    [/\bcancel\w*\b.{0,25}\b(subscription|contract|genesis|account|service)\b|\bend (our|the|my) (subscription|contract)\b/i, "cancel"],
    [/\b(setup|set-up|set up|onboarding|hidden|extra|additional|one-time|upfront)\s+(fees?|costs?|charges?)\b|\bhidden (costs?|charges?)\b/i, "fees"],
    [/\b(prices?|pricing|costs?|fees?|afford\w*|budget)\b|how much (is it|does it|will it|would it|do you charge)|\$/i, "price"],
    [/\bcustomi[sz]\w*|\b(change|edit|swap|use) (the |our |my )?(own )?(colou?rs?|logos?|fonts?|layout|template|look|design)\b|\bour own (look|design|colou?rs|logo|fonts?)\b|\bredesign\w*/i, "custom"],
    [/\bgenesis ministry\b|\bwhat is (this|genesis)\b|\b(packages?|brand ?boards?|social (media|plan|marketing)|marketing plan|templates?|what do (we|i) get|what does a church get)\b/i, "package"],
    [new RegExp("\\b(who|what) is " + AN_RE + "\\b|\\bhow does " + AN_RE + " work\\b|\\bwhat (can|does|will) " + AN_RE + " do\\b|\\b(chat ?bots?|assistants?|ai|a\\.i\\.)\\b", "i"), "hope"],
    [/\b(back ?office|crm|care (inbox|team)|staff inbox|spiritual gifts? (assessment|test|conversation|picture|inventory|survey))\b/i, "backoffice"],
    /* The plans by name ("What is the Shepherd plan?", "Care, Shepherd or Plus?") get every plan. */
    [/\b(care|shepherd|plus) (plans?|tiers?)\b|\bcare\b[^.?!]{0,30}\bshepherd\b|\bshepherd\b[^.?!]{0,30}\bplus\b|\b(which|what) plans?\b/i, "package"],
  ];
  var SITE = [
    /* Round 3: a buyer's plan question ("Does the Shepherd plan include staff seats?") is the plans, never
       the pastors; a request kept from one pastor, family reading messages, and what a pastor must report. */
    [/\b(?:care|shepherd|plus) (?:plans?|tiers?|levels?)\b|\bstaff seats?\b|\b(?:shepherd|plus)\b.{0,30}\b(?:include|includes|cost|costs|price|seats?|reports?|plans?|tiers?)\b|\bdowngrad\w*/i, "package"],
    [/\bcare\b.{0,20}\bplan\b.{0,30}\b(?:or|vs\.?|versus|and)\b.{0,20}\binbox\b|\binbox\b.{0,30}\b(?:or|vs\.?|versus|and)\b.{0,20}\bcare plan\b|\bwhat (?:does|is) the care inbox\b|\bdifference between (?:the )?care(?: plan)? and (?:the )?care inbox\b/i, "careplan"],
    [/\b(?:keep|hide|hid|block|private|secret)\w*\b.{0,40}\bprayers?(?: requests?)?\b.{0,40}\bfrom (?:the )?(?:other |another |my |our |a |one |certain )?(?:pastors?|lead pastor|senior pastor|staff|prayer team|elders?)\b/i, "prayerfromstaff"],
    [/\b(?:husband|wife|spouse|partner|boyfriend|girlfriend|parents?|mom|dad|mother|father|family|kids|children(?!'?s? ministry)|roommate|anyone (?:at|in) my (?:home|house))\b.{0,40}\b(?:see|sees|read|reads|find|finds|know|knows|get into|look at|check)\w*\b.{0,40}\b(?:messages?|prayers?|requests?|emails?|what i (?:write|wrote|send|share|type))\b/i, "messagesprivate"],
    [/\b(?:illegal|a crime)\b|\b(?:have to|must|required to|need to|obligated to) report\b.{0,40}\b(?:i|me|tell|share|say)\b|\bkeep (?:it|this|what i (?:say|tell|share)) (?:private|secret|confidential|between us)\b|\bconfidential(?:ity)?\b.{0,30}\b(?:pastor|counsel\w*|talk|tell)\b/i, "confidential"],
    /* "Is this chat private?", "What do you do with what I type here?", "Is this conversation recorded?" */
    [/\b(?:is|are) (?:this|the|our|my) (?:chat|conversation)s? (?:being )?(?:private|recorded|saved|kept|stored|confidential|secure|monitored)\b|\b(?:does|do|will|can|could) (?:anyone|anybody|someone|somebody|a person|people|staff|the church|you|they)\b.{0,40}\b(?:see|sees|read|reads|watch|record|save|keep|store)\w*\b.{0,30}\b(?:what i (?:type|write|say|ask)|this chat|this conversation|my (?:chat|questions?))\b|\bwhat (?:do|does|will|happens)\b.{0,30}\b(?:what i (?:type|write|say)|this chat|this conversation)\b/i, "chat"],
    /* Prayer and an AI company, and outside providers: plain answers, never the prayer invitation. */
    [/\bprayers?\b.{0,60}\b(?:openai|chat ?gpt|gpt|ai (?:company|companies|provider|service|model)|outside ai|another ai|an ai)\b|\b(?:openai|chat ?gpt)\b.{0,60}\bprayers?\b|\b(?:does|do|will|can|could) (?:hope|the ai|ai|a bot|the assistant|you)\b.{0,20}\b(?:read|see|look at|scan)\w*\b.{0,30}\bprayers?\b/i, "aiprayer"],
    [/\bthird[- ]part(?:y|ies)\b|\bwhich (?:companies|vendors|providers|services)\b|\boutside (?:ai|companies|company|vendors?|providers?)\b|\bai (?:company|companies|provider|providers|vendor|service)\b/i, "processors"],
    [/\bwho (sees|can see|reads|can read|will see|will read|gets to see|gets to read|gets) (my|a|the|our|your) (prayer|request)|\b(is|are) (my |our )?prayer( requests?)? (private|confidential|safe|secret)\b|\b(private|confidential) prayer\b|\bwho (sees|reads) (it|them|prayer requests?)\b/i, "prayerwho"],
    [/\b(?:is|are|will) (?:my|our) (?:personal )?(?:information|info|details|data|email|forms?|requests?) (?:be )?(?:safe|private|secure|protected|kept private|shared|sold)\b|\bwhat (?:do|will) you do with (?:my|our) (?:information|info|details|email|data)\b|\b(?:do|does|will|would) (?:you|they|the church|this church|your church|genesis|y'?all)\b.{0,20}\b(?:share|sell|give away|pass on)\b.{0,10}\b(?:my|our) (?:personal )?(?:information|info|details|email|e-mail|data|phone number|address)\b|\bprivacy (?:policy|notice|page|statement)\b/i, "privacy"],
    /* Beliefs come before care: "What do you believe about gay marriage?" is a question, not distress. */
    [/\b(believe|believes|views?|position|stance|teach|teaches) (about|on)\b|\b(gay|lgbtq?\w*|same[- ]sex|homosexual\w*|transgender|affirming)\b|\bwomen (pastors?|preach\w*|elders?|leaders?|in ministry)\b|\bwomen be (pastors?|elders?|preachers?)\b|\b(can|do|does|are) women (preach|lead|teach|pastor)\w*\b|\bdenomination\w*\b|\bstatement of faith\b|\bdoctrin\w*\b|\bwhat (do|does) (you|your church|the church) teach\b/i, "beliefs"],
    [/\b(talk|speak|meet|chat|sit down|get coffee) (to|with) (a|the|one of the|your|our)?\s?pastors?\b|\b(see|reach|call|email|contact) (a|the|your) pastor\b|\bpastors?\b.{0,30}\b(this week|appointment|available|meet with)\b/i, "talkpastor"],
    [/\bweddings?\b|\bget married\b|\bmarry us\b|\bofficiat\w*/i, "wedding"],
    [/\b(food )?pantry\b|\bfood bank\b|\bgroceries\b|\bneed (food|groceries|help with (rent|bills|food|utilities))\b|\bbenevolence\b|\bhelp (paying|with) (rent|bills|utilities|groceries)\b/i, "pantry"],
    [/\b(download|install)\b.{0,30}\bapps?\b|\b(need|have) to (get|use|download|install) (an |the )?apps?\b|\bapps?\b.{0,20}\b(required|necessary)\b/i, "noapp"],
    [/\b(counsel\w*|therap\w*|marriage|divorce|grie\w*|addiction|recovery|support groups?|mental health|depress\w*|anxiety|anxious|panic attacks?)\b/i, "care"],
    [/\b(change|move|cancel|reschedul\w*|switch|push) (my|our|the) (visit|plans?|sunday|date|rsvp)\b/i, "visitchange"],
    [/\b(cost|pay|charge|fee)s?\b.*\b(attend|come|coming|visit|church|sunday|service)\b|\bis (it|church|sunday|this|coming) free\b|\bdo (i|we) (have to|need to) (pay|give)\b/i, "free"],
    [/\bbackground[- ]?check\w*|\b(?:volunteers?|leaders?|teachers?|workers?|staff) (?:are |get |been )?(?:screened|vetted)\b/i, "kidsafe"],
    [/\bvolunteer\w*|\bserve teams?\b|\b(?:how (?:can|do|could) (?:i|we)|(?:i|we) (?:want|would like|'d like) to|can (?:i|we)|ways to|where (?:can|do) (?:i|we)) (?:serve|help out|get involved)\b|\bget involved\b/i, "serve"],
    [/^(?!.*\b(?:see|sees|share|shares|store|stores|storing|keep|keeps|track|tracks|read|reads|reading|open|opens|access|hide|know|knows)\b.{0,40}\b(?:info\w*|data|details|records?|messages?|prayers?|requests?|location|number|email)\b).*\b(kids?|child ?care|child\w*|nursery|bab(y|ies)|toddlers?|vbs|vacation bible)\b/i, "kids"],
    [/^(?!.*\b(?:see|sees|share|shares|store|stores|storing|keep|keeps|track|tracks|read|reads|reading|open|opens|access|hide|know|knows)\b.{0,40}\b(?:info\w*|data|details|records?|messages?|prayers?|requests?|location|number|email)\b).*\b(students?|youth|teens?|teenagers?|middle school|high school|young adults?|college)\b/i, "students"],
    [/\b(small groups?|groups?|bible stud(y|ies)|life groups?|events?|socials?|fellowship|meet (new )?people|make friends|get connected)\b/i, "groups"],
    /* Round 4: who sees what I give, a phone number for texts, and app messages, before giving hears "give". */
    [/\b(?:see|sees|know|knows|private|track\w*|notice\w*|find out)\b.{0,40}\b(?:giv\w*|gave|tith\w*|donat\w*)\b|\b(?:giv\w*|gave|tith\w*|donat\w*)\b.{0,30}\b(?:private|confidential|anonymous|see|sees|know|knows)\b|\bstopped (?:giving|tithing)\b/i, "givingprivate"],
    [/\btext (?:me|us)\b|\b(?:give|share|leave|put)\b.{0,15}\bmy (?:phone )?number\b|\btext messages?\b/i, "texting"],
    [/\b(?:who|anyone|staff)\b.{0,30}\b(?:see|sees|read|reads)\b.{0,30}\bmessages?\b.{0,30}\b(?:app)\b|\bmessages? (?:i send )?in the app\b/i, "appmessages"],
    /* "give it to our members" and "give this to the team" are not giving. */
    [/\b(giv(e|ing)(?! up\b)(?! (?:it|this|that|them) to\b)(?! to (?:our|my|the) (?:members|people|team|staff|families)\b)|tith\w*|donat\w*|offerings?)\b|(?<!spiritual )\bgifts?\b/i, "give"],
    /* A guest moved by Sunday ("the sermon hit me hard") hears gladness, not a schedule. */
    [/\b(?:sermon|message|song|songs|worship|music|service|teaching|word|words|verse|scripture|story|testimony|series|choir|it|that|this)\b[^.?!]{0,30}\b(?:hit|moved|spoke to|speaks to|got to|blessed|encouraged|challenged|convicted|stayed with) (?:me|us|my heart|my soul)\b(?! up\b| that\b)|\bhit (?:home|close to home)\b|\bspoke to my (?:heart|soul)\b/i, "moved"],
    [/\b(watch\w*|live ?stream\w*|stream\w*|sermons?|podcasts?)\b|\b(service|church|gathering|worship)s? online\b|\bonline (service|church|gathering|worship)s?\b|\b(latest|last|this week'?s|sunday'?s|recent|newest) (message|sermon|teaching)\b/i, "watch"],
    [/\b(pray\w*|hurting|sick|struggl\w*|hospital\w*|surgery|cancer)\b/i, "prayer"],
    /* A holiday or another language: the regular Sunday times would read as a yes. */
    [/\b(?:spanish|espa(?:ñ|n)ol|korean|chinese|mandarin|cantonese|vietnamese|french|portuguese|arabic|haitian|creole|sign language|asl|interpret\w*|translat\w*|another language|other languages?|christmas|easter|good friday|maundy|thanksgiving|new year'?s?|holidays?|ash wednesday|lent|advent|candlelight)\b/i, "special"],
    [/\b(?:coffee|tea|donuts?|snacks?)\b/i, "newhere"],
    /* "My phone died, what time is church again?" is a question about Sunday, not the phone number. */
    [/\bwhat time\b|\bwhen (?:is|does|do|are) (?:church|the service|services|sunday|worship|the gathering|gatherings|it start|things start|you meet)\b/i, "times"],
    [/\b(phone( number)?|telephone|call (you|the church|someone|the office)|contact|e-?mail|reach (you|someone|the church|the office)|office hours)\b|\bwhat'?s (your|the) number\b|\b(your|the) number\b/i, "contact"],
    [/\bhow long (?:have|has) (?:you|y'?all|the church|this church|[a-z]+(?: [a-z]+)? church) (?:all )?been\b|\b(?:when|what year) (?:was|were|did) (?:you|y'?all|the church|this church|it) (?:get )?(?:founded|started|start|begin|planted|built)\b|\bhow old is (?:the|your|this) church\b|\bfounded\b|\b(?:church'?s|your) history\b|\bbeen around\b/i, "history"],
    [/^(?!.*\b(?:see|sees|share|shares|store|stores|storing|keep|keeps|track|tracks|read|reads|reading|open|opens|access|hide|know|knows)\b.{0,40}\b(?:info\w*|data|details|records?|messages?|prayers?|requests?|location|number|email)\b).*\b(pastors?|leaders?|who runs|who leads|who preaches|staff)\b/i, "pastors"],
    [/\babout (your|the|this) church\b|\btell me about (you|yourselves|it)\b|\bwhat (kind|type|sort) of church\b|\bwhat is (your|the) church like\b|\b(believ\w*|beliefs?|values?|mission|denomination\w*|theology)\b/i, "values"],
    [/\b(park|parking|parked|garage)\b/i, "parking"],
    /* A first-time guest's questions go to the welcome, not only the times. */
    [/\b(?:i'?m|i am|we'?re|we are) (?:brand )?new\b|\bnew here\b|\bfirst (?:time|sunday|visit)\b|\bnever been\b|\b(?:need|looking for|want|find|finding) (?:a |a new |a home )?church\b|\bwhere (?:do|should|can) (?:i|we) (?:start|begin)\b|\bwhat (?:happens|should (?:i|we) expect|to expect|can (?:i|we) expect)\b|\bcome (?:alone|by myself|on my own)\b|\bbring (?:a friend|friends|my (?:friend|family|partner|husband|wife|parents?|roommate))\b/i, "newhere"],
    [/\b(times?|when|sundays?|services?|gatherings?|where|address|location|located|directions?|how far|nearby|close to|wear|dress)\b/i, "times"],
    [/\b(new|first time|start\w*|visit\w*|join\w*|members?|membership)\b|\btour of the (building|church|campus|chapel)\b|\bshow me around\b/i, "newhere"],
  ];
  // Most specific first. Patterns allow plurals and word stems. A page's own rules come first: a rule
  // may be a pattern or its text (["\\bbapti[sz]\\w*", "baptism"]), and hope.json's matchPatterns
  // (text rules, since JSON cannot carry a pattern) are read here too.
  function toRule(m) {
    var r = Array.isArray(m) ? [m[0], m[1]] : m ? [m.match || m.re, m.key] : [];
    if (typeof r[0] === "string") try { r[0] = new RegExp(r[0], "i"); } catch (e) { r[0] = null; }
    return r;
  }
  var PAGE_RULES = [], seenRule = {};
  (CFG.match || []).concat(CFG.matchPatterns || []).map(toRule).forEach(function (r) {
    if (!r[0] || !r[0].test || !r[1]) return;
    var id = String(r[0].source) + "\u0000" + r[1];
    if (seenRule[id]) return;
    seenRule[id] = 1; PAGE_RULES.push(r);
  });
  var MATCH = FIRST.concat(EARLY, PAGE_RULES, CHURCH ? SITE.concat(PRODUCT) : PRODUCT.concat(SITE));
  /* On the story pages a question about prayer with product words in it is about the product. */
  var PRODUCT_WORDS = /\b(staff|team|admins?|directors?|deacons?|elders?|teachers?|ministry leaders?|levels?|access|private|privacy|protect\w*|locks?|locked|genesis|records?|data|volunteers?|software|platform)\b|\bwho (can |will |gets to )?(see|sees|read|reads|open|opens)\b|\b(see|sees|read|reads|open|opens) (the |our |my |a |their )?prayer|\b(does|can|will|would) hope\b|\bhope (answer|respond|repl|handl|draft|writ|read|see)\w*|\b(read|see|open)s? (every|all|any) prayer|\b(as|i'?m|i am) (the |a )?(lead|senior|executive|associate) pastor\b|\bwho (at church |on staff |at the church )?(is|gets) (told|notified|alerted)\b|\bmarked pastors only\b/i;

  /* The crisis check. The words live in shared/crisis-words.js, the one list every Hope reads (the
     workspace dock too): the live church site's pattern, widened so a crisis is heard however it is
     written, about someone else, or by staff writing about someone in the church. Word stems use \w*
     so "suicide", "suicidal" and "overdosed" all match. */
  var CRISIS = WORDS.crisis, calm = WORDS.calm;
  /* Someone else in danger, and a staff member writing about someone in the church, on every page. */
  function isCrisis(q) { var s = WORDS.safety(q); return s === "crisis" || s === "leadersafety"; }
  /* The net: a crisis word ("abuse", "danger", "pills") gets the crisis reply before any answer, so
     "I need to report abuse by a pastor" never gets the pastors' bio. A pastor's question about how
     abuse is handled, with no "I" or "me" in it (WORDS.policy), gets the answer on reporting instead,
     which gives 988 and 911 too. */
  var CRISIS_NET = WORDS.net;
  /* Where a question goes: "crisis", an answer key, or "fallback". Curly apostrophes read as straight. */
  function route(q) {
    q = WORDS.plain(String(q || ""));
    /* The safety pre-check (shared/crisis-words.js) runs first, on every Hope: a disclosure of danger
       or harm never reaches a topic rule, whatever words it shares with one ("pastor", "staff"). */
    var safe = WORDS.safety(q);
    if (safe === "crisis" || safe === "leadersafety") return safe;
    if (safe === "policy") return A.reporting ? "reporting" : "crisis";
    /* Round 5: the last net comes before any topic too ("I have a gun", "he touched my son"), so a word
       like "kids" or "times" in the same message never takes it to a cheerful answer. */
    if (WORDS.last.test(calm(q))) return "crisis";
    for (var i = 0; i < MATCH.length; i++) {
      if (!MATCH[i][0].test(q)) continue;
      var k = MATCH[i][1];
      if (k === "prayer" && !CHURCH && A.prayerwho && PRODUCT_WORDS.test(q)) return "prayerwho";
      if (k === "tour" || k === "menu" || A[k]) return k;
    }
    return "fallback";
  }

  function onChip(c) {
    addUser(c.label);
    if (c.run) { c.run(); return; }
    if (c.go) { var dest = c.go === true ? c.href : c.go; if (/^#./.test(dest || "")) goAnchor(dest); else location.href = dest; return; }
    if (c.href) { window.open(c.href, "_blank", "noopener"); say("Opened in a new tab. Anything else I can show you?", MENU.slice(0, 4)); return; }
    answer(c.key);
  }
  function answer(key, q) {
    if (key === "tour") { say(CFG.tourIntro || "Great. I will walk you through the page one section at a time. Use Next to move on, or press Escape any time to stop.", null, function () { setTimeout(startTour, REDUCE ? 50 : 600); }); return; }
    if (key === "menu" || !A[key]) { say("Here are the questions I can answer in this demo. Tap one.", null, function () { addQuestions(); }); return; }
    say(withLine(val(A[key].t, q), q), val(A[key].c, q));
  }
  /* Round 5: a question about death ("What happens after we die?") gets its answer, with 988 and 911 under it. */
  function withLine(t, q) { return t && q && /\b(?:die|dies|dying|death|dead)\b/i.test(q) && String(t).indexOf("988") < 0 ? t + CRISIS_LINE : t; }
  function greet() {
    /* On the first open the chat starts at the top: the greeting, the tour button, then the questions. */
    say(val(CFG.greeting) || ("Hi, I am " + AN + ", the assistant for " + NAME + ". This is a live preview of the " + LOOK + " template from Genesis Ministry. Want a quick guided demo of the site, or tap a question below?"), null, function () {
      addQuestions();
      var b = body; if (!b) return;
      var smooth = b.style.scrollBehavior; b.style.scrollBehavior = "auto"; b.scrollTop = 0; b.style.scrollBehavior = smooth;
      if (isOpen && (document.activeElement === allQ || !panel.contains(document.activeElement))) focusOn(firstQuestion());
    });
  }

  /* ------------------------------------------------------------- invite */
  var invite = null;
  var INVITE_KEY = CFG.inviteKey || "hd-invited";
  function hideInvite() {
    document.documentElement.classList.remove("hd-invite-on");
    if (inviteEsc) { document.removeEventListener("keydown", inviteEsc, true); inviteEsc = null; }
    if (foldFocus) { document.removeEventListener("focusin", foldFocus, true); foldFocus = null; }
    if (invite) { invite.classList.remove("on"); var n = invite; invite = null; setTimeout(function () { n.remove(); }, GENESIS ? 0 : 400); }
  }
  /* At the foot of the page the invite steps aside, so it never sits on the last row of links (Privacy,
     Staff Login). The chat circle stays. */
  if (!GENESIS) window.addEventListener("scroll", function () {
    if (!invite || !invite.classList.contains("on")) return;
    var se = document.scrollingElement || document.documentElement;
    if (se.scrollTop + window.innerHeight >= se.scrollHeight - 160) hideInvite();
  }, { passive: true });
  /* Escape puts the invite away at any width. Focus inside it goes back to the chat circle. */
  var inviteEsc = null;
  function armEscape() {
    inviteEsc = function (e) {
      if (e.key !== "Escape" || !invite || isOpen || touring) return;
      var inside = invite.contains(document.activeElement);
      clearTimeout(foldTimer); hideInvite();
      if (inside && focusable(launch)) focusOn(launch);
    };
    document.addEventListener("keydown", inviteEsc, true);
  }
  /* On a phone the invite folds back into the chat circle after a few seconds, on the next scroll,
     or when the first screen comes back into view, so it never sits on the page's own words. */
  var foldTimer = 0, foldScroll = null, foldFocus = null;
  function foldInvite() {
    clearTimeout(foldTimer);
    if (!invite || GENESIS) return;
    if (invite.contains(document.activeElement)) return; // someone is using it
    if (foldScroll) { window.removeEventListener("scroll", foldScroll); foldScroll = null; }
    if (foldFocus) { document.removeEventListener("focusin", foldFocus, true); foldFocus = null; }
    hideInvite();
  }
  /* At every width it folds as soon as a keyboard user moves on to something else on the page, so it
     never sits over the control that has focus (WCAG 2.4.11), at 200 percent zoom and on a desktop too. */
  function armFold() {
    if (GENESIS) return;
    foldFocus = function (e) { if (invite && !invite.contains(e.target) && !(launch && launch.contains(e.target))) foldInvite(); };
    document.addEventListener("focusin", foldFocus, true);
    if (!phoneChat()) return;
    foldTimer = setTimeout(foldInvite, 8000);
    var y0 = window.scrollY, t0 = Date.now();
    foldScroll = function () { if (Date.now() - t0 > 700 && Math.abs(window.scrollY - y0) > 160) foldInvite(); };
    window.addEventListener("scroll", foldScroll, { passive: true });
  }
  /* The invite never covers what a keyboard user is on (WCAG 2.4.11): not in a short window (400
     percent zoom), not while focus is inside the page, and not over the focused control. */
  function inviteWouldCover() {
    if (GENESIS) return false;
    if (window.innerHeight < 500) return true;
    var a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement || (launch && launch.contains(a))) return false;
    if (viaKeys && a.closest && a.closest("main, #main, [role=main]")) return true;
    var r = a.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 32), right = window.innerWidth - 16, bottom = window.innerHeight - 88;
    return r.right > right - w && r.bottom > bottom - 190 && r.top < bottom;
  }
  function showInvite() {
    if (isOpen || touring || store(INVITE_KEY)) return;
    if (inviteWouldCover()) { if (window.innerHeight >= 500) setTimeout(showInvite, 3000); return; }
    /* An open menu sheet or one of the site's own forms keeps the screen: the invite waits. */
    if (document.body.classList.contains("menu-open") || document.body.classList.contains("fd-open")) { setTimeout(showInvite, 1500); return; }
    /* Genesis screens: never while the Hope dock is open (it would sit on the dock's own controls). */
    if (GENESIS && document.body.classList.contains("v2-genesis-open")) { setTimeout(showInvite, 1500); return; }
    store(INVITE_KEY, "1");
    document.documentElement.classList.add("hd-invite-on");
    armEscape();
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
      /* If the dock opens while the offer is up, the offer steps aside for good. */
      if (window.MutationObserver) {
        var mine = invite, mo = new MutationObserver(function () {
          if (invite !== mine) { mo.disconnect(); return; }
          if (document.body.classList.contains("v2-genesis-open")) { mo.disconnect(); hideInvite(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      }
      return;
    }
    /* A labeled region; only its words are announced, never the buttons or the close glyph. */
    invite = el("div", "hd-invite"); invite.setAttribute("role", "region"); invite.setAttribute("aria-label", "Tour invitation from " + AN);
    var p = el("p"); p.setAttribute("role", "status"); p.innerHTML = "<b></b> "; p.querySelector("b").textContent = "Hi, I am " + AN + "."; p.appendChild(document.createTextNode((CFG.invite && CFG.invite.text) || "Want a short tour of this site?"));
    var x = el("button", "hd-x"); x.type = "button"; x.setAttribute("aria-label", "Dismiss"); x.innerHTML = '<span aria-hidden="true">×</span>';
    var row = el("div", "hd-row");
    var go = el("button", "hd-btn", "Start the Tour"); go.type = "button";
    var ask = el("button", "hd-btn ghost", "Ask " + AN); ask.type = "button";
    row.appendChild(go); row.appendChild(ask);
    invite.appendChild(x); invite.appendChild(p); invite.appendChild(row);
    document.body.appendChild(invite);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (invite) invite.classList.add("on"); }); });
    armFold();
    x.addEventListener("click", function () { clearTimeout(foldTimer); hideInvite(); if (focusable(launch)) focusOn(launch); });
    go.addEventListener("click", function () { clearTimeout(foldTimer); hideInvite(); startTour(); });
    ask.addEventListener("click", function () { clearTimeout(foldTimer); hideInvite(); setOpen(true); });
  }
  /* The invite never covers the first screen: on a phone it waits until the hero has scrolled away,
     and it folds away again when the hero comes back. Framed (the church's site inside the
     workspace) or ?embed=1, the page never offers it at all. */
  function scheduleInvite() {
    var hero = !GENESIS && SEL.hero ? pick(SEL.hero) : null;
    if (hero && phoneChat() && "IntersectionObserver" in window) {
      var away = false, wait = 0;
      var io = new IntersectionObserver(function (es) {
        var e = es[es.length - 1];
        away = !e.isIntersecting;
        if (away && !store(INVITE_KEY)) { clearTimeout(wait); wait = setTimeout(function () { if (away) showInvite(); }, REDUCE ? 0 : 700); }
        if (!away && e.intersectionRatio >= 0.2 && invite) foldInvite();
        if (store(INVITE_KEY) && !invite) io.disconnect();
      }, { threshold: [0, 0.2] });
      io.observe(hero);
      return;
    }
    setTimeout(showInvite, 2200);
  }
  if ((GENESIS ? CFG.autoInvite === true : CFG.autoInvite !== false) && !FRAMED && !EMBED) scheduleInvite();

  /* --------------------------------------------------------------- tour */
  var HERO_FOCUS = ".times, .hero-times, .btn-pair, .cta, .pair, .hero-actions";
  /* The part of a tall section a step names, for each of the four looks (the first one found wins):
     the pastors' names and story, and the footer's times, address and directions. */
  var PASTOR_FOCUS = [".pastors-copy", ".pastor-text", ".split.pastors > div:last-child", ".sig"];
  /* On a phone the photo sits above the words: the step keeps the pastors' photo and names in view. */
  var PASTOR_PHOTO = [".pastors-photo, .pastors-copy h3", ".ph, .pt-row h3", ".split.pastors figure", ".pastors figure"];
  var FOOTER_FOCUS = [".f-cols > div:nth-child(2)", "#directions", ".ft-sundays", ".f-times"];
  var DEFAULT_STEPS = [
    { sel: SEL.hero, k: "First impression", h: "Everything a guest needs on the first screen", p: "Service times, the address and one clear next step, over a calm moving photo. This screen does the most work.", focus: HERO_FOCUS, place: "beside-focus", scrollTop: true },
    { sel: SEL.announce, k: "Announcements", h: "One big thing, without a pop-up", p: "A building campaign, a conference or Easter. One line, one button, and it opens a video when you want it. Your team changes it in a minute." },
    { sel: SEL.pastors, k: "Your people", h: "Faces and a mission first", p: "Guests want to know who leads and what you believe before they walk in. Real photos and names do more than any paragraph.", focus: PASTOR_FOCUS, phoneFocus: PASTOR_PHOTO, place: "beside-focus", photoWeight: 1 },
    { sel: SEL.nextSteps, k: "Next steps", h: "A clear path for every visitor", p: "Plan a visit, get to know us, give, then Start Here, groups and prayer. Plan Your Visit opens a short form that reaches your welcome team right away.", place: "beside-focus" },
    { sel: SEL.strip, k: "Church life", h: "Show what a Sunday really feels like", p: "A slow-moving strip of your own photos. Pause Motion stops it, and everything else that moves on the page, for anyone, it pauses when someone hovers or tabs to it, and it stays still for anyone who prefers less motion." },
    { sel: SEL.message, k: "Messages", h: "Your latest message, updated for you", p: "On the live site this pulls the newest message from YouTube automatically, so the home page is never out of date." },
    { sel: SEL.reviews, k: "Trust", h: "Kind words from your own people", p: "Short quotes from your own members rotate here, shared with their permission. A neighbor's words can turn a maybe into a visit." },
    { sel: SEL.newsletter, k: "Stay connected", h: "Grow a list you own", p: "A simple newsletter sign-up, so people who are not ready to visit can still hear from you. A prayer request opens a short form too, where each person chooses who may read it, with 988 and 911 right on it." },
    { sel: ".hd-launch", k: AN, h: "An assistant that never sleeps", p: "That is me. On a real church site I answer guests from the church's own facts, point people to the prayer form, where they choose who reads it, and show 988 and 911 under every answer. In this demo, you tap a question and get an answer written ahead of time." },
    /* The ring goes on the footer's times, address and directions where one block holds all three. */
    { sel: SEL.footer ? ["footer div.f-times", "footer .ft-sundays", "#footer div.f-times", SEL.footer] : SEL.footer, k: "Every page", h: "Built around your Sunday", p: "Times, address and directions sit in the footer of every page, and on phones a slim bar keeps them one tap away.", focus: FOOTER_FOCUS, place: "beside-focus" },
  ];
  /* Steps are worked out when the tour starts, so a page can draw its sections first. A hero step
     with no focus of its own keeps the times and the buttons in view beside the card. */
  function resolveSteps() {
    var raw = typeof CFG.tour === "function" ? CFG.tour() : (CFG.tour && CFG.tour.length ? CFG.tour : DEFAULT_STEPS);
    var phone = isPhone();
    return (raw || []).filter(function (s) { return s && (s.sel === ".hd-launch" ? !!launch : (typeof s.before === "function" || !!pick(s.sel))); }).map(function (s) {
      var hero = !s.focus && SEL.hero && s.sel === SEL.hero, small = phone && s.phoneFocus;
      if (!hero && !small) return s;
      var o = {}; for (var k in s) o[k] = s[k];
      if (hero) o.focus = HERO_FOCUS;
      if (small) o.focus = s.phoneFocus;
      return o;
    });
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
  /* Where focus goes when a tour ends: what started it, else the page's own Take the Tour button,
     else the chat circle, else the main content. Never the body, never a card that is gone. */
  function tourHome() {
    var a = document.activeElement;
    if (a && a !== document.body && document.contains(a) && !(a.closest && a.closest(".hd-invite, .hd-panel, .hd-g, .hd-card"))) return a;
    return null;
  }
  function goHome() {
    var home = focusable(returnTo) ? returnTo : pick([".gm-tour-btn", ".mx-tour", "[data-hope-tour]"]);
    if (!focusable(home)) home = focusable(launch) ? launch : null;
    if (!home) {
      home = $("#v2-main") || $("#gm-main") || $("main");
      if (home && !home.hasAttribute("tabindex")) home.setAttribute("tabindex", "-1");
    }
    returnTo = null;
    focusOn(home);
    /* A keyboard user sees where focus landed: the page brings that control into view. */
    if (viaKeys && home && home.scrollIntoView) try { home.scrollIntoView({ block: "nearest", inline: "nearest", behavior: REDUCE ? "auto" : "smooth" }); } catch (e) {}
  }
  var viaKeys = false;
  document.addEventListener("keydown", function () { viaKeys = true; }, true);
  document.addEventListener("pointerdown", function () { viaKeys = false; }, true);
  /* One live region for the whole page, so each step is read out as it changes (a region that is
     drawn already filled, inside a card that is redrawn each step, is often not read). */
  var live = null;
  function announce(text) {
    if (!live) {
      live = el("div", "hd-sr"); live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite"); live.setAttribute("aria-atomic", "true");
      document.body.appendChild(live);
    }
    live.textContent = "";
    setTimeout(function () { if (live) live.textContent = text; }, 60);
  }
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
    returnTo = tourHome();
    if (panel) setOpen(false);
    store(INVITE_KEY, "1"); // someone who has taken the tour is never offered it again
    hideInvite(); touring = true; idx = 0;
    document.documentElement.classList.add("hd-tour-on");
    if (GENESIS) {
      spot = el("div", "v2-guide-ring hd-g-ring"); spot.setAttribute("aria-hidden", "true"); spot.hidden = true;
      card = el("section", "v2-guide hd-g"); card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true"); card.setAttribute("aria-label", "Guided demo with " + GUIDE);
      card.setAttribute("aria-describedby", "hd-say");
    } else {
      spot = el("div", "hd-spot"); spot.setAttribute("aria-hidden", "true");
      card = el("div", "hd-card"); card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true"); card.setAttribute("aria-label", "Guided demo with " + GUIDE);
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
    clearRoom();
    document.documentElement.classList.remove("hd-tour-on", "hd-step-launch", "hd-step-orb", "hd-side-on");
    document.removeEventListener("scroll", place, { capture: true }); window.removeEventListener("resize", place);
    document.removeEventListener("keydown", tourKeys);
    cancelAnimationFrame(rafId);
    if (GENESIS) {
      if (spot) spot.remove();
      if (finale && card) { showDone(); return; }
      if (card) card.remove();
      spot = card = null;
      goHome();
      if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(!!finale); } catch (e) {}
      return;
    }
    [spot, card].forEach(function (n) { if (n) { n.classList.remove("on"); setTimeout(function () { n.remove(); }, 350); } });
    spot = card = null;
    if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(!!finale); } catch (e) {}
    /* finale.chat: false ends the tour without opening the chat (the page shows its own last card). */
    if (finale && (val(CFG.finale) || {}).chat === false) { goHome(); return; }
    if (finale) {
      started = true;
      setOpen(true);
      var fin = val(CFG.finale) || {};
      var chips = fin.chips || [
        LINKS.brandBoard && { label: "See the Brand Board", href: LINKS.brandBoard, cta: true },
        LINKS.socialPlan && { label: "See the Social Plan", href: LINKS.socialPlan },
        { label: "What Is the Back Office?", key: "backoffice" },
        { label: "How Does " + AN + " Work?", key: "hope" },
        { label: "Take the Tour Again", key: "tour" },
      ].filter(Boolean);
      if (NEXT && NEXT.href) chips = [{ label: NEXT.label || "Continue the Demo", href: nextHref(), go: true, cta: true }].concat(chips.map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; o.cta = false; return o; }));
      /* The next screen's note follows the text, unless the text already carries it. */
      var finText = fin.text || "That is the tour. Every Genesis Ministry church gets this website in its own content and photos, plus a brand board, a social marketing plan, and me. From the Shepherd plan, the back office comes too. Customization beyond the template is available for an additional cost.";
      if (NEXT && NEXT.note && finText.indexOf(NEXT.note) < 0) finText += "\n\n" + NEXT.note;
      say(finText, chips);
    } else goHome();
  }
  function tourKeys(e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (e.key === "Escape") { e.preventDefault(); endTour(false); }
    else if (e.key === "Tab") trapTab(e);
    else if (typing) return;
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  }
  /* The tour card is a dialog: Tab and Shift Tab go round its own buttons and links. */
  function trapTab(e) {
    if (!card) return;
    var all = [].filter.call(card.querySelectorAll("button, a[href]"), function (n) { return !n.disabled && visible(n); });
    if (!all.length) return;
    var first = all[0], last = all[all.length - 1], a = document.activeElement;
    if (!card.contains(a)) { e.preventDefault(); focusOn(e.shiftKey ? last : first); }
    else if (e.shiftKey && a === first) { e.preventDefault(); focusOn(last); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); focusOn(first); }
  }
  /* Genesis screens on a short, wide window (a phone on its side): the guide card docks at the side. */
  function sideDock() { return GENESIS && window.innerHeight < 500 && window.innerWidth >= 640 && window.innerWidth <= 1180; }
  /* The bottom of the bars at the top of a Genesis screen (the sample strip, the phone top bar), while
     they are on screen, so the card never sits on the menu, search or account buttons. */
  function topBars() {
    var y = 0;
    [".v2-fixture-badge", ".v2-mobile-top"].forEach(function (s) {
      var n = $(s); if (!n || !visible(n)) return;
      var r = n.getBoundingClientRect();
      if (r.top <= y + 2 && r.bottom > y) y = r.bottom;
    });
    return y;
  }
  function next() { if (!touring) return; if (idx < STEPS.length - 1) show(idx + 1); else endTour(true); }
  function back() { if (!touring) return; if (idx > 0) show(idx - 1); }
  function target() { return STEPS[idx] ? pick(STEPS[idx].sel) : null; }
  /* A short, wide window (a laptop at 200 percent zoom, a tablet on its side) on a church site or in the
     member app: the card docks at the foot of the screen as on a phone, and the target is brought into the
     room above it, so the card never sits over the part a step describes. */
  function shortDock() { return !GENESIS && window.innerHeight <= 500 && window.innerWidth > 640; }
  function isPhone() { return window.innerWidth <= (GENESIS ? 860 : 640) || shortDock(); }

  /* The element that scrolls a target: a scrolling ancestor, or the page itself (null). */
  function scrollParent(n) {
    for (var p = n && n.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var oy = getComputedStyle(p).overflowY;
      if ((oy === "auto" || oy === "scroll" || oy === "overlay") && p.scrollHeight > p.clientHeight + 1) return p;
    }
    return null;
  }
  /* A church site's own sticky header (the page scrolls under it): without a topInset of its own,
     the tour keeps clear of it, so a step never rings the nav or hides a section's first line. */
  var siteHeader = null;
  function stickyHeader() {
    if (GENESIS || CFG.topInset != null) return null;
    if (siteHeader && document.contains(siteHeader)) return siteHeader;
    var list = document.querySelectorAll("body > header, .site-header, header.site");
    for (var i = 0; i < list.length; i++) {
      var pos = getComputedStyle(list[i]).position;
      if ((pos === "sticky" || pos === "fixed") && visible(list[i])) return (siteHeader = list[i]);
    }
    return null;
  }
  function hasInset() { return CFG.topInset != null || !!stickyHeader(); }
  function inset(sp) {
    var v = CFG.topInset;
    if (v == null) { var h = stickyHeader(); if (!h || sp) return 0; var hr = h.getBoundingClientRect(); return hr.bottom > 0 && hr.top < 160 ? hr.bottom + 8 : 0; }
    return Math.max(0, Number(typeof v === "function" ? v(sp) : v) || 0);
  }
  /* The part of the screen where a target can be seen: the window, cut to every box around it that
     clips (a phone frame, a table, the rail), and below a sticky bar at the top (topInset). */
  function viewBox(t) {
    var vw = window.innerWidth, vh = window.innerHeight, b = { top: 0, left: 0, right: vw, bottom: vh };
    for (var p = t.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var cs = getComputedStyle(p);
      if (cs.position === "fixed") break;
      var ox = cs.overflowX !== "visible", oy = cs.overflowY !== "visible";
      if (!ox && !oy) continue;
      var pr = p.getBoundingClientRect();
      if (ox) { b.left = Math.max(b.left, pr.left); b.right = Math.min(b.right, pr.right); }
      if (oy) { b.top = Math.max(b.top, pr.top); b.bottom = Math.min(b.bottom, pr.bottom); }
    }
    var sp = scrollParent(t), r = t.getBoundingClientRect();
    /* A bar pinned to the top or the foot of that scroller (the member app's top bar and tabs). */
    if (sp) {
      var spr = sp.getBoundingClientRect();
      [].forEach.call(sp.children, function (c) {
        if (c.contains(t)) return;
        var cs = getComputedStyle(c);
        if (cs.position !== "sticky" && cs.position !== "fixed") return;
        var cr = c.getBoundingClientRect();
        if (!cr.height || cr.height > spr.height * 0.4) return;
        if (Math.abs(cr.bottom - Math.min(spr.bottom, vh)) < 6) b.bottom = Math.min(b.bottom, cr.top);
        else if (Math.abs(cr.top - Math.max(spr.top, 0)) < 6) b.top = Math.max(b.top, cr.bottom);
      });
    }
    var ins = (sp ? sp.getBoundingClientRect().top : 0) + inset(sp) - 8;
    /* Clip under a sticky bar only when the target runs on below it (not when it sits in that bar). */
    if (ins > b.top && r.bottom > ins + 24) b.top = ins;
    return b;
  }
  /* The part of a tall target a step talks about: step.focus (inside the target first), or on the
     story and template pages the section's heading, so a long section opens at its title. */
  /* The box of what an element shows, not of its block: a line of times in a full-width paragraph
     is only as wide as its words. */
  function tightRect(n) {
    var r = n.getBoundingClientRect();
    try { var rg = document.createRange(); rg.selectNodeContents(n); var t = rg.getBoundingClientRect(); if (t.width > 0 && t.height > 0 && t.width < r.width - 1) return t; } catch (e) {}
    return r;
  }
  function unionRect(list) {
    var u = null;
    list.forEach(function (n) { var r = tightRect(n); if (!u) u = { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; else { u.top = Math.min(u.top, r.top); u.bottom = Math.max(u.bottom, r.bottom); u.left = Math.min(u.left, r.left); u.right = Math.max(u.right, r.right); } });
    if (u) u.height = u.bottom - u.top;
    return u;
  }
  /* step.focus is a selector (every match counts) or a list of selectors (the first one found wins). */
  function focusRect(s, t) {
    if (!s || !s.focus) return null;
    var sels = Array.isArray(s.focus) ? s.focus : [s.focus];
    function find(root) {
      for (var i = 0; i < sels.length; i++) {
        var list = [];
        try { list = [].filter.call(root.querySelectorAll(sels[i]), visible); } catch (e) {}
        if (list.length) return unionRect(list);
      }
      return null;
    }
    /* The target itself, when it is the part named ("#footer .f-times" on Lampstand), before any match
       elsewhere on the page. */
    function self() { for (var i = 0; i < sels.length; i++) { try { if (t.matches(sels[i])) return unionRect([t]); } catch (e) {} } return null; }
    return find(t) || self() || find(document);
  }
  function headOffset(t) {
    if (GENESIS || !hasInset()) return 0;
    var h = null; try { h = t.querySelector(".intro, h1, h2, h3"); } catch (e) {}
    if (!h || !visible(h)) return 0;
    return Math.max(0, h.getBoundingClientRect().top - t.getBoundingClientRect().top - 28);
  }

  /* On a phone the card docks at the bottom. While touring, the scroller gets room at its foot,
     so a target at the very end of a page can still rise above the card. */
  var roomEl = null, roomInline = "", roomBase = 0;
  function makeRoom(t) {
    if (!isPhone() || !card) { clearRoom(); return; }
    var sc = scrollParent(t) || document.body;
    if (roomEl && roomEl !== sc) clearRoom();
    if (!roomEl) { roomEl = sc; roomInline = sc.style.paddingBottom; roomBase = parseFloat(getComputedStyle(sc).paddingBottom) || 0; }
    sc.style.paddingBottom = Math.round(roomBase + (card.offsetHeight || 260) + 24) + "px";
  }
  function clearRoom() { if (roomEl) { roomEl.style.paddingBottom = roomInline; roomEl = null; } }

  /* Bring the target into view so it and the card both fit. With no scroll container and no
     inset this is the same arithmetic the template tour has always used. */
  function bringIntoView(t, cardH, cardW, s) {
    var sp = scrollParent(t), vh = window.innerHeight, vw = window.innerWidth;
    var box = sp ? sp.getBoundingClientRect() : { top: 0, bottom: vh };
    var rTop = Math.max(0, box.top) + inset(sp), rBottom = Math.min(vh, box.bottom), rH = Math.max(80, rBottom - rTop);
    var r = t.getBoundingClientRect(), phone = isPhone(), desired, f = focusRect(s, t);
    var beside = !phone && (GENESIS || CFG.placement === "side") && !(GENESIS && r.width > WIDE && r.height + cardH + 56 <= rH) && (r.right + 16 + cardW <= vw - 12 || r.left - 16 - cardW >= 12);
    /* A tall target with a focus part: keep that part above the card, with as much of the
       target above it as fits. */
    function fitFocus(avail) {
      if (f.height > avail - 20) return rTop + 8 - (f.top - r.top);
      return rTop + Math.min(16, avail - 12 - (f.bottom - r.top));
    }
    var how = REDUCE ? "auto" : "smooth";
    /* The first screen's step shows the first screen as a guest meets it: the page at the top. */
    if (s && s.scrollTop && !phone && !sp) { if (window.scrollY > 2) window.scrollTo({ top: 0, behavior: how }); return; }
    if (phone) {
      var room = rH - (sideDock() ? 0 : cardH) - 24;
      if (r.height <= room) desired = rTop + Math.max(GENESIS ? 12 : 16, Math.min(80, (room - r.height) / 2));
      else if (f) desired = fitFocus(room);
      else desired = rTop + (GENESIS ? 8 : 16) - headOffset(t);
    } else if (beside) {
      desired = r.height + 48 <= rH ? rTop + (rH - r.height) / 2 : rTop + 24;
    } else if (r.height + cardH + 56 <= rH) {
      desired = rTop + Math.max(24, (rH - r.height - cardH - 16) / 2);
    } else if (s && s.place === "beside-focus" && (f || !GENESIS)) {
      /* The card will sit on a clear part of the section, beside the focus part: show the whole
         section when it fits, else its top down to the focus, else the focus in the middle. */
      /* A section with a photo the card must not cover (the pastors): its top, so the room under the
         photo is on screen for the card. */
      if (r.height <= rH - 16) desired = s.photoWeight ? rTop + 8 : rTop + (rH - r.height) / 2;
      else if (!f) desired = rTop + 8 - headOffset(t);
      else if (f.bottom - r.top + 24 <= rH) desired = rTop + 8;
      else desired = rTop + rH / 2 - (f.top - r.top) - f.height / 2;
    } else if (f) {
      desired = fitFocus(rH - cardH - 56);
    } else {
      desired = rTop + (GENESIS || hasInset() ? 24 : 90) - headOffset(t);
    }
    var delta = r.top - desired;
    if (Math.abs(delta) < 3) return;
    if (sp) sp.scrollTo({ top: Math.max(0, sp.scrollTop + delta), behavior: how });
    else window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior: how });
  }

  function show(i) {
    idx = i;
    if (STEPS[i] && typeof STEPS[i].before === "function") { try { STEPS[i].before(); } catch (e) {} }
    var root = document.documentElement;
    if (GENESIS) root.classList.add("hd-step-orb"); // the orb is findable while the step's target is picked
    var s = STEPS[i], t = target(), last = i === STEPS.length - 1, nh = last ? nextHref() : "";
    if (GENESIS) root.classList.toggle("hd-step-orb", !!(t && (t.matches(".v2-genesis-opener") || t.querySelector(".v2-genesis-opener"))));
    root.classList.toggle("hd-step-launch", s.sel === ".hd-launch");
    if (GENESIS) paintGenesis(s, i, last, nh); else paintSite(s, i, last, nh);
    if (t && s.sel !== ".hd-launch") { makeRoom(t); bringIntoView(t, card.offsetHeight || 230, GENESIS && !isPhone() ? 340 : (card.offsetWidth || 360), s); }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      place();
      if (!card) return;
      if (GENESIS) { if (spot) spot.hidden = false; card.style.visibility = ""; } else { if (spot) spot.classList.add("on"); card.classList.add("on"); }
      /* The card takes focus on every step. A card that was hidden a moment ago may not take it on the
         first try (the Genesis guide on step 1), so it tries again on the next frames. */
      var f = card.querySelector("[data-hd-focus]");
      if (f) {
        focusOn(f);
        /* A card that scrolls inside (400 percent zoom) shows the focused control: only the card scrolls. */
        var fr = f.getBoundingClientRect(), kr = card.getBoundingClientRect();
        if (card.scrollHeight > card.clientHeight + 1 && (fr.bottom > kr.bottom || fr.top < kr.top)) card.scrollTop += fr.bottom > kr.bottom ? fr.bottom - kr.bottom + 8 : fr.top - kr.top - 8;
        if (document.activeElement !== f) requestAnimationFrame(function () {
          focusOn(f);
          if (document.activeElement !== f) setTimeout(function () { if (card && card.contains(f)) focusOn(f); }, 160);
        });
      }
    }, REDUCE ? 60 : 520);
  }
  function paintSite(s, i, last, nh) {
    card.classList.remove("on");
    card.innerHTML = "";
    var kk = s.k || (CFG.tourTitle ? GUIDE + " · " + CFG.tourTitle : GUIDE);
    var k = el("p", "k", kk + "  ·  " + (i + 1) + " of " + STEPS.length);
    var h = el("h3", null, s.h);
    var p = el("p", null, s.p); p.id = "hd-say"; card.setAttribute("aria-describedby", "hd-say");
    var bar = el("div", "bar");
    var dots = el("div", "hd-dots"); dots.setAttribute("aria-hidden", "true"); STEPS.forEach(function (_, j) { dots.appendChild(el("i", j === i ? "on" : "")); });
    var ctr = el("div", "hd-row");
    var skip = el("button", "hd-skip", "End Tour"); skip.type = "button";
    var bk = el("button", "hd-btn ghost", "Back"); bk.type = "button"; bk.disabled = i === 0; if (i === 0) bk.style.visibility = "hidden";
    var nx = el("button", "hd-btn" + (last && nh ? " ghost" : ""), last ? "Finish" : "Next"); nx.type = "button";
    ctr.appendChild(bk); ctr.appendChild(nx);
    bar.appendChild(skip); bar.appendChild(ctr);
    card.appendChild(k); card.appendChild(h); card.appendChild(p);
    if (s.note) card.appendChild(el("p", "hd-cnote", s.note));
    /* The foot stays at the card's bottom edge when the card scrolls (a short window). */
    var foot = el("div", "hd-cfoot");
    foot.appendChild(dots); foot.appendChild(bar); card.appendChild(foot);
    dots.style.margin = "0 0 12px";
    if (last && nh) {
      var a = el("a", "hd-btn hd-next"); a.href = nh; a.setAttribute("data-hd-focus", "");
      a.appendChild(document.createTextNode(NEXT.label || "Continue the Demo")); a.insertAdjacentHTML("beforeend", ICON_ARROW);
      foot.appendChild(a);
    } else nx.setAttribute("data-hd-focus", "");
    skip.addEventListener("click", function () { endTour(false); });
    bk.addEventListener("click", back); nx.addEventListener("click", next);
    announce("Step " + (i + 1) + " of " + STEPS.length + ". " + s.h + ". " + s.p + (s.note ? " " + s.note : ""));
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
      '<h2 class="v2-guide-title"></h2><p class="v2-guide-say" id="hd-say"></p>' + (s.note ? '<p class="v2-guide-note"></p>' : "") +
      '<div class="v2-guide-foot"><span class="v2-guide-count"></span>' +
      (i > 0 ? '<button class="v2-button v2-button-quiet" type="button" data-guide="back">Back</button>' : "") +
      '<button class="v2-button' + (last && nh ? "" : " v2-button-primary") + ' v2-guide-next" type="button" data-guide="next"' + (last && nh ? "" : " data-hd-focus") + ">" + (last ? "Finish" : "Next") + "</button></div>" +
      (last && nh ? '<div class="v2-guide-controls"><a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a></div>' : "");
    card.querySelector(".v2-guide-eyebrow").textContent = GUIDE + (title ? " · " + title : "");
    card.querySelector(".v2-guide-title").textContent = s.h;
    card.querySelector(".v2-guide-say").textContent = s.p;
    if (s.note) card.querySelector(".v2-guide-note").textContent = s.note;
    card.querySelector(".v2-guide-count").textContent = (i + 1) + " of " + STEPS.length;
    if (last && nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }
    announce("Step " + (i + 1) + " of " + STEPS.length + ". " + s.h + ". " + s.p + (s.note ? " " + s.note : ""));
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
    card.removeAttribute("aria-modal");
    card.setAttribute("role", "region");
    card.style.left = card.style.top = card.style.maxHeight = "";
    card.style.removeProperty("--v2-guide-arrow");
    card.setAttribute("aria-label", "Guided demo with " + GUIDE + ", done");
    card.setAttribute("aria-describedby", "hd-say");
    /* With links of its own (the last card of a demo), Close moves up beside Take the Tour Again as an
       icon, so the actions stay on one row. */
    var links = fin.links || [], iconClose = !!links.length;
    card.innerHTML = '<div class="v2-guide-head"><span class="v2-guide-eyebrow"></span><span class="hd-g-headr"><span class="v2-guide-count"></span>' +
      '<button class="v2-guide-icon hd-g-again" type="button" data-guide="again" aria-label="Take the Tour Again" title="Take the Tour Again">' + ICON_AGAIN + "</button>" +
      (iconClose ? '<button class="v2-guide-icon v2-guide-close hd-g-x" type="button" data-guide="close" aria-label="Close" title="Close">' + ICON_GX + "</button>" : "") + "</span></div>" +
      '<p class="v2-guide-say" id="hd-say"></p>' + (NEXT && NEXT.note ? '<p class="v2-guide-note"></p>' : "") +
      '<div class="v2-guide-controls">' + (nh ? '<a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a>' : "") +
      links.map(function (l, li) { return '<a class="v2-button" data-guide-link="' + li + '"' + (!nh && !li ? " data-hd-focus" : "") + "></a>"; }).join("") +
      (CFG.openChat ? '<button class="v2-button" type="button" data-guide="ask"></button>' : "") +
      (iconClose ? "" : '<button class="v2-button' + (nh ? " v2-button-quiet" : " v2-button-primary") + '" type="button" data-guide="close"' + (nh ? "" : " data-hd-focus") + ">Close</button>") + "</div>";
    var title = CFG.tourTitle || "";
    card.querySelector(".v2-guide-eyebrow").textContent = GUIDE + (title ? " · " + title : "");
    card.querySelector(".v2-guide-count").textContent = "Done";
    card.querySelector(".v2-guide-say").textContent = fin.text || "That is the tour of this screen.";
    if (NEXT && NEXT.note) card.querySelector(".v2-guide-note").textContent = NEXT.note;
    announce("Done. " + (fin.text || "That is the tour of this screen.") + (NEXT && NEXT.note ? " " + NEXT.note : ""));
    if (nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }
    links.forEach(function (l, li) { var la = card.querySelector('[data-guide-link="' + li + '"]'); if (la) { la.href = l.href; la.textContent = l.label; } });
    var ask = card.querySelector('[data-guide="ask"]'); if (ask) ask.textContent = fin.askLabel || ("Ask " + AN);
    /* The last card keeps its actions on one row: Ask Hope steps aside when it would wrap (the orb
       still opens Hope). */
    if (ask && iconClose) {
      var first = card.querySelector(".v2-guide-controls > :first-child");
      if (first && first !== ask && ask.getBoundingClientRect().top > first.getBoundingClientRect().top + 4) ask.remove();
    }
    var doneCard = card;
    /* The Done card is docked at the bottom on phones too, so the orb stays aside until it closes. */
    document.documentElement.classList.add("hd-invite-on");
    function closeDone() { document.documentElement.classList.remove("hd-invite-on"); doneCard.remove(); if (card === doneCard) card = null; spot = null; if (typeof CFG.onTourEnd === "function") try { CFG.onTourEnd(true); } catch (e) {} }
    card.onclick = function (e) {
      var b = e.target.closest("[data-guide]"); if (!b) return;
      var act = b.getAttribute("data-guide");
      if (act === "close") { closeDone(); goHome(); }
      else if (act === "ask") { closeDone(); openChat(fin.askPrompt || ""); }
      else if (act === "again") { closeDone(); startTour(); }
    };
    card.onkeydown = function (e) { if (e.key === "Escape") { e.preventDefault(); closeDone(); goHome(); } };
    var f = card.querySelector("[data-hd-focus]"); if (f) f.focus({ preventScroll: true });
  }

  /* Where the words of a section sit on screen: every visible element with text of its own (a heading,
     a line of times, a sticker, a card's title), as the box its words fill. */
  /* A photo that is part of the content (the pastors, a card's picture) counts too, at a quarter of
     the weight, so the card would rather cover a corner of a photo than a line of words. A photo
     behind the whole section (the hero) does not count. */
  function wordBoxes(root, photo) {
    var out = [], vw = window.innerWidth, vh = window.innerHeight, all = root.querySelectorAll("*");
    var rr = root.getBoundingClientRect(), whole = Math.min(rr.width * rr.height, vw * vh);
    for (var i = 0; i < all.length && i < 800; i++) {
      var n = all[i], tag = n.tagName, own = /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(tag), r;
      if (/^(IMG|VIDEO|PICTURE)$/.test(tag)) {
        if (!visible(n)) continue;
        r = n.getBoundingClientRect();
        if (r.width * r.height < whole * 0.5 && r.bottom > 0 && r.top < vh) out.push([r, photo || 0.25, true]);
        continue;
      }
      if (!own && /^(SCRIPT|STYLE|svg|SOURCE|BR|path)$/.test(tag)) continue;
      for (var c = n.firstChild; c && !own; c = c.nextSibling) if (c.nodeType === 3 && /\S/.test(c.nodeValue)) own = true;
      if (!own || !visible(n)) continue;
      r = tightRect(n);
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw || !r.width || !r.height) continue;
      out.push([r, 1]);
    }
    return out;
  }
  /* The best place for the card over a tall section: no words under it if anywhere fits (else as few
     as possible), inside the visible box, clear of the chat circle, and as near the focus part as it
     can be. */
  function clearSpot(t, s, cw, ch, b) {
    var vw = window.innerWidth, vh = window.innerHeight, m = 10, step = 12, pad = 6; // a clear spot may sit 10px from the screen edge and 6px from words
    var boxes = wordBoxes(t, s && s.photoWeight).map(function (e) { var r = e[0], p = e[2] ? 0 : pad; return [r.left - p, r.top - p, r.right + p, r.bottom + p, e[1], !!e[2]]; });
    var f = focusRect(s, t);
    if (f) boxes.push([f.left - pad, f.top - pad, f.right + pad, f.bottom + pad, 1]);
    if (launch && launch.isConnected) { var lr = launch.getBoundingClientRect(); if (lr.width) boxes.push([lr.left - 12, lr.top - 12, lr.right + 12, lr.bottom + 12, 1]); }
    var y0 = Math.max(m, b.top + 8), y1 = Math.min(vh, b.bottom) - ch - m, x0 = Math.max(m, b.left + 8), x1 = Math.min(vw, b.right) - cw - m;
    if (y1 < y0 || x1 < x0) return null;
    var tr = t.getBoundingClientRect();
    var ax = f ? (f.left + f.right) / 2 : (tr.left + tr.right) / 2, ay = f ? (f.top + f.bottom) / 2 : Math.max(y0, tr.top) + ch / 2;
    var best = null, ys = [], xs = [], yi, xi, y, x;
    /* Every step of the grid, and the last spot that fits too (the lowest, the rightmost), which the
       grid alone can miss by a few pixels. */
    for (y = y0; y < y1; y += step) ys.push(y);
    for (x = x0; x < x1; x += step) xs.push(x);
    ys.push(y1); xs.push(x1);
    for (yi = 0; yi < ys.length; yi++) {
      y = ys[yi];
      for (xi = 0; xi < xs.length; xi++) {
        x = xs[xi];
        var o = 0;
        for (var i = 0; i < boxes.length; i++) {
          var q = boxes[i], w = Math.min(x + cw, q[2]) - Math.max(x, q[0]), h = Math.min(y + ch, q[3]) - Math.max(y, q[1]);
          if (w <= 0 || h <= 0) continue;
          /* A line cut in half ("Sundays at 9:00 & 11:00 A") reads as broken: it costs more than
             covering a whole small block. */
          var all = (q[2] - q[0]) * (q[3] - q[1]);
          o += q[5] ? w * h * q[4] : (w * h >= all - 1 ? all : all * 2 + 4000);
        }
        var dx = x + cw / 2 - ax, dy = y + ch / 2 - ay, d = dx * dx + dy * dy;
        if (!best || o < best.o || (o === best.o && d < best.d)) best = { x: Math.round(x), y: Math.round(y), o: o, d: d };
      }
    }
    return best;
  }
  /* Where a ring that stops at a docked card should end: just above a line of words the edge would
     cut in half, so the ring never ends halfway through a sentence. */
  function lineEdge(t, top, edge) {
    var lines = [], n = 0, w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), node, range = document.createRange(), i;
    while ((node = w.nextNode()) && n++ < 600) {
      if (!/\S/.test(node.nodeValue)) continue;
      range.selectNodeContents(node);
      var rs = range.getClientRects();
      for (i = 0; i < rs.length; i++) if (rs[i].height && rs[i].bottom > top && rs[i].top < edge) lines.push(rs[i]);
    }
    /* Moving the edge above one line can land it inside the line above, so look again until it rests. */
    for (var pass = 0, moved = true; moved && pass < 6; pass++) {
      moved = false;
      for (i = 0; i < lines.length; i++) if (lines[i].top < edge && lines[i].bottom > edge) { edge = lines[i].top - 4; moved = true; }
    }
    return Math.max(top + 40, edge);
  }
  function setSpot(top, left, bottom, right) {
    spot.style.top = top + "px"; spot.style.left = left + "px";
    spot.style.width = Math.max(0, right - left) + "px"; spot.style.height = Math.max(0, bottom - top) + "px";
  }
  function place() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () {
      if (!touring || !spot || !card) return;
      var t = target(); if (!t) return;
      if (GENESIS) { placeGenesis(t); return; }
      var r = t.getBoundingClientRect(), b = viewBox(t), pad = 10, vw = window.innerWidth, vh = window.innerHeight;
      var top = Math.max(8, b.top + 4, r.top - pad), left = Math.max(8, b.left + 4, r.left - pad);
      var bottom = Math.min(vh - 8, b.bottom - 4, r.bottom + pad), right = Math.min(vw - 8, b.right - 4, r.right + pad);
      if (vw <= 640 || shortDock()) {
        /* The card docks at the bottom (at the top for the chat circle step): the ring stops at its edge. */
        var cr = card.getBoundingClientRect();
        if (document.documentElement.classList.contains("hd-step-launch")) top = Math.max(top, Math.min(bottom - 40, cr.bottom + 8));
        else if (cr.height && cr.top - 8 < bottom) bottom = lineEdge(t, top, Math.max(top + 40, cr.top - 8));
        setSpot(top, left, bottom, right);
        return;
      }
      setSpot(top, left, bottom, right);
      var cw = card.offsetWidth, chh = card.offsetHeight, gap = 16;
      var stp = STEPS[idx];
      if (stp && stp.place === "edge-left") { card.style.top = Math.max(16, Math.min(vh - chh - 16, (top + bottom) / 2 - chh / 2)) + "px"; card.style.left = "16px"; return; }
      if (CFG.placement === "side" && right - left <= vw * 0.7) {
        var cyS = Math.max(16, Math.min(vh - chh - 16, (top + bottom) / 2 - chh / 2));
        if (right + gap + cw <= vw - 12) { card.style.top = cyS + "px"; card.style.left = (right + gap) + "px"; return; }
        if (left - gap - cw >= 12) { card.style.top = cyS + "px"; card.style.left = (left - gap - cw) + "px"; return; }
      }
      var below = bottom + gap + chh < vh - 8, above = top - gap - chh >= Math.max(8, b.top + 4), cy, cx;
      /* A section too tall for the card above or below it: a step that names its parts (the hero's
         times and buttons, the pastors, the next steps, the footer's address) puts the card on the
         clearest part of the screen, beside the focus part and off every line of the section's words. */
      var free = !below && !above && stp && stp.place === "beside-focus" ? clearSpot(t, stp, cw, chh, b) : null;
      if (below || above) {
        cy = below ? bottom + gap : top - gap - chh;
        cx = Math.min(vw - cw - 16, Math.max(16, left));
      } else if (free) {
        cy = free.y; cx = free.x;
      } else if ((vh - chh - gap - 24) - top >= 120) {
        /* A tall section: the ring shows its top part and the card sits just under it, over the
           dimmed rest of the section, never over the part being described. */
        bottom = vh - chh - gap - 24;
        setSpot(top, left, bottom, right);
        cy = bottom + gap;
        cx = Math.min(vw - cw - 16, Math.max(16, (left + right) / 2 - cw / 2));
      } else {
        cy = vh - chh - 24; cx = vw - cw - 24;
      }
      /* Keep the card clear of the chat circle so Next is never covered. */
      if (launch && launch.isConnected) {
        var lr = launch.getBoundingClientRect();
        if (lr.width && lr.left < cx + cw && lr.right > cx && lr.top < cy + chh && lr.bottom > cy) {
          if (lr.left - cw - 12 >= 16) cx = lr.left - cw - 12; else cy = Math.max(8, lr.top - chh - 12);
        }
      }
      card.style.top = cy + "px"; card.style.left = cx + "px";
    });
  }
  /* Ring and card the way Genesis OS guided-session.js draws them: the card beside the target,
     to the right when there is room, then the left, below and above, with its arrow on the
     middle of the target. A phone, or a target with no room around it, keeps the card docked
     at the bottom, or at the top when the target sits under it. The ring stays inside the box
     that scrolls the target (the workspace, a table, the rail) and stops at a docked card. */
  function placeGenesis(t) {
    card.setAttribute("data-placed", "");
    card.classList.remove("hd-g-side"); card.style.maxHeight = "";
    var r = t.getBoundingClientRect(), b = viewBox(t), pad = 6, vw = window.innerWidth, vh = window.innerHeight;
    var top = Math.max(4, b.top + 2, r.top - pad), left = Math.max(4, b.left + 2, r.left - pad);
    var bottom = Math.min(vh - 4, b.bottom - 2, r.bottom + pad), right = Math.min(vw - 4, b.right - 2, r.right + pad);
    /* On a phone a full-width target starts its words a few pixels from the screen's edge: the ring
       sits in the gutter outside them, never on the first letter. It is held inside the box that
       scrolls the target only where the target is cut by it. */
    if (vw <= 860) {
      left = r.left >= b.left - 1 ? Math.max(2, r.left - pad) : Math.max(2, b.left + 2);
      right = r.right <= b.right + 1 ? Math.min(vw - 2, r.right + pad) : Math.min(vw - 2, b.right - 2);
    }
    var box = { top: top, left: left, right: right, bottom: bottom, width: right - left, height: bottom - top };
    /* A phone held on its side (short and wide): a card docked at the bottom would leave the target a
       sliver, so the card sits at the right under the top bar and the target shows beside it. */
    var sd = sideDock(), root = document.documentElement;
    if (sd !== root.classList.contains("hd-side-on")) { root.classList.toggle("hd-side-on", sd); place(); return; }
    if (sd) {
      card.classList.remove("is-anchored", "is-top"); card.removeAttribute("data-side");
      card.style.left = ""; card.style.removeProperty("--v2-guide-arrow");
      card.classList.add("hd-g-side");
      var sTop = topBars() + 8;
      card.style.top = sTop + "px"; card.style.maxHeight = Math.max(160, vh - sTop - 12) + "px";
      var sr = card.getBoundingClientRect();
      if (sr.width && sr.left < right) right = Math.max(left + 40, sr.left - 8);
      setSpot(top, left, bottom, right);
      return;
    }
    if (vw > 860) {
      card.classList.add("is-anchored"); card.classList.remove("is-top");
      var w = card.offsetWidth || 340, h = card.offsetHeight || 180, gap = 16, m = 12;
      /* The card never covers the sidebar: on a wide window its left edge stays right of it. */
      var lm = m, sb = document.querySelector("aside.v2-sidebar");
      if (sb && !sb.contains(t)) { var sbr = sb.getBoundingClientRect(); if (sbr.width && sbr.right > 0 && sbr.right < vw / 2) lm = Math.max(m, sbr.right + m); }
      var cx = box.left + box.width / 2, cy = box.top + box.height / 2, side = "", L = 0, T = 0;
      var fits = {
        right: function () { if (box.right + gap + w <= vw - m) { side = "right"; L = box.right + gap; T = cy - h / 2; } },
        left: function () { if (box.left - gap - w >= lm) { side = "left"; L = box.left - gap - w; T = cy - h / 2; } },
        bottom: function () { if (box.bottom + gap + h <= vh - m) { side = "bottom"; T = box.bottom + gap; L = cx - w / 2; } },
        top: function () { if (box.top - gap - h >= m) { side = "top"; T = box.top - gap - h; L = cx - w / 2; } }
      };
      /* A wide section reads best with the card under it (or over it); a narrow one, beside it. */
      (box.width > WIDE ? ["bottom", "top", "right", "left"] : ["right", "left", "bottom", "top"]).forEach(function (k) { if (!side) fits[k](); });
      if (side) {
        setSpot(top, left, bottom, right);
        L = Math.max(lm, Math.min(L, vw - m - w)); T = Math.max(m, Math.min(T, vh - h - m));
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
    var isTop = under && box.top > ch + 24;
    card.classList.toggle("is-top", isTop);
    /* A docked card never sits on the ring: the ring stops at its edge (keeping at least 40px). */
    var cr = card.getBoundingClientRect();
    if (cr.height && cr.left < right && cr.right > left) {
      if (isTop) top = Math.max(top, Math.min(bottom - 40, cr.bottom + 6));
      else if (cr.top < bottom) bottom = lineEdge(t, top, Math.max(top + 40, Math.min(bottom, cr.top - 6)));
    }
    setSpot(top, left, bottom, right);
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
    /* For the page's own code only (a fixed question), answered as if its chip was tapped. */
    ask: function (q) {
      if (!panel) { openChat(q); return; }
      setOpen(true);
      (function trySend() { if (busy) { setTimeout(trySend, 200); return; } respond(String(q || "")); })();
    },
    /* Tap to ask, from the page's own buttons (the Website screen's Try Hope): opens Hope and taps the
       question chip for this answer, as a visitor would. Returns false when this Hope has no such chip. */
    tap: function (key) {
      var item = null;
      QUESTIONS.forEach(function (g) { g.items.forEach(function (it) { if (!item && it.key === key) item = it; }); });
      if (!item) return false;
      openChat();
      var tries = 0;
      (function press() {
        var chip = qsBox && qsBox.querySelector('[data-hope-q="' + key + '"]');
        if (busy || !chip) { if (++tries < 60) setTimeout(press, 100); return; }
        var more = chip.closest(".hd-qs-more");
        if (more && more.hidden) { var mb = qsBox.querySelector(".hd-more"); if (mb) mb.click(); }
        chip.click();
      })();
      return true;
    },
    isTouring: function () { return touring; },
    /* The element the current tour step points at (null when no tour runs), for the placement checks. */
    stepTarget: function () { return touring ? target() : null; },
    stepFocus: function () { var t = touring ? target() : null; return t ? focusRect(STEPS[idx], t) : null; },
    /* The fixed crisis reply, for any Hope that shares these words (shared/app.js reads it). */
    crisisReply: crisisReply,
    /* Whether text is a crisis, by the widened check above (shared/app.js can ask it too). */
    isCrisis: function (text) { var q = WORDS.plain(String(text || "")); return isCrisis(q) || (WORDS.safety(q) !== "policy" && CRISIS_NET.test(calm(q))); },
    /* Which safety reply a text gets: "crisis", "leadersafety", "policy" or null (shared/crisis-words.js). */
    safety: function (text) { return WORDS.safety(WORDS.plain(String(text || ""))); },
    leaderReply: function () { return LEADER_REPLY; },
    /* Where a question would go ("crisis", an answer key or "fallback"), for the checks in
       shared/hope-check.html. It answers nothing and changes nothing. */
    route: route,
    /* Tap to ask: the questions this Hope shows ([{ title, more, items: [{ label, key }] }]) and the
       words and chips one of them gets when tapped, for the same checks. Neither says anything in the chat. */
    questions: function () { return QUESTIONS.map(function (g) { return { title: g.title, more: g.more, items: g.items.map(function (it) { return { label: it.label, key: it.key }; }) }; }); },
    chipAnswer: function (key, label) {
      if (!A[key]) return null;
      var c = val(A[key].c, label);
      return { key: key, text: withLine(val(A[key].t, label), label), chips: (c || []).filter(Boolean).map(function (x) { return x.label; }) };
    },
    /* The words and chips a question would get, for the same checks. It says nothing in the chat. */
    answerInfo: function (q) {
      q = WORDS.plain(String(q || "")); var k = route(q), t, c;
      if (k === "crisis") { t = CRISIS_REPLY; c = CRISIS_CHIPS; }
      else if (k === "leadersafety") { t = LEADER_REPLY; c = LEADER_CHIPS; }
      else if (k === "fallback") { var fb = fallback(q); t = fb.t; c = fb.c; }
      else if (k === "tour" || k === "menu" || !A[k]) { t = k; c = MENU; }
      else { t = withLine(val(A[k].t, q), q); c = val(A[k].c, q); }
      return { key: k, text: t, chips: (c || []).filter(Boolean).map(function (x) { return x.label; }) };
    }
  };
})();
