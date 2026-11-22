/* Genesis Ministry design preview: the guided demo.

   shared/app.js loads this file on every platform page. It gives each screen a short tour,
   chains the screens into one end-to-end demo path, starts a screen's tour on ?tour=1, and adds
   the scripted answers a church leader asks about.

   - Genesis screens (the church workspace) use the real Genesis OS guide
     (.v2-guide and .v2-guide-ring, drawn by ../shared/hope-demo.js with skin "genesis"), with
     GUIDE as the guide's name. Questions go to the real assistant dock (GM.hope).
   - Member screens use ../shared/hope-demo.js in the church's own brand, with the assistant
     (GM.assistant.name) as the guide and a chat circle for questions.
   - ?plan= decides what a tour shows. A step about something outside the plan becomes a short
     step that says which plan adds it, a locked screen gets a short tour of its locked state,
     and the path skips locked screens and says so.

   Copy rules: warm, plain, short sentences. No em dashes. No emojis. Buttons in Title Case. */
(function () {
  "use strict";
  var GM = window.GM;
  var STORY = window.STORY;
  if (GM ? (!GM.data || GM.demo) : !STORY) return;
  if (window.__gmDemo) return;
  window.__gmDemo = true;
  var D = GM ? GM.data : (window.GM_DATA || {});
  /* Where this file lives, so ../shared/hope-demo.js resolves from any page. */
  var SELF = (document.currentScript && document.currentScript.src) || "";
  var SHARED_DIR = SELF ? SELF.replace(/demo\.js(?:[?#].*)?$/, "") : (GM && GM.sharedPath) || "shared/";

  /* The guide's name on Genesis screens and the story pages. Rename it here.
     The assistant stays GM.assistant.name (shared/app.js), or STORY.assistant on the story pages. */
  var GUIDE = "Genesis";
  /* The church consultation on geai.us: on the last card of the guided demo, and from Hope. */
  var CONTACT = "/contact?topic=ministry";
  var CONTACT_LINK = { label: "Book a Consultation", href: CONTACT };
  var CONTACT_CHIP = { label: "Book a Consultation", href: CONTACT, go: true, cta: true };
  /* The guided demo ends when the next stop is the overview, the one stop with no tour. */
  function endOfDemo(nx) { return !!(nx && nx.tour === false); }
  var AN = GM ? GM.assistant.name : STORY.assistant;

  /* ------------------------------------------------------------------ scripted answers */
  var LEVELS_TEXT = "Care: the website in one of four looks, the brand board, the social marketing plan, " + AN + " on the website, Plan a Visit and prayer forms by email, and newsletter sign-up. " +
    "Shepherd: everything in Care, plus Today, the guest pipeline, the member app, the care inbox, team roles with the prayer team named, and drafts that wait for approval. " +
    "Plus: everything in Shepherd, plus person pages, the access record, the spiritual gifts picture, reports, custom roles, named gift viewers and more staff seats. " +
    "Enterprise is for more than one campus, scoped on a call. Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.";
  var ANSWERS = {
    platform: "Genesis Ministry is the church edition of Genesis OS. Every church gets a website in one of four looks, a brand board, a social marketing plan and " + AN + " on its website. Shepherd adds a front office for first-time guests, a care inbox and a member app. Plus adds a page for each person, the spiritual gifts picture and reports. A person approves everything that goes out.",
    prayer: "Only the pastors and the prayer team, or the pastors only when the person asks for that. Staff and website admins cannot open prayer, and the system stops them if they try. Alert emails say only: New request. Sign in to read. From Shepherd every open is recorded, and nobody can edit that record. Plus adds the Access Record screen to search and export it.",
    crisis: "If a message or a prayer request sounds like someone is in danger, the person sees 988 and 911 right away, and the pastor on call gets an email and a phone notification that carry no private words. A pastor follows up and sets the next check-in. " + AN + " never handles it alone.",
    ai: AN + " drafts and summarizes, and a person approves everything before it goes out. " + AN + " answers only from facts the church approved, never writes a reply to prayer or a private message, never sets a gifts score, and only sees what the signed-in person can see.",
    pco: "No, it does not replace them. Genesis Ministry works beside Planning Center, Subsplash and your giving provider. Give opens your own giving page, and events, groups and kids check-in open the tool you already use. At onboarding we can import your people list from a Planning Center or Subsplash export, so nobody is entered twice.",
    importpeople: "Yes. At onboarding we can import your people list from a Planning Center or Subsplash export, as a CSV. Records also grow as people sign in. Genesis does not replace those tools, and a live Planning Center sync is on the roadmap.",
    signin: "An email address. Members sign in with a 6 digit code sent by email, or with Google, so there is no password to remember. Member accounts are for adults 18 and older, confirmed once. Signing in the first time creates the account.",
    age: "No. Member accounts are for adults 18 and older, confirmed once at the first sign in. Kids and students are cared for through their parents and the church's kids and student ministries, never through a private account.",
    minor: "If someone under 18 writes in, staff do not continue a private one to one thread. They bring in a parent or guardian, follow the church's child protection policy, and report when the law requires it. The account is closed kindly, because member accounts are for adults.",
    data: "Your data is yours. If you ever leave, we hand over a full export of your people, guests, care history and the access record, and then delete our copy once you confirm you have it.",
    hosting: "Genesis Ministry runs on a managed cloud database. Staff sign in with two steps, and prayer stays behind role checks the system enforces. During scoping we share the hosting and backup details in writing, in plain words, so your team can review them before you sign anything.",
    launch: "About 55 days from signing to live, in the sample. Content and photos come first, then the brand board, the site build, the facts " + AN + " may use, your privacy page, roles and a staff walkthrough.",
    training: "Yes. Your staff get a walkthrough at launch, then a monthly check-in with Genesis. Every screen also has a short guided tour, like this one.",
    staffaccess: "No, not in the ordinary course. Genesis signs in to your workspace only when you open a support session, and that session is recorded where you can see it. An honest limit: the engineers who run the database could technically reach it. The rule, the record and our support policy are the promise.",
    texting: "Texting is off. Guest follow-up goes by email unless the church turns texting on.",
    custom: "Each of the four looks is filled with the church's own content, photos, colors and logo. Customization beyond the template is available for an additional cost.",
    levels: LEVELS_TEXT,
    contact: "A person at Genesis would be glad to talk with you. Book a consultation: a free conversation about your church, with no obligation.",
    price: "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month."
  };
  var RULES = [
    [/\b(genesis|your|vendor|support) (staff|team|engineers?|employees?|people)\b.*\b(read|see|open|access)|\b(can|could|do|does) (genesis|you|your (staff|team))\b.*\b(read|see|open|access)\b.*\b(prayer|care|data|messages)/i, "staffaccess"],
    [/\b(minor|under ?18|under 18|underage|teen(ager)?s?|child|kid|student|young person)\b.*\b(writes?|messages?|sends?|contacts?|reaches out|emails?)\b|\bif (a|someone) (minor|teen|kid|child|under)/i, "minor"],
    [/\b(1[0-7]|sixteen|fifteen|seventeen|fourteen|thirteen)[- ]?(year|yr)|\b(minor|teen(ager)?s?|under ?18|kids?|children|students?)\b.*\b(sign ?up|sign ?in|accounts?|join|use the app)\b/i, "age"],
    [/\bimport|bring (over|in) (our|the|my) (people|members|list)|(people|member) (list|data) (from|into)|entered twice|double entry|migrat\w*/i, "importpeople"],
    [/\bhost(ed|ing)?\b|where is (the |our )?data|stored|secure|security|backups?|encrypt\w*|servers?\b|safe is (the |our )?data/i, "hosting"],
    [/\b(if|when) (we|you) (leave|cancel|stop)|leave genesis|our data|own (the|our) data|export (our|the|my|everything)|data (portab\w*|ownership)|who owns/i, "data"],
    [/how long (does it|will it|to)|(launch|go live|get live|set ?up) (time|take)|timeline|how (soon|fast|quickly)|weeks? to launch|days to launch/i, "launch"],
    [/\btrain(ing|ed)?\b|onboard (our|the) staff|walk ?through for (our|the) staff|learn (it|to use)|support after launch/i, "training"],
    [/planning center|subsplash|pushpay|church ?center|breeze|tithe\.?ly|church management|chms|replace (our|the|my)/i, "pco"],
    [/\bcrisis|emergenc\w*|\b988\b|\b911\b|someone (is )?(hurting|in danger)|safety plan/i, "crisis"],
    [/who (can |will |gets to )?(see|sees|read|reads|open)|private|confidential|prayer team see|see (the |my |our )?prayer/i, "prayer"],
    [/sign ?in|log ?in|password|6 digit|sign up|members? need/i, "signin"],
    [/\btext(s|ing)?\b|\bsms\b/i, "texting"],
    [/\b(talk|speak) (to|with) (someone|somebody|a person|a human|genesis)|\b(contact|reach|call|email) (genesis|you|someone|a person)\b|\bbook (a |the )?(call|consultation|meeting)\b|\bconsultation\b|\bget started\b/i, "contact"],
    [/\b(prices?|pricing|costs?|how much|fees?|dollars?|afford|budget)\b|\$/i, "price"],
    [/custom\w*|our own (look|design|colou?rs|logo|fonts?)|redesign|change the (look|design)/i, "custom"],
    [/\b(levels?|tiers?|includ\w*|packages?|welcome level|connect level|shepherd level|enterprise)\b|what do (we|i) get|(which|what) plans?\b/i, "levels"],
    [/\b(ai|a\.i\.|artificial|automat\w*|bots?|robots?|limits?|limited)\b|what can (hope|it) do|does (hope|it) (send|reply|write)/i, "ai"],
    [/what is (this|genesis|the platform)|genesis ministry|tell me about (this|the platform)|what does (this|it) do/i, "platform"]
  ];

  var MORE_KEYS = ["importpeople", "age", "minor", "data", "hosting", "launch", "training", "staffaccess"];
  function addMore(answers, a, chips) { MORE_KEYS.forEach(function (k) { if (!answers[k]) answers[k] = a(ANSWERS[k], chips); }); return answers; }

  if (!GM) { storyPages(); return; }

  var FILE = (location.pathname.split("/").pop() || "church-today.html").replace(/\.html$/i, "");
  var P = new URLSearchParams(location.search);
  var SIDE = GM.side;
  var MEMBER = SIDE === "member";

  function fill(s) { return GM.fill(String(s == null ? "" : s).replace(/\{assistant\}/g, AN)); }
  function listNames(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function addParam(href, k, v) {
    if (!href) return href;
    var hash = "", hi = href.indexOf("#"); if (hi >= 0) { hash = href.slice(hi); href = href.slice(0, hi); }
    var q = "", qi = href.indexOf("?"); if (qi >= 0) { q = href.slice(qi + 1); href = href.slice(0, qi); }
    var p = new URLSearchParams(q); p.set(k, v);
    return href + "?" + p.toString() + hash;
  }
  function levelOf(module) { return GM.level(GM.moduleLevel(module)); }

  /* ------------------------------------------------------------------ where this screen is */
  /* A screen's key: the file, plus its mode when one file draws more than one screen. */
  function modeOf() {
    if (FILE === "church-person") return P.get("id") ? "record" : "list";
    if (FILE === "member-gifts") { var s = P.get("step"); return s === "talk" || s === "words" || s === "done" ? s : ""; }
    if (FILE === "member-signin") { var t = P.get("step"); return t === "code" || t === "adult" ? t : ""; }
    if (FILE === "member-messages") return P.get("new") ? "new" : "";
    return "";
  }
  var MODE = modeOf();
  var KEY = FILE + (MODE ? ":" + MODE : "");

  /* ------------------------------------------------------------------ the demo path */
  /* The church workspace, the member app, then back. */
  /* An entry with plans: [n] is on the path only at those levels: Care shows the website package
     right after Today, and Shepherd shows Messages and Give, the parts it is sold on. */
  var PATH_ALL = [
    { key: "church-today", label: "The Church Workspace" },
    { key: "church-website", label: "The Website, Brand Board and Social Plan", module: "website", plans: [1] },
    { key: "church-guests", label: "Guests", module: "guests" },
    { key: "church-guest", label: "One Guest", module: "guests" },
    { key: "church-care", label: "Care", module: "care" },
    { key: "church-person:record", href: "church-person.html?id=p-sarah", label: "One Person", module: "people" },
    { key: "church-gifts", label: "Gifts", module: "gifts" },
    { key: "church-reports", label: "Reports", module: "reports" },
    { key: "member-home", label: "The Member App", module: "member-app" },
    { key: "member-prayer", label: "Member Prayer", module: "member-app" },
    { key: "member-messages", label: "Member Messages", module: "member-app", plans: [2] },
    { key: "member-give", label: "Give", module: "member-app", plans: [2] },
    { key: "member-gifts", label: "The Gifts Conversation", module: "member-gifts" },
    { key: "member-gifts:talk", href: "member-gifts.html?step=talk", label: "One Statement at a Time", module: "member-gifts" },
    { key: "member-gifts-result", label: "Gifts to Explore", module: "member-gifts" },
    { key: "index", label: "Back to the Overview", tour: false }
  ];
  var PATH = PATH_ALL.filter(function (e) { return !e.plans || e.plans.indexOf(GM.plan) >= 0; });

  /* Screens off the main path continue to a sensible next screen, then rejoin it. */
  var OFF = {
    "church-guests-report": "church-care",
    "church-person:list": "church-person:record",
    "church-team": "church-access",
    "church-access": "member-home",
    "church-settings": "church-team",
    "church-website": "church-guests",
    "member-signin": "member-signin:code",
    "member-signin:code": "member-signin:adult",
    "member-signin:adult": "member-welcome",
    "member-welcome": "member-home",
    "member-messages": "member-messages:new",
    "member-messages:new": "member-give",
    "member-give": "member-gifts",
    "member-gifts:words": "member-gifts:done",
    "member-gifts:done": "member-gifts-result"
  };
  var EXTRA = {
    "church-website": { label: "The Website", module: "website" },
    "church-settings": { label: "Settings", module: "settings" },
    "church-team": { label: "Team Roles", module: "team" },
    "church-person:record": { href: "church-person.html?id=p-sarah", label: "One Person", module: "people" },
    "church-access": { label: "The Access Record", module: "access" },
    "member-signin:code": { href: "member-signin.html?step=code", label: "The Sign In Code", module: "member-app" },
    "member-signin:adult": { href: "member-signin.html?step=adult", label: "The Adult Check", module: "member-app" },
    "member-welcome": { label: "The First Question", module: "member-app" },
    "member-messages:new": { href: "member-messages.html?new=1", label: "A New Message", module: "member-app" },
    "member-give": { label: "Give", module: "member-app" },
    "member-gifts:done": { href: "member-gifts.html?step=done", label: "Done", module: "member-gifts" }
  };
  function pathIndex(key) { for (var i = 0; i < PATH.length; i++) if (PATH[i].key === key) return i; return -1; }
  function hrefOf(e) { return e.href || e.key.split(":")[0] + ".html"; }
  function open(e) { return !e.module || GM.isIncluded(e.module); }
  /* Walk the path from index i, skipping screens outside the plan, and say what was skipped. */
  function walk(i) {
    var skipped = [];
    for (; i < PATH.length; i++) {
      var e = PATH[i];
      if (open(e)) return { entry: e, skipped: skipped };
      skipped.push(e);
    }
    return null;
  }
  function skipNote(skipped, to) {
    if (!skipped.length) return "";
    var levels = [];
    skipped.forEach(function (e) { var c = levelOf(e.module).code; if (levels.indexOf(c) < 0) levels.push(c); });
    levels.sort();
    var labels = [], church = false, member = false;
    skipped.forEach(function (e) { if (labels.indexOf(e.label) < 0) labels.push(e.label); if (/^church-/.test(e.key)) church = true; if (/^member-/.test(e.key)) member = true; });
    var what = labels.length <= 3 ? listNames(labels) + (labels.length === 1 ? " comes" : " come")
      : "The rest of " + (church && member ? "the church workspace and the member app come" : church ? "the church workspace comes" : "the member app comes");
    return what + " with " + listNames(levels) + ", so on the " + GM.level().code + " plan" + (to.key === "index" ? " the demo ends here" : " the demo goes on to " + to.label) + ". Switch the plan to see them.";
  }
  function nextFor() {
    var i = pathIndex(KEY), hop = null;
    if (i >= 0) hop = walk(i + 1);
    else if (OFF[KEY]) {
      /* Follow the off-path chain; a locked stop is passed over (twice at most) before falling back. */
      var k = OFF[KEY], guard = 0, skippedOff = [];
      while (k && guard++ < 4) {
        var j = pathIndex(k);
        if (j >= 0) { hop = walk(j); if (hop) hop.skipped = skippedOff.concat(hop.skipped); break; }
        var x = EXTRA[k] || {};
        var e = { key: k, href: x.href, label: x.label || k, module: x.module };
        if (open(e)) { hop = { entry: e, skipped: skippedOff }; break; }
        skippedOff.push(e);
        k = OFF[k];
      }
      if (!hop) hop = walk(pathIndex("index"));
    }
    if (!hop) return null;
    var to = hop.entry;
    var href = hrefOf(to);
    if (/^church-|^member-/.test(href)) href = GM.url(href);
    return { label: (to.key === "index" ? "" : "Next: ") + to.label, href: href, tour: to.tour !== false, note: skipNote(hop.skipped, to) };
  }

  /* Where this screen sits on the guided demo path on this plan, for the card's eyebrow:
     "Screen 3 of 12 · ". Empty for a screen off the path. */
  function screenOf() {
    var stops = PATH.filter(function (e) { return e.key !== "index" && open(e); });
    for (var i = 0; i < stops.length; i++) if (stops[i].key === KEY) return "Screen " + (i + 1) + " of " + stops.length + " · ";
    return "";
  }

  /* ------------------------------------------------------------------ shared targets */
  var PLAN_SEL = MEMBER ? ['.m-stagebar [data-tour="shell.plan"]'] : ['.gm-plan-switch[data-tour="shell.plan"]', "#v2-account", "#v2-mobile-account"];
  var VIEWS_SEL = ['[data-tour="shell.views"]', ".v2-view-picker"];
  function T(name) { return '[data-tour="' + name + '"]'; }

  /* ------------------------------------------------------------------ the tours */
  /* Each tour: { title, done, steps: [{ sel, h, p, module, note }] }. Text may use {church.short},
     {church.name}, {assistant} and the other GM.fill keys. A step with a module outside the
     level is replaced by a short step that names the plan that adds it. */
  var TOURS = {
    /* ---------------- The church workspace ---------------- */
    "church-today": function () {
      if (GM.ctx && GM.ctx.locked) return { title: "Care", done: "On the Care plan a church gets a website that welcomes people, with {assistant} answering questions and every form arriving by email. Next, the website package itself.", steps: [
        { sel: "#td-page .v2-page-head", h: "Care starts with the website", p: "Care is the website in one of four looks, with {assistant} answering questions on it. This is the screen a church on Care sees." },
        { sel: ".td-grid3", h: "Website, brand board and social plan", p: "{church.name}'s website in the {church.look} look, a brand board any volunteer can follow, and a social marketing plan." },
        { sel: "#td-page > .v2-pulse", h: "Every form arrives by email", p: "Plan a Visit, prayer and newsletter forms reach the church by email. On this plan the prayer words are in that email, sent only to the pastors' address." },
        { sel: ".gm-locked-card", h: "Today comes with Shepherd", p: "This preview is showing Care. Shepherd adds this view, the guest pipeline, the locked care inbox, the member app and drafts that wait for approval." },
        { sel: PLAN_SEL, h: "Switch the plan any time", p: "Shepherd and Plus are one tap away, so a church sees exactly what each plan adds." }
      ] };
      var recorded = GM.isIncluded("access") ? "a record of who opened what" : "every open recorded (Plus adds the Access Record screen)";
      return { title: "Today", done: "That is Today. One calm list of what needs a person, so nobody falls through the cracks.", steps: [
        { sel: T("today.hope"), h: "{assistant} reads the week first", p: "New guests, care waiting on us and drafts to approve, counted for the pastor, with one question to ask." },
        { sel: T("today.next"), h: "Your next move", p: "One guest or care item at a time, most important first, with an owner and a reason. Next and Skip for Now work through the list." },
        { sel: T("today.glance"), h: "The day at a glance", p: "New guests, care waiting on us and follow-ups due. Each number opens the list behind it." },
        { sel: T("today.drafts"), h: "{assistant} drafts, a person decides", p: "Welcome notes are labelled and wait for approval. Nothing goes out on its own." },
        { sel: [T("today.seen"), T("today.care")], h: "What each role sees on Today", p: "Switch to Staff and the prayer rows disappear: an office manager sees only that prayer is with the pastors and the prayer team. Topics only, even for pastors." },
        { sel: T("today.protect"), h: "Protecting people is built in", p: "Private prayer, alerts with no private words, " + recorded + ", archive instead of delete, and email-first follow-up." },
        { sel: PLAN_SEL, h: "Show any plan", p: "Switch between Care, Shepherd and Plus any time. Locked parts stay in the menu and explain what they add." }
      ] };
    },
    "church-website": { title: "The website package", done: "That is what every plan starts with: a website people can use, {assistant} on it, a brand board, a social plan and forms that reach the right person.", steps: [
      { sel: T("website.site"), h: "The website, live in its look", p: "{church.name}'s site in the {church.look} look, built for phones first. {assistant} answers questions on it from facts the church approved." },
      { sel: T("website.kit"), h: "Brand board and social plan", p: "A brand board any volunteer can follow, and a plan that turns one Sunday message into a week of posts." },
      { sel: T("website.visit"), h: "A Plan a Visit email, as the church gets it", p: "On the Care plan the form arrives by email to the address the church chose. From Shepherd it lands in Guests with an owner, and the email says only who to welcome." },
      { sel: T("website.prayer"), h: "Prayer forms, honestly", p: "On the Care plan the words travel in the email, to the pastors' address only. Shepherd keeps prayer in a locked inbox, and the email says only: New request. Sign in to read." },
      { sel: PLAN_SEL, h: "See what Shepherd adds", p: "Switch to Shepherd to see the same Plan a Visit become a guest with an owner and a next step." }
    ] },
    "church-settings": { title: "Settings", done: "That is Settings. Genesis Ministry works beside the tools a church already uses, and Genesis signs in only when the church asks.", steps: [
      { sel: T("settings.tools"), h: "Works with your tools", p: "Giving opens your provider. Events, groups and kids check-in open Planning Center or Subsplash. People can be imported at onboarding, so nobody is entered twice." },
      { sel: T("settings.alerts"), h: "How follow-up and alerts travel", p: "Guest follow-up by email, texting off unless you turn it on. The pastor on call gets an email and a phone notification, with no private words." },
      { sel: T("settings.support"), h: "Genesis signs in only when you ask", p: "Support sessions are off. When you open one, it is recorded where you can see it. An honest limit is written plainly." },
      { sel: T("settings.data"), h: "Your data is yours", p: "Export everything any time, and a full export if you ever leave." }
    ] },
    "church-guests": function () {
      var reportNote = GM.isIncluded("reports") ? "" : "The Guest Report has a small lock. It comes with " + levelOf("reports").code + ".";
      return { title: "Guests", done: "That is the front office. Every first-time guest has an owner, a next step and a date, and the guests who go quiet are caught, not lost.", steps: [
        { sel: VIEWS_SEL, h: "One pipeline, six ways to look", p: "Needs You, All Guests, By Stage, Drafts Waiting, Gone Quiet and the Guest Report. The same guests, sorted for the job in front of you.", note: reportNote },
        { sel: T("guests.pulse"), h: "The front office in three numbers", p: "Guests with an open next step, new this week, and follow-ups due." },
        { sel: T("guests.next"), h: "The guest to welcome first", p: "Owner, next step, due date and why now, with one gold action. Guests come from Plan a Visit, {assistant}, connect cards, events and the newsletter." },
        { sel: T("guests.safety"), h: "Nobody falls through", p: "Checked every morning: nobody without an owner, nobody without a next step, and two guests who have gone quiet. Hector M. is away this week, so Owner Away moved his guests to Nadia K. until he is back." },
        { sel: ['#v2-workspace-rail a[data-shell-view="quiet"]', ".v2-view-picker"], h: "Gone Quiet", p: "No reply after two emails, or a planned visit missed. Each gets one gentle last note, then a choice to close it with a reason: moved, found another church, or asked us to stop." },
        { sel: T("guests.list"), h: "Every guest, with an owner", p: "Source, stage, next step and due date for each guest. By Stage shows the board from New to Serving." },
        { sel: T("guests.email"), h: "Email first", p: "Follow-up goes by email. Texting stays off unless the church turns it on, and every welcome note waits for a person." }
      ] };
    },
    "church-guest": { title: "One guest", done: "That is one guest's record. One owner, one next step, and a welcome that never goes out without a person.", steps: [
      { sel: T("guest.next"), h: "One owner, one next step", p: "Name, source, planned visit, stage and due date, with the recommended step and one gold action." },
      { sel: T("guest.about"), h: "Only what they chose to share", p: "Facts in general terms. Family is described generally, and kids' names are never kept." },
      { sel: T("guest.contact"), h: "Reach them the way they asked", p: "Email first, a phone call only if asked, and text messages off unless the church turns texting on. One click stops guest emails." },
      { sel: T("guest.path"), h: "New to Serving", p: "The six-stage path, the next step with its owner and date, and Move Stage. Every change lands in the timeline." },
      { sel: ["#draft", T("guest.draft")], h: "A welcome note that waits", p: "{assistant} drafted it from what the guest shared. Approve and Send, Edit or Not Now. A pastor's call is never drafted." },
      { sel: [T("guest.close"), T("guest.timeline")], h: "Owner away, or time to close", p: "Owner Away hands every guest to someone else until the owner is back. Close This Guest asks for a reason, moved, found another church or asked us to stop, then archives it and counts it in the Guest Report." },
      { sel: T("guest.protect"), h: "Who can see this guest", p: "Staff with guest access and pastors. Prayer never shows here, every open is recorded, and records are archived, never deleted." }
    ] },
    "church-guests-report": { title: "Guest report", done: "That is the guest report. Where guests come from and where they stall, in counts only.", steps: [
      { sel: T("report.privacy"), h: "Counts only", p: "No names, no prayer and no private words. The last 12 months, sized for {church.short}." },
      { sel: T("report.glance"), h: "Three report metrics", p: "New guests in 12 months, the median time to first contact, and the second visit rate." },
      { sel: T("report.move"), h: "The highest-impact move", p: "Guests who visited but have not come to Start Here yet, with one gold action to open them By Stage." },
      { sel: T("report.path"), h: "The guest path", p: "Each stage with the share kept, and where guests came from in the last 90 days." },
      { sel: T("report.speed"), h: "Time to first contact", p: "The monthly median against a goal of within a day." },
      { sel: T("report.return"), h: "Who comes back", p: "Second visits by month, and how long each step of the path takes." }
    ] },
    "church-care": function () {
      var personNote = GM.isIncluded("people") ? "" : "Open Person comes with " + levelOf("people").code + ", which adds a page for each person.";
      var recorded = GM.isIncluded("access") ? "a record of who looked" : "every open recorded (Plus adds the Access Record screen)";
      /* On phones the thread pane opens over the list, so these steps open the first conversation,
         or go back to the list, before they are drawn. */
      var phone = window.innerWidth <= 860;
      function openFirst() { if (!phone || document.querySelector("#cr-shell.has-thread")) return; var b = document.querySelector("#cr-list .v2-thread-row"); if (b) b.click(); }
      function backToList() { if (!phone || !document.querySelector("#cr-shell.has-thread")) return; var b = document.querySelector('#cr-pane [data-cr="back"]'); if (b) b.click(); }
      return { title: "Care", done: "That is care. Prayer stays with pastors and the prayer team, a person writes every reply to prayer, and nothing private travels by email.", steps: [
        { sel: VIEWS_SEL, h: "One inbox, four ways in", p: "Waiting on Us, Prayer, Messages and Archived. The same inbox, sorted for the job at hand.", before: backToList },
        { sel: T("care.roles"), h: "See what each role sees", p: "Switch between Pastor, Prayer Team and Staff. Prayer disappears for staff, and messages disappear for the prayer team.", before: backToList },
        { sel: T("care.waiting"), h: "Oldest waiting first", p: "Each thread shows its owner and how long it has waited. Prayer and private threads show a lock instead of a preview.", before: backToList },
        { sel: T("care.thread"), h: "Archive, never delete", p: "The open conversation, with Open Person and Archive. In a crisis, the person gets 988 and 911 right away and the pastor on call is alerted.", note: personNote, before: openFirst },
        { sel: T("care.visibility"), h: "Who can see this", p: "A lock badge, the names of the people who can see it, and an owner chosen only from them.", before: openFirst },
        { sel: T("care.reply"), h: "Replies stay inside", p: "On everyday questions {assistant} may draft a labelled reply that waits for approval; on prayer and private threads a person writes every word. The person gets one email: You have a reply. Sign in to read.", before: openFirst },
        { sel: [T("care.minor"), T("care.protect")], h: "If someone under 18 writes in", p: "Staff stop the private thread, bring in a parent and follow the church's child protection policy. Care is protected with " + recorded + ", alerts with no private words and archive instead of delete." }
      ] };
    },
    "church-person": function () {
      if (MODE === "list") return { title: "People", done: "That is People. Everyone once, with the next person to check on at the top.", steps: [
        { sel: T("person.pulse"), h: "Everyone, once", p: "Members, regulars and guests on the path. Each person has one record." },
        { sel: T("person.next"), h: "The person to check on first", p: "The earliest open reminder with its owner, and one gold action to open the page." },
        { sel: [T("person.list") + " .v2-table-meta", T("person.list") + " .v2-mobile-deal-row", T("person.list")], h: "Search, filter and sort", p: "Care waiting, reminders and the shepherd for each person. This preview shows a sample of the church's records. Members never see a directory." },
        { sel: [T("shell.genesis"), T("shell.hope")], h: "Ask {assistant} about anyone's next step", p: "{assistant} answers in counts and owners, and only sees what the person asking is allowed to see." },
        { sel: [T("shell.jump"), ".v2-mobile-command"], h: "Jump to anyone", p: "Ctrl K opens Jump to, so a pastor reaches any screen or view in a couple of keys." }
      ] };
      return { title: "One person", done: "That is one person's page. Everything about someone in one place, and each part visible only to the people who should see it.", steps: [
        { sel: T("person.card"), h: "One record per person", p: "How they attend, an adult account confirmed, and a note that this open is recorded. The next step sits right here." },
        { sel: T("person.who"), h: "Contact, behind a lock", p: "Email, phone and how they like to be reached, visible to staff and pastors only." },
        { sel: T("person.prayer"), h: "Prayer with a history", p: "Locked to pastors and the prayer team. An older request is attached only when the person asks." },
        { sel: T("person.gifts"), h: "Gifts, only after a yes", p: "Locked to pastors and named leads. The score is plain arithmetic, and {assistant} never sets it.", module: "gifts" },
        { sel: T("person.notes"), h: "Private pastor notes", p: "Pastors only. Never shown to the person, to staff or to the prayer team, and archived instead of deleted." },
        { sel: T("person.access"), h: "Who opened this record", p: "Taken from the access record, which nobody can edit." },
        { sel: T("person.requests"), h: "Their information is theirs", p: "A copy or a removal on request. A removal waits for the lead pastor." }
      ] };
    },
    "church-gifts": { title: "Gifts of our church", done: "That is the gifts picture. Pastors see where people might serve, and every name is there only because that person said yes.", steps: [
      { sel: T("gifts.glance"), h: "Counts only", p: "How many finished, in person and online, how many said yes to sharing, and who wants to talk about serving." },
      { sel: T("gifts.move"), h: "Ready for a conversation", p: "People who said yes, asked to talk about serving and are not serving yet." },
      { sel: [T("gifts.chart") + " .v2-section-head", T("gifts.chart") + " .v2-viz-head", T("gifts.chart")], h: "Hidden until 25 finish", p: "The chart waits until 25 people finish. When a part of a bar is fewer than 5, only the total is drawn, so no one can be worked out. The Before 25 Finish switch shows the waiting state." },
      { sel: [T("gifts.finder") + " .v2-section-head", T("gifts.finder")], h: "The finder", p: "Pick a gift, a team and serving status. Only people who said yes are ever listed by name." },
      { sel: [T("gifts.teams") + " .v2-section-head", T("gifts.teams")], h: "Gifts to teams", p: "Teams with people who said yes and are not serving yet. Because they said yes, exact counts are shown, and the church's own gift list sits beside it." },
      { sel: T("gifts.protect"), h: "Plain arithmetic", p: "Scores are added up, never guessed. {assistant} never sets a score, and nothing private feeds it." }
    ] },
    "church-reports": { title: "Reports", done: "That is Reports. Counts a pastor can act on, and nothing that could expose a person.", steps: [
      { sel: [T("reports.tabs"), ".v2-report-picker"], h: "Four reports, one place", p: "Summary, Care, Guests to Members and Gifts Completion. On phones it is a picker." },
      { sel: T("reports.glance"), h: "Three numbers a pastor reads first", p: "Median hours to a first reply, care waiting on us now, and guests who became members this year." },
      { sel: T("reports.move"), h: "The highest-impact move", p: "Care that has waited more than a day, with one gold Open Care action." },
      { sel: T("reports.reply"), h: "Reply time against a goal", p: "Hours to a first reply by week, against a one-day goal. One axis, and View as Table on every chart." },
      { sel: T("reports.path"), h: "From guest to serving", p: "Twelve months of the guest path, stage by stage." },
      { sel: T("reports.protect"), h: "What reports never show", p: "No names or private words, fewer than 5 for small counts in the gifts picture and prayer topics, filtered by role, and every export recorded." }
    ] },
    "church-team": { title: "Team roles", done: "That is Team. Roles decide who sees what, and every change goes to the lead pastor.", steps: [
      { sel: VIEWS_SEL, h: "Roles and the record", p: "Team Roles decide who can see what. The Access Record shows what people actually opened." },
      { sel: T("team.glance"), h: "Seats and safety", p: "Staff seats in use for this plan, who can open prayer, and two-step sign in for everyone. Shepherd names the prayer team; Plus adds custom roles and named gift viewers." },
      { sel: T("team.next"), h: "A role to confirm", p: "A new prayer team member waits for the lead pastor, with one gold Confirm action." },
      { sel: T("team.list"), h: "Every person and role", p: "Role, whether they open prayer or gift names, two-step and last sign in." },
      { sel: T("team.prayer"), h: "Who can open prayer", p: "Pastors and the prayer team, enforced by the system, with the last blocked try." },
      { sel: T("team.security"), h: "Sign in and safety", p: "Two-step for staff, alerts with no private words, the pastor on call reached by email and phone notification, guest texting off, and support sessions off unless the church opens one." },
      { sel: T("team.changes"), h: "Changes go to the lead pastor", p: "Every role change is logged and emailed. When someone steps down, access ends and nothing is deleted." }
    ] },
    "church-access": { title: "Access record", done: "That is the access record. Every open is written down, nobody can change it, and a blocked try is never hidden.", steps: [
      { sel: VIEWS_SEL, h: "Roles and the record", p: "Roles decide who can see what. This screen shows what people actually opened." },
      { sel: T("access.glance"), h: "The week in three numbers", p: "Entries since Sunday, prayer opened by pastors and the prayer team only, and blocked attempts." },
      { sel: T("access.blocked"), h: "A blocked attempt, recorded", p: "An office manager followed an old forwarded link to a prayer request. The system checks the role on every open, so nothing was shown, and it was written down." },
      { sel: T("access.log"), h: "Newest first, never edited", p: "It names the record, never what it says. Entries are added and never changed." },
      { sel: T("access.readonly"), h: "Nobody can edit it", p: "A mistake is corrected with a new entry. Genesis signs in only in a support session the church opens, and that session is recorded here. The honest limit is written beside it." },
      { sel: T("access.roles"), h: "Role changes go to the lead pastor", p: "The email the lead pastor gets, and every role change and ended access." }
    ] },

    /* ---------------- The member app (the church's brand, Hope as the guide) ---------------- */
    "member-home": { title: "Home", done: "That is the member's home: their own prayer, their own messages and three clear buttons, in {church.short}'s colors.", steps: [
      { sel: T("home.hello"), h: "A home in {church.short}'s colors", p: "Members sign in with a code and land here, with a greeting and a notice when the church has replied." },
      { sel: T("home.actions"), h: "Three clear buttons", p: "Ask for Prayer, Send a Message and Talk About Serving. Each one reaches the right person." },
      { sel: T("home.prayer"), h: "Their own prayer requests", p: "Each with its status and a lock that shows exactly who can see it." },
      { sel: T("home.profile"), h: "Their information stays theirs", p: "Adult account confirmed with the date, and Ask for a Copy or Ask to Remove My Information." },
      { sel: [".hd-launch", ".mx-hope"], h: "{assistant}, in {church.short}'s colors", p: "Members can ask {assistant} questions any time. {assistant} answers from facts the church approved and hands anything personal to a real person." },
      { sel: '.m-stagebar [data-tour="shell.switcher"]', h: "The same app, each church's brand", p: "Switch between Lightwell, Lampstand, Calder Hill and Goldenrod. Same app, each church's own colors and type." },
      { sel: ".mx-about", h: "How it protects people", p: "Beside the phone: what this screen does to protect people, and a link to the same moment in the church workspace." }
    ] },
    "member-prayer": { title: "Prayer", done: "That is prayer in the member app. Private to the people they chose, with help on the page and a person behind every reply.", steps: [
      { sel: T("prayer.form"), h: "Prayer in a few taps", p: "The member is already signed in. The pastors get an alert that says only: New request. Sign in to read." },
      { sel: T("prayer.visibility"), h: "They choose who sees it", p: "Pastors and the prayer team, or pastors only, with the names shown." },
      { sel: T("prayer.help"), h: "Help is always on the page", p: "911 and 988 with the church phone, on every prayer form." },
      { sel: T("prayer.secrecy"), h: "An honest promise", p: "Prayer is private, and the page never promises total secrecy when someone is being harmed." },
      { sel: T("prayer.history"), h: "A history with replies", p: "Every request, any reply, who can see it, and Add an Update." }
    ] },
    "member-messages": function () {
      if (MODE === "new") return { title: "New message", done: "Three doors, each clearly labelled, so a member always knows who will read what they write.", steps: [
        { sel: T("messages.new"), h: "Three clear doors", p: "A question for the office, something private for a pastor, or talk about serving. Each says who will read it." }
      ] };
      return { title: "Messages", done: "That is Messages. Their own conversations with the church, a person on every reply, and no private words in any email.", steps: [
        { sel: T("messages.list"), h: "Only their own conversations", p: "The member's threads with the church. No directory and no forum." },
        { sel: T("messages.thread"), h: "A thread that reads easily", p: "Day markers, a New divider, who each reply came from, and a lock on private threads." },
        { sel: T("messages.composer"), h: "Reply in place", p: "With the urgent 911 and 988 line right beside the box." },
        { sel: T("messages.email"), h: "The email carries no private words", p: "It says only: You have a reply. Sign in to read." }
      ] };
    },
    "member-give": { title: "Give", done: "That is Give. The church's own giving form, one tap away, and no giving history kept in the app.", steps: [
      { sel: T("give.frame"), h: "The church's own giving form", p: "Embedded here as a placeholder. Genesis never handles the payment." },
      { sel: T("give.link"), h: "The full giving page", p: "Wallets, recurring gifts and receipts stay with the church's giving provider." },
      { sel: T("give.privacy"), h: "No giving history in the app", p: "And the other ways to give, said plainly." }
    ] },
    "member-signin": function () {
      if (MODE === "code") return { title: "Sign in", done: "A code by email, and nothing private in the email.", steps: [
        { sel: T("signin.code"), h: "Six boxes, or paste the code", p: "Typing or pasting both work, and Send a New Code is right there." },
        { sel: T("signin.mail"), h: "The code email, exactly", p: "What the member sees in their inbox. It carries nothing private." }
      ] };
      if (MODE === "adult") return { title: "Sign in", done: "Adults only, confirmed once and saved with the date.", steps: [
        { sel: T("signin.adult"), h: "Adults only, confirmed once", p: "The member says they are 18 or older, and the date is saved." }
      ] };
      return { title: "Sign in", done: "Sign in is a code by email, no password, adults only.", steps: [
        { sel: T("signin.email"), h: "No password to forget", p: "A 6 digit code arrives by email. Signing in the first time creates the account." },
        { sel: T("signin.google"), h: "Or Continue with Google", p: "The other way in, for members who prefer it." },
        { sel: T("signin.adults"), h: "Adults only", p: "Member accounts are for people 18 and older, confirmed once." },
        { sel: T("signin.privacy"), h: "What we keep and why", p: "No directory, and members can ask for a copy or for removal at any time." }
      ] };
    },
    "member-welcome": { title: "First question", done: "One light question, and nothing is blocked whatever they answer.", steps: [
      { sel: T("welcome.choices"), h: "One light first question", p: "I attend in person, I join online, or I am new or exploring." },
      { sel: T("welcome.continue"), h: "Nothing is blocked", p: "Whatever they pick, they can go on, and Skip for Now is always there." },
      { sel: T("welcome.note"), h: "Who can see the answer", p: "Said plainly, right under the question." }
    ] },
    "member-gifts": function () {
      if (MODE === "talk") return { title: "Gifts conversation", done: "One statement at a time, in the church's own voice, saved after every tap.", steps: [
        { sel: T("gifts.progress"), h: "Two rounds, saved as they go", p: "Progress at the top, and Saved just now after every tap." },
        { sel: T("gifts.thread"), h: "It reads like a conversation", p: "Earlier answers stay in view, with short lines in the church's voice between sections." },
        { sel: T("gifts.statement"), h: "One statement at a time", p: "Five answers, from Not me to That is me. No trick questions." }
      ] };
      if (MODE === "words") return { title: "Gifts conversation", done: "Their own words are welcome, and they never change the score.", steps: [
        { sel: T("gifts.words"), h: "In their own words", p: "Two optional questions. They never change the score." }
      ] };
      if (MODE === "done") return { title: "Gifts conversation", done: "Done, and worked out by plain arithmetic.", steps: [
        { sel: T("gifts.done"), h: "Done", p: "The result is gifts to explore, worked out by plain arithmetic." }
      ] };
      return { title: "Gifts conversation", done: "A spiritual gifts conversation that feels like a friend asking, not a test.", steps: [
        { sel: T("gifts.welcome"), h: "What to expect", p: "About 10 minutes, saved after every tap, a gentle guide, and names shared only with a yes." },
        { sel: T("gifts.start"), h: "Start, or pick up again", p: "One button starts the conversation or continues where they left off." }
      ] };
    },
    "member-gifts-result": { title: "Gifts to explore", done: "Gifts to explore, never a verdict, with one easy step toward serving.", steps: [
      { sel: T("result.gifts"), h: "Gifts to explore, not a verdict", p: "Each with a definition, a scripture and the teams where it often fits. Ties are shown." },
      { sel: T("result.math"), h: "How we added it up", p: "Plain arithmetic, scores out of 25. No AI sets a score." },
      { sel: T("result.note"), h: "Words the pastors approved", p: "The closing note is built only from sentences the pastors wrote." },
      { sel: T("result.share"), h: "Sharing is their choice", p: "Yes or Not Yet, naming exactly who would see their name." },
      { sel: T("result.serve"), h: "One step toward serving", p: "I Would Like to Talk About Serving reaches the serving teams lead in Messages." }
    ] }
  };

  /* A screen outside the plan: a short tour of its calm locked state. */
  function lockedTour(moduleKey) {
    var m = D.modules[moduleKey] || { label: "This screen", level: 3, adds: "", points: [] };
    var lv = GM.level(m.level), cur = GM.level();
    var steps = [
      { sel: [".gm-locked-card", ".m-locked"], h: m.label + " is included in " + lv.name, p: fill(m.adds.replace(/\bHope\b/g, AN)) + " This preview is showing " + cur.name + ". " + lv.name + " adds this view." },
      { sel: [".gm-locked-card .gm-checks", ".m-locked .m-checks"], h: "What it adds", p: (m.points || []).slice(0, 3).join(". ") + "." },
      { sel: PLAN_SEL, h: "Preview " + lv.code, p: "Switch the plan to see this screen working. A locked part keeps its place and says which plan adds it." }
    ];
    if (!MEMBER) steps.push({ sel: ['.v2-nav a[aria-current="page"]'], h: "It keeps its place in the menu", p: "Locked screens stay in the menu with a small lock, so a church sees what it can grow into." });
    var named = { "Member App": "the member app", "Access Record": "the access record", "My Gifts": "the gifts conversation" }[m.label] || m.label;
    return { title: m.label, done: lv.name + " adds " + named + ". Compare every plan, or switch the plan shown.", steps: steps };
  }

  function currentTour() {
    var ctx = GM.ctx || {};
    var t;
    if (ctx.locked && (!ctx.customLocked || document.querySelector(".gm-locked-page, .m-locked") || (FILE === "church-guests-report"))) {
      if (FILE !== "church-today") t = lockedTour(ctx.module);
    }
    if (!t) {
      var def = TOURS[FILE];
      t = typeof def === "function" ? def() : def;
    }
    if (!t) {
      var own = GM.tourSteps && GM.tourSteps();
      if (own && own.length) t = { title: (document.body.getAttribute("data-title") || ""), steps: own.map(function (s) { return { sel: s.target, h: s.title, p: s.text }; }) };
    }
    return t || null;
  }
  /* Short member tours borrow from the stage around the phone, so every tour has four to seven steps. */
  var MEMBER_EXTRAS = [
    { sel: ".mx-about", h: "How this screen protects people", p: "Beside the phone: what this screen does to keep people safe, and a link to the same moment in the church workspace." },
    { sel: ".mx-screens", h: "Every screen of the member app", p: "The member app in order, from sign in to gifts. A screen outside the plan shows the plan that adds it.", place: "edge-left" },
    { sel: '.m-stagebar [data-tour="shell.plan"]', h: "Show any plan", p: "Care, Shepherd or Plus. On Care, the app shows a calm Included in Shepherd state, never a broken page." },
    { sel: [".hd-launch", ".mx-hope"], h: "{assistant}, in {church.short}'s colors", p: "Members can ask {assistant} questions any time. {assistant} answers from facts the church approved and hands anything personal to a real person." }
  ];
  function padMember(t) {
    if (!MEMBER || !t || !t.steps) return t;
    var have = t.steps.map(function (s) { return String(s.sel); });
    function shown(sel) { return [].concat(sel).some(function (q) { try { var n = document.querySelector(q); return !!(n && n.getClientRects().length); } catch (e) { return false; } }); }
    var live = t.steps.filter(function (s) { return shown(s.sel); }).length;
    var steps = t.steps.slice();
    MEMBER_EXTRAS.forEach(function (x) { if (live < 4 && have.indexOf(String(x.sel)) < 0 && shown(x.sel)) { steps.push(x); live++; } });
    return { title: t.title, done: t.done, steps: steps };
  }
  /* Plan-aware steps: a step about a module outside the plan says which plan adds it. */
  function compile(t) {
    if (!t) return [];
    t = padMember(t);
    var out = [];
    var phone = window.innerWidth <= 860;
    (t.steps || []).forEach(function (s) {
      if (s.only === "phone" && !phone) return;
      if (s.only === "wide" && phone) return;
      if (s.module && !GM.isIncluded(s.module)) {
        var m = D.modules[s.module], lv = levelOf(s.module);
        out.push({ sel: s.lockSel || PLAN_SEL, h: (s.lockLabel || m.label) + " comes with " + lv.name, p: fill(m.adds.replace(/\bHope\b/g, AN)), note: "This preview is showing " + GM.level().code + ". Switch the plan to see it." });
        return;
      }
      /* The Hope circle shows on wide screens; on phones Hope lives in the stage bar. */
      var sel = Array.isArray(s.sel) && s.sel[0] === ".hd-launch" ? (window.innerWidth > 520 ? ".hd-launch" : s.sel.slice(1)) : s.sel;
      out.push({ sel: sel, h: fill(s.h), p: fill(s.p), note: s.note ? fill(s.note) : "", k: MEMBER ? AN + " · " + screenOf() + fill(t.title) : undefined, before: s.before, place: s.place });
    });
    return out;
  }

  /* ------------------------------------------------------------------ Genesis screens: the dock */
  function dockAnswers() {
    var list = RULES.map(function (r) { return { match: r[0], answer: ANSWERS[r[1]] }; });
    list.unshift({ match: /\b(tours?|walk ?through|show me around|guide me|guided demo)\b/i, answer: function () {
      setTimeout(function () { GM.hope.close(); GM.demo.start(); }, 900);
      return "Starting the guided demo of this screen. Use Next to move on, or press Escape to stop.";
    } });
    return list;
  }

  /* ------------------------------------------------------------------ member screens: Hope in the church's brand */
  function memberConfig(tour, nx) {
    var c = GM.church, th = c.theme;
    var chipsAbout = [
      { label: "Who Sees Prayer Requests?", key: "prayerwho" },
      { label: "What Happens in a Crisis?", key: "crisisinfo" },
      { label: "What Do Members Need to Sign In?", key: "signin" },
      { label: "What Does Each Plan Include?", key: "levels" }
    ];
    function a(text, chips) { return { t: text, c: chips || chipsAbout.slice(0, 3) }; }
    return {
      look: c.look,
      assistantName: AN,
      guideName: AN,
      tourTitle: tour ? screenOf() + fill(tour.title) : "",
      church: { name: c.name, short: c.short, city: c.city + ", " + c.state, phone: c.phone, times: c.times },
      brand: { accent: th.accent, accentInk: th.onAccent, accentText: th.accentInk, ink: th.text, surface: th.surface, surface2: th.surface3, line: th.lineStrong, font: th.body, radius: th.radiusLg, buttonRadius: th.btnRadius },
      greeting: "Hi, I am " + AN + ", the assistant in " + c.short + "'s member app. This is a design preview with sample data. Want a short tour of this screen, or do you have a question?",
      menu: [
        { label: "Take the Guided Demo", key: "tour", cta: true },
        { label: "Who Sees Prayer Requests?", key: "prayerwho" },
        { label: "What Happens in a Crisis?", key: "crisisinfo" },
        { label: "What Do Members Need to Sign In?", key: "signin" },
        { label: "Does It Replace Planning Center?", key: "pco" },
        { label: "What Does Each Plan Include?", key: "levels" }
      ],
      answers: addMore({
        platform: a(ANSWERS.platform, [{ label: "What Does Each Plan Include?", key: "levels" }, { label: "Take the Guided Demo", key: "tour", cta: true }]),
        prayerwho: a(ANSWERS.prayer, [{ label: "What Happens in a Crisis?", key: "crisisinfo" }, { label: "How Is the AI Limited?", key: "ai" }]),
        crisisinfo: a(ANSWERS.crisis, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "How Is the AI Limited?", key: "ai" }]),
        ai: a(ANSWERS.ai, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "What Is Genesis Ministry?", key: "platform" }]),
        pco: a(ANSWERS.pco, [{ label: "What Does Each Plan Include?", key: "levels" }]),
        signin: a(ANSWERS.signin, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "Is Texting On?", key: "texting" }]),
        texting: a(ANSWERS.texting, [{ label: "What Do Members Need to Sign In?", key: "signin" }]),
        custom: a(ANSWERS.custom, [{ label: "What Does It Cost?", key: "price" }, { label: "What Does Each Plan Include?", key: "levels" }]),
        levels: a(ANSWERS.levels, [{ label: "What Does It Cost?", key: "price" }, { label: "Can We Customize It?", key: "custom" }]),
        contact: a(ANSWERS.contact, [CONTACT_CHIP, { label: "What Is Genesis Ministry?", key: "platform" }]),
        price: a(ANSWERS.price, [CONTACT_CHIP, { label: "What Does Each Plan Include?", key: "levels" }, { label: "Can We Customize It?", key: "custom" }]),
        giftsinfo: a("The gifts conversation takes about 10 minutes and saves after every tap. It gives gifts to explore, worked out by plain arithmetic, and a member's name is shared with the pastors only after a yes. It comes with " + levelOf("member-gifts").code + ".", [{ label: "How Is the AI Limited?", key: "ai" }]),
        give: a("Give opens " + c.short + "'s own giving form. Genesis never handles the payment, and the app keeps no giving history. Recurring gifts and receipts stay with the church's giving provider.", [{ label: "Does It Replace Planning Center?", key: "pco" }]),
        times: a(c.short + " gathers " + c.times + " in " + c.city + ". The church website has the address, directions and what to expect on a first Sunday.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }])
      }, a, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "What Does Each Plan Include?", key: "levels" }]),
      match: RULES.map(function (r) { return [r[0], r[1] === "prayer" ? "prayerwho" : r[1] === "crisis" ? "crisisinfo" : r[1]]; }).concat([
        [/spiritual gifts?|gifts? (conversation|assessment|test|result)|my gifts/i, "giftsinfo"],
        [/\b(giv(e|ing)|tith\w*|donat\w*|offerings?)\b/i, "give"]
      ]),
      fallback: "Good question. In " + c.short + "'s app I answer from facts the church approved, or I pass it to a real person on the team. For this preview, try one of these.",
      note: "Design preview. Answers are scripted from sample data.",
      tour: function () { return compile(tour); },
      tourIntro: "Here we go. I will walk you through this screen one part at a time. Use Next to move on, or press Escape to stop.",
      next: nx,
      finale: { text: tour ? fill(tour.done) : "", chips: [{ label: "Take the Tour Again", key: "tour" }].concat(chipsAbout.slice(0, 2), endOfDemo(nx) ? [CONTACT_CHIP] : []) },
      endLink: endOfDemo(nx) ? CONTACT_LINK : null,
      autoStartParam: "tour",
      keepParams: ["church", "plan", "from"],
      autoInvite: false,
      placement: "side",
      bottomOffset: 0,
      topInset: function (sp) {
        var mt = document.querySelector(".m-app .m-top");
        var h = mt ? mt.offsetHeight : 0;
        if (sp) return h + 8;
        var top = mt ? parseFloat(getComputedStyle(mt).top) || 0 : 0;
        return Math.max(top + h, 44) + 8;
      }
    };
  }

  /* ------------------------------------------------------------------ Genesis screens: the real guide */
  function genesisConfig(tour, nx) {
    return {
      skin: "genesis",
      assistantName: AN,
      guideName: GUIDE,
      tourTitle: tour ? screenOf() + fill(tour.title) : "",
      tour: function () { return compile(tour); },
      next: nx,
      finale: { text: tour ? fill(tour.done) : "", askLabel: "Ask " + AN, links: endOfDemo(nx) ? [CONTACT_LINK] : [] },
      endLink: endOfDemo(nx) ? CONTACT_LINK : null,
      openChat: function (prompt) { GM.hope.open(prompt || ""); },
      autoStartParam: "tour",
      keepParams: ["church", "plan", "from"],
      autoInvite: false,
      inviteKey: "gm.demo.invited",
      invite: { text: "Want the guided demo? It starts on this screen.", caption: "A few short steps on each screen, from Today to the member app and back. Sample data only. Nothing is sent." }
    };
  }

  /* ------------------------------------------------------------------ the story pages */
  /* index.html and journey.html (geai.us look, story/story.js) load this file on their own,
     without the shell. They get a tour in the geai.us colors with GUIDE as the guide, a chat
     circle for questions with the same scripted answers, and a last step that starts the demo. */
  function storyPages() {
    var file = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/i, "") || "index";
    /* The templates gallery is the root index.html, one folder above platform/. */
    var gallery = file === "index" && !/\/platform\//.test(location.pathname);
    if (gallery) file = "gallery";
    var PRE = gallery ? "platform/" : "";
    var TS = {
      index: { title: "The overview", done: "That is the front door. Start the Guided Demo to walk through one church's week, screen by screen, then come back here.", steps: [
        { sel: ".hero .hero-copy", h: "Edition 05 of Genesis OS", p: "Genesis Ministry is one platform for a church of about 100 to 1,000 people: a website in its own look, " + AN + " for guests, and a workspace where nobody falls through the cracks." },
        { sel: ".tenant", h: "Show the demo as any church", p: "Four made up churches, one in each look. The choice carries through every screen, in the workspace and in the member app." },
        { sel: "#doors", h: "Every part, one door each", p: "From the front office to what members see on their phones, then the journey and the four looks. Each screen opens with sample data and its own short tour." },
        { sel: "#rules", h: "Care comes with rules", p: "Prayer stays with pastors and the prayer team, alerts carry no private words, a person approves every draft, and nothing is deleted." },
        { sel: "#levels", h: "Start where the church is", p: "Care, Shepherd and Plus, with Enterprise for more than one campus. Each Demo This Plan button starts the tour on that plan. Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month." },
        { sel: ".close-band", h: "One Sunday, start to finish", p: "Start the Guided Demo opens Today and walks through every screen, then brings you back here." }
      ] },
      gallery: { title: "The four looks", done: "That is the gallery. Start the Guided Demo to see what sits behind the website, screen by screen.", steps: [
        { sel: ".hero .hero-copy", h: "Four looks, one standard", p: "Every Genesis Ministry church gets a website in one of four looks, filled with its own story, photos and colors." },
        { sel: "#looks", h: "Pick the look that fits", p: "Each look opens as a full sample church site, with its brand board and social plan. " + AN + " answers questions on every one." },
        { sel: "#package", h: "One package", p: "The website, a brand board, a social marketing plan and " + AN + ", on every plan. Customization beyond the template is available for an additional cost." },
        { sel: "#platform", h: "What sits behind the website", p: "From Shepherd, a front office for guests, a care inbox and a member app. The front door and the journey explain it." },
        { sel: ".close-band", h: "See it working", p: "Start the Guided Demo opens Today and walks through every screen with sample data." }
      ] },
      journey: { title: "The journey", done: "That is how Genesis Ministry works, start to finish. Now see it working, screen by screen.", steps: [
        { sel: [".chapters", ".hero"], h: "Four chapters", p: "A guest's path, privacy, what the AI does, and the plans." },
        { sel: "#guest", h: "From a late night search to a place to serve", p: "Every first-time guest gets an owner, a next step and a date, from New to Serving." },
        { sel: "#privacy", h: "One record per person", p: "Prayer for pastors and the prayer team, alerts with no private words, a record of who opened what, and archive instead of delete." },
        { sel: "#ai", h: "It drafts, then waits", p: AN + " drafts, summarizes and sorts. A person approves everything, and " + AN + " never sets a gifts score." },
        { sel: "#levels", h: "Care, Shepherd, Plus", p: "Each plan adds to the one before, with Enterprise for more than one campus. Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month." }
      ] }
    };
    var t = TS[file] || TS.index;
    function demoHref() {
      var slug = null, plan = null;
      try { slug = sessionStorage.getItem("gm.church"); plan = sessionStorage.getItem("gm.plan"); } catch (e) {}
      slug = slug || (STORY.church && STORY.church.slug) || "bright-modern";
      plan = plan || String(STORY.plan || 3);
      return PRE + "church-today.html?church=" + encodeURIComponent(slug) + "&plan=" + encodeURIComponent(plan) + "&tour=1";
    }
    function a(text, chips) { return { t: text, c: chips }; }
    var more = [{ label: "What Does Each Plan Include?", key: "levels" }, { label: "Who Sees Prayer Requests?", key: "prayerwho" }];
    window.HOPE_DEMO = {
      look: "Genesis Ministry",
      assistantName: AN,
      guideName: GUIDE,
      tourTitle: t.title,
      church: { name: "Genesis Ministry", short: "Genesis Ministry" },
      brand: { accent: "#f2d895", accentInk: "#08090e", accentText: "#f2d895", ink: "#f4efe8", surface: "#101929", surface2: "#172237", line: "rgba(244,239,232,.18)", font: '"Satoshi", ui-sans-serif, system-ui, Arial, sans-serif', radius: "10px", buttonRadius: "6px" },
      greeting: "Hi, I am " + AN + ". This is the Genesis Ministry design preview, with sample data. Want a short tour of this page, or do you have a question?",
      menu: [
        { label: "Take the Tour", key: "tour", cta: true },
        { label: "Start the Guided Demo", key: "startdemo" },
        { label: "What Is Genesis Ministry?", key: "platform" },
        { label: "Who Sees Prayer Requests?", key: "prayerwho" },
        { label: "Book a Consultation", href: CONTACT, go: true },
        { label: "Does It Replace Planning Center?", key: "pco" }
      ],
      answers: addMore({
        startdemo: { t: "The guided demo starts on Today, the way a pastor sees it on a Thursday morning, and walks through every screen.", c: function () { return [{ label: "Start the Guided Demo", href: demoHref(), go: true, cta: true }]; } },
        platform: a(ANSWERS.platform, more),
        prayerwho: a(ANSWERS.prayer, [{ label: "What Happens in a Crisis?", key: "crisisinfo" }, { label: "How Is the AI Limited?", key: "ai" }]),
        crisisinfo: a(ANSWERS.crisis, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        ai: a(ANSWERS.ai, more),
        pco: a(ANSWERS.pco, more),
        signin: a(ANSWERS.signin, more),
        texting: a(ANSWERS.texting, more),
        custom: a(ANSWERS.custom, [{ label: "What Does It Cost?", key: "price" }]),
        levels: a(ANSWERS.levels, [{ label: "What Does It Cost?", key: "price" }, { label: "Can We Customize It?", key: "custom" }]),
        contact: a(ANSWERS.contact, [CONTACT_CHIP].concat(more)),
        price: a(ANSWERS.price, [CONTACT_CHIP, { label: "What Does Each Plan Include?", key: "levels" }])
      }, a, more),
      match: RULES.map(function (r) { return [r[0], r[1] === "prayer" ? "prayerwho" : r[1] === "crisis" ? "crisisinfo" : r[1]]; }),
      fallback: "Good question. The guided demo shows every screen with sample data, and a person at Genesis can answer the rest on a call. For now, try one of these.",
      note: "Design preview. Answers are scripted from sample data.",
      tour: t.steps.map(function (s) { return { sel: s.sel, h: s.h, p: s.p, k: GUIDE + " · " + t.title }; }),
      next: function () { return { label: "Start the Guided Demo", href: demoHref(), tour: false }; },
      finale: { text: t.done, chips: [{ label: "Take the Tour Again", key: "tour" }].concat(more) },
      autoStartParam: file === "journey" || file === "gallery" ? "tour" : "pagetour",
      autoInvite: false,
      placement: "side",
      topInset: function () { var h = document.querySelector(".site-header"); return (h ? Math.max(0, h.getBoundingClientRect().bottom) : 102) + 8; }
    };
    var s = document.createElement("script");
    s.src = SHARED_DIR + "../../shared/hope-demo.js";
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ wiring */
  var pending = false;
  GM.demo = {
    loaded: true,
    guide: GUIDE,
    path: PATH,
    key: KEY,
    start: function () { if (window.HopeDemo) window.HopeDemo.tour(); else pending = true; },
    end: function () { if (window.HopeDemo) window.HopeDemo.end(); },
    next: null
  };

  /* Demo This Plan starts the church part of the demo path on that plan. */
  function isDemoLink(a) {
    var label = (a.textContent || "").replace(/\s+/g, " ").trim();
    return a.hasAttribute("data-demo") || a.id === "sa-demo-btn" || /^Demo (This Plan|Level 0\d)$/i.test(label);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (a && isDemoLink(a) && /church-today\.html/.test(a.getAttribute("href"))) a.setAttribute("href", addParam(a.getAttribute("href"), "tour", "1"));
  }, true);
  function init() {
    var tour = currentTour();
    var nx = nextFor();
    GM.demo.next = nx;
    if (!MEMBER && GM.hope && GM.hope.addAnswers) GM.hope.addAnswers(dockAnswers(), "base");
    window.HOPE_DEMO = MEMBER ? memberConfig(tour, nx) : genesisConfig(tour, nx);

    if (tour && tour.steps && tour.steps.length) {
      if (MEMBER) { var mt = document.querySelector(".mx-tour"); if (mt) mt.hidden = false; }
      else GM.addTourButton();
    }
    if (MEMBER) {
      /* On phones Hope opens from the stage bar above the phone, so no circle covers the screen. */
      var st = document.createElement("style");
      st.textContent = "@media (max-width:520px){body .hd-invite{bottom:calc(88px + env(safe-area-inset-bottom,0px))}}";
      document.head.appendChild(st);
      var bar = document.querySelector(".m-stagebar");
      if (bar && !bar.querySelector(".mx-hope")) {
        var hb = document.createElement("button");
        hb.type = "button"; hb.className = "v2-button v2-icon-button v2-button-quiet mx-hope";
        hb.setAttribute("aria-label", "Ask " + AN); hb.title = "Ask " + AN;
        hb.innerHTML = GM.v2Icon("message");
        hb.addEventListener("click", function () { if (window.HopeDemo) window.HopeDemo.open(); });
        var themeBtn = bar.querySelector(".gm-theme-btn");
        bar.insertBefore(hb, themeBtn || null);
      }
    }

    var s = document.createElement("script");
    s.src = SHARED_DIR + "../../shared/hope-demo.js";
    s.onload = function () { if (pending) { pending = false; window.HopeDemo.tour(); } };
    document.head.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
