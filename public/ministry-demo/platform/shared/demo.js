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
  var AN = GM ? GM.assistant.name : STORY.assistant;

  /* ------------------------------------------------------------------ scripted answers */
  var PRICES = (D && D.pricingLine) || "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.";
  var LEVELS_TEXT = PRICES + " Care is the website in one of four looks, the brand board, the social marketing plan, " + AN + " on the website, Plan a Visit and prayer forms by email, and newsletter sign-up. " +
    "Shepherd is everything in Care, plus Today, the guest pipeline, the member app, the care inbox and drafts that wait for approval, with up to 8 staff seats. " +
    "Plus is everything in Shepherd, plus person pages, the Access Record screen, the spiritual gifts picture, reports, custom roles and named gift viewers, with up to 15 staff seats. " +
    "Enterprise, for more than one campus, is scoped on a call.";
  /* Where Talk With Genesis goes: one address for the whole preview (GM_DATA.genesisContact). */
  var CONTACT = (D && D.genesisContact) || (STORY && STORY.contact) || "/contact?topic=ministry-demo";
  /* Staff seats at each plan, from the plans themselves. Everyone who signs in to the workspace, the
     prayer team too, uses a seat; members never do. */
  var SEAT_WHO = " Everyone who signs in to the workspace uses a staff seat, prayer team volunteers included. Members never use one.";
  var SEAT_MORE = " More seats are available for an additional cost, quoted in writing before you sign.";
  function seatsText() {
    var lv = (D && D.levels) || [];
    if (!lv.length) return "Staff seats depend on the plan." + SEAT_WHO + SEAT_MORE;
    return lv.map(function (l) { var t = String(l.seats || ""); return l.name + ": " + t.charAt(0).toLowerCase() + t.slice(1) + "."; }).join(" ") + SEAT_WHO + SEAT_MORE;
  }
  /* One plan, in the words of LEVELS_TEXT, with its price and seats from D.levels. */
  function planText(n) {
    var l = ((D && D.levels) || [])[n - 1];
    if (!l) return LEVELS_TEXT;
    var seats = String(l.seats || "").replace(/\.?$/, ".");
    var body = {
      1: "the website in one of four looks, the brand board, the social marketing plan, " + AN + " on the website, Plan a Visit and prayer forms by email, and newsletter sign-up. One sign-in for the pastors. No staff seats are needed, because every form arrives by email.",
      2: "everything in Care, plus Today, the guest pipeline, the member app, the care inbox for prayer and messages, team roles with the prayer team named, and drafts that wait for approval. Every open of prayer is recorded. " + seats,
      3: "everything in Shepherd, plus a page for each person, the Access Record screen, the spiritual gifts conversation and the pastor's gifts picture, reports, custom roles and named gift viewers. " + seats
    }[n];
    return "The " + l.name + " plan is " + l.price + ". It is " + body;
  }
  /* Which plan a question is about. "Care" names the plan only in plan words ("the Care plan", "Care,
     Shepherd and Plus"), never in "the care inbox" or "pastoral care". */
  var PLAN_WORD = {
    care: /\bcare\b(?!\s+(?:inbox|items?|waiting|team|pastors?|threads?|meals|report|for|about|of|and prayer)\b)/i,
    shepherd: /\bshepherd\b/i,
    plus: /\bplus\b/i,
    enterprise: /\benterprise\b/i
  };
  var PLAN_RANK = ["care", "shepherd", "plus", "enterprise"];
  function plansNamed(q) { return PLAN_RANK.filter(function (k) { return PLAN_WORD[k].test(q); }); }
  var PLAN_ADDS = /\b(?:not in|isn'?t in|aren'?t in|is not in|are not in|adds?|added|adding|over|beyond|on top of|more than|extra|missing|doesn'?t (?:have|include|get)|does not (?:have|include|get)|lacks?)\b/i;
  function planKey(name) { return name === "enterprise" ? "campus" : "plan" + name; }
  /* Two or three plans named together, or a plan's price: "What's the difference between Care, Shepherd
     and Plus?" (every plan), "What's in Plus that isn't in Shepherd?" (the higher one), "What do I get
     for $299?" (that plan). */
  function planPair(q) {
    q = String(q || "");
    var names = plansNamed(q);
    if (names.length >= 3) return "levels";
    if (names.length === 2) return PLAN_ADDS.test(q) ? planKey(names[1]) : "levels";
    if (names.length === 1 && /\b(how much|costs?|price|pricing)\b/i.test(q)) return planOne(q);
    var price = /\$\s?(149|299|499)\b/.exec(q);
    if (price && !names.length) return { "149": "plancare", "299": "planshepherd", "499": "planplus" }[price[1]];
    return null;
  }
  /* One plan named on its own: "What is the Shepherd plan?", "What comes with Plus?". "Care" and "Plus"
     are everyday words too, so on their own they need plan words around them. */
  function planOne(q) {
    q = String(q || "");
    var names = plansNamed(q);
    if (names.length !== 1 || names[0] === "enterprise") return null;
    var n = names[0];
    if (n === "care" && !/\bcare (?:plan|tier|level|package)\b|\b(?:on|with) care\b(?!\s+(?:inbox|items?|team|pastors?))|\b(?:what is|what'?s|whats|about|explain|describe) care\s*[?.!]*\s*$/i.test(q)) return null;
    if (n === "plus" && !/\bplus (?:plan|tier|level|package)\b|\b(?:on|with|the|get|about|explain|describe|is|does|what'?s|whats) plus\b|^\s*plus\b/i.test(q)) return null;
    return "plan" + n;
  }
  /* A rule that is a function, shaped like a pattern (test and source), for every Hope that reads RULES. */
  function fnRule(fn, key) { return [{ source: "fn:" + key + ":" + (fn.name || ""), test: function (q) { return fn(q) === key; } }, key]; }
  var ANSWERS = {
    platform: "Genesis Ministry is the church edition of Genesis OS. Every church gets a website in one of four looks, a brand board, a social marketing plan and " + AN + " on its website. The Shepherd plan adds a front office for first-time guests, a care inbox and a member app. The Plus plan adds a page for each person, the spiritual gifts picture and reports. A person approves everything that goes out.",
    prayer: "From the Shepherd plan, only the pastors and the prayer team can read prayer, or the pastors only when the person asks for that. Staff and website admins cannot open prayer, and the system stops them if they try. Alert emails say only: New request. Sign in to read. Every open is recorded, and nobody can edit that record. The Plus plan adds the Access Record screen to search and export it. On the Care plan, prayer forms go by email to the pastors' address, words and all.",
    /* A church on the Care plan has no prayer inbox yet: the form goes by email, words and all. */
    prayer01: "On the Care plan, prayer forms go by email to the pastors' address only, and the words are in that email. From the Shepherd plan, prayer stays in a locked inbox for the pastors and the prayer team, and the email says only: New request. Sign in to read. Staff and website admins cannot open it there, and every open is recorded.",
    staffreplace: "No. Genesis is software. It supports your pastors and care teams and never replaces them. A person approves every draft and writes every reply to prayer.",
    aiprayer: "No. " + AN + " never reads prayer words or private messages, never summarizes them and never drafts a reply. It sees only that a request is waiting, its topic, its owner and how long it has waited. The one automatic check is for crisis words, which shows the person 988 and 911 right away. From the Shepherd plan it also alerts the pastor on call, with no private words.",
    crisis: "If a message or a prayer request sounds like someone is in danger, the person sees 988 and 911 right away. From the Shepherd plan, the pastor on call also gets an email and a phone notification that carry no private words, and a pastor follows up and sets the next check-in. " + AN + " never handles it alone.",
    /* What the Care plan does in a crisis: the reply on the website, and the form in the pastors' email. No pastor on call yet. */
    crisis01: "If someone writes words of crisis on the website, " + AN + " shows them 988 and 911 right away, in a reply written by people. On the Care plan nobody is paged: a prayer form still reaches the pastors' email, words and all. The Shepherd plan adds a pastor on call who is alerted, with no private words.",
    oncall01: "The pastor on call comes with the Shepherd plan. On the Care plan, " + AN + " shows anyone in crisis 988 and 911 right away, and a prayer form reaches the pastors' email, words and all. From Shepherd, a pastor named in Team is alerted by email and phone, with no private words.",
    /* AI training: never on prayer, messages or member data. */
    aitraining: "No. Genesis never uses prayer, messages or member data to train AI. " + AN + " answers only from facts your church approved.",
    ai: AN + " drafts and summarizes, and a person approves everything before it goes out. " + AN + " answers only from facts the church approved, never writes a reply to prayer or a private message, never sets a gifts score, and only sees what the signed-in person can see.",
    pco: "No. Keep Planning Center, Subsplash and your giving provider. Genesis Ministry works beside them. Give opens your own giving page, and events, groups and kids check-in open the tool you already use. At onboarding we can import your people list from a Planning Center or Subsplash export, so nobody is entered twice.",
    /* "Do you work with Breeze?" is not "does it replace", so it never starts with No. */
    worksbeside: "Genesis Ministry works beside Planning Center, Breeze, Subsplash and your giving provider, and does not replace them. Give opens your own giving page, and events, groups and kids check-in open the tool you already use. There is no live sync today: at onboarding we can import your people list from an export, so nobody is entered twice.",
    different: "Planning Center, Breeze and Subsplash keep your church's records and the tools around them. Genesis Ministry is the part guests and members meet: the website and " + AN + ", a front office where every first-time guest gets an owner and a next step, the care inbox and the member app, with a person approving every draft. It works beside the tool you use, so you keep it.",
    /* A church's web address is settled during scoping, so Hope says where it is settled. */
    domain: "Your web address is settled during scoping, with a person at Genesis: which address the new site uses and how the move is handled. Choose Talk With Genesis to confirm it for your church.",
    start: "Every church starts the same way. Consultation is a free conversation. Scoping brings a guided demo and a proposal with a look and a plan. Implementation builds it with your content, Launch takes it live with your staff, and the Managed Platform keeps it running. Choose Talk With Genesis to begin.",
    upgrade: "Each plan adds to the one before, so a church can start on Care and move up to Shepherd or Plus as it grows. A person at Genesis sets up the change with you.",
    cancel: "How a plan ends is set with Genesis on a call, before you sign anything. If you ever leave, your data is yours: we hand over a full export of your people, guests, care history and the access record, then delete our copy once you confirm you have it.",
    discount: PRICES + " Any other terms are set with Genesis on a call.",
    pcokeep: "Yes. Genesis Ministry works beside Planning Center, Subsplash and your giving provider, and does not replace them. Give opens your own giving page, and events, groups and kids check-in open the tool you already use. At onboarding we can import your people list from a Planning Center or Subsplash export, so nobody is entered twice.",
    importpeople: "Yes. At onboarding we can import your people list from a spreadsheet or CSV export of the tool you use today, such as Planning Center or Subsplash. Records also grow as people sign in. Genesis does not replace those tools, and a live Planning Center sync is on the roadmap.",
    signin: "Members sign in with their email address and a 6-digit code sent by email, or with Google, so there is no password to remember. Member accounts are for adults 18 and older, confirmed once. Signing in the first time creates the account.",
    age: "Member accounts are for adults 18 and older, confirmed once at the first sign in. Kids and students are cared for through their parents and the church's kids and student ministries, never through a private account.",
    minor: "If someone under 18 writes in, staff do not continue a private one-to-one thread. They bring in a parent or guardian, follow the church's child protection policy, and report when the law requires it. The account is closed kindly, because member accounts are for adults.",
    data: "Your data is yours. If you ever leave, we hand over a full export of your people, guests, care history and the access record, with your website content, " + AN + "'s approved facts and the brand board, and then delete our copy once you confirm you have it.",
    hosting: "Genesis Ministry runs on a managed cloud database. Staff sign in with two steps, and prayer stays behind role checks the system enforces. During scoping we share the hosting and backup details in writing, in plain words, so your team can review them before you sign anything.",
    launch: "About 55 days from signing to live, in the sample. Content and photos come first, then the brand board, the site build, the facts " + AN + " may use, your privacy page, roles and a staff walkthrough.",
    training: "Yes. Your staff get a walkthrough at launch, then a monthly check-in with Genesis. Every screen also has a short guided tour, like this one.",
    staffaccess: "No, not in the ordinary course. Genesis signs in to your workspace only when you open a support session, and that session is recorded where you can see it. An honest limit: the engineers who run the database could technically reach it. The rule, the record and our support policy are the promise.",
    /* The church's own answer. */
    texting: "Texting is off. Guest follow-up goes by email unless the church turns texting on.",
    masstext: "Genesis Ministry does not send texts to the whole church. Guest follow-up goes by email, and texting stays off unless the church turns it on for guests. For a snow-day notice, keep the texting or email tool you use today, and update the website so guests who check see it too.",
    custom: "Each of the four looks is filled with the church's own content, photos, colors and logo. Customization beyond the template is available for an additional cost.",
    levels: LEVELS_TEXT,
    price: PRICES + " Enterprise, for more than one campus, is scoped on a call. Customization beyond the template is available for an additional cost.",
    archive: "Nothing pastoral is deleted. Prayer, threads and pastor notes are archived, so nothing is lost by accident, and a person can still ask for a copy or for removal. A removal waits for the lead pastor.",
    campus: "Enterprise is for churches with more than one campus. One campus with several services is not Enterprise. Enterprise includes everything in Plus, and how your campuses share people, care and reports is scoped with you on a call.",
    onecampus: "No. One campus with several services is not Enterprise. Care, Shepherd and Plus each cover one campus, however many services it holds. Enterprise is for a church with more than one campus, and it is scoped on a call.",
    accessrecord: "From the Shepherd plan, every open, reply, change and archive of prayer and private threads is written down. It names the record, never what it says, and nobody can edit it. A mistake is corrected with a new entry, and a blocked try is recorded too. The Plus plan adds the Access Record screen to search and export it.",
    oncall: "From the Shepherd plan, each church names a pastor on call in Team. When a message or prayer request sounds like someone is in danger, the person sees 988 and 911 right away, and the pastor on call gets an email and a phone notification with no private words. A pastor follows up and sets the next check-in.",
    /* What a pastor asks before booking a call. */
    call: "Choose Talk With Genesis, and a person at Genesis will set up a call. They walk you through it with your own church in mind: the look, your content and the plan that fits.",
    seats: seatsText(),
    contract: "Contract terms are set with Genesis on a call, before you sign anything. " + PRICES + " Scoping includes a demo in the look you choose.",
    trial: "A trial is set with Genesis on a call. Scoping includes a demo in the look you choose, with your own church in mind.",
    model: AN + " is Genesis's assistant. It runs on an outside AI service under contract, which never trains on your data, and the provider is named in writing during scoping. " + AN + " answers only from facts the church approved, never writes a reply to prayer or a private message, and a person approves everything that goes out.",
    turnoff: "Yes. A pastor can turn " + AN + " off on the website or in the workspace at any time.",
    nothuman: "No. " + AN + " always says it is an automated assistant, and it hands anything personal to a real person.",
    wrong: AN + " answers only from facts your church approved, and hands anything else to a person. Your team can fix a fact in minutes, and " + AN + " uses the new one from then on.",
    giving: "Give opens your church's own giving page, from the provider you already use, such as Planning Center Giving, Subsplash or Pushpay. Genesis never handles a payment, and the app keeps no giving history.",
    guestunsub: "Every guest email has one click to stop guest emails. The guest's record shows it right away, and nobody emails them again unless they ask.",
    newsletter: "Genesis Ministry does not send newsletters. The newsletter sign-up on your website adds each new person to Guests with an owner and a next step, and your newsletter keeps going out from the tool you use today.",
    company: "Genesis AI makes Genesis OS, and Genesis Ministry is its edition for churches. A person at Genesis walks each church through scoping, the build and launch, then keeps the platform running.",
    size: "Genesis Ministry is built for churches of about 100 to 1,000 people. A smaller church can start with Care, the website and " + AN + " at $149 a month, and add more as it grows.",
    /* A pastor's buying and planning questions. The ones settled on a call are set in writing then. */
    keepsite: "Whether " + AN + " can be added to a website you already have is settled during scoping, with a person at Genesis. Every plan today comes with a new website in one of four looks, with " + AN + " built in. Choose Talk With Genesis to talk it through for your church.",
    givingsee: "Nobody sees giving in Genesis. Give opens your church's own giving page, and the app keeps no giving history, so no role here, not a pastor and not the prayer team, can see what anyone gives. Giving records stay with your giving provider.",
    careplan: "Care is the first plan, at $149 a month: the website, " + AN + " on it and forms by email. The Care Inbox is a screen that comes with the Shepherd plan: one shared inbox for prayer and messages, with an owner on every thread and every open recorded.",
    schedule: "Genesis Ministry does not schedule volunteers. Keep Planning Center Services, or the tool you use for rotas today. From the Shepherd plan, every first-time guest has an owner and a next step, and Serving is the last stage on the guest path.",
    permember: "No. Each plan is one monthly price for the church, not a price per member: Care at $149, Shepherd at $299 and Plus at $499 a month. Plans count staff seats, and member accounts never use a seat.",
    phones: "The member app is made for phones, iPhone and Android alike, and it comes with the Shepherd plan. How your members get it is set up with Genesis during scoping. Members sign in with a code sent by email, so there is no password to remember.",
    language: "The four looks are written in English today. A site in Spanish, or in two languages, is settled during scoping with a person at Genesis. Choose Talk With Genesis to ask for your church.",
    growth: "Genesis Ministry is built for churches of about 100 to 1,000 people. When a church grows past that, a person at Genesis reviews the fit with you, and Enterprise is there when a second campus opens.",
    support: "Genesis runs the platform for you, so a person at Genesis is your support. Support hours, and how to reach someone on a Sunday morning, are set in writing during scoping, before you sign anything.",
    attendance: "Genesis Ministry does not take attendance or run check-in. Keep the check-in tool you use today. From the Plus plan, Reports count guests, care and the guest path, never names.",
    checkin: "Kids check-in stays in the tool you use today, such as Planning Center Check-Ins. In Genesis Ministry, the kids check-in link opens that tool, so families never learn a second system.",
    references: "A person at Genesis can talk with you about other churches and references on a call. Choose Talk With Genesis to set it up.",
    whobuilds: "Genesis builds it with your content. Consultation is a free conversation. Scoping brings a guided demo and a proposal with a look and a plan. Implementation builds the site with your words and photos, Launch takes it live with your staff, and the Managed Platform keeps it running.",
    hipaa: "Genesis Ministry does not claim HIPAA compliance today. HIPAA covers health care providers and insurers, and most churches are not covered by it. Prayer and care stay behind role checks the system enforces, and during scoping we share the security and backup details in writing.",
    websitecost: "The website is in every plan. Care, at $149 a month, is the website in one of four looks with " + AN + " on it, and each plan adds to that. Customization beyond the template is available for an additional cost.",
    downgrade: "If a church moves down a plan, its records are kept. The screens the lower plan does not include lock, and nothing is deleted. Moving back up opens them again. A person at Genesis sets up the change with you.",
    /* Trust questions a pastor asks before signing: who reports abuse, outside providers, other
       churches, teens, prayer leaving the inbox, the lead pastor and pastors-only requests. */
    reporting: AN + " never reports to anyone, and it never reads prayer words. Your pastors follow your church's child protection and reporting policy, and a person handles every report. When someone writes words of crisis, " + AN + " shows them 988 and 911 right away, and from the Shepherd plan the pastor on call is alerted, with no private words.",
    otherchurches: "No. Each church's data is kept apart, and no church sees another's.",
    minormessage: "No. Member accounts are for adults 18 and older, so the app has no private messages between staff and teenagers. Students are cared for through their parents and the church's student ministry. If someone under 18 writes in, staff bring in a parent or guardian and follow the church's child protection policy.",
    prayerforward: "Prayer words stay inside the Care Inbox, for the pastors and the prayer team the person chose. Alert emails carry no words, only: New request. Sign in to read. Every open is recorded. Whether a request can ever leave the inbox, by forwarding or export, is settled in writing with a person at Genesis during scoping.",
    pastorsonly: "Yes. Every request reaches the pastors, the lead pastor included. A request marked Pastors only is read by the pastors and not by the prayer team, and every open is recorded. This comes with the Shepherd plan.",
    oncallcover: "The pastor on call is named in Team, week by week. When that pastor is away, the lead pastor names whoever covers, and the alerts go to them, with no private words. This comes with the Shepherd plan.",
    faithcompany: "A person at Genesis would be glad to tell you about the team and why it builds for churches, on a call.",
    privacypolicy: "Yes. Every church's website gets its own privacy page, written with your team before launch, in plain words members can read. How Genesis handles your data is shared in writing during scoping.",
    guestchats: "When a guest leaves a name or asks for a person, the question reaches Guests with an owner and a next step, marked as from a " + AN + " conversation. How long chats are kept is set in writing during scoping, with a person at Genesis.",
    real: "Genesis Ministry is real software from Genesis AI. The four churches in this preview, and every person and number in them, are made up, so you can try every screen without touching anyone's real information.",
    value: "A website builder gives you a website. Care, at $149 a month, is the website in one of four looks, built by Genesis with your content, with " + AN + " answering guests day and night from facts your church approved, plus the brand board, the social marketing plan, and Plan a Visit and prayer forms by email. Genesis keeps it running.",
    serving: "Not through the website today. A guest who says they want to serve tells a greeter or a pastor, and from the Shepherd plan every guest has an owner and a next step, with Serving as the last stage on the guest path. Volunteer scheduling stays in the tool you use today.",
    beliefs: "Each church answers that in its own words. On a church's own site, " + AN + " shares what the church has written about its beliefs, and hands questions like this to a pastor rather than guessing.",
    giftsinfo: "The spiritual gifts conversation is a set of short statements a member answers in the app, about 10 minutes, saved after every tap. The result is gifts to explore, added up by plain arithmetic, and " + AN + " never sets a score. Who sees it: the member first. A name reaches the pastors and any gift viewers the church names only after a yes. The church's gifts picture shows counts only and stays hidden until 25 people finish. It comes with the Plus plan."
  };
  /* Round 4: access, giving records, exports and texting, each its own answer. */
  ANSWERS.removeaccess = "When someone steps down, their access ends that day. The lead pastor removes them in Team, nothing they wrote is deleted, and their opens stay in the access record.";
  ANSWERS.givingexport = "Giving records stay with your giving provider, such as Planning Center Giving, Subsplash or Pushpay, and year-end statements come from there. Genesis never handles a payment and keeps no giving history, so there is no giving to export here.";
  ANSWERS.exportwho = "Who can reach people records is set by each staff member's role in Team, and only the lead pastor changes a role. Which roles may export the people list is settled in writing during scoping, with a person at Genesis. Members never see a directory.";
  ANSWERS.grouptext = "No. Genesis Ministry does not send group or church-wide texts, so a small group leader keeps using the tool they use today. Texting, where a church has it, is for guest follow-up only.";
  ANSWERS.textcost = "I would rather not guess about texting costs. A person at Genesis can answer that on a call, and any cost is set in writing before you sign anything.";
  /* Selling and outside providers: a promise a church can repeat in its own privacy notice. */
  ANSWERS.sell = "No. Genesis never sells your data or shares it for anyone's marketing. To run the service, a few providers process it for us under contract, such as cloud hosting, email delivery and the AI service behind " + AN + ". The list is shared in writing during scoping.";
  /* Outside providers get their own words, with no "No." first: the question is who, not whether. */
  ANSWERS.processors = "To run the service, a few providers process your data for Genesis under contract, such as cloud hosting, email delivery and the AI service behind " + AN + ". Genesis never sells your data or shares it for anyone's marketing. The list is shared in writing during scoping.";
  /* Round 3: questions that used to reach a different answer. */
  ANSWERS.prayerfromstaff = "A request marked Pastors only is read by the pastors and not by the prayer team, and staff and website admins cannot open prayer at all. It still reaches every pastor, the lead pastor included, so it cannot be kept from one pastor, and every open is recorded. This comes with the Shepherd plan. On the Care plan, prayer forms go by email to the pastors' address, words and all.";
  ANSWERS.prayerfromstaff01 = "On the Care plan, prayer forms go by email to the pastors' address, words and all, so whoever reads that mailbox can read every request. From the Shepherd plan, a request can be marked Pastors only, which keeps it from the prayer team, and every open is recorded.";
  ANSWERS.prayernotify = "Alert emails about prayer say only: New request. Sign in to read. They carry no name and no words. From the Shepherd plan, that alert goes to the pastors and the prayer team the person chose. On the Care plan, the prayer form itself goes by email to the pastors' address, words and all.";
  ANSWERS.hopeprays = AN + " never prays for anyone, never reads prayer words and never writes a reply to prayer. A prayer request goes to the people the person chose, and a person prays and replies.";
  ANSWERS.contactsee = "Who sees a person's phone number and email is set by each staff member's role in Team, such as the pastors and whoever follows up with guests. Prayer is separate: only the pastors and the prayer team can read it, and every open is recorded.";
  ANSWERS.givingfees = "Genesis takes no cut of donations. Give opens your church's own giving page, from the provider you already use, and that provider's own processing fees are the only ones on a gift. Genesis never handles a payment.";
  ANSWERS.autoreply = AN + " never sends a reply to prayer or a private message on its own. On the website it answers guests' questions from facts your church approved, and in the workspace every draft waits for a person to approve it.";
  ANSWERS.madeup = AN + " is built not to make things up. It answers only from facts your church approved, and when it does not know, it says so and hands the question to a person. Your team can fix a fact in minutes, and " + AN + " uses the new one from then on.";
  ANSWERS.soc2 = "I would rather not guess about SOC 2. A person at Genesis can tell you where that stands, and the hosting and security details are shared in writing during scoping. What I can say: Genesis Ministry runs on a managed cloud database, staff sign in with two steps, and prayer stays behind role checks the system enforces.";
  ANSWERS.denomfit = "Genesis Ministry does not take a side on doctrine. " + AN + " shares only what your church has written and approved about its beliefs, and hands questions of faith to a pastor rather than answering them itself.";
  ANSWERS.advice = AN + " does not give pastoral, legal, medical or financial advice. It answers practical questions from facts your church approved, and it hands anything personal to a real person. If someone is in crisis, it shows them 988 and 911 right away.";
  ANSWERS.sermon = AN + " does not write sermons, and it never writes a reply to prayer. In the workspace it drafts small things for a person to approve, like welcome notes and follow-up notes. The preaching stays yours.";
  ANSWERS.confidential = "A pastor can talk with you about what stays private and the few things they must report to keep someone safe. If anyone is in danger right now, call 911, or call or text 988.";
  ANSWERS.aiprayerco = ANSWERS.aiprayer;
  /* What a pastor types to the workspace Hope. */
  ANSWERS.chat = "In this preview, answers are scripted from sample data, and nothing you type here is sent. In your workspace, " + AN + " only sees what you can see, and never sends anything without a person's approval.";
  /* Round 5: answers a question used to miss: more than one website, shared sign-ins, prayer options,
     pastor notes, a legal request, a free plan, a Bible translation, leaving with the website, export
     terms, chat history, a loss, and texting asked a different way. */
  ANSWERS.multisite = "Each plan includes one church website, for one campus. More than one site or campus is Enterprise, scoped with a person at Genesis on a call.";
  ANSWERS.sharelogin = function (q) { return careFor(q) ? "On the Care plan, the pastors share one sign-in, with no staff seats. From the Shepherd plan, each staff member signs in as themselves, so every open is recorded." : "Each staff member signs in as themselves, so every open is recorded and access can end the day someone leaves. On the Care plan, the pastors share one sign-in."; };
  ANSWERS.prayeranon = "A prayer request is read only by the people the person chooses, and other members never see it. Whether your church offers a way to share one without a name is set with a person at Genesis on a call.";
  ANSWERS.prayerwall = "Genesis Ministry keeps prayer private: a request is read only by the people the person chose, and it is never posted for other members to see. A public prayer wall is not part of it today, and a person at Genesis can talk through what your church has in mind on a call.";
  ANSWERS.pastornotes = "Pastor notes stay with the pastors, and " + AN + " never reads or writes them. Exactly which roles on your staff can open them is set up with a person at Genesis, who can walk you through it on a call.";
  ANSWERS.legalrequest = "A request from the police or a court for your church's data goes to a person at Genesis, never to " + AN + ", and how Genesis answers one is set in writing before you sign anything. " + AN + " never reports to anyone on its own.";
  ANSWERS.freeplan = "No. There is no free plan. Plans start with Care at $149 a month, then Shepherd at $299 a month and Plus at $499 a month.";
  ANSWERS.bibletrans = "I would rather not guess. " + AN + " answers only from facts your church approved and does not quote the Bible on its own. A person at Genesis can answer that on a call.";
  ANSWERS.websiteown = "If you ever leave, we hand over your website content, " + AN + "'s approved facts and the brand board, on every plan. Who holds the web address and the site's code after you leave is set in writing with a person at Genesis before you sign anything.";
  ANSWERS.exportterms = "Any fee for an export, and how long your data stays available after you cancel, are set in writing before you sign anything. A person at Genesis can confirm them on a call.";
  ANSWERS.chatexport = "I would rather not guess whether " + AN + "'s chat history is part of an export. A person at Genesis can confirm it on a call, and how long chats are kept is set in writing during scoping.";
  ANSWERS.grief = "I am so sorry for your loss. Please take care of yourself, and lean on your pastors and the people who love you. If you are in crisis, call or text 988, or 911 in an emergency.";
  ANSWERS.textwho = "Texting is off unless the church turns it on, and it is for guest follow-up only. Who on staff sees a guest's texts is set with a person at Genesis during scoping.";
  ANSWERS.minortext = "Texting is for guest follow-up only, and it is off unless the church turns it on. Member accounts are for adults 18 and older, and kids are cared for through their parents and the church's kids ministry.";
  var beliefsAll = ANSWERS.beliefs;
  ANSWERS.beliefs = function (q) { return beliefsAll + (/\b(?:die|dies|dying|death|dead)\b/i.test(String(q || "")) ? " If you are in crisis, call or text 988, or 911 in an emergency." : ""); };
  var autoAll = ANSWERS.autoreply;
  ANSWERS.autoreply = function (q) { return /\b(?:decid\w*|choos\w*|picks?|assign\w*)\b/i.test(String(q || "")) ? "No. A person decides who gets a follow-up, and " + AN + " never decides on its own or sends anything without a person's approval." : autoAll; };
  /* A yes or no question gets Yes or No first; "how" and "who" questions get the answer itself. */
  function yesNo(q) { return /^\s*(do|does|did|is|are|can|could|will|would|should|have|has)\b/i.test(String(q || "")); }
  /* "Can we move down to Shepherd later?" is a yes; "Do we lose our records if we drop down?" is a no. */
  var downAll = ANSWERS.downgrade;
  ANSWERS.downgrade = function (q) {
    q = String(q || "");
    if (/\b(lose|lost|losing|delete\w*|deleting|erase\w*|wipe\w*|keep our|kept|gone|disappear\w*)\b/i.test(q)) return "No. " + downAll;
    if (yesNo(q) && /\b(can|could|may|is it possible)\b/i.test(q)) return "Yes. A church can move down a plan. " + downAll.replace(/^If a church moves down a plan, its/, "Its");
    return downAll;
  };
  /* "How do we import our people?" gets the answer itself, without "Yes." first. */
  var importAll = ANSWERS.importpeople;
  ANSWERS.importpeople = function (q) { return yesNo(q) ? importAll : importAll.replace("Yes. ", ""); };
  var trainingAll = ANSWERS.training, staffAll = ANSWERS.staffaccess;
  ANSWERS.training = function (q) { return yesNo(q) ? trainingAll : trainingAll.replace(/^Yes\. /, ""); };
  ANSWERS.staffaccess = function (q) { return /^\s*who\b/i.test(String(q || "")) ? staffAll.replace(/^No, not in the ordinary course\./, "Nobody, in the ordinary course.") : staffAll; };
  /* "Can I add one more seat?" gets a yes before the seat counts. */
  var seatsAll = ANSWERS.seats;
  ANSWERS.seats = function (q) {
    q = String(q || "");
    /* Round 5: on Care there are no staff seats to add. */
    if (careFor(q) && /\b(add|more|extra|another|buy|additional)\b.{0,20}\bseats?\b/i.test(q)) {
      var lvs = (D && D.levels) || [], c2 = lvs[1] && lvs[1].seats ? lvs[1].seats.replace(/^Up to/, "up to").replace(/ staff seats?$/, "") : "up to 8", c3 = lvs[2] && lvs[2].seats ? lvs[2].seats.replace(/^Up to/, "up to").replace(/ staff seats?$/, "") : "up to 15";
      return "The Care plan has one sign-in for the pastors. Staff seats and Team roles come with Shepherd (" + c2 + ") and Plus (" + c3 + ").";
    }
    /* "How much is an extra seat?" is a price question: no "Yes." first. */
    if (/\b(add|more|extra|another|buy|additional)\b.{0,20}\bseats?\b/i.test(q) && /\b(how much|cost|costs|price|prices|pricing|charge)\b/i.test(q)) return SEAT_MORE.trim() + " " + seatsAll.replace(SEAT_MORE, "");
    if (/\b(add|more|extra|another|buy|additional)\b.{0,20}\bseats?\b/i.test(q)) return "Yes." + SEAT_MORE + " " + seatsAll.replace(SEAT_MORE, "");
    /* "Do the volunteers on our prayer team each need a staff seat?" gets Yes first. */
    if (/\b(volunteers?|prayer team|part[- ]time|ushers?|greeters?)\b/i.test(q) && yesNo(q)) return "Yes." + SEAT_WHO + " " + seatsAll.replace(SEAT_WHO, "");
    return seatsAll;
  };
  /* "Do we need Enterprise?" gets No first; "Which plan do we need for three services?" gets the answer. */
  var oneAll = ANSWERS.onecampus;
  ANSWERS.onecampus = function (q) {
    q = String(q || "");
    if ((yesNo(q) && /\benterprise\b/i.test(q)) || /\b(do|does|would|will|should|must) (we|i|our church|a church|you)\b.{0,24}\benterprise\b|\bis (it|this|that) enterprise\b/i.test(q)) return oneAll;
    return "Any plan covers one campus, however many services it holds: Care, Shepherd or Plus. Enterprise is for a church with more than one campus, and it is scoped on a call.";
  };
  ANSWERS.plancare = planText(1);
  ANSWERS.planshepherd = planText(2);
  ANSWERS.planplus = planText(3);
  /* Members are not staff seats. */
  ANSWERS.memberlimit = (function () {
    var lv = (D && D.levels) || [], s2 = lv[1] && lv[1].seats, s3 = lv[2] && lv[2].seats;
    var seats = s2 && s3 ? " The Shepherd plan has " + s2.replace(/^Up to/, "up to") + " and the Plus plan " + s3.replace(/^Up to/, "up to") + "." : "";
    return "Plans count staff seats, not members." + seats + " Member accounts are for adults 18 and older and never use a staff seat. Genesis Ministry is built for churches of about 100 to 1,000 people, and for a larger church Genesis confirms the fit on a call.";
  })();
  var AN_RX = String(AN).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* The plan this Hope speaks for. On the Care plan (the website only) a church's answers say what Care
     does today and what the Shepherd plan adds. The story pages speak for every plan, unless the
     question names Care or the overview shows the Care plan. */
  var CARE = !!(GM && GM.side !== "genesis" && GM.plan === 1);
  var STORY_CARE = !GM && !!(STORY && +STORY.plan === 1);
  function namesCare(q) { q = String(q || ""); return PLAN_WORD.care.test(q) && !/\b(shepherd|plus)\b/i.test(q); }
  function careFor(q) { return CARE || STORY_CARE || namesCare(q); }
  ANSWERS.cheapest = "Care is the plan to start with, at $149 a month. " + planText(1).replace(/^The Care plan is [^.]+\. It is /, "It is ");
  /* Who can read the pastors' email: on Care the prayer words travel in it. */
  ANSWERS.mailbox = function (q) {
    var care = "On the Care plan, prayer forms arrive in the pastors' email with the words in them, so anyone who can open that mailbox can read them. Keep that mailbox to the pastors.";
    var shep = "From the Shepherd plan the alert email says only: New request. Sign in to read. Anyone with the pastors' mailbox sees that a request is waiting, never the words, which stay in a locked inbox for the pastors and the prayer team.";
    if (GM && GM.side !== "genesis") return CARE ? care + " The Shepherd plan keeps the words out of email." : shep;
    return careFor(q) ? care + " " + shep : shep + " " + care;
  };
  /* "Does Shepherd include reports?": Yes or No first, then the plan that brings it. */
  var FEATURES = [
    [/\breports?\b/i, "Reports", 3, true],
    [/\b(person|people) pages?\b|\bpages? (for|per) (each )?person\b/i, "Person pages", 3, true],
    [/\baccess record\b/i, "The Access Record screen", 3],
    [/\bcustom roles?\b/i, "Custom roles", 3, true],
    [/\bgift viewers?\b/i, "Named gift viewers", 3, true],
    [/\b(spiritual )?gifts?\b/i, "The spiritual gifts conversation and picture", 3, true],
    [/\bmember app\b|\ban app\b|\bthe app\b/i, "The member app", 2],
    [/\bcare inbox\b|\binbox\b/i, "The Care Inbox", 2],
    [/\bguest (pipeline|path)\b|\bfront office\b|\bguests\b/i, "The guest pipeline", 2],
    [/\btoday (view|screen|page)\b/i, "Today", 2],
    [/\bdrafts?\b/i, "Drafts that wait for approval", 2, true],
    [/\bteam roles?\b|\b(named )?prayer team\b/i, "Team roles with a named prayer team", 2, true],
    [/\bbrand board\b/i, "The brand board", 1],
    [/\bsocial (marketing )?plan\b/i, "The social marketing plan", 1],
    [/\bnewsletter\b/i, "Newsletter sign-up", 1],
    [/\bplan a visit\b|\bprayer forms?\b/i, "Plan a Visit and prayer forms", 1, true],
    [/\bweb ?site\b/i, "The website", 1]
  ];
  function featureAsked(q) {
    q = String(q || "");
    /* "Does Plus include more than one website?" is about how many, never a plain yes. */
    if (/\b(more than one|multiple|two|three|several|second|another|extra|separate)\b.{0,20}\b(web ?sites?|sites?|campus\w*|domains?)\b/i.test(q)) return null;
    if (!/\b(includ\w*|come with|comes with|get|have|has|offer|cover|in)\b/i.test(q)) return null;
    var names = plansNamed(q).filter(function (n) { return n !== "enterprise"; });
    if (names.length !== 1) return null;
    if (names[0] === "plus" && !/\bplus\b\s*(plan|includ|come|get|have|has|offer|cover|\?)|\b(on|with|the|does|in|get) plus\b|^\s*plus\b/i.test(q)) return null;
    if (names[0] === "care" && !/\bcare (plan|includ|come|get|have|has|offer|cover)|\b(on|with|the|does|in|get) care\b(?!\s+inbox)/i.test(q)) return null;
    for (var i = 0; i < FEATURES.length; i++) if (FEATURES[i][0].test(q)) return { f: FEATURES[i], n: PLAN_RANK.indexOf(names[0]) + 1 };
    return null;
  }
  function planFeature(q) { return featureAsked(q) ? "planfeature" : null; }
  ANSWERS.planfeature = function (q) {
    var hit = featureAsked(q), lv = (D && D.levels) || [];
    if (!hit || !lv.length) return LEVELS_TEXT;
    var f = hit.f, at = lv[f[2] - 1], on = lv[hit.n - 1], verb = f[3] ? " come" : " comes";
    if (hit.n >= f[2]) return "Yes. " + f[1] + verb + " with the " + at.name + " plan" + (hit.n > f[2] ? ", and every plan after it includes " + (f[3] ? "them" : "it") : "") + ". The " + on.name + " plan is " + on.price + ".";
    return "No. " + f[1] + verb + " with the " + at.name + " plan, at " + at.price + ". The " + on.name + " plan is " + on.price + ".";
  };
  /* "Which plan for a church of 300?": the size, and the plan that fits it. */
  ANSWERS.size = function (q) {
    q = String(q || "").replace(/(\d),(\d{3})/g, "$1$2");
    var st = /\b(\d{1,3})\s*(?:staff|people on staff|employees|staff members)\b/i.exec(q), staff = st ? +st[1] : 0;
    var m = /\b(\d{2,5})\b(?!\s*(?:staff|people on staff|employees|seats?))/.exec(q), n = m ? +m[1] : 0;
    var lv = (D && D.levels) || [], s2 = lv[1] ? lv[1].seats.toLowerCase() : "up to 8 staff seats", s3 = lv[2] ? lv[2].seats.toLowerCase() : "up to 15 staff seats";
    var base = "Genesis Ministry is built for churches of about 100 to 1,000 people.";
    if (n > 1000) return base + " For a church of " + n + ", a person at Genesis confirms the fit with you on a call. Enterprise is for more than one campus.";
    if (n && n < 100) return base + " A church of " + n + " can start with Care, the website and " + AN + " at $149 a month, and add more as it grows.";
    if (n && (staff > 8 || n >= 200)) return "For a church of about " + n + (staff ? " with " + staff + " staff" : "") + ", Shepherd is a good fit at $299 a month: the guest pipeline, the Care Inbox and the member app, with " + s2 + ". Plus, at $499 a month, adds person pages, the gifts picture and reports, with " + s3 + "." + (staff > 15 ? " More seats are available for an additional cost." : "") + " A person at Genesis can confirm it with your own church in mind.";
    if (n) return "For a church of about " + n + ", Care fits if you want the website and " + AN + " first, at $149 a month. Shepherd, at $299 a month, adds the guest pipeline, the Care Inbox and the member app, with " + s2 + ". A person at Genesis can confirm it with your own church in mind.";
    return base + " A smaller church can start with Care, the website and " + AN + " at $149 a month, and add more as it grows.";
  };
  /* Fees and price changes: the plan price is the plan, and anything more is settled in writing on a
     call first. */
  ANSWERS.fees = function (q) {
    if (/\b(go(?:es)? up|going up|increase\w*|raise\w*|rise|rising|change over time|lock\w* in|next year|after (?:the first|a|one) year|year two)\b/i.test(String(q || ""))) return PRICES + " How a price is held over time is set in writing with Genesis before you sign anything.";
    return "The monthly price is the plan: Care at $149, Shepherd at $299 and Plus at $499 a month. Anything more, like customization beyond the template, is quoted in writing before you sign. Any other terms are set with Genesis on a call.";
  };
  /* The Care plan's own answers: forms arrive by email, so there is no inbox, archive or list to import yet. */
  var NO_IMPORT = / ?(?:At onboarding|There is no live sync today: at onboarding) we can import your people list from a[^.]*\./;
  /* Leaving on Care: the forms already live in the church's own email, so the export is the site. */
  var CARE_DATA = "On the Care plan your forms live in your own email, so there is nothing of yours in a Genesis inbox to hand back. If you ever leave, we hand over your website content, " + AN + "'s approved facts and the brand board, then delete our copy once you confirm you have it.";
  var CANCEL_TERMS = "How a plan ends is set with Genesis on a call, before you sign anything. ";
  if (CARE || STORY_CARE) {
    ANSWERS.crisis = ANSWERS.crisis01;
    ANSWERS.oncall = ANSWERS.oncall01;
    ANSWERS.prayer = ANSWERS.prayer01;
    ANSWERS.newsletter = "Genesis Ministry does not send newsletters. On the Care plan, each newsletter sign-up on your website arrives by email and is added to your list, and your newsletter keeps going out from the tool you use today. The Shepherd plan adds each one to Guests with an owner and a next step.";
    ANSWERS.importpeople = "On the Care plan there is nothing to import, because every form arrives by email. From the Shepherd plan, we can import your people list at onboarding from a spreadsheet or CSV export of the tool you use today.";
    ["pco", "pcokeep", "worksbeside"].forEach(function (k) { ANSWERS[k] = ANSWERS[k].replace(NO_IMPORT, "") + " On the Care plan there is nothing to import, because every form arrives by email."; });
    ANSWERS.archive = "On the Care plan, forms arrive by email, so they live in the pastors' mailbox and Genesis keeps no inbox of them. From the Shepherd plan, nothing pastoral is deleted: prayer, threads and pastor notes are archived, and a removal waits for the lead pastor.";
    ANSWERS.data = "Your data is yours. " + CARE_DATA;
    ANSWERS.cancel = CANCEL_TERMS + CARE_DATA;
  }
  /* Round 5: on Care there are no Team roles, named prayer team or record of opens: forms go by email. */
  var CARE_MAIL = "On the Care plan, Plan a Visit and prayer forms go by email to the address your church chooses, so whoever reads that mailbox sees the details. Team roles, a named prayer team and a record of every open come with the Shepherd plan.";
  var careWords = { contactsee: CARE_MAIL, hosting: "Genesis Ministry runs on a managed cloud database, and during scoping we share the hosting and backup details in writing. " + CARE_MAIL, hipaa: "Genesis Ministry does not claim HIPAA compliance today. HIPAA covers health care providers and insurers, and most churches are not covered by it. " + CARE_MAIL };
  Object.keys(careWords).forEach(function (k) { var all = ANSWERS[k]; ANSWERS[k] = function (q) { return careFor(q) ? careWords[k] : typeof all === "function" ? all(q) : all; }; });
  var notifyAll = ANSWERS.prayernotify;
  ANSWERS.prayernotify = function (q) {
    if (!careFor(q)) return notifyAll;
    return (yesNo(q) && /\b(?:show|shows|include\w*|contain\w*|have|has|carry|carries|words?|text of)\b/i.test(String(q || "")) ? "Yes. " : "") + "On the Care plan the prayer form goes by email to the pastors' address, words and all. From the Shepherd plan the alert says only: New request. Sign in to read.";
  };
  /* Texting is guest follow-up only, and on the Care plan it is not there yet. "No." comes first only
     when the question asks whether Care has texting. */
  var textAll = ANSWERS.texting;
  ANSWERS.texting = function (q) {
    q = String(q || "");
    var asksPlan = yesNo(q) && /\b(?:includ\w*|come with|comes with|get|have|has|offer|on|is texting|turn on)\b/i.test(q);
    if (careFor(q) && !/\b(?:shepherd|plus)\b/i.test(q)) return (asksPlan ? "No. " : "") + "Guest texting comes with the Shepherd plan. On the Care plan, guest follow-up goes by email. Genesis Ministry never sends group or church-wide texts.";
    if (/\b(?:includ\w*|extra|add-?on|cost\w*)\b/i.test(q)) return "Guest texting comes with the Shepherd plan, and it is off until the church turns it on. Any cost for texting is set in writing before you sign, and a person at Genesis can confirm it on a call.";
    return textAll + " Texting is for guest follow-up only, never group or church-wide texts.";
  };
  /* Every Hope answers prayer for the plan asked about ("On the Care plan, who reads the prayer emails?"); the
     story pages answer a crisis for it too. */
  if (!GM || GM.side !== "genesis") {
    var prayerPlan = ANSWERS.prayer, prayerOne = ANSWERS.prayer01;
    ANSWERS.prayer = function (q) { return namesCare(q) || CARE ? prayerOne : prayerPlan; };
  }
  /* Keeping a request from one pastor: on Care the pastors share one mailbox. */
  var pfsAll = ANSWERS.prayerfromstaff;
  ANSWERS.prayerfromstaff = function (q) { return careFor(q) ? ANSWERS.prayerfromstaff01 : pfsAll; };
  if (!GM) {
    var crisisAll = ANSWERS.crisis, oncallAll = ANSWERS.oncall;
    var prayerStory = ANSWERS.prayer;
    ANSWERS.prayer = function (q) { return careFor(q) ? ANSWERS.prayer01 : prayerStory(q); };
    ANSWERS.crisis = function (q) { return careFor(q) ? ANSWERS.crisis01 : crisisAll; };
    ANSWERS.oncall = function (q) { return careFor(q) ? ANSWERS.oncall01 : oncallAll; };
    var dataAll = ANSWERS.data, cancelAll = ANSWERS.cancel;
    ANSWERS.data = function (q) { return careFor(q) ? "Your data is yours. " + CARE_DATA : dataAll; };
    ANSWERS.cancel = function (q) { return careFor(q) ? CANCEL_TERMS + CARE_DATA : cancelAll; };
  }
  /* A rule that tests with a function, with the face of a pattern. */
  function rx(fn, key) { return fnRule(function (q) { return fn(q) ? key : null; }, key); }
  var TRAIN_AI = new RegExp("\\b(ai|a\\.i\\.|artificial intelligence|models?|llms?|chat ?gpt|openai|gpt|algorithms?|machine learning|" + AN_RX + ")\\b", "i");
  /* "Do you use our prayer requests to train AI?" is about AI, never about staff training. */
  function aiTraining(q) {
    q = String(q || "");
    /* "used to improve your AI", "make the model smarter" and "fed into an AI model" are training too. */
    if (!/\b(train\w*|learn\w*|fine[- ]?tun\w*|feed\w*|fed (into|to)|improv\w*|smarter)\b/i.test(q)) return false;
    var staffOnly = /\b(train\w*|onboard\w*|teach\w*)\b.{0,20}\b(our|the|my|your)?\s?(staff|team|volunteers|people|pastors|leaders|admins?)\b|\b(staff|team|volunteers?|we|i|pastors?)\b.{0,20}\b(learn|be trained|get trained)\b|\bstaff training\b|\blearn (more|about|how)\b/i;
    var aiNamed = /\btrain\w*\b.{0,20}\b(ai|a\.i\.|models?|llms?)\b|\b(prayers?|messages?|data)\b.{0,60}\btrain/i;
    if (staffOnly.test(q) && !aiNamed.test(q)) return false;
    if (TRAIN_AI.test(q)) return true;
    return /\b(prayers?|prayer requests?|requests?|messages?|threads?|data|information|records?|conversations?|notes?)\b/i.test(q) && /\btrain\w*\b.{0,30}\b(on|with|using|from)\b|\b(use|using|used|feed\w*)\b.{0,40}\b(to|for|into) (train|training|fine|improve|make)/i.test(q);
  }
  function oneCampus(q) {
    q = String(q || "");
    if (/\b(more than|other than|beyond) one\b|\b(two|three|several|multiple|many|second|another|new) (campus|campuses|locations|sites)\b|\bmulti-?site\b/i.test(q)) return false;
    /* "a Spanish service and an English service at the same campus" is one campus too. */
    return/\b(one|a single|single|1|only one|just one) (campus|location|site|building)\b|\bsame (campus|location|building)\b|\b(two|three|four|five|several|multiple|many|\d) (sunday |weekend |worship )?(services|gatherings)\b|\b\w+ service and (an? )?\w+ service\b/i.test(q) && /\b(enterprise|campus|campuses|plan|tier|multi-?site|price|cost|count|need)\b/i.test(q);
  }
  var RULES = [
    /* Trust questions first: AI training, will it replace people, does the AI read prayer, can Genesis read it, can our staff. */
    rx(aiTraining, "aitraining"),
    /* Round 5: questions that shared a word with another answer and got it. */
    [/\b(?:more than one|multiple|two|three|several|second|another|extra|separate)\b.{0,20}\b(?:web ?sites?|domains?)\b|\b(?:more than one|multiple|two|three|several|extra|separate)\b.{0,20}\bsites\b/i, "multisite"],
    [/\b(?:share|sharing|shared|same|one)\b.{0,15}\b(?:login|log-?ins?|sign-?ins?|accounts?|passwords?)\b/i, "sharelogin"],
    [/\b(?:police|subpoena\w*|courts?|law enforcement|warrants?)\b.{0,40}\b(?:data|records?|hand|give|ask\w*|request\w*)\b|\b(?:hand|give|turn)\w*\b.{0,30}\b(?:data|records?)\b.{0,30}\b(?:police|courts?|law enforcement)\b/i, "legalrequest"],
    [/\b(?:directors?|ministry leaders?|teachers?|coaches?|deacons?|elders?)\b.*\b(?:read|see|open|access)\w*\b.*\bprayers?\b/i, "prayer"],
    [/\banonym\w*\b.{0,40}\bprayers?\b|\bprayers?\b.{0,40}\banonym\w*|\bprayers?\b.{0,40}\bwithout (?:a|my|their|his|her) name\b/i, "prayeranon"],
    [/\bprayer wall\b|\b(?:public|bulletin|out loud|aloud|on (?:the )?screen)\b.{0,40}\bprayers?\b|\bprayers?\b.{0,40}\b(?:public|bulletin|out loud|aloud)\b/i, "prayerwall"],
    [/^(?!.*\b(?:delete\w*|erase\w*|archiv\w*|remov\w*|encrypt\w*|secur\w*|stored|hipaa|backed up|backups?)\b).*(?:\bnotes?\b.{0,40}\b(?:counsel\w*|visit|session)\b|\b(?:counsel\w*|pastor\w*)\b.{0,30}\bnotes?\b)/i, "pastornotes"],
    [/\bnotice\b.{0,40}\bcancel\w*|\bcancel\w*\b.{0,40}\bnotice\b/i, "cancel"],
    [/\bwhat (?:exactly )?(?:do|does|would|will) (?:we|i|a church) get (?:on|with|in|for) (?:the )?care\b/i, "plancare"],
    [/\bfree (?:plan|tier|version)\b|\bis (?:there|it) (?:a )?free\b(?! trial)/i, "freeplan"],
    [/\bbible (?:translation|version)s?\b|\b(?:which|what) (?:translation|version) of the bible\b/i, "bibletrans"],
    [/\b(?:own|owns|keep|take|takes)\b.{0,30}\b(?:web ?site|site|domain)\b.{0,40}\b(?:leave|cancel|go|stop)\w*|\bwho owns\b.{0,30}\b(?:web ?site|site|domain|code)\b/i, "websiteown"],
    [/\b(?:fee|cost|charge|price)\w*\b.{0,25}\bexport\w*|\bexport\w*\b.{0,30}\b(?:fee|cost|charge)\w*|\bhow long\b.{0,50}\b(?:after|once)\b.{0,20}\b(?:cancel|leave|stop)\w*|\b(?:after|once) (?:we|you) (?:cancel|leave)\w*\b.{0,40}\bhow long\b/i, "exportterms"],
    [/\bexport\w*\b.{0,40}\b(?:chats?|conversations?|chat history)\b|\b(?:chats?|conversations?|chat history)\b.{0,30}\bexport\w*/i, "chatexport"],
    [/\b(?:giv\w*|tith\w*|donat\w*)\b.{0,40}\bwithout\b.{0,30}\b(?:pastors?|church|anyone|staff|elders?)\b|\bwithout\b.{0,30}\b(?:pastors?|church|anyone|staff)\b.{0,20}\b(?:knowing|seeing|finding out)\b/i, "givingsee"],
    [/\b(?:greeters?|ushers?|volunteers?|leaders?|staff)\b.{0,30}\b(?:access|see|view)\w*\b.{0,30}\b(?:list|guests?|first[- ]time|people|records|directory)\b/i, "contactsee"],
    [/\btext of\b.{0,30}\b(?:prayers?|requests?)\b|\b(?:e-?mails?)\b.{0,40}\b(?:show|shows|include\w*|contain\w*|have|has)\b.{0,40}\b(?:prayers?|requests?)\b|\b(?:notif\w*|alerts?|lock ?screen|push)\b.{0,40}\b(?:show|shows|display\w*|include\w*|reveal\w*|say|says)\b.{0,30}\bprayers?|\block ?screen\b.{0,40}\bprayers?|\bprayers?\b.{0,40}\block ?screen/i, "prayernotify"],
    [new RegExp("\\b(?:" + AN_RX + "|the ai|ai|it|the assistant)\\b.{0,30}\\b(?:decide|decides|choose|chooses|pick|picks|assign\\w*)\\b.{0,40}\\b(?:on its own|by itself|automatically|without (?:a person|anyone|us|asking))\\b|\\b(?:" + AN_RX + "|the ai|ai)\\b.{0,20}\\b(?:decide|decides|choose|chooses)\\b.{0,30}\\b(?:who|which)\\b", "i"), "autoreply"],
    [/^(?!.*\b(?:jesus|christ|god|lord|savior)\b).*\b(?:died|passed away|passed on|funeral|lost my (?:mom|dad|mother|father|husband|wife|son|daughter|baby|child|grandma|grandmother|grandpa|grandfather|brother|sister|friend))\b/i, "grief"],
    [/\bwhat happens (?:after|when) (?:we|you|i|people) (?:die|dies)\b|\bafter ?life\b|\bspeaking in tongues\b|\brapture\b|\bis it (?:wrong|a sin|sinful)\b(?!.{0,20}\b(?:if|when) (?:hope|the ai|it)\b)|\bwrong to\b(?! (?:say|use) (?:hope|the ai))/i, "beliefs"],
    [/\bhow many texts?\b|\btexts? (?:a|per) month\b|\btext\w* (?:limit|allowance)\b/i, "textcost"],
    [/\btexts?\b.{0,40}\bwho (?:on staff )?(?:sees?|reads?)\b|\bwho (?:on staff )?(?:sees?|reads?)\b.{0,30}\btexts?\b/i, "textwho"],
    [/\b(?:kids|children|minors?|under ?1[38]|teens?)\b.{0,40}\btext\w*|\btext\w*\b.{0,40}\b(?:kids|children|minors?|under ?1[38])\b/i, "minortext"],
    /* Prayer sent to an AI company is about prayer, never only about the model. */
    [/\bprayers?\b.{0,60}\b(openai|chat ?gpt|gpt|ai (company|companies|provider|service|model)|outside ai|another ai|an ai (company|model|service))\b|\b(openai|chat ?gpt)\b.{0,60}\bprayers?\b/i, "aiprayerco"],
    /* "Is this chat private?" before the prayer rule hears "private". */
    [/\b(is|are) (this|the|our|my) (chat|conversation)s? (being )?(private|recorded|saved|kept|stored|confidential|secure|monitored)\b|\b(does|do|will|can|could) (anyone|anybody|someone|somebody|a person|people|staff|the church|you|they)\b.{0,40}\b(see|sees|read|reads|watch|record|save|keep|store)\w*\b.{0,30}\b(what i (type|write|say|ask)|this chat|this conversation|my (chat|questions?))\b|\bwhat (do|does|will|happens)\b.{0,30}\b(what i (type|write|say)|this chat|this conversation)\b/i, "chat"],
    /* Other churches and outside providers, before the data export and the model hear their words. */
    [/\bother churches\b.{0,40}\b(see|sees|share|shared|sharing|access|data|read|information)\b|\b(share|shared|sharing|see|access)\w*\b.{0,50}\b(other|another) church(es)?\b/i, "otherchurches"],
    [/\bthird[- ]part(y|ies)\b|\bwhich (companies|vendors|providers|services)\b|\bprocess\w* (our|the|my|your|church) data\b|\b(sub-?processors?|data processors?)\b|\boutside (ai|companies|company|vendors?|providers?|services?)\b|\bai (company|companies|provider|providers|vendor|service)\b|\b(go|goes|sent|send|sends|passed|shared?)\b.{0,30}\b(to|with) (an? )?(outside|other|third|another) (company|companies|ai|vendor|provider|service)\b/i, "processors"],
    /* Who reports abuse: Hope reports to no one; the pastors follow the church's policy. */
    [/\b(report\w*|notif\w*|tell|told|call\w*)\b.{0,40}\b(police|authorities|cps|child protective|law enforcement)\b|\b(police|authorities|cps)\b.{0,40}\b(report\w*|notif\w*|told|call\w*)\b|\bmandat\w* report\w*|\b(does|will|would|can) (hope|genesis|it|the app|the system)\b.{0,20}\breport\b|\bwho (at church |on staff |at the church )?(is|gets) told\b|\bwho handles\b.{0,30}\b(abuse|danger|reports?)\b|\breporting (policy|abuse)\b/i, "reporting"],
    /* Staff messaging teenagers, prayer leaving the inbox, the lead pastor and Pastors only, guest chats, on-call cover. */
    [/^(?!.*\bparents?\b).*\b(youth pastor|youth leaders?|staff|leaders?|pastors?|volunteers?)\b.{0,40}\b(message|messages|messaging|dm|dms|text|chat|write to)\b.{0,40}\b(teens?|teenagers?|minors?|youth group|middle school\w*|high school\w*|under ?18)\b/i, "minormessage"],
    [/\b(forward\w*|export\w*|e-?mail\w*|send|sends|copy|copies|print\w*|download\w*)\b.{0,40}\bprayers?( requests?)?\b.{0,40}\b(personal|own|private|home|gmail|outside)\b|\bprayers?( requests?)?\b.{0,30}\b(forward\w*|export\w*)\b/i, "prayerforward"],
    [/\b(lead|senior|executive) pastor\b.{0,60}\b(read|see|open)\w*\b.{0,40}\bprayers?\b|\bmarked pastors only\b|\bpastors only\b.{0,40}\b(lead pastor|read|see)\b/i, "pastorsonly"],
    /* Round 3: questions that shared a word with another answer and got it. How abuse is handled, with
       no disclosure in it (the safety pre-check has already heard any disclosure), is the reporting answer. */
    [/\b(handl\w*|respond\w*|deal\w*)\b.{0,30}\b(abuse|harm|misconduct)\b|\b(abuse|misconduct) (reports?|allegations?|claims?|polic(y|ies))\b|\baccused of\b/i, "reporting"],
    [/\b(keep|hide|hid|block|private|secret)\w*\b.{0,40}\bprayers?( requests?)?\b.{0,40}\bfrom (the )?(other |another |my |our |a |one |certain )?(pastors?|lead pastor|senior pastor|staff|prayer team|elders?|deacons?)\b|\bprayers?( requests?)?\b.{0,30}\b(hidden|kept|private|secret) from (the )?(other |my |our |a )?(pastors?|lead pastor|staff|prayer team)\b/i, "prayerfromstaff"],
    [/\b(notif\w*|alerts?|alert emails?|emails?)\b.{0,40}\bprayers?( requests?)?\b.{0,30}\b(say|says|show|shows|include|includes|contain|contains|look like|go to|goes to|sent|send)\b|\bprayers?( requests?)?\b.{0,40}\b(notif\w*|alerts?|alert emails?)\b|\bwho (gets|is) (notified|alerted|emailed)\b.{0,30}\bprayer/i, "prayernotify"],
    [new RegExp("\\b(does|will|can|could|would) (" + AN_RX + "|the ai|ai|it|the assistant|the bot)\\b.{0,15}\\bpray(?!er)\\b", "i"), "hopeprays"],
    [/\b(write|writes|writing|draft|drafts|prepare|prepares|create|creates)\b.{0,20}\b(my |our |the |a |his |her )?(sermons?|homil\w*|devotionals?|bible stud(y|ies)|sunday (message|teaching))\b|\bsermons?\b.{0,20}\b(written|drafted)\b/i, "sermon"],
    [/\b(percent\w*|cut|fee|fees|take|takes|charge|charges)\b.{0,25}\b(of|on|from) (the |our |each |every |a )?(donations?|giving|gifts?|tithes?|offerings?)\b|\b(donations?|giving|gifts?|tithes?)\b.{0,20}\b(fee|fees|percent\w*|cut)\b/i, "givingfees"],
    /* Round 4: support signing in, removing access, marketing, giving records, who exports, group texting and texting costs. */
    [/\b(genesis|support)\b.{0,30}\b(log|sign)s? ?(in|into|on)\b|\b(log|sign)s? ?(in|into)\b.{0,30}\bwithout (asking|telling|us|our)\b/i, "staffaccess"],
    [/^(?!.*\bprayers?\b).*\b(see|sees|view|views|access)\b.{0,30}\b(phone( numbers?)?|numbers|e-?mail address\w*|home address\w*|addresses|contact (info|information|details))\b/i, "contactsee"],
    [/\b(remove|revoke|end|cut off|take away|turn off)\w*\b.{0,30}\baccess\b|\baccess\b.{0,30}\b(removed|revoked|ended|end)\b/i, "removeaccess"],
    [/\bmarket\w* (to|at)\b|\b(use|using|used)\b.{0,30}\b(data|information|emails?)\b.{0,20}\b(market\w*|advertis\w*)\b/i, "sell"],
    [/\b(giving|donations?|tithes?|contributions?)\b.{0,40}\b(export\w*|statements?|receipts?|records?|history|year-?end)\b|\b(export\w*|year-?end)\b.{0,40}\b(giving|donations?|tithes?|contributions?)\b/i, "givingexport"],
    [/\b(volunteers?|staff|who|anyone|admins?|ushers?|greeters?|leaders?)\b.{0,30}\b(export|download)\w*\b.{0,30}\b(directory|people|members|list|records)\b/i, "exportwho"],
    [/\b(support|tickets?|help ?desk)\b.{0,30}\b(how fast|how quickly|how long|response|respond|answer|reply)\b|\b(how fast|how quickly|how long)\b.{0,40}\b(support|tickets?)\b/i, "support"],
    [/\b(small group|group|leaders?|ministry)\b.{0,40}\btext(s|ing)?\b|\btext(s|ing)?\b.{0,30}\b(their|his|her|the|a|my) (small )?group\b/i, "grouptext"],
    [/\b(charge|cost|price|fee|pay)\w*\b.{0,30}\btext\w*|\btext\w*\b.{0,30}\b(charge|cost|price|fee)\w*/i, "textcost"],
    [/^(?!.*\baccess record\b)(?:.*\bexport\w*\b.{0,40}\b(list|people|members|data|records|spreadsheet|csv|excel|everything)\b|.*\b(download|pull|take|get)\b.{0,30}\b(out|back)\b.{0,30}\b(list|people|members|data|records|spreadsheet|csv)\b|.*\b(download|pull|take|get)\b.{0,30}\b(list|people|members|data|records)\b.{0,20}\b(out|as a (spreadsheet|csv)|into a (spreadsheet|csv)|to (a )?(spreadsheet|csv|excel))\b)/i, "data"],
    [/^(?!.*\bprayers?\b)(?:.*)\bwho (can |will |gets to )?(see|sees|read|reads|view|views|access)\b.{0,30}\b(phone( numbers?)?|numbers|emails?|e-?mail address\w*|home address\w*|addresses|contact (info|information|details))\b|\b(phone numbers?|contact (info|information|details)|email address\w*)\b.{0,30}\b(who|private|visible)\b/i, "contactsee"],
    [new RegExp("\\b(does|will|can|could|would) (" + AN_RX + "|the ai|ai|it|the assistant)\\b.{0,30}\\b(reply|replies|respond\\w*|answer\\w*|send\\w*)\\b.{0,30}\\b(on its own|by itself|automatically|without (a person|anyone|us|me|approval|asking))\\b|\\bauto[- ]?(reply|replies|respond\\w*)\\b", "i"), "autoreply"],
    [new RegExp("\\b(how (do|can|would) (i|we) know|will|does|could|would|can|won'?t|doesn'?t)\\b.{0,30}\\b(" + AN_RX + "|the ai|ai|it)\\b.{0,30}\\b(makes? up|make (things|stuff|it|something|answers?|facts?) up|makes? (things|stuff) up|invent\\w*|hallucinat\\w*|lie|lies|guess\\w*)\\b", "i"), "madeup"],
    [/\bsoc ?(2|ii)\b|\biso ?27001\b|\bpen(etration)? test\w*\b|\bsecurity (audit|certification|report)s?\b/i, "soc2"],
    [/\b(work|works|fit|fits|built|made|right|good) for (churches of )?(any|every|all|other|different|our|my) (denominations?|traditions?)\b|\b(any|every|all|other|different) denominations?\b|\bdenominations?\b.{0,30}\b(work|works|fit|use|support)\b/i, "denomfit"],
    [new RegExp("\\b(" + AN_RX + "|the ai|ai|it|the assistant|the bot)\\b.{0,30}\\b(give|gives|giving|offer\\w*|provide\\w*)\\b.{0,20}\\b(advice|counsel\\w*|therapy|diagnos\\w*)\\b|\\b(can|does|will) (" + AN_RX + "|it) (counsel|advise)\\b", "i"), "advice"],
    [/\b(illegal|a crime)\b|\b(have to|must|required to|need to|obligated to) report\b.{0,40}\b(i|me|tell|share|say)\b|\bkeep (it|this|what i (say|tell|share)) (private|secret|confidential|between us)\b|\bconfidential(ity)?\b.{0,30}\b(pastor|counsel\w*|talk|tell)\b/i, "confidential"],
    [/\b(chats?|conversations?|questions?)\b.{0,40}\b(guests?|visitors?|people)\b.{0,40}\b(hope|website|site)\b.{0,40}\b(saved|kept|stored|see|read|how long)\b|\b(see|read|view)\b.{0,20}\bwhat (guests?|visitors?|people) (asked|ask|typed|said)\b|\b(chats?|conversations?)\b.{0,40}\b(read|see|kept|saved|stored|how long)\b|\b(read|see|keep|save|store)\w*\b.{0,30}\b(that|the|those|guest|guests'|these) (chats?|conversations?)\b/i, "guestchats"],
    [/\bon[- ]call\b.{0,60}\b(vacation|away|sick|out|off|leave|travel\w*|cover\w*|backup|back-up)\b|\bwho covers\b/i, "oncallcover"],
    [/^(?!.*\b(?:giv\w*|tith\w*|donat\w*|offering\w*)\b).*(?:\b(replace|replacing|take the place of|do away with)\b.{0,20}\b(staff|team|pastors?|people|volunteers|care team|prayer team|ministers?|secretary|office manager|administrator|admins?|receptionist)\b|\b(instead of|without) (a |the |our |my )?(pastors?|staff|people|volunteers)\b)/i, "staffreplace"],
    [/\b(hope|ai|a\.i\.|assistant|bot|robot|it)\b.*\b(read|reads|reading|see|sees|summar\w*|reply|replies|respond\w*|answer\w*|write|writes|draft\w*)\b.*\b(prayers?|private)\b/i, "aiprayer"],
    /* "Can Genesis staff read our prayer requests?" is about Genesis, so it comes before the staff rule. */
    [/\b(genesis|your|vendor|support) (staff|team|engineers?|employees?|people|developers?|admins?)\b.*\b(read|see|open|access)|\b(can|could|do|does|will|would) (genesis|you|your (staff|team|engineers?|company))\b.*\b(read|see|open|access)\b.*\b(prayer|care|data|messages|records?)|\b(engineers?|developers?|database|whoever runs|(person|people|someone|anyone) (who|that) runs?|hosting company|tech support)\b.{0,60}\b(read|see|open|access)\w*\b|\b(who|anyone|anybody|someone|somebody|people|staff|employees?|engineers?) (at|from|in|inside|working (at|for)) (genesis|your company|the company)\b.{0,50}\b(read|see|open|access|look)\w*|\b(read|see|open|access)\w*\b.{0,40}\b(at|from) genesis\b/i, "staffaccess"],
    /* Nobody sees giving, whatever their role: "If a deacon is on the prayer team, can he see what people give?" */
    [/\b(see|sees|seeing|know|knows|view|views|access|look at|track|tracks)\b.{0,30}\b(what|how much|who) (people|members|someone|anyone|they|each person|families|folks|we|i|he|she|everyone)?\s?(give|gives|gave|donates?|tithes?)\b|\b(what|how much) (each|every|a|the)? ?(person|family|member|people|families|household)s? (give|gives|gave|tithes?|donates?)\b|\bgiving (history|records?|amounts?|data|totals?)\b|\bwho (gives|tithes|donates)\b|\b(see|view|access)\b.{0,20}\b(the )?(giving|donations|tithes)\b|\b(giving|donation|tax|year-end|year end|contribution) (statements?|receipts?)\b/i, "givingsee"],
    /* The pastors' mailbox: on Care it carries the prayer words. */
    [/\b(read|see|open|access|check|look at|get into)\w*\b.{0,40}\b(pastors?'?s?'?|the|that|our|church|shared) (e-?mail|mailbox|email account|email inbox)\b|\bmailbox\b/i, "mailbox"],
    [/\b(staff|office( manager)?|secretary|volunteers?|admins?|ushers?|greeters?)\b.*\b(read|see|open|access)\w*\b.*\bprayers?\b/i, "prayer"],
    /* Care the plan, and the Care Inbox the screen. */
    [/\bcare\b.{0,20}\bplan\b.{0,30}\b(or|vs\.?|versus|and)\b.{0,20}\binbox\b|\binbox\b.{0,30}\b(or|vs\.?|versus|and)\b.{0,20}\bcare plan\b|\bwhat (does|is) the care inbox\b|\bwhat'?s the care inbox\b|\bcare inbox do\b|\bdifference between (the )?care( plan)? and (the )?care inbox\b/i, "careplan"],
    /* "Is this a real church I can visit?": the churches are made up, in the workspace too. */
    [/\b(real church|is (this|it|that) (a )?real\b|made[- ]up|fake church|actual church|does (this|the) church (really )?exist|is (lightwell|lampstand|calder hill|goldenrod)\b.{0,30}\breal)\b/i, "real"],
    /* Plan questions that name plans but ask something narrower: seats, one campus, moving down, fees, a feature. */
    rx(oneCampus, "onecampus"),
    [/\b(limit|cap|maximum|max)\b.{0,40}\b(members?|people|adults|accounts)\b|\bhow many (members|people|adults)\b.{0,30}\b(use|sign|join|have|on)\b.{0,20}\b(app|accounts?|it|this)\b|\bunlimited (members|users|accounts|people)\b/i, "memberlimit"],
    [/\b(per|each|a|every) (member|person|head|attendee)\b.{0,20}\b(price|pricing|charge|cost|fee)\b|\b(charge|price|bill|pay)\w*\b.{0,15}\b(per|by the|for each|by) (member|person|head|attendee)\b|\bper[- ](member|person|head|attendee)\b/i, "permember"],
    [/\b(staff )?seats?\b|\bhow many (staff|users|logins|accounts|people can (sign|log) in)\b|\bseat (limit|count)\b|\b(users?|logins?) (are )?included\b/i, "seats"],
    [/\bdowngrad\w*|\bdrop(ping)? (down |back )?(from|to|a plan)\b|\b(move|moving|go|going|step|stepping) (back )?down (a |to (a |the )?|from )?(plan|tier|level|care|shepherd)\b|\bback (down )?to (care|shepherd)\b/i, "downgrade"],
    [/\b(setup|set-up|set up|onboarding|start-?up|activation|hidden|extra|additional|other|one-time|upfront|up-front|surprise)\s+(fees?|costs?|charges?)\b|\bfees?\b|\bhidden (costs?|charges?)\b|\bprices?\b.{0,20}\b(go(es)? up|going up|increase|rise|change)\b|\b(raise|increase)\w* (the |your |our )?prices?\b|\bprice (increase|lock|guarantee)\b/i, "fees"],
    fnRule(planFeature, "planfeature"),
    [/\b(cheapest|least expensive|lowest[- ]priced?|lowest|smallest|entry[- ]level|starter|basic|most affordable) (plan|option|tier|level|package|price)\b|\bcheapest\b/i, "cheapest"],
    /* The plans by name: two or three named together, or a plan's price, before any rule that hears "care" or "$". */
    fnRule(planPair, "levels"), fnRule(planPair, "planplus"), fnRule(planPair, "planshepherd"), fnRule(planPair, "plancare"), fnRule(planPair, "campus"),
    [/\bgenesis\b.{0,30}\b(christian|faith-based|faith based|believers?)\b|\b(christian|faith-based) (company|business|team)\b/i, "faithcompany"],
    [/\bwho (is|are) genesis( ai)?\b|\bwhat is genesis ai\b|\bwho (makes|made|built|builds|is behind|runs|owns) (this|it|genesis|hope|the platform|genesis ministry)\b|\babout genesis ai\b|\bgeai\b/i, "company"],
    [/\b(chat ?gpt|openai|anthropic|gpt|gemini|claude|llm|large language model)\b|\b(which|what) (ai|model|engine)\b|\b(built|running|based) on (an? )?(ai|model|gpt)\b|\bpowered by\b/i, "model"],
    [/\b(pretend\w*|claim\w*|act\w*|pass\w*|pose\w*) (to be |as )?(an? )?(human|person|real person)\b|\b(say|tell|admit|disclose)s? (it is|it'?s|that it is) (an? )?(ai|automated|bot|robot|machine)\b|\bknow (it is|it'?s|they are|they'?re) (talking|chatting) (to|with) (an? )?(ai|bot|robot|machine)\b/i, "nothuman"],
    [new RegExp("\\b(is|are) (" + AN_RX + "|you|it|this|the assistant) (a |an )?(real |actual )?(person|human|bot|robot|machine|ai)\\b", "i"), "nothuman"],
    /* "Can we turn the member app off and keep only the website?" is the Care plan. */
    [/\b(turn|switch|shut)\w* (the )?(member )?app off\b|\b(turn|switch|shut)\w* off the (member )?app\b|\bkeep (only|just) the (web ?site|site)\b|\bwithout the (member )?app\b/i, "plancare"],
    [new RegExp("\\b(turn|switch|shut)(ing)? (" + AN_RX + "|the (ai|assistant|chat(bot)?)) off\\b|\\b(turn|switch|shut)(ing)? off (" + AN_RX + "|the (ai|assistant|chat(bot)?))\\b|\\b(disable|pause)\\b.{0,12}\\b(" + AN_RX + "|the ai|the assistant)\\b|\\bwithout " + AN_RX + "\\b", "i"), "turnoff"],
    [new RegExp("\\b(" + AN_RX + "|ai|assistant|bot|it)\\b.{0,40}\\b(wrong|incorrect|false|outdated|inaccurate|mistakes?|made[- ]up|hallucinat\\w*|makes? (things|stuff) up)\\b", "i"), "wrong"],
    [/\b(minor|under ?18|under 18|underage|teen(ager)?s?|child|kid|student|young person)\b.*\b(writes?|messages?|messaged|sends?|contacts?|reaches out|emails?)\b|\bif (a|someone) (minor|teen|kid|child|under)|\b(1[0-7]|thirteen|fourteen|fifteen|sixteen|seventeen)[- ]?(year|yr)s?[- ]?old\b.*\b(writes?|messages?|messaged|emails?|contacts?|reaches|texts?|dms?|sends?)\b/i, "minor"],
    [/\b(1[0-7]|sixteen|fifteen|seventeen|fourteen|thirteen)[- ]?(year|yr)|\b(minor|teen(ager)?s?|under ?18|kids?|children|students?)\b.*\b(sign ?up|sign ?in|accounts?|join|use (?:the|this) app)\b|\bteen\w*\b.{0,30}\b(?:use|on (?:their|his|her) own)\b.{0,20}\bapp\b|\b(?:keep|store|collect|have)\w*\b.{0,20}\b(?:my )?(?:children|kids|child)'?s? (?:info\w*|data|details|records?)\b/i, "age"],
    /* "If we leave, can we get our data in a spreadsheet?" is the export, never the import. */
    [/\b(if|when) (we|you) leave\b(?!\s+(for|because|due|church|early|the service|on|in|at)\b)|\bleave genesis\b|\bexport (our|the|my|everything|all)\b|\b(get|take) (our|my|the) data\b|\bour data back\b/i, "data"],
    [/\bimport|bring (over|in) (our|the|my) (people|members|list)|(people|member) (list|data) (from|into)|entered twice|double entry|migrat\w*|\bspreadsheets?\b|\bexcel\b|\bcsv\b/i, "importpeople"],
    [/\bhipaa\b/i, "hipaa"],
    [/\bprivacy (policy|policies|notice|page|statement)\b/i, "privacypolicy"],
    [/\b(sell|sells|selling|sold|rent|rents|monetiz\w*)\b.{0,30}\b(data|information|info|lists?|emails?|contacts?|people)\b|\b(data|information) (is |are )?(sold|for sale)\b|\badvertis\w*|\bthird[- ]part(y|ies)\b/i, "sell"],
    [/\bhost(ed|ing)?\b|hipaa|complian\w*|gdpr|soc ?2|regulat\w*|where is (the |our )?data|stored|secure|security|backups?|encrypt\w*|servers?\b|safe is (the |our )?data|\b(is|are) (my|our|the|their) (data|information|records?|members'? (data|information)|people'?s? (data|information)) (safe|secure|protected|private)\b|\bdata (safe|safety|protection|privacy)\b|keep (our|the|my) (data|information) (safe|secure)|privacy of (our|the|my) data/i, "hosting"],
    /* Ending a plan is a buying question: how it ends, then the data export. */
    [/\bcancel\w*\b.{0,25}\b(any ?time|anytime|plan|subscription|service|contract|genesis|account|later|month)\b|\b(can|could) (we|i) cancel\s*[?.!]*\s*$|\bend (our|the|my) (plan|subscription|service|contract)\b|\bstop paying\b/i, "cancel"],
    /* "Can we text the whole church when we cancel for snow?" is texting, never the data export. */
    [/\btext(s|ing)?\b.{0,40}\b(whole|entire|all|every(one|body)?|the) (church|congregation|members|people|families)\b|\b(mass|group|bulk|church-?wide|all-?church) (texts?|texting|sms|messages?)\b|\b(snow|weather|closing|closure|cancel\w*)\b.{0,40}\btext(s|ing)?\b|\btext(s|ing)?\b.{0,40}\b(snow|weather|closing|closure)\b/i, "masstext"],
    [/\b(if|when) (we|you) (leave|cancel|stop)(?!\s+(for|because|due|church|services?|sunday|worship|the service|on|in|at)\b)|leave genesis|our data|own (the|our) data|export (our|the|my|everything)|data (portab\w*|ownership)|who owns (the|our|my) (data|information|records?)|\bwants? to (leave|cancel|switch)|(cancel|end) (our|the|my) (contract|account|subscription|service)|switch (to another|away|providers?)/i, "data"],
    [/\b(delete|deleted|deleting|erase|erased|wipe)\b|remov(e|ing) (a|the|our|my|this|that) (prayer|request|thread|note|message|record|conversation)/i, "archive"],
    [/how long (does it|will it|to)|\bhow long\b.{0,30}\b(live|launch\w*|up and running|set ?up|built|ready to (go|use))\b|\bwhen (can|could|will|would|do) (we|i|it|our (site|website|church)) (go|be|get) (live|launched|up and running)\b|(launch|go live|get live|set ?up) (time|take|date)|\bgo-?live\b|timeline|how (soon|fast|quickly)\b.{0,40}\b(live|launch\w*|up and running|ready|built|set ?up|get started|start)|weeks? to launch|days to launch/i, "launch"],
    /* Staff training only. AI training is the first trust rule. */
    [/\btrain(ing|ed)? (for |of )?(our|the|my|your)?\s?(staff|team|volunteers|people|pastors|leaders|admins?)\b|\b(staff|team|volunteer|admin) training\b|\b(is there|do you (offer|provide|do)|any|what) training\b|\bhow (do|will|does) (we|our staff|the staff|staff|our team) (learn|get trained)\b|onboard (our|the) staff|walk ?through for (our|the) staff|learn (it|to use)|support after launch/i, "training"],
    [/\b(volunteers?|people|members?|guests?)\b.{0,30}\bsign (up|on)\b.{0,30}\bserv\w*\b|\bsign[- ]?ups? (to|for) serv\w*\b|\bserv\w*\b.{0,30}\bsign[- ]?ups?\b/i, "serving"],
    [/\b(schedul\w*|rota|roster|rotation)\b.{0,30}\b(volunteers?|teams?|serving|servers|ushers|greeters|worship team|nursery)\b|\bvolunteers?\b.{0,30}\b(schedul\w*|rota|roster|rotation)\b|\bvolunteer (management|scheduling)\b/i, "schedule"],
    [/\b(android|iphone|ios|ipad|app store|play store|google play|apple store)\b|\b(mobile|phone) app\b.{0,30}\b(store|download|work|available)\b|\bdownload (the |an |our )?app\b/i, "phones"],
    [/\b(spanish|espa(ñ|n)ol|bilingual|another language|other languages?|second language|multilingual|translat\w*|korean|mandarin|chinese|vietnamese|portuguese|french|haitian|creole)\b/i, "language"],
    [/\b(grow|grows|growing|get|gets) (past|beyond|over|bigger than|larger than)\b.{0,20}\b(1,?000|a thousand|\d{4,5})\b|\b(past|over|more than|beyond) (1,?000|a thousand) (people|members)\b|\boutgrow\w*\b/i, "growth"],
    [/^(?!.*\b(crisis|emergenc\w*|danger\w*|suicid\w*|988|911|hurt\w*|abus\w*)\b).*(?:\b(breaks?|broken|goes down|stops working|not working|crash\w*|outage|problem|issue)\b.{0,40}\b(sunday|weekend|morning|night|after hours)\b|\bwho do (i|we) call\b|\b(tech(nical)? )?support\b.{0,30}\b(hours|sunday|weekend|24\/7|phone|number|when)\b|\bsupport (line|hours|phone|number)\b|\b24\/?7\b)/i, "support"],
    [/\battendance\b|\bheadcount\b|\bwho (came|showed up|attended)\b|\b(take|track|count)\w* (attendance|who comes)\b/i, "attendance"],
    [/\b(kids?|child(ren)?|nursery|student|youth)\b.{0,15}\bcheck[- ]?ins?\b|\bcheck[- ]?ins?\b.{0,15}\b(kids?|child(ren)?|nursery)\b|\b(do|does|can|will) (it|this|genesis( ministry)?|you) (do|handle|run|offer|include|support) (kids'? |child |children'?s? )?check[- ]?ins?\b/i, "checkin"],
    [/\breferences?\b|\b(talk|speak|call) (to|with) (a |another |other |some )?church(es)?\b.{0,30}\b(use|using|uses|used)\b|\b(churches|anyone|who) (are |is )?(already )?using (it|this|genesis)\b|\bother churches\b.{0,30}\b(use|using)\b|\bcase stud\w*|\btestimonials?\b|\bhow many churches\b/i, "references"],
    [/\bwho (builds|makes|designs|sets up|creates|writes) (the |our |my )?(web ?site|site|content|pages?)\b|\b(do|does|will) (we|i|you|genesis) (have to )?(build|make|design|write) (the |our |my )?(web ?site|site)\b|\bbuild (the|our) (web ?site|site) (ourselves|for us)\b/i, "whobuilds"],
    [/\b(web ?site|site)\b.{0,20}\b(extra|separate|cost extra|included|add-?on)\b|\b(is|are) (the )?(web ?site|site|hope) (extra|included|separate)\b|\bhow much (is|does) the (web ?site|site)\b/i, "websitecost"],
    [/\b(believe|believes|views?|position|stance|teach|teaches) (about|on)\b|\b(gay|lgbtq?\w*|same[- ]sex|homosexual\w*|transgender|affirming)\b|\bwomen (pastors?|preach\w*|elders?|leaders?|in ministry)\b|\bwomen be (pastors?|elders?)\b|\bdenomination\w*\b|\bstatement of faith\b|\bdoctrin\w*\b/i, "beliefs"],
    [/\bonline giving\b|\b(take|takes|accept|accepts|collect|collects|process|processes|receive|handle|handles)\b.{0,30}\b(donations|gifts|giving|tithes|offerings|payments)\b|\b(do|does|can|will) (it|this|genesis( ministry)?|the app|the platform) (do|handle|process|take|offer|include|support) (online )?(giving|donations|tithes|payments)\b|\bgiving (platform|provider|tool|page|system)\b/i, "giving"],
    /* Other church tools: how Genesis differs, whether it works with them, and the web address, before "can we keep". */
    [/\b(different|differ\w*|compar\w*|vs\.?|versus|better than|instead of)\b.{0,30}\b(planning center|subsplash|pushpay|breeze|tithe\.?ly|church ?center|ccb|rock rms|elvanto|other church (software|tools?))\b|\b(planning center|subsplash|breeze|pushpay|tithe\.?ly)\b.{0,30}\b(different|differ\w*|vs\.?|versus|compar\w*|better)\b/i, "different"],
    [/\b(do|does|can|will) (you|it|this|genesis( ministry)?) (work|integrate|connect|sync|play) (well |nice(ly)? )?(with|beside|alongside|to)\b|\b(work|works|integrate|integrates|connect|connects|sync|syncs) with (planning center|subsplash|pushpay|breeze|tithe\.?ly|church ?center|ccb|rock|elvanto|realm)\b|\bintegrat(e|es|ion|ions)\b/i, "worksbeside"],
    /* "Why pay $149 when Squarespace costs $30?" is about value; "we paid for a redesign last year" is about keeping it. */
    [/\b(squarespace|wix|weebly|godaddy|website builders?)\b.{0,60}(\$|\b(cost|costs|cheaper|price|month)\b)|\bwhy (would|should) (i|we) pay\b/i, "value"],
    [/\b(redesign\w*|new website|built (a|our) (web ?site|site)|paid (someone|a designer|a company))\b.{0,80}\b(last year|already|existing|throw (it )?away|keep)\b|\bthrow (it|our (current |old |existing )?(web ?site|site)) away\b/i, "keepsite"],
    /* "Can we keep our current website and just add Hope to it?" is the website, not Planning Center. */
    [new RegExp("\\b(keep|use|stay with|stick with|hold on to)\\b.{0,30}\\b(current|existing|own|old|present)\\s+(web ?site|site|page)\\b|\\b(current|existing|own|old) (web ?site|site)\\b.{0,40}\\b(add|keep|embed|plug|use)\\b|\\badd (" + AN_RX + "|it|the assistant|the chat\\w*|a chat\\w*)\\b.{0,30}\\b(to|on|into) (our|my|the) (current |existing |own |old )?(web ?site|site)\\b|\\bembed\\w*\\b|\\bplug-?ins?\\b|\\b(wordpress|squarespace|wix|ekklesia|nucleus)\\b", "i"), "keepsite"],
    [/\bdomains?\b|\bweb ?(address|site address)\b|\burl\b|\bdns\b/i, "domain"],
    /* "Can we keep Planning Center?" only: "Can I keep a prayer request from the other pastors?" is prayer. */
    [/\b(can|could|may|do) (we|i) (keep|still use|stay with|continue (using|with))\b.{0,40}\b(planning center|pco|subsplash|breeze|ccb|church community builder|pushpay|tithe\.?ly|church ?center|rock rms|elvanto|realm|(our|the|my) (current |existing |old )?(tools?|software|systems?|chms|church management|giving (provider|platform|tool|page)|apps?))\b|\bkeep using\b.{0,40}\b(planning center|pco|subsplash|breeze|ccb|pushpay|tithe\.?ly|church ?center|(our|the|my) (current |existing )?(tools?|software|systems?|chms|giving provider|apps?))\b|\b(does|will|can) (it|this|genesis( ministry)?) (work|integrate|connect|sync) (with|beside|alongside|to)\b/i, "pcokeep"],
    [/planning center|subsplash|pushpay|church ?center|breeze|tithe\.?ly|church management|chms|check-?in|replace (our|the|my) (chms|church management|giving|planning center|subsplash|software|tools?|apps?|system|website)/i, "pco"],
    [/\bon[- ]call\b|after hours|middle of the night|who (gets|is) (alerted|notified|paged)/i, "oncall"],
    [/\bcrisis|emergenc\w*|\b988\b|\b911\b|someone (is )?(hurting|in danger)|safety plan/i, "crisis"],
    [/spiritual gifts?|gifts? (conversation|assessment|test|survey|inventory|results?|picture|score|chart|names?)|my gifts|who (can |will )?(see|sees|read|reads)\b.{0,20}\bgifts?\b/i, "giftsinfo"],
    [/access record|who (on staff |at church |at the church )?(has )?opened|audit (log|trail)?|log of (who|every)|record of (who|every)|track(s|ed)? (who|every)/i, "accessrecord"],
    /* Prayer access needs the word prayer or request: "Who can see our giving?" is not prayer. */
    [/(\bwho (can |will |gets to )?(see|sees|read|reads|open)\b|\bprivate\b|\bconfidential\b).{0,40}\b(prayers?|requests?)\b|\bprayers?( requests?)?\b.{0,40}\b(private|confidential|who (can |will )?(see|sees|read|reads|open))\b|prayer team see|see (the |my |our )?prayer/i, "prayer"],
    [/sign ?in|log ?in|password|6[- ]?digit|sign up|members? need/i, "signin"],
    /* Round 5: texting intent only, never "the text of a prayer request". */
    [/\b(?:texting|sms)\b|\btext (?:messages?|guests?|people|members|us|me|them)\b|\b(?:send|get|receive|turn (?:off|on)|stop|includ\w*)\b.{0,20}\btexts?\b|\btexts?\b.{0,30}\b(?:included|extra|a month|per month)\b/i, "texting"],
    /* A guest's own unsubscribe. */
    [/\b(guests?|visitors?|newcomers?|people|members?)\b.{0,30}\b(unsubscribe\w*|opt[- ]?out|stop (getting|receiving) (emails?|messages)|stop (the )?emails?)\b|\bunsubscribe\w*\b.{0,30}\b(guests?|visitors?|newcomers?)\b|\bstop guest emails\b/i, "guestunsub"],
    [/\bnewsletter sign-?ups?\b|\b(send|sends|sending|write|email|mail)\b.{0,30}\bnewsletters?\b|\bnewsletters?\b.{0,30}\b(send|sent|from here|tool)\b|\bmailchimp|constant contact|email (blasts?|campaigns?|marketing)\b/i, "newsletter"],
    [/\bhow (do|does|will|can|could) (i|we|you) (contact|reach|get in touch with) (you|genesis|someone|a person)\b/i, "call"],
    [/\bcontracts?\b|\b(sign|signing) (a |an )?(contract|agreement)|\bcommitment\b|\block(ed)? in\b|\bterms\b/i, "contract"],
    [/\b(free )?trials?\b|\btry\b.{0,20}\b(free|first|out|before (we|you|i) (buy|sign|commit|pay))\b|\btest drive\b|\bpilot\b|\bfree (version|tier|plan|period|month|weeks?)\b/i, "trial"],
    [/\bupgrad\w*\b|\b(change|switch|move) (our |the |my )?(plan|plans|tier|level)\b|\b(move|go) up (a |to (a |the )?)?(plan|tier|level)\b|\bstart (small|with care|on care|on the care plan)\b|\badd (more |the rest |features )?(later|as we grow)\b/i, "upgrade"],
    [/\bdiscount\w*|\bnon-?profit (rate|price|pricing|discount)\b|\bcoupon\w*|\bannual (price|pricing|plan|billing|discount)\b|\bpay (yearly|annually|for a year)\b|\bcheaper\b|\bspecial (price|pricing|rate|offer)\b/i, "discount"],
    [/\b(prices?|pricing|costs?|how much|fees?|dollars?|afford|budget)\b|\$|\bis (it|this|genesis( ministry)?) free\b/i, "price"],
    [/custom\w*|our own (look|design|colou?rs|logo|fonts?)|\b(our own|use our( own)?) (photos?|pictures|images|logos?|colou?rs)\b|redesign|change the (look|design)/i, "custom"],
    [/\bget(ting)? started\b|\bhow (do|can|would|should|does) (we|i|a church|our church) (start|begin|sign up|join)( with| using)? (genesis|this|it|genesis ministry)\b|\bhow (do|can) (we|i) sign (up|our church up)\b|\bsign (us|our church) up\b/i, "start"],
    [/\b(book|schedule|set up|arrange|request) (a |an )?(call|meeting|demo|consultation|walk ?through)\b|\btalk (to|with) (genesis|sales|someone at genesis|a person at genesis)\b|\b(talk|speak|chat) (to|with) (a |an )?(real |live )?(person|human)\b|\b(talk|speak|chat) (to|with) (someone|somebody|a person) (at|from) genesis\b|\breal (person|human)\b|\bcontact genesis\b|\bget in touch\b|\b(try|see|demo|test|use) (it|this|genesis( ministry)?) (with|for|on|using) (my|our) (own )?church\b|\bwith (my|our) own (church|content|people|photos)\b/i, "call"],
    [/\bcampus(es)?\b|multi-?sites?|multiple (locations|sites|campuses)|more than one (campus|location|site)|(second|another|new) (campus|location)\b|(second|another) site\b/i, "campus"],
    [/\b(work|built|made|fit|right|good) for (a )?(small|smaller|tiny|big|large|larger)\b|\b(small|smaller|tiny|big|large|larger) church(es)?\b|\bchurch(es)? (of|with) (about |around |only |just |under |over )?\d{2,5}\b|\bhow (big|small) (does|do|should|must) (a |our |the )?church\b|\bminimum size\b|\btoo (small|big|much)\b|\bwe (are|have) (about |around |only |just )?\d{2,4} (people|members|adults)\b|\b(the )?only (staff|employee|staff member|person on staff)\b|\bby myself\b/i, "size"],
    /* One plan named on its own: "What is the Shepherd plan?" */
    fnRule(planOne, "plancare"), fnRule(planOne, "planshepherd"), fnRule(planOne, "planplus"),
    [/\b(levels?|tiers?|includ\w*|packages?|plans|(?:care|shepherd|plus) plan|enterprise)\b|what do (we|i) get|(which|what) plans?\b/i, "levels"],
    [/\b(ai|a\.i\.|artificial|automat\w*|bots?|robots?|limits?|limited)\b|what can (hope|it) do|\b(can|does|will|could) (hope|it) (send|reply|write|answer|respond|draft)/i, "ai"],
    [/what is (this|genesis|the platform)|genesis ministry|tell me about (this|the platform)|what does (this|it) do/i, "platform"],
    /* Last: "How do we buy it?" is how a church gets started. */
    [/\b(buy|purchase)\b|\bsubscribe (to|for) (genesis|this|it|a plan|the plan)\b/i, "start"]
  ];

  var MORE_KEYS = ["staffreplace", "aiprayer", "pcokeep", "importpeople", "age", "minor", "data", "hosting", "launch", "training", "staffaccess", "archive", "campus", "accessrecord", "oncall", "giftsinfo",
    "seats", "contract", "trial", "model", "turnoff", "nothuman", "wrong", "giving", "guestunsub", "sell", "newsletter", "company", "size",
    "worksbeside", "different", "domain", "memberlimit", "upgrade", "cancel", "discount", "plancare", "planshepherd", "planplus",
    "aitraining", "onecampus", "masstext", "keepsite", "givingsee", "mailbox", "careplan", "schedule", "permember", "phones", "language", "growth", "support",
    "attendance", "checkin", "references", "whobuilds", "hipaa", "websitecost", "downgrade", "beliefs", "fees", "planfeature", "cheapest",
    "aiprayerco", "processors", "otherchurches", "reporting", "minormessage", "prayerforward", "pastorsonly", "guestchats", "oncallcover", "value", "serving", "faithcompany", "privacypolicy",
    "prayerfromstaff", "prayernotify", "hopeprays", "contactsee", "givingfees", "autoreply", "madeup", "soc2", "denomfit", "advice", "sermon", "confidential", "removeaccess", "givingexport", "exportwho", "grouptext", "textcost", "texting",
    "multisite", "sharelogin", "prayeranon", "prayerwall", "pastornotes", "legalrequest", "freeplan", "bibletrans", "websiteown", "exportterms", "chatexport", "grief", "textwho", "minortext"];
  /* Answers that a person at Genesis settles: Talk With Genesis sits under each one, on every Hope. */
  var TALK_KEYS = ["call", "start", "domain", "keepsite", "language", "support", "references", "contract", "trial", "cancel", "discount", "fees", "growth", "whobuilds", "processors", "prayerforward", "guestchats", "faithcompany", "soc2"];
  /* Trust and policy answers the workspace dock gives before a screen's own answers ("Who covers when
     the pastor on call is away?" on a person page is about on-call cover, not that person). */
  var FIRST_KEYS = ["givingsee", "model", "staffaccess", "removeaccess", "givingexport", "exportwho", "grouptext", "textcost", "aitraining", "aiprayerco", "chat", "processors", "otherchurches", "sell", "reporting", "minormessage", "prayerforward", "pastorsonly", "guestchats", "oncallcover", "prayerfromstaff", "prayernotify", "hopeprays", "contactsee", "confidential", "sermon"];
  function talkChips() { return [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does Each Plan Include?", key: "levels" }]; }
  function addMore(answers, a, chips) { MORE_KEYS.forEach(function (k) { if (!answers[k]) answers[k] = a(ANSWERS[k], TALK_KEYS.indexOf(k) >= 0 ? talkChips() : chips); }); return answers; }
  /* Inside a church's own screens, the on-call answer names who is on call there. */
  if (GM && GM.church && GM.side !== "genesis" && GM.plan >= 2) ANSWERS.oncall +=" At " + GM.church.short + ", " + GM.church.carePastor + " is the pastor on call.";
  /* On the Care plan a church's prayer forms go by email, words and all, so the prayer answer says so. */
  if (GM && GM.side === "church" && GM.plan === 1) ANSWERS.prayer = ANSWERS.prayer01;

  if (!GM) { storyPages(); return; }

  var FILE = (location.pathname.split("/").pop() || "church-today.html").replace(/\.html$/i, "");
  var P = new URLSearchParams(location.search);
  var SIDE = GM.side;
  var MEMBER = SIDE === "member";

  /* "Goldenrod Commons'" and "Lightwell's": a name that ends in s takes an apostrophe only. */
  function poss(n) { n = String(n || ""); return /s$/i.test(n) ? n + "'" : n + "'s"; }
  function fill(s) {
    s = String(s == null ? "" : s).replace(/\{assistant\}/g, AN);
    if (GM && GM.church) s = s.replace(/\{church\.short\}'s/g, poss(GM.church.short)).replace(/\{church\.name\}'s/g, poss(GM.church.name));
    return GM.fill(s);
  }
  var IS_PHONE = window.innerWidth <= 860;
  /* The plan switch on a phone lives behind the initials at the top. */
  var PLAN_HINT = IS_PHONE && !MEMBER ? " On a phone, tap your initials at the top, then pick a plan." : "";
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
  /* Every run is a church buyer's demo, from Today to the overview's plans. */
  var ORIGIN = "church";
  var PATH_ALL = [
    { key: "church-today", label: "The Church Workspace" },
    { key: "church-website", label: "The Website Package", module: "website", plans: [1] },
    { key: "church-guests", label: "Guests", module: "guests" },
    { key: "church-guest", label: "One Guest", module: "guests" },
    { key: "church-care", label: "The Care Inbox", module: "care" },
    { key: "church-person:record", href: "church-person.html?id=p-sarah", label: "One Person", module: "people" },
    /* The Plus plan sells the Access Record screen, so its demo shows it. */
    { key: "church-access", label: "The Access Record", module: "access", plans: [3] },
    { key: "church-gifts", label: "Gifts", module: "gifts" },
    { key: "church-reports", label: "Reports", module: "reports" },
    { key: "member-home", label: "The Member App", module: "member-app" },
    { key: "member-prayer", label: "Member Prayer", module: "member-app" },
    { key: "member-messages", label: "Member Messages", module: "member-app", plans: [2] },
    { key: "member-give", label: "Give", module: "member-app", plans: [2] },
    { key: "member-gifts", label: "The Gifts Conversation", module: "member-gifts" },
    { key: "member-gifts:talk", href: "member-gifts.html?step=talk", label: "One Statement at a Time", module: "member-gifts" },
    { key: "member-gifts-result", label: "Gifts to Explore", module: "member-gifts" },
    ORIGIN === "desk"
      ? { key: "index", label: "Back to the Overview", tour: false }
      : { key: "index", href: "index.html#levels", label: "See the Plans", tour: false }
  ];
  /* The short way through goes from Member Prayer straight into the gifts conversation (its own first
     screen is one card of what to expect, which the conversation itself shows). */
  var SHORT_SKIP = P.get("pace") === "short" ? ["member-gifts"] : [];
  var PATH = PATH_ALL.filter(function (e) { return (!e.plans || e.plans.indexOf(GM.plan) >= 0) && (!e.desk || ORIGIN === "desk") && SHORT_SKIP.indexOf(e.key) < 0; })
    .map(function (e) { return SHORT_SKIP.length && e.key === "member-gifts:talk" ? Object.assign({}, e, { label: "The Gifts Conversation" }) : e; });
  /* The church buyer's demo closes the week's story on its last screen: Maya, the first-time guest,
     and Sarah, who asked the church to pray for her mom. On the Care plan (the website only) it says what
     the next plans add instead. */
  /* Which plan this demo shows, with its price, in one sentence. */
  function planShown() {
    return GM.plan === 3 ? "You are seeing the Plus plan, $499 a month. Shepherd, $299 a month, covers Today through the Care Inbox and the member app."
      : GM.plan === 2 ? "You are seeing the Shepherd plan, $299 a month. Plus, $499 a month, adds person pages, the gifts picture and reports."
      : "You are seeing the Care plan, $149 a month.";
  }
  function churchClose() {
    if (GM.plan === 1) return "You saw the Care plan, $149 a month. Next, see what the Shepherd and Plus plans add.";
    var maya = GM.draftStatus && GM.draftStatus("d-01") === "approved" ? "Maya heard from Nadia before her first Sunday" : "Maya's welcome from Nadia is ready before her first Sunday";
    /* Shepherd shows the call as a message ("A call about your mom"); Plus shows the promise on Sarah's page. */
    var sarah = GM.plan >= 3 ? "Sarah knows " + GM.church.carePastor + " is calling tonight at 7" : "Sarah has a message from " + GM.church.carePastor + " about a call tonight";
    var plan = GM.plan === 3 ? " You saw the Plus plan, $499 a month. Shepherd, $299 a month, covers everything up to the Care Inbox and the member app." : " You saw the Shepherd plan, $299 a month. Plus, $499 a month, adds person pages, the gifts picture and reports.";
    return "This week " + maya + ", and " + sarah + ". Nobody fell through. That is Genesis Ministry for your church." + plan;
  }
  var CHURCH_CLOSE = churchClose();
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
    "member-gifts:done": { href: "member-gifts.html?step=done", label: "The Last Step", module: "member-gifts" }
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
  /* How a screen is named inside a sentence ("the member app", "a person's page"), never as a button label. */
  var SAY = {
    "church-today": "the church workspace", "church-website": "the website package", "church-guests": "Guests", "church-guest": "a guest's record",
    "church-care": "the care inbox", "church-person:record": "a person's page", "church-gifts": "the gifts picture", "church-reports": "Reports",
    "member-home": "the member app", "member-prayer": "prayer in the member app", "member-messages": "messages in the member app", "member-give": "Give",
    "member-gifts": "the gifts conversation", "member-gifts:talk": "the gifts conversation", "member-gifts-result": "Gifts to Explore",
    "church-team": "Team Roles", "church-access": "the access record"
  };
  function sayOf(e) { return SAY[e.key] || String(e.label || "").replace(/^The /, "the "); }
  function cap(t) { t = String(t || ""); return t.charAt(0).toUpperCase() + t.slice(1); }
  function skipNote(skipped, to) {
    if (!skipped.length) return "";
    /* On the Care plan the last card already says what the next plans add. */
    if (to.key === "index" && ORIGIN === "church" && GM.plan === 1) return "";
    var plans = [];
    skipped.forEach(function (e) { var l = levelOf(e.module); if (plans.indexOf(l) < 0) plans.push(l); });
    plans.sort(function (a, b) { return a.n - b.n; });
    var planNames = "the " + listNames(plans.map(function (l) { return l.name; })) + (plans.length > 1 ? " plans" : " plan");
    var names = [], church = false, member = false;
    skipped.forEach(function (e) { var n = sayOf(e); if (names.indexOf(n) < 0) names.push(n); if (/^church-/.test(e.key)) church = true; if (/^member-/.test(e.key)) member = true; });
    var what = names.length <= 3 ? cap(listNames(names)) + (names.length === 1 ? " comes" : " come")
      : "The rest of " + (church && member ? "the church workspace and the member app come" : church ? "the church workspace comes" : "the member app comes");
    var one = names.length === 1;
    var tail = to.key === "index" ? (ORIGIN === "church" ? ", so the demo ends here." : ", so the demo goes back to the overview.") : ", so the demo goes to " + sayOf(to) + " next.";
    return what + " with " + planNames + tail + " Switch the plan to see " + (one ? "it" : "them") + ".";
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
    if (!hop || !hop.entry) return null;
    var to = hop.entry;
    var href = hrefOf(to);
    if (/^church-|^member-/.test(href)) href = GM.url(href);
    /* Inside the member app, its Home is "Home", not "The Member App". */
    var toLabel = MEMBER && to.key === "member-home" ? "Home" : to.label;
    return { label: (to.key === "index" ? "" : "Next: ") + toLabel, href: href, tour: to.tour !== false, note: skipNote(hop.skipped, to), last: to.key === "index" };
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
      if (GM.ctx && GM.ctx.locked) return { title: "The Care plan", done: "On the Care plan a church gets a website that welcomes people, with {assistant} answering questions and every form arriving by email. Next, the website package itself.", steps: [
        { sel: "#td-page .v2-page-head", essential: true, h: "The Care plan starts with the website", p: "The Care plan is the website in one of four looks, with {assistant} answering questions on it. This is the screen a church on the Care plan sees." },
        { sel: ".td-grid3", h: "Website, brand board and social plan", p: "{church.name}'s website in the {church.look} look, a brand board any volunteer can follow, and a social marketing plan." },
        { sel: "#td-page > .v2-pulse", essential: true, h: "Every form arrives by email", p: "Plan a Visit, prayer and newsletter forms reach the church by email. On this plan the prayer words are in that email, sent only to the pastors' address." },
        { sel: ".gm-locked-card", essential: true, h: "Today comes with the Shepherd plan", p: "This preview is showing the Care plan. The Shepherd plan adds this view, the guest pipeline, the locked care inbox, the member app and drafts that wait for approval." },
        { sel: PLAN_SEL, h: "Switch the plan any time", p: (IS_PHONE ? "Tap your initials at the top, then pick Shepherd or Plus" : "Shepherd and Plus are one click away") + ", so a church sees exactly what each plan adds." }
      ] };
      var recorded = GM.isIncluded("access") ? "a record of who opened what" : "every open recorded (the Plus plan adds the Access Record screen)";
      /* The week has two people in it: Maya, a first-time guest, and Sarah, who asked for prayer. */
      var maya = GM.guest("g-01"), mayaFirst = maya && GM.draftStatus(maya.draft) === "waiting";
      return { title: "Today", done: mayaFirst ? "That is Today. One calm list of what needs a person, so Maya hears from someone today and nobody falls through the cracks." : "That is Today. One calm list of what needs a person, so nobody falls through the cracks.", steps: [
        { sel: T("today.hope"), h: "{assistant} reads the week first", p: "{assistant} puts today's list in order and says who comes first. Beside it: the goal for a first reply to care, adults in the member app and the drafts that need your judgment. " + planShown() },
        mayaFirst
          ? { sel: T("today.next"), h: "Maya comes first today", p: "Maya T. filled out Plan a Visit on Wednesday night. She is coming Sunday with her husband and two kids, and her welcome note is due today. Next and Skip for Now work through the rest, one person at a time.",
              phone: { focus: [".v2-next-move h2, .v2-next-move .v2-next-actions .v2-button-primary"], p: "Maya T. filled out Plan a Visit on Wednesday night. She is coming Sunday with her husband and two kids, and her welcome note is due today. Review Welcome Note opens it." } }
          : { sel: T("today.next"), h: "Your next move", p: "One guest or care item at a time, most important first, with an owner and a reason. Next and Skip for Now work through the list." },
        { sel: T("today.glance"), h: "The day at a glance", p: "New guests, care waiting on us and follow-ups due. Each number opens the list behind it." },
        { sel: T("today.drafts"), h: "{assistant} drafts, a person decides", p: mayaFirst ? "{assistant} already wrote Maya a note: how kids check-in works and where Nadia will meet the family {church.welcomeSpot}. It waits until a person chooses Approve and Send, Edit or Not Now." : "Welcome notes are labeled and wait for approval. Nothing goes out on its own.",
          focus: [".gm-draft-actions"], phone: { sel: [T("today.drafts") + " .gm-draft-actions", T("today.drafts")] } },
        { sel: [T("today.care"), T("today.seen")], h: "What each role sees on Today", p: "Topics only, even for pastors: Sarah's request reads Health. Switch to Staff and the prayer rows disappear, so an office manager sees only that prayer is with the pastors and the prayer team.",
          phone: { sel: [T("today.seen"), T("today.care")] } },
        { sel: T("today.protect"), h: "Protecting people is built in", p: "Private prayer, alerts with no private words, " + recorded + ", archive instead of delete, and email-first follow-up.",
          phone: { sel: ["#td-protect > li:last-child", T("today.protect")], p: "Email first: guest follow-up goes by email, and texting stays off unless the church turns it on. The rules above it keep prayer private, alerts free of private words, " + recorded + " and archive instead of delete." } },
        { sel: PLAN_SEL, h: "Show any plan", p: "Switch between Care, Shepherd and Plus any time. Locked parts stay in the menu and explain what they add." + PLAN_HINT }
      ] };
    },
    /* The two emails differ by plan (church-website.html): on the Care plan the form itself, words and all;
       from the Shepherd plan an email that names only who to welcome, and a guest record behind it. */
    "church-website": function () {
      var site = { sel: T("website.site"), h: "The website, live in its look", p: "{church.name}'s site in the {church.look} look, built for phones first. {assistant} answers questions on it from facts the church approved. The questions under Try {assistant} on the phone ask the site's own {assistant}, right inside the phone.",
        phone: { sel: [T("website.site") + " .ws-phone", T("website.site")] } };
      var kit = { sel: T("website.kit"), h: "Brand board and social plan", p: "A brand board any volunteer can follow, and a plan that turns one Sunday message into a week of posts." };
      if (GM.plan === 1) return { title: "The website package", done: "That is what every plan starts with: a website people can use, {assistant} on it, a brand board, a social plan and forms that reach the right person.", steps: [
        site, kit,
        { sel: T("website.visit"), h: "A Plan a Visit email, as the church gets it", p: "On the Care plan the form arrives by email to the address the church chose, with everything Maya typed. Someone on the team reads that inbox and replies by hand." },
        { sel: T("website.prayer"), h: "Prayer forms, honestly", p: "On the Care plan the words travel in the email, to the pastors' address only. The reader's choice of who may read it travels with them, and the pastors honor it. The Shepherd plan keeps prayer in a locked inbox, and the email says only: New request. Sign in to read." },
        { sel: PLAN_SEL, h: "See what the Shepherd plan adds", p: "Switch to the Shepherd plan to see the same Plan a Visit become a guest with an owner and a next step." + PLAN_HINT }
      ] };
      return { title: "The website package", done: "That is the website package: a website people can use, {assistant} on it, a brand board, a social plan and forms that land with the right person, with no private words in any email.", steps: [
        site, kit,
        { sel: T("website.visit"), h: "An email that names who to welcome", p: "Nadia K. gets one email: Maya T. planned a visit for Sunday, and a line to sign in for the details. The form itself landed in Guests as New, with Nadia as the owner and a welcome note due today." },
        { sel: T("website.prayer"), h: "Prayer stays inside", p: "The pastors and the prayer team get one email that says only: New request. Sign in to read. The words stay in the locked care inbox, and every open is recorded." },
        { sel: ["#ws-visit .ws-actions", T("website.visit")], h: "Open Maya's record", p: "Open Maya's Guest Record shows the same Plan a Visit as a guest, with an owner, a next step and a welcome note waiting for approval." }
      ] };
    },
    "church-settings": function () {
      /* On the Care plan there is no pastor on call, no guest texting and no people import yet, and the
         forms arrive in the church's own email, so the tour says that instead. */
      if (GM.plan === 1) return { title: "Settings", done: "That is Settings on the Care plan. Your forms arrive in your own email, and Genesis signs in only when you ask.", steps: [
        { sel: T("settings.tools"), h: "Works with your tools", p: "The website's Give link opens your own giving page. Events, groups and kids check-in stay in the tool you already use, and the website points people to them." },
        { sel: T("settings.alerts"), h: "How forms travel", p: "Plan a Visit and prayer forms arrive by email at the address you chose, and the prayer words are in that email. Crisis words on the website get 988 and 911 right away. The pastor on call and guest texting come with the Shepherd plan." },
        { sel: T("settings.support"), h: "Genesis signs in only when you ask", p: "Support sessions are off. When you open one, it is recorded where you can see it. Your forms stay in your own email, not in a Genesis inbox." },
        { sel: T("settings.data"), h: "Your data is yours", p: "Export your website content and approved facts any time, and a full export if you ever leave." }
      ] };
      return { title: "Settings", done: "That is Settings. Genesis Ministry works beside the tools a church already uses, and Genesis signs in only when the church asks.", steps: [
        { sel: T("settings.tools"), h: "Works with your tools", p: "Giving opens your provider. Events, groups and kids check-in open Planning Center or Subsplash. People can be imported at onboarding, so nobody is entered twice." },
        { sel: T("settings.alerts"), h: "How follow-up and alerts travel", p: "Guest follow-up by email, texting off unless you turn it on. The pastor on call gets an email and a phone notification, with no private words." },
        { sel: T("settings.support"), h: "Genesis signs in only when you ask", p: "Support sessions are off. When you open one, it is recorded where you can see it. An honest limit is written plainly." },
        { sel: T("settings.data"), h: "Your data is yours", p: "Export everything any time, and a full export if you ever leave." }
      ] };
    },
    "church-guests": function () {
      var reportNote = GM.isIncluded("reports") ? "" : "The Guest Report has a small lock. It comes with the " + levelOf("reports").name + " plan.";
      return { title: "Guests", done: "That is the front office. Every first-time guest has an owner, a next step and a date, and the guests who go quiet are caught, not lost.", steps: [
        { sel: VIEWS_SEL, h: "One pipeline, six ways to look", p: "Needs You, All Guests, By Stage, Drafts Waiting, Gone Quiet and the Guest Report. The same guests, sorted for the job in front of you.", note: reportNote },
        { sel: T("guests.pulse"), h: "The front office in three numbers", p: "Guests with an open next step, new this week, and follow-ups due." },
        { sel: T("guests.next"), h: "The guest to welcome first", p: "Owner, next step, due date and why now, with one gold action. Guests come from Plan a Visit, {assistant}, connect cards, events and the newsletter." },
        { sel: T("guests.list"), h: "Every guest, with an owner", p: "Source, stage, next step and due date for each guest. By Stage shows the board from New to Serving." },
        { sel: T("guests.safety"), h: "Nobody falls through", p: "Checked every morning: nobody without an owner, nobody without a next step, and two guests who have gone quiet. Hector M. is away this week, so Owner Away moved his guests to Nadia K. until he is back.",
          phone: { sel: [T("guests.away"), T("guests.safety")] } },
        { sel: ['#v2-workspace-rail a[data-shell-view="quiet"]', ".v2-view-picker"], h: "Gone Quiet", p: "No reply after two emails, or a planned visit missed. Each gets one gentle last note, then a choice to close it with a reason: moved, found another church or asked us to stop.",
          phone: { p: "Pick Gone Quiet in the View menu: no reply after two emails, or a planned visit missed. Each gets one gentle last note, then a choice to close it with a reason: moved, found another church or asked us to stop." } },
        { sel: T("guests.email"), h: "Email first", p: "Follow-up goes by email. Texting stays off unless the church turns it on, and every welcome note waits for a person." }
      ] };
    },
    "church-guest": (P.get("id") || "g-01") === "g-01" ? { title: "One guest", done: "That is Maya's record. One owner, one next step, and a welcome that never goes out without a person.", steps: [
      { sel: T("guest.next"), h: "This is Maya's record", p: "Maya T. found {church.short} through Plan a Visit on Wednesday night. Nadia K. owns her next step, a welcome note due today, before her first Sunday." },
      { sel: T("guest.about"), h: "Only what she chose to share", p: "Coming Sunday with her husband and two kids, and a question about kids check-in. Family is described generally, and kids' names are never kept." },
      { sel: T("guest.contact"), h: "Reach her the way she asked", p: "Email first, a phone call only if asked, and text messages off unless the church turns texting on. One click stops guest emails." },
      { sel: T("guest.path"), h: "New to Serving", p: "Maya is at New. The six-stage path, the next step with its owner and date, and Move Stage. Every change lands in the timeline." },
      { sel: ["#draft", T("guest.draft")], h: "A welcome note that waits", p: "{assistant} drafted it from what Maya shared: how kids check-in works and where to find Nadia. Approve and Send, Edit or Not Now. A pastor's call is never drafted.",
        focus: [".gm-draft-actions"], phone: { sel: ["#draft .gm-draft-actions", "#draft", T("guest.draft")] } },
      { sel: [T("guest.close"), T("guest.timeline")], h: "Owner away, or time to close", p: "Owner Away hands every guest to someone else until the owner is back. Close This Guest asks for a reason: moved, found another church or asked us to stop. Then it archives the guest and counts it in the Guest Report." },
      { sel: T("guest.protect"), h: "Who can see this guest", p: "Staff with guest access and pastors. Prayer never shows here, every open is recorded, and records are archived, never deleted." }
    ] } : { title: "One guest", done: "That is one guest's record. One owner, one next step, and a welcome that never goes out without a person.", steps: [
      { sel: T("guest.next"), h: "One owner, one next step", p: "Name, source, planned visit, stage and due date, with the recommended step and one gold action." },
      { sel: T("guest.about"), h: "Only what they chose to share", p: "Facts in general terms. Family is described generally, and kids' names are never kept." },
      { sel: T("guest.contact"), h: "Reach them the way they asked", p: "Email first, a phone call only if asked, and text messages off unless the church turns texting on. One click stops guest emails." },
      { sel: T("guest.path"), h: "New to Serving", p: "The six-stage path, the next step with its owner and date, and Move Stage. Every change lands in the timeline." },
      { sel: ["#draft", T("guest.draft")], h: "A welcome note that waits", p: "{assistant} drafted it from what the guest shared. Approve and Send, Edit or Not Now. A pastor's call is never drafted.",
        focus: [".gm-draft-actions"], phone: { sel: ["#draft .gm-draft-actions", "#draft", T("guest.draft")] } },
      { sel: [T("guest.close"), T("guest.timeline")], h: "Owner away, or time to close", p: "Owner Away hands every guest to someone else until the owner is back. Close This Guest asks for a reason: moved, found another church or asked us to stop. Then it archives the guest and counts it in the Guest Report." },
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
      var personNote = GM.isIncluded("people") ? "" : "Open Person comes with the " + levelOf("people").name + " plan, which adds a page for each person.";
      var recorded = GM.isIncluded("access") ? "a record of who looked" : "every open recorded (the Plus plan adds the Access Record screen)";
      /* On phones the thread pane opens over the list, so these steps open the first conversation,
         or go back to the list, before they are drawn. */
      var phone = window.innerWidth <= 860;
      function backToList() { if (!phone || !document.querySelector("#cr-shell.has-thread")) return; var b = document.querySelector('#cr-pane [data-cr="back"]'); if (b) b.click(); }
      /* The story of the week: Sarah asked the church to pray for her mom. These steps open her request
         (or the first conversation, in a view without it). */
      var sarahView = !P.get("view") || P.get("view") === "prayer";
      function openSarah() {
        var cur = document.querySelector("#cr-list .v2-thread-row.is-active");
        var open = !phone || document.querySelector("#cr-shell.has-thread");
        if (cur && open && (cur.getAttribute("data-id") === "pr-01" || !sarahView)) return;
        if (phone && document.querySelector("#cr-shell.has-thread")) backToList();
        var b = (sarahView && document.querySelector('#cr-list [data-id="pr-01"]')) || document.querySelector("#cr-list .v2-thread-row");
        if (b) b.click();
      }
      var openFirst = openSarah;
      return { title: "Care inbox", done: sarahView ? "That is the care inbox. Sarah's request stays with the pastors and the prayer team, a person writes every reply to prayer, and nothing private travels by email." : "That is the care inbox. Prayer stays with pastors and the prayer team, a person writes every reply to prayer, and nothing private travels by email.", steps: [
        { sel: VIEWS_SEL, h: "One inbox, four ways in", p: "Waiting on Us, Prayer, Messages and Archived. The same inbox, sorted for the job at hand.", before: backToList },
        { sel: T("care.roles"), h: "See what each role sees", p: "Switch between Pastor, Prayer Team and Staff. Prayer disappears for staff, and messages disappear for the prayer team.", before: backToList },
        { sel: T("care.waiting"), h: "Oldest waiting first", p: "Each thread shows its owner and how long it has waited. Prayer and private threads show a lock instead of a preview.", before: backToList },
        sarahView
          ? { sel: T("care.thread"), h: "Sarah asked the church to pray", p: "Sarah N. asked for prayer for her mom, who starts treatment next week. Owen B. on the prayer team owns it. Nothing here is ever deleted, only archived. In a crisis, the person sees 988 and 911 right away and the pastor on call is alerted.", note: personNote, before: openFirst }
          : { sel: T("care.thread"), h: "Archive, never delete", p: "The open conversation, with Open Person and Archive. In a crisis, the person gets 988 and 911 right away and the pastor on call is alerted.", note: personNote, before: openFirst },
        { sel: T("care.visibility"), h: "Who can see this", p: sarahView ? "A lock badge and the names of the people who can read Sarah's request: the pastors and the prayer team. The owner is chosen only from them." : "A lock badge, the names of the people who can see it, and an owner chosen only from them.", before: openFirst },
        { sel: T("care.reply"), h: "Replies stay inside", p: sarahView ? "A person writes every word of a reply to prayer, and {assistant} never drafts one. Sarah gets one email that says only: You have a reply. Sign in to read." : "On everyday questions {assistant} may draft a labeled reply that waits for approval. On prayer and private threads a person writes every word. The person gets one email: You have a reply. Sign in to read.", before: openFirst },
        { sel: [T("care.minor"), T("care.protect")], h: "If someone under 18 writes in", p: "Staff stop the private thread, bring in a parent and follow the church's child protection policy. The care inbox is protected with " + recorded + ", alerts with no private words and archive instead of delete." }
      ] };
    },
    "church-person": function () {
      if (MODE === "list") return { title: "People", done: "That is People. Everyone once, with the next person to check on at the top.", steps: [
        { sel: T("person.pulse"), h: "Everyone, once", p: "Members, regulars and guests on the path. Each person has one record." },
        { sel: T("person.next"), h: "The person to check on first", p: "The earliest open reminder with its owner, and one gold action to open the page." },
        { sel: [T("person.list") + " .v2-table-meta", T("person.list") + " .v2-mobile-deal-row", T("person.list")], h: "Search, filter and sort", p: "Care waiting, reminders and who cares for each person. This preview shows a sample of the church's records. Members never see a directory." },
        { sel: [T("shell.genesis"), T("shell.hope")], h: "Ask {assistant} about anyone's next step", p: "{assistant} answers in counts and owners, and only sees what the person asking is allowed to see." },
        { sel: [T("shell.jump"), ".v2-mobile-command"], h: "Jump to anyone", p: "Ctrl K opens Jump to, so a pastor reaches any screen or view in a couple of keys." }
      ] };
      if (P.get("id") === "p-sarah") return { title: "One person", done: "That is Sarah's page. Everything about her in one place, and each part visible only to the people who should see it.", steps: [
        { sel: T("person.card"), h: "Everything about Sarah, in one place", p: "How she attends, an adult account confirmed, and a note that this open is recorded. Her next step sits right here: {church.carePastor} promised to call her tonight at 7." },
        { sel: T("person.who"), h: "Contact, behind a lock", p: "Her email, phone and how she likes to be reached, visible to staff and pastors only." },
        { sel: T("person.prayer"), h: "Prayer with a history", p: "Her request for her mom, and the one from August about a teaching job. Locked to pastors and the prayer team." },
        { sel: T("person.gifts"), h: "Gifts, only after a yes", p: "Sarah said yes to sharing. Locked to pastors and named leads. The score is plain arithmetic, and {assistant} never sets it.", module: "gifts" },
        { sel: T("person.notes"), h: "Private pastor notes", p: "Pastors only. Never shown to Sarah, to staff or to the prayer team, and archived instead of deleted." },
        { sel: T("person.access"), h: "Who opened this record", p: "Taken from the access record, which nobody can edit.", focus: ["h2, .v2-muted-copy:first-of-type, .v2-activity-row:nth-child(-n+2)"], place: "beside-focus" },
        { sel: T("person.requests"), h: "Her information is hers", p: "A copy or a removal on request. A removal waits for the lead pastor." }
      ] };
      return { title: "One person", done: "That is one person's page. Everything about someone in one place, and each part visible only to the people who should see it.", steps: [
        { sel: T("person.card"), h: "One record per person", p: "How they attend, an adult account confirmed, and a note that this open is recorded. The next step sits right here." },
        { sel: T("person.who"), h: "Contact, behind a lock", p: "Email, phone and how they like to be reached, visible to staff and pastors only." },
        { sel: T("person.prayer"), h: "Prayer with a history", p: "Locked to pastors and the prayer team. An older request is attached only when the person asks." },
        { sel: T("person.gifts"), h: "Gifts, only after a yes", p: "Locked to pastors and named leads. The score is plain arithmetic, and {assistant} never sets it.", module: "gifts" },
        { sel: T("person.notes"), h: "Private pastor notes", p: "Pastors only. Never shown to the person, to staff or to the prayer team, and archived instead of deleted." },
        { sel: T("person.access"), h: "Who opened this record", p: "Taken from the access record, which nobody can edit.", focus: ["h2, .v2-muted-copy:first-of-type, .v2-activity-row:nth-child(-n+2)"], place: "beside-focus" },
        { sel: T("person.requests"), h: "Their information is theirs", p: "A copy or a removal on request. A removal waits for the lead pastor." }
      ] };
    },
    "church-gifts": { title: "Gifts of our church", done: "That is the gifts picture. Pastors see where people might serve, and every name is there only because that person said yes.", steps: [
      { sel: T("gifts.glance"), h: "Counts only", p: "How many finished, in person and online, how many said yes to sharing, and who wants to talk about serving." },
      { sel: T("gifts.move"), h: "Ready for a conversation", p: "People who said yes, asked to talk about serving and are not serving yet." },
      { sel: [T("gifts.chart") + " .v2-section-head", T("gifts.chart") + " .v2-viz-head", T("gifts.chart")], h: "Hidden until 25 finish", p: "The chart waits until 25 people finish. When a part of a bar is fewer than 5, only the total is drawn, so no one can be worked out. The Before 25 Finish switch shows the waiting state." },
      { sel: [T("gifts.finder") + " .v2-section-head", T("gifts.finder")], h: "The finder", p: "Pick a gift, a team and serving status. Only people who said yes are ever listed by name." },
      { sel: [T("gifts.teams") + " .v2-section-head", T("gifts.teams")], h: "Gifts to teams", p: "Teams with people who said yes and are not serving yet. Because they said yes, exact counts are shown, and the church's own gift list sits beside it." },
      { sel: T("gifts.protect"), h: "Plain arithmetic", p: "Scores are added up, never guessed. {assistant} never sets a score, and nothing private feeds it.",
        phone: { sel: ["#gf-protect > li:nth-child(4)", T("gifts.protect")] } }
    ] },
    "church-reports": { title: "Reports", done: "That is Reports. Counts a pastor can act on, and nothing that could expose a person.", steps: [
      { sel: [T("reports.tabs"), ".v2-report-picker"], h: "Four reports, one place", p: "Summary, Care, Guests to Members and Gifts Completion. On phones it is a picker." },
      { sel: T("reports.glance"), h: "Three numbers a pastor reads first", p: "Median hours to a first reply, care waiting on us now, and guests who became members this year." },
      { sel: T("reports.move"), h: "The highest-impact move", p: "Care that has waited more than a day, with one gold Open Care Inbox action." },
      { sel: T("reports.reply"), h: "Reply time against a goal", p: "Hours to a first reply by week, against a one-day goal. One axis, and View as Table on every chart." },
      { sel: T("reports.path"), h: "From guest to serving", p: "Twelve months of the guest path, stage by stage." },
      { sel: T("reports.protect"), h: "What reports never show", p: "No names or private words. Small counts in the gifts picture and prayer topics show as fewer than 5. Everything is filtered by role, and every export is recorded.",
        phone: { sel: ["#rp-protect > li:nth-child(4)", T("reports.protect")], p: "Every export is recorded in the access record. Reports also carry no names or private words, show small counts as fewer than 5 and are filtered by role." } }
    ] },
    "church-team": { title: "Team Roles", done: "That is Team. Roles decide who sees what, and every change goes to the lead pastor.", steps: [
      { sel: VIEWS_SEL, h: "Roles and the record", p: GM.plan >= 3 ? "Team Roles decide who can see what. The Access Record shows what people actually opened." : "Team Roles decide who can see what. Every open is recorded, and the Plus plan adds the Access Record screen to search it." },
      { sel: T("team.glance"), h: "Seats and safety", p: "Staff seats in use for this plan, who can open prayer, and two-step sign in for everyone. The Shepherd plan names the prayer team; the Plus plan adds custom roles and named gift viewers." },
      { sel: T("team.next"), h: "A role to confirm", p: "A new prayer team member waits for the lead pastor, with one gold Confirm action." },
      { sel: T("team.list"), h: "Every person and role", p: "Role, whether they open prayer or see gift names, and the last sign in. Two-step sign in is on for everyone.", focus: [".v2-table-meta, .v2-table thead, .v2-table tbody tr:nth-child(-n+3)"] },
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
    "member-home": { title: "Home", done: "That is Sarah's home: her own prayer, her own messages and three clear buttons, in {church.short}'s colors.", steps: [
      { sel: T("home.hello"), h: "Now the same week from Sarah's side", p: "Sarah signs in with a code and lands here, in {church.short}'s colors. {church.carePastor}'s reply is waiting for her." },
      { sel: T("home.actions"), h: "Three clear buttons", p: "Ask for Prayer, Send a Message and Talk About Serving. Each one reaches the right person." },
      { sel: T("home.prayer"), h: "Their own prayer requests", p: "Each with its status and a lock that shows exactly who can see it." },
      { sel: T("home.profile"), h: "Their information stays theirs", p: "Adult account confirmed with the date, and Ask for a Copy or Ask to Remove My Information.", focus: ".mh-kv > div:last-child, .mh-links",
        phone: { focus: ".mh-links" } },
      { sel: [".hd-launch", ".mx-hope"], h: "{assistant}, in {church.short}'s colors", p: "Members can ask {assistant} questions any time. {assistant} answers from facts the church approved and hands anything personal to a real person." },
      { sel: '.m-stagebar [data-tour="shell.switcher"]', h: "The same app, each church's brand", p: "Switch between Lightwell, Lampstand, Calder Hill and Goldenrod. Same app, each church's own colors and type." },
      { sel: ".mx-about", h: "How it protects people", p: "Beside the phone: what this screen does to protect people, and a link to the same moment in the church workspace." }
    ] },
    "member-prayer": { title: "Prayer", done: "That is prayer in the member app. Private to the people they chose, with help on the page and a person behind every reply.", steps: [
      { sel: T("prayer.form"), h: "Prayer in a few taps", p: "The member is already signed in. The pastors get an alert that says only: New request. Sign in to read.",
        phone: { sel: [T("prayer.form") + " .mp-alert", T("prayer.form")] } },
      { sel: T("prayer.visibility"), h: "They choose who sees it", p: "Pastors and the prayer team, or pastors only, with the names shown." },
      { sel: T("prayer.help"), h: "Help is always on the page", p: "911 and 988 with the church phone, on every prayer form." },
      { sel: T("prayer.secrecy"), h: "An honest promise", p: "Prayer is private, and the page never promises total secrecy when someone is being harmed." },
      { sel: T("prayer.history"), h: "A history with replies", p: "Every request, any reply, who can see it, and Add an Update.",
        phone: { sel: [T("prayer.history") + " .mp-req", T("prayer.history")] } }
    ] },
    "member-messages": function () {
      if (MODE === "new") return { title: "New message", done: "Three doors, each clearly labeled, so a member always knows who will read what they write.", steps: [
        { sel: T("messages.new"), h: "Three clear doors", p: "A question for the office, something private for a pastor, or talk about serving. Each says who will read it." }
      ] };
      return { title: "Messages", done: "That is Messages. Their own conversations with the church, a person on every reply, and no private words in any email.", steps: [
        { sel: T("messages.list"), h: "Only their own conversations", p: "The member's threads with the church. No directory and no forum." },
        { sel: T("messages.thread"), h: "A thread that reads easily", p: "Day markers, a New divider, who each reply came from, and a lock on private threads." },
        { sel: T("messages.composer"), h: "Reply in place", p: "Reply right here. The 911 and 988 line sits beside the box." },
        { sel: T("messages.email"), h: "The email carries no private words", p: "It says only: You have a reply. Sign in to read." }
      ] };
    },
    "member-give": { title: "Give", done: "That is Give. The church's own giving form, one tap away, and no giving history kept in the app.", steps: [
      { sel: T("give.frame"), h: "The church's own giving form", p: "Shown here as a sample. Genesis never handles the payment." },
      { sel: T("give.link"), h: "The full giving page", p: "Wallets, recurring gifts and receipts stay with the church's giving provider." },
      { sel: T("give.privacy"), h: "No giving history in the app", p: "The app never shows giving history. Receipts and statements stay with the giving provider, and the other ways to give are listed below." }
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
        { sel: T("signin.email"), h: "No password to forget", p: "A 6-digit code arrives by email. Signing in the first time creates the account." },
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
      { sel: T("result.gifts"), h: "Gifts to explore, not a verdict", p: "Each with a definition, a scripture and the teams where it often fits. Ties are shown.",
        phone: { sel: [T("result.gifts") + " .mr-gift", T("result.gifts")] } },
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
      { sel: [".gm-locked-card", ".m-locked"], h: m.label + " is included in the " + lv.name + " plan", p: fill(m.adds.replace(/\bHope\b/g, AN)) + " This preview is showing the " + cur.name + " plan. The " + lv.name + " plan adds this view." },
      { sel: [".gm-locked-card .gm-checks", ".m-locked .m-checks"], h: "What it adds", p: (m.points || []).slice(0, 3).join(". ") + "." },
      { sel: PLAN_SEL, h: "Preview the " + lv.name + " plan", p: "Switch the plan to see this screen working. A locked part keeps its place and says which plan adds it." }
    ];
    if (!MEMBER) steps.push({ sel: ['.v2-nav a[aria-current="page"]'], h: "It keeps its place in the menu", p: "Locked screens stay in the menu with a small lock, so a church sees what it can grow into." });
    var named = { "Member App": "the member app", "Access Record": "the access record", "My Gifts": "the gifts conversation", "Care Inbox": "the care inbox" }[m.label] || m.label;
    return { title: m.label, done: "The " + lv.name + " plan adds " + named + ". Compare every plan, or switch the plan shown.", steps: steps };
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
  /* The short way through (?pace=short, the hub's Start the Guided Demo): two or three steps per screen,
     the ones that carry Maya's and Sarah's week. Take the Tour on any screen still shows every step. */
  var ESSENTIAL = {
    "church-today": ["today.hope", "today.next", "today.drafts"],
    "church-website": ["website.site", "website.prayer"],
    "church-guests": ["guests.next", "guests.safety"],
    "church-guest": ["guest.next", "#draft", "guest.protect"],
    "church-care": ["care.thread", "care.visibility", "care.reply"],
    "church-person:record": ["person.card", "person.prayer", "person.notes"],
    "church-gifts": ["gifts.chart", "gifts.finder"],
    "church-reports": ["reports.glance", "reports.protect"],
    "member-home": ["home.hello", "home.prayer"],
    "member-prayer": ["prayer.form", "prayer.visibility"],
    "member-messages": ["messages.thread", "messages.email"],
    "member-give": ["give.frame"],
    "member-gifts": ["gifts.welcome"],
    "member-gifts:talk": ["gifts.progress", "gifts.statement"],
    "member-gifts-result": ["result.gifts", "result.share"]
  };
  var fullTour = false;
  /* Locked screens already have a short tour; the Care plan's Home (Today, locked on Care) has its own short way. */
  function shortPace() { return P.get("pace") === "short" && !fullTour && !!ESSENTIAL[KEY] && !(GM.ctx && GM.ctx.locked && KEY !== "church-today"); }
  function isEssential(s, names) {
    if (s.essential) return true;
    var sels = [].concat(s.sel).map(String);
    return names.some(function (n) { return sels.some(function (q) { return q === n || q.indexOf('"' + n + '"') >= 0; }); });
  }
  /* Short member tours borrow from the stage around the phone, so every tour has four to seven steps. */
  var MEMBER_EXTRAS = [
    { sel: ".mx-about", h: "How this screen protects people", p: "Beside the phone: what this screen does to keep people safe, and a link to the same moment in the church workspace." },
    { sel: ".mx-screens", h: "Every screen of the member app", p: "The member app in order, from sign in to gifts. A screen outside the plan shows the plan that adds it.", place: "edge-left" },
    { sel: '.m-stagebar [data-tour="shell.plan"]', h: "Show any plan", p: "Care, Shepherd or Plus. A screen outside the plan shows a calm state that names the plan that adds it, never a broken page." },
    { sel: [".hd-launch", ".mx-hope"], h: "{assistant}, in {church.short}'s colors", p: "Members can ask {assistant} questions any time. {assistant} answers from facts the church approved and hands anything personal to a real person." }
  ];
  /* Each extra is shown once per demo run (on the first screen that uses it, and again only there),
     so the member path never repeats the same padding step. */
  function usedExtras() { try { return JSON.parse(sessionStorage.getItem("gm.demo.extras") || "{}") || {}; } catch (e) { return {}; } }
  function padMember(t) {
    if (!MEMBER || !t || !t.steps || shortPace()) return t;
    var have = t.steps.map(function (s) { return String(s.sel); });
    function shown(sel) { return [].concat(sel).some(function (q) { try { var n = document.querySelector(q); return !!(n && n.getClientRects().length); } catch (e) { return false; } }); }
    var live = t.steps.filter(function (s) { return shown(s.sel); }).length;
    var steps = t.steps.slice();
    var used = usedExtras();
    /* A page's own steps count as used, so Home's own How It Protects People step is not repeated later. */
    have.forEach(function (k) { MEMBER_EXTRAS.forEach(function (x) { if (String(x.sel) === k && !used[k]) used[k] = KEY; }); });
    MEMBER_EXTRAS.forEach(function (x) {
      var k = String(x.sel);
      if (live < 4 && have.indexOf(k) < 0 && (!used[k] || used[k] === KEY) && shown(x.sel)) { steps.push(x); live++; used[k] = KEY; }
    });
    try { sessionStorage.setItem("gm.demo.extras", JSON.stringify(used)); } catch (e) {}
    return { title: t.title, done: t.done, steps: steps };
  }
  /* Plan-aware steps: a step about a module outside the plan says which plan adds it. */
  function compile(t) {
    if (!t) return [];
    t = padMember(t);
    var out = [];
    var phone = window.innerWidth <= 860;
    var ess = shortPace() ? ESSENTIAL[KEY] : null;
    (t.steps || []).forEach(function (s) {
      if (ess && !isEssential(s, ess)) return;
      if (s.only === "phone" && !phone) return;
      if (s.only === "wide" && phone) return;
      if (s.module && !GM.isIncluded(s.module)) {
        var m = D.modules[s.module], lv = levelOf(s.module);
        out.push({ sel: s.lockSel || PLAN_SEL, h: (s.lockLabel || m.label) + " comes with the " + lv.name + " plan", p: fill(m.adds.replace(/\bHope\b/g, AN)), note: "This preview is showing the " + GM.level().name + " plan. Switch the plan to see it." });
        return;
      }
      /* On a phone a step may point at the one part it names (a tall section would sit under the docked card). */
      var ph = phone && s.phone ? s.phone : null;
      var sel0 = ph && ph.sel ? ph.sel : s.sel;
      /* The Hope circle shows on wide screens; on phones Hope lives in the stage bar. */
      var sel = Array.isArray(sel0) && sel0[0] === ".hd-launch" ? (window.innerWidth > 520 ? ".hd-launch" : sel0.slice(1)) : sel0;
      /* A phone step that points at its own part (ph.sel) does not inherit the wide step's focus. */
      var focus = ph ? (ph.focus || (ph.sel ? undefined : s.focus)) : s.focus;
      var step = { sel: sel, h: fill(ph && ph.h ? ph.h : s.h), p: fill(ph && ph.p ? ph.p : s.p), note: s.note ? fill(s.note) : "", k: MEMBER ? GUIDE + " · " + screenOf() + fill(t.title) : undefined, before: s.before, place: s.place, focus: focus, scrollTop: s.scrollTop };
      /* Member screens: the room kept clear at the top (the phone's own top bar) only applies to a
         part inside the phone. A step about the stage around it (the plan switch, the church
         switcher) says so as it is drawn. Only a step whose target is on screen gets this, so a
         step without a target is still left out of the tour. */
      if (MEMBER) {
        var tg = firstShown(sel);
        if (tg || s.before) {
          var outside = !!tg && !tg.closest(".m-app");
          step.before = (function (orig, out0) { return function () { stepOutside = out0; if (orig) orig(); }; })(s.before, outside);
        }
      }
      out.push(step);
    });
    return out;
  }
  var stepOutside = false;
  function firstShown(sel) {
    var list = [].concat(sel);
    for (var i = 0; i < list.length; i++) {
      var all; try { all = document.querySelectorAll(list[i]); } catch (e) { continue; }
      for (var j = 0; j < all.length; j++) if (all[j].getClientRects().length) return all[j];
    }
    return null;
  }

  /* ------------------------------------------------------------------ Genesis screens: the dock */
  function dockAnswers() {
    var list = RULES.map(function (r) {
      /* Talk With Genesis is a link under the answer, opening the contact page in a new tab. */
      var v = ANSWERS[r[1]], talk = TALK_KEYS.indexOf(r[1]) >= 0, link = { label: "Talk With Genesis", href: CONTACT };
      var ans = !talk ? v : typeof v === "function" ? function (q) { return { text: v(q), link: link }; } : { text: v, link: link };
      return { match: r[0], answer: ans, first: FIRST_KEYS.indexOf(r[1]) >= 0 };
    });
    list.unshift({ match: /^(?!.*\b(book|schedule|arrange|set up|request)\b).*\b(tours?|walk ?through|show me around|guide me|guided demo)\b/i, answer: function () {
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
    /* Who reads what a member writes, in the member's own words, from the church's own team. */
    var lead = GM.staff("s-lead"), care = GM.staff("s-care");
    var pastors = [lead, care].map(function (x) { return x.name; });
    var team = D.staff.filter(function (x) { return x.roleKey === "prayer"; }).map(function (x) { return x.name; });
    var giftNames = D.staff.filter(function (x) { return x.caps.indexOf("giftNames") >= 0; }).map(function (x) { return GM.staff(x.id).name; });
    var prayerMine = "Only the people you chose can read it. With the pastors and the prayer team, that is " + listNames(pastors.concat(team)) + ", and no one else. With pastors only, it is " + listNames(pastors) + ". The alert they get says only: New request. Sign in to read. Staff and website admins cannot open it.";
    var toMessages = { label: "Send a Message", href: GM.url("member-messages.html", { "new": "1" }), go: true, cta: true };
    var toHome = { label: "Open Home", href: GM.url("member-home.html"), go: true };
    var last = nx && nx.last && ORIGIN === "church";
    return {
      look: c.look,
      assistantName: AN,
      /* The guided demo is Genesis's, on every screen; the church's own assistant is the chat. */
      guideName: GUIDE,
      tourTitle: tour ? screenOf() + fill(tour.title) : "",
      church: { name: c.name, short: c.short, city: c.city + ", " + c.state, phone: c.phone, times: c.times },
      brand: { accent: th.accent, accentInk: th.onAccent, accentText: th.accentInk, ink: th.text, surface: th.surface, surface2: th.surface3, line: th.lineStrong, font: th.body, radius: th.radiusLg, buttonRadius: th.btnRadius },
      greeting: "Hi, I am " + AN + ". In this preview I can walk you through this screen, or answer questions about how " + poss(c.short) + " member app keeps members safe. Everything here is sample data.",
      menu: [
        { label: "Take the Guided Demo", key: "tour", cta: true },
        { label: "Who Sees Prayer Requests?", key: "prayerwho" },
        { label: "Who Reads My Messages?", key: "messageswho" },
        { label: "What Happens in a Crisis?", key: "crisisinfo" },
        { label: "What Do Members Need to Sign In?", key: "signin" },
        { label: "Can I Talk to a Pastor?", key: "pastor" }
      ],
      answers: addMore({
        platform: a(ANSWERS.platform, [{ label: "What Does Each Plan Include?", key: "levels" }, { label: "Take the Guided Demo", key: "tour", cta: true }]),
        prayerwho: a(prayerMine, [{ label: "How Is Prayer Protected?", key: "prayerinfo" }, { label: "What Happens in a Crisis?", key: "crisisinfo" }]),
        prayerinfo: a(ANSWERS.prayer, [{ label: "What Happens in a Crisis?", key: "crisisinfo" }, { label: "Does " + AN + " Read My Prayer?", key: "aimine" }]),
        crisisinfo: a(ANSWERS.crisis, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
        ai: a(ANSWERS.ai, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "Who Reads My Messages?", key: "messageswho" }]),
        /* What a member asks about the people behind the app. */
        messageswho: a("A question for the church office is read by the church staff, who reply, usually within a day. Something private, for a pastor, is read only by " + listNames(pastors) + ". Every reply comes from a person.", [toMessages, { label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        giftswho: a("Only you, unless you say yes. With a yes, " + listNames(giftNames) + " see your name with your gifts. The church's gifts picture shows counts only, never names.", [{ label: "How Is It Added Up?", key: "giftsinfo" }]),
        aimine: a("No. " + AN + " never reads or answers prayer. Only the people you chose can read it, and a person writes every reply.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        pastor: a(lead.name + " leads " + c.name + ", and " + care.name + " cares for the church family. To reach one of them, send a Message and choose Something private, for a pastor. Or call the church at " + c.phone + ".", [toMessages]),
        talk: a("You can write to the church in Messages, and a real person will answer. If it cannot wait, call the church at " + c.phone + ". If you are in danger, call 911, or call or text 988.", [toMessages, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
        remove: a("On Home, choose Ask to Remove My Information, and a pastor confirms it with you. Nothing is thrown away by accident before then, and you can also ask for a copy first.", [toHome]),
        kids: a(c.kidsCheckIn + " The church website has the rest, from ages to what to expect on a first Sunday.", [{ label: "What Time Is Sunday?", key: "times" }]),
        pco: a(ANSWERS.pco, [{ label: "What Does Each Plan Include?", key: "levels" }]),
        signin: a(ANSWERS.signin, [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "Is Texting On?", key: "texting" }]),
        texting: a(ANSWERS.texting, [{ label: "What Do Members Need to Sign In?", key: "signin" }]),
        custom: a(ANSWERS.custom, [{ label: "What Does It Cost?", key: "price" }, { label: "What Does Each Plan Include?", key: "levels" }]),
        levels: a(ANSWERS.levels, [{ label: "What Does It Cost?", key: "price" }, { label: "Can We Customize It?", key: "custom" }]),
        price: a(ANSWERS.price, [{ label: "What Does Each Plan Include?", key: "levels" }, { label: "Can We Customize It?", key: "custom" }]),
        giftsinfo: a("The gifts conversation takes about 10 minutes and saves after every tap. It gives gifts to explore, worked out by plain arithmetic, and " + AN + " never sets a score. Your name is shared only after a yes. Who sees it is up to you.", [{ label: "Who Sees My Gifts?", key: "giftswho" }]),
        give: a("Give opens " + poss(c.short) + " own giving form. Genesis never handles the payment, and the app keeps no giving history. Recurring gifts and receipts stay with the church's giving provider.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        times: a(c.short + " gathers " + c.times + " in " + c.city + ". The church website has the address, directions and what to expect on a first Sunday.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        /* Everyday member questions: a reply, giving, baptism, emails, and a hard week. */
        replies: a("Replies are in Messages and under each prayer request. Right now " + care.name + " has replied to you in Messages.", [{ label: "Open Messages", href: GM.url("member-messages.html"), go: true, cta: true }, { label: "Who Reads My Messages?", key: "messageswho" }]),
        givingprivate: a("Give opens " + poss(c.short) + " own giving form. This app keeps no giving history, so nobody here sees what you give. Receipts stay with the church's giving provider.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        baptism: a((c.baptism || "Ask the church about baptism, and a pastor will talk it through with you first.") + " To ask, send a Message, or call the church at " + c.phone + ".", [toMessages, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
        emails: a("Emails from the app never carry private words. They say only that you have a reply, and you sign in to read it. To change what you receive, ask the church office in Messages.", [toMessages]),
        /* A member asking for the privacy page. */
        privacypolicy: a(poss(c.short) + " website has a privacy page that says who sees what you share. In the app, a prayer request is read only by the people you choose, a private message only by the pastors, and every reply comes from a person.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages]),
        /* A belief question goes to a pastor, never the hard-week or crisis answer. */
        beliefs: a("Thank you for asking. That deserves a real conversation, not a quick answer from me. " + lead.name + " and " + care.name + " would be glad to talk it through with you. Send a Message and choose Something private, for a pastor, or call the church at " + c.phone + ".", [toMessages, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
        hardship: a("I am so sorry. You do not have to carry this alone. You can write to the church in Messages, and a real person will answer. If it cannot wait, call the church at " + c.phone + ". If you are in danger, call 911, or call or text 988.", [toMessages, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
        call: a(ANSWERS.call, [{ label: "Talk With Genesis", href: CONTACT }]),
        start: a(ANSWERS.start, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does Each Plan Include?", key: "levels" }]),
        /* A member's questions that share words with a buyer's: the church's own voice, never scoping or
           Talk With Genesis. The plans and their prices stay, for a pastor trying the preview. */
        domain: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will answer.", [toMessages]),
        keepsite: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will answer.", [toMessages]),
        sell: a("No. " + c.short + " never sells what you share, and neither does Genesis, which runs this app for the church. Nothing is passed on for anyone's marketing. A few service providers, such as hosting, email delivery and the AI service behind " + AN + ", handle it under contract only to run the app. " + AN + " never reads prayer.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages]),
        processors: a("A few service providers, such as hosting, email delivery and the AI service behind " + AN + ", handle what you share under contract, only to run the app for " + c.short + ". Nobody sells it or passes it on for anyone's marketing, and " + AN + " never reads prayer.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages]),
        contract: a("Members never sign a contract or pay for the app. It is free for everyone at " + c.short + ".", [{ label: "What Do Members Need to Sign In?", key: "signin" }]),
        trial: a("The app is free for members, so there is nothing to try first. Sign in with your email and a 6-digit code.", [{ label: "What Do Members Need to Sign In?", key: "signin" }]),
        discount: a("The app is free for members. Giving is always your choice, through the church's own giving form.", [{ label: "How Do I Give?", key: "give" }]),
        fees: a("Members never pay to use the app. Giving is always your choice, through the church's own giving form.", [{ label: "How Do I Give?", key: "give" }]),
        cancel: a("You can stop using the app at any time. To have your information removed, choose Ask to Remove My Information on Home, and a pastor confirms it with you.", [toHome]),
        support: a("If something in the app is not working, send a Message to the church office, and someone will help. If you are in danger, call 911, or call or text 988.", [toMessages]),
        language: a("The app is in English today. If you would like help in another language, send a Message to the church office, and someone will do what they can.", [toMessages]),
        references: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will answer.", [toMessages]),
        /* Family at home, and what a pastor must report. */
        messagesprivate: a("A private message is read only by " + listNames(pastors) + ", and a prayer request only by the people you chose. Nothing goes to anyone in your family, and the email you get says only that you have a reply, so you sign in to read it. If someone at home can open your email or phone, sign out when you finish. If you are not safe at home, call 911, or call or text 988.", [toMessages, { label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        confidential: a("A pastor can talk with you about what stays private and the few things they must report to keep someone safe. Send a Message and choose Something private, for a pastor, or call the church at " + c.phone + ". If anyone is in danger right now, call 911, or call or text 988.", [toMessages]),
        prayerfromstaff: a("You choose who reads each request: the pastors and the prayer team, or Pastors only. A request marked Pastors only is read by " + listNames(pastors) + " and not by the prayer team. It cannot be kept from one pastor, so if you would rather talk with just one of them, send a Message and choose Something private, for a pastor.", [toMessages, { label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        /* Round 4: a member's own privacy questions: contact details, location, a copy, the church's tools, emails. */
        contactsee: a("Other members never see your phone number, email or address: the app has no member directory. Inside the church, who sees contact details is set by each staff member's role, such as the pastors and whoever follows up with guests.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages]),
        location: a("The app does not ask for your location or keep it. The church website has the address and directions to Sunday.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }]),
        mydata: a("Yes. You can ask for a copy of your information from Home, the same place you can ask to remove it, and a pastor confirms it with you. Nothing is removed unless you ask.", [toHome]),
        memberpco: a("That is a question for the church office. The app opens the church's own tools when you need them, like its giving form and kids check-in. Send a Message, and someone from " + c.short + " will answer.", [toMessages]),
        /* Round 5: a member's questions that share words with a buyer's, in the church's own voice. */
        model: a(AN + " runs on an outside AI service under contract, which never trains on what you write. It answers only from facts " + c.short + " approved, and it never reads prayer or private messages.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages]),
        memberplan: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will answer. The app is free for members.", [toMessages]),
        websitecost: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will answer.", [toMessages]),
        freeplan: a("The app is free for members. Giving is always your choice, through the church's own giving form.", [{ label: "How Do I Give?", key: "give" }]),
        wrong: a("If something I say looks wrong, send a Message to the church office, and a person will check it. I answer only from facts " + c.short + " approved.", [toMessages]),
        textoff: a("That is a question for the church office. Send a Message, and someone from " + c.short + " will change it for you.", [toMessages]),
        mailinglist: a("No. Plan a Visit goes to the welcome team so they can greet you. You get church emails only when you ask for them, and every email has a way to stop them.", [{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, toMessages])
      }, a,[{ label: "Who Sees Prayer Requests?", key: "prayerwho" }, { label: "Can I Talk to a Pastor?", key: "pastor" }]),
      /* A member's own questions first, then the product rules (in the member's words where they differ). */
      match: [
        /* "Do you use my prayer requests to train AI?" is about AI training before it is about who reads prayer. */
        rx(aiTraining, "aitraining"),
        /* Round 5: what the church pays, its plan, texts a member wants off, and a moral question for the pastors. */
        [/\b(?:church|they|we)\b.{0,20}\b(?:pay|pays|paying|spend|spends)\b|\bwhich plan\b|\b(?:our|this|the) church\b.{0,20}\bplan\b|\bplan\b.{0,20}\b(?:our|this|the) church\b/i, "memberplan"],
        [/\b(?:turn off|stop|opt out|unsubscribe)\b.{0,20}\btext\w*|\btext\w*\b.{0,20}\b(?:turn(?:ed)? off|stop|opt out)\b/i, "textoff"],
        [/\bis it (?:wrong|a sin|sinful|okay|ok|alright) to (?!(?:bring|park|come|give|call|ask|send|share|text|visit|attend|join|wear)\b)|\bwrong to\b/i, "beliefs"],
        /* Round 4: contact details, location, a copy of my data, the church's tools, a mailing list and who reads a prayer. */
        [/\b(other members|members|anyone|everyone|people|other people)\b.{0,30}\b(see|sees|know|find|look up)\b.{0,30}\b(phone|number|email|address|contact)\w*|\bdirectory\b/i, "contactsee"],
        [/\b(keep|track|stor|know|use|collect|sav)\w*\b.{0,20}\bmy (location|whereabouts)\b|\blocation (tracking|data|services)\b/i, "location"],
        [/\b(copy|download|export)\b.{0,30}\b(of )?(all )?(my|of my) (data|information|info|records?)\b|\bmy data\b.{0,30}\b(copy|download|get)\b/i, "mydata"],
        [/\b(mailing list|email list|newsletter|marketing emails?|spam)\b|\badded to\b.{0,30}\b(list|emails?)\b/i, "mailinglist"],
        [/\b(does|do|is) (this|the|my|our) church\b.{0,20}\b(use|have|on)\b.{0,20}\b(planning center|subsplash|breeze|pushpay|church ?center)\b/i, "memberpco"],
        [/^(?!.*\b(husband|wife|spouse|partner|boyfriend|girlfriend|parents?|mom|dad|mother|father|family|kids|children|roommate)\b).*(\bprayer( requests?)?\b.{0,60}\b(see|sees|read|reads|know|knows)\b|\b(see|read)s?\b.{0,30}\b(my|a) prayer)/i, "prayerwho"],
        /* "Do you send our prayer requests to OpenAI?" is about who reads prayer: no AI does. */
        [/\bprayers?\b.{0,60}\b(openai|chat ?gpt|gpt|ai (company|companies|provider|service|model)|outside ai|another ai|an ai (company|model|service))\b|\b(openai|chat ?gpt)\b.{0,60}\bprayers?\b/i, "aimine"],
        /* A belief question ("What does the church believe about divorce?") is not a hard week. */
        [/\b(believe|believes|views?|position|stance|teach|teaches) (about|on)\b|\b(gay|lgbtq?\w*|same[- ]sex|transgender|affirming)\b|\bwomen (pastors?|preach\w*|elders?)\b|\bdenomination\w*\b|\bstatement of faith\b/i, "beliefs"],
        /* A hard week comes before any product answer. */
        [/\b(passed away|has died|just died|died (last|this|on|in)|funeral|griev\w*|grief|lost my (job|mom|dad|mother|father|husband|wife|son|daughter|baby|child|friend|home|house|brother|sister)|laid off|got fired|been fired|divorc\w*|miscarr\w*|cancer|diagnos\w*|in the hospital|scared|afraid|so worried|can'?t sleep)\b/i, "hardship"],
        /* "Can my husband see my messages?": family at home never reads them. */
        [/\b(husband|wife|spouse|partner|boyfriend|girlfriend|parents?|mom|dad|mother|father|family|kids|children|roommate|anyone (at|in) my (home|house))\b.{0,40}\b(see|sees|read|reads|find|finds|know|knows|get into|look at|check)\w*\b.{0,40}\b(messages?|prayers?|requests?|emails?|what i (write|wrote|send|share|type))\b/i, "messagesprivate"],
        /* "Baptist" is a church, not a baptism. */
        [/\bbapti[sz](e|ed|es|ing|m|ms|mal)\b|\bimmers(ed|ion)\b|\bdunk(ed|ing)?\b/i, "baptism"],
        [new RegExp("\\b(ai|a\\.i\\.|" + AN_RX + "|bot|robot|computer|assistant|machine)\\b.{0,30}\\b(read\\w*|see\\w*|look\\w* at|answer\\w*|repl\\w*|scan\\w*|process\\w*)\\b.{0,30}\\b(prayers?|requests?)\\b", "i"), "aimine"],
        [/\b(did|has|have|is)\b.{0,40}\b(reply|replied|respond\w*|answer\w*|write back|written back|wrote back|get back|gotten back)\b|\bany (reply|replies|answer|response)\b|\bwhere (is|are|do i (see|find)) (my |the |a )?(reply|replies|answers?)\b/i, "replies"],
        [/\b(giv(e|ing)|tith\w*|donat\w*|offerings?)\b.{0,30}\b(private|see|sees|seeing|visible|history|record\w*|track\w*|know|knows|knowing|finding out)\b|\bwho (can )?(sees?|knows?) (what|how much) i give\b/i, "givingprivate"],
        [/\b(turn off|stop|unsubscribe|opt out|fewer|less|change)\b.{0,20}\b(e-?mails?|notifications?|alerts?)\b|\be-?mail (settings|preferences|notifications)\b|\bunsubscribe\b/i, "emails"],
        [/\bwho (reads|sees|can read|can see|will read|will see|gets)\b.{0,30}\b(messages?|threads?|conversations?)\b|\b(staff|office|pastors?|anyone|someone)\b.{0,30}\b(read|reads|see|sees)\b.{0,20}\bmy (?:private )?(messages?|threads?|conversations?)\b/i, "messageswho"],
        [/\bwho (sees|can see|will see|gets|reads)\b.{0,30}\bgifts?\b|\bgifts?\b.{0,30}\bwho (sees|can see|will see)\b|share my (gifts|results?|name)|\bgifts?\b.{0,30}\b(shared|share|see|sees|visible)\b/i, "giftswho"],
        /* Removing a request comes before "my prayer request", so it is never answered with who can see it. */
        [/\b(delete|remove|erase|close|cancel|take down|withdraw)\b.{0,20}\b(my )?(account|information|info|data|profile|records?)\b|\bforget me\b|\b(delete|remove|erase|take down|withdraw|cancel)\b.{0,25}\b(prayer|request|message|post)/i, "remove"],
        [/\b(my|our) (prayers?|prayer requests?|requests?)\b(?! team)|\bwho (reads|sees|can read|can see|will read|will see) (my|what i write in my|what i) ?(prayers?|prayer requests?|requests?)\b/i, "prayerwho"],
        [/\b(talk|speak|meet|chat) (to|with) (a|my|the|our) pastor|\bwho is (my|our|the) (lead |care )?pastor|\bmy pastor\b|\bsee a pastor\b|\bpastor'?s (name|phone|number|email)/i, "pastor"],
        [/\b(need|want|would like) (someone|somebody|a person) to talk to|\bsomeone to talk to\b|\b(i'?m|i am|feeling) (so )?(lonely|struggling|overwhelmed|not ok|not okay)\b|\bhaving a (really )?hard time\b|^\s*i need help\s*[.!]?\s*$/i, "talk"],
        [/\b(what time|when) (is|are|does|do)\b.{0,30}\b(sunday|services?|gatherings?|church|worship|start)\b|\bservice times?\b|\bsunday times?\b/i, "times"],
        [/^(?!.*\b(account|sign ?(in|up)|log ?in)\b).*(\b(kids?|children|nursery|toddlers?)\b.*\b(check|room|class|sunday|program|ministry|during|go)\b|\bcheck[- ]?in\b|\bwhere do (the |my |our )?kids\b)/i, "kids"]
      ].concat(RULES.map(function (r) { return [r[0], r[1] === "data" ? "mydata" : /^(?:pco|pcokeep|worksbeside|importpeople)$/.test(r[1]) ? "memberpco" : r[1] === "prayer" ? "prayerwho" : r[1] === "crisis" ? "crisisinfo" : r[1] === "aiprayer" ? "aimine" : r[1] === "archive" ? "remove" : r[1] === "giving" ? "give" : r[1] === "guestunsub" ? "emails" : r[1]]; })).concat([
        /* "a privacy policy we can give to our members" is not giving. */
        [/\b(giv(e|ing)(?! (it|this|that|them) to\b)(?! to (our|my|the) (members|people|team|staff|families)\b)|tith\w*|donat\w*|offerings?)\b/i, "give"]
      ]),
      fallback: "I am not sure about that one, and I would rather not guess. In " + poss(c.short) + " app I answer from facts the church approved, and anything personal goes to a real person: send a Message and someone from the church will answer. For this preview, try one of these.",
      /* Tap to ask only: the questions a member can tap, each with the answer written for it. */
      questions: [
        { title: "Popular Questions", items: [
          ["Who Sees My Prayer Requests?", "prayerwho"], ["Who Reads My Messages?", "messageswho"], ["Can I Talk to a Pastor?", "pastor"],
          ["What Happens in a Crisis?", "crisisinfo"], ["Does " + AN + " Answer Prayer Requests?", "aimine"], ["What Do Members Need to Sign In?", "signin"]] },
        { title: "My Information", more: true, items: [
          ["Who Sees My Gifts?", "giftswho"], ["Can Other Members See My Phone Number?", "contactsee"], ["Who Sees What I Give?", "givingprivate"],
          ["Can I Get a Copy of My Data?", "mydata"], ["How Do I Remove My Information?", "remove"]] },
        { title: "Sundays", more: true, items: [
          ["What Time Is Sunday?", "times"], ["Where Do Kids Check In?", "kids"], ["How Do I Get Baptized?", "baptism"]] }
      ],
      tour: function () { return compile(tour); },
      tourIntro: "Here is the guided demo of this screen, one part at a time. Use Next to move on, or press Escape to stop.",
      next: nx,
      /* The last screen of a church buyer's demo: the assistant closes this screen in the church's own voice, then
         Genesis closes the week's story in its own guide card (showChurchClose), not in the church's chat. */
      finale: last
        ? { text: tour ? fill(tour.done) : "", chips: [{ label: "Take the Tour Again", key: "tour" }] }
        : { text: (tour ? fill(tour.done) : "") + (nx && nx.note ? "\n\n" + nx.note : ""), chips: [{ label: "Take the Tour Again", key: "tour" }].concat(chipsAbout.slice(0, 2)) },
      onTourEnd: function (finished) { if (finished && last) setTimeout(function () { showChurchClose(nx); }, 0); },
      autoStartParam: "tour",
      keepParams: ["church", "plan", "from", "pace"],
      autoInvite: false,
      placement: "side",
      bottomOffset: 0,
      /* The phone's top bar pins under the stage bar as the page scrolls. A part inside the phone keeps
         clear of it; a part of the stage around the phone (the plan switch) does not sit under it. */
      topInset: function (sp) {
        /* A part of the stage still keeps clear of the sample strip fixed at the top of the window. */
        if (stepOutside) { var strip = sp ? null : document.querySelector(".gm-preview-strip"); var sb = strip && strip.getClientRects().length ? strip.getBoundingClientRect().bottom : 0; return sb > 0 ? sb + 8 : 0; }
        var mt = document.querySelector(".m-app .m-top");
        /* At 500px tall or less the bar is not sticky, so it keeps no room at the top. */
        var h = mt && getComputedStyle(mt).position === "sticky" ? mt.offsetHeight : 0;
        if (sp) return h + 8;
        var top = mt ? parseFloat(getComputedStyle(mt).top) || 0 : 0;
        return Math.max(top + h, 44) + 8;
      }
    };
  }

  /* The church buyer's demo ends on a member screen. The church's own chat stays the church's: the
     week's story closes in the Genesis guide card, the same Done card the workspace uses, with the
     plans, how a church gets started and the way back. */
  function showChurchClose(nx) {
    var chatClose = document.querySelector('.hd-panel.on .hd-head button[aria-label="Close chat"]');
    if (chatClose) chatClose.click();
    var old = document.querySelector(".gm-close-card"); if (old) old.remove();
    var card = document.createElement("section");
    card.className = "v2-guide gm-close-card";
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", GUIDE + ", the end of the demo");
    var start = "journey.html#start";
    card.innerHTML = '<div class="v2-guide-head"><span class="v2-guide-eyebrow"></span><span class="v2-guide-count">Done</span>' +
      '<button class="v2-guide-icon v2-guide-close" type="button" data-close aria-label="Close" title="Close"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
      '<p class="v2-guide-say" role="status"></p>' + (nx && nx.note ? '<p class="v2-guide-note"></p>' : "") +
      '<div class="v2-guide-controls"><a class="v2-button v2-button-primary" data-levels></a><a class="v2-button" data-talk target="_blank" rel="noopener"></a><a class="v2-button" data-start></a><a class="v2-button v2-button-quiet" data-home></a></div>';
    card.querySelector(".v2-guide-eyebrow").textContent = GUIDE + " · The week";
    card.querySelector(".v2-guide-say").textContent = churchClose();
    if (nx && nx.note) card.querySelector(".v2-guide-note").textContent = nx.note;
    var lv = card.querySelector("[data-levels]"); lv.href = nx && nx.href ? nx.href : GM.levelsHref; lv.textContent = "See the Plans";
    var tk = card.querySelector("[data-talk]"); tk.href = CONTACT; tk.innerHTML = "Talk With Genesis<span class=\"sr-only\"> (opens in a new tab)</span>";
    var st = card.querySelector("[data-start]"); st.href = start; st.textContent = "How to Get Started";
    var hm = card.querySelector("[data-home]"); hm.href = "index.html?church=" + encodeURIComponent(GM.church.slug) + "&plan=" + GM.plan; hm.textContent = "Back to the Overview";
    function close() { card.remove(); var t = document.querySelector(".mx-tour") || document.getElementById("gm-main"); if (t && t.focus) try { t.focus({ preventScroll: true }); } catch (e) {} }
    card.querySelector("[data-close]").addEventListener("click", close);
    card.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); close(); } });
    document.body.appendChild(card);
    /* After the chat has let go of focus. */
    setTimeout(function () { try { lv.focus({ preventScroll: true }); } catch (e) {} }, 320);
  }

  /* ------------------------------------------------------------------ Genesis screens: the real guide */
  function genesisConfig(tour, nx) {
    var last = nx && nx.last && ORIGIN === "church";
    return {
      skin: "genesis",
      assistantName: AN,
      guideName: GUIDE,
      tourTitle: tour ? screenOf() + fill(tour.title) : "",
      tour: function () { return compile(tour); },
      next: nx,
      /* A church buyer's demo ends on the church side. */
      finale: { text: (tour ? fill(tour.done) : "") + (last ? " " + churchClose() : ""), askLabel: "Ask " + AN,
        /* See the Plans (the gold Next) already opens the overview, so the second way on is a call. */
        /* The last card of a church buyer's demo, as on the week card: a call, how to start, and the way back. */
        links: last ? [{ label: "Talk With Genesis", href: CONTACT }, { label: "How to Get Started", href: "journey.html#start" }, { label: "Back to the Overview", href: "index.html?church=" + encodeURIComponent(GM.church.slug) + "&plan=" + GM.plan }] : [] },
      openChat: function (prompt) { GM.hope.open(prompt || ""); },
      autoStartParam: "tour",
      keepParams: ["church", "plan", "from", "pace"],
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
    /* The public copy has no presenter mode. */
    var PRESENT = false;
    /* Targets are the short head of each section, so the card never sits on the part a step describes;
       phoneSel points a phone at the one part a step names. */
    var TS = {
      index: { title: "The overview", done: "That is the overview. Start the Guided Demo to walk through one church's week, screen by screen, then come back here.", steps: [
        { sel: ".hero .hero-copy", h: "Edition 05 of Genesis OS", p: "Genesis Ministry is one platform for a church of about 100 to 1,000 people: a website in its own look, " + AN + " for guests, and a workspace where nobody falls through the cracks." },
        { sel: ".tenant", h: "Show the demo as any church", p: "Four made-up churches, one in each look. The choice carries through every screen, in the workspace and in the member app." },
        { sel: ["#doors .intro > div:first-child", "#doors .intro", "#doors"], phoneSel: ["#doors .intro", "#doors"], h: "Every part, one door each", p: "From the website to what members see on their phones." + " Each screen opens with sample data and its own short tour." },
        { sel: ["#rules .rules-side", "#rules"], phoneSel: ["#rules .crisis", "#rules .rules-side"], h: "A reply written by people", p: "If someone writes in crisis, they see 988 and 911 right away, in a reply written by people, never improvised. From the Shepherd plan, the pastor on call is alerted with no private words." },
        { sel: ["#rules .rules", "#rules"], phoneSel: ["#rules .rules > li:first-child", "#rules .rules"], place: "edge-left", h: "Pastoral care comes with rules", p: "From the Shepherd plan, prayer stays with pastors and the prayer team and alerts carry no private words. On Care, prayer forms go to the pastors' email. A person approves every draft, and nothing is deleted. Each rule links to the screen where you can see it." },
        { sel: ["#levels .intro > div:first-child", "#levels .intro", "#levels"], phoneSel: ["#levels .intro", "#levels"], h: "Start where the church is", p: PRICES + " Enterprise, for more than one campus, is scoped on a call. Each Demo This Plan button starts the tour on that plan." },
        { sel: [".close-band .actions", ".close-band"], h: "One week, start to finish", p: "Start the Guided Demo opens Today and follows Maya's first visit and Sarah's prayer request through the week, a few stops on each screen. It ends with the plans and a way back here." }
      ] },
      gallery: { title: "The four looks", done: "That is the gallery. Start the Guided Demo to see what sits behind the website, screen by screen.", steps: [
        { sel: ".hero .hero-copy", h: "Four looks, one standard", p: "Every Genesis Ministry church gets a website in one of four looks, filled with its own story, photos and colors." },
        { sel: ["#looks .intro > div:first-child", "#looks .intro", "#looks"], phoneSel: ["#looks .intro", "#looks"], h: "Pick the look that fits", p: "Each look opens as a full sample church site, with its brand board and social plan. " + AN + " answers questions on every one." },
        { sel: ["#package .intro > div:first-child", "#package .intro", "#package"], phoneSel: ["#package .intro", "#package"], h: "One package", p: "The website, a brand board, a social marketing plan and " + AN + ", on every plan. Customization beyond the template is available for an additional cost." },
        { sel: ["#platform .intro > div:first-child", "#platform .intro", "#platform"], phoneSel: ["#platform .intro", "#platform"], h: "What sits behind the website", p: "From the Shepherd plan, a front office for guests, a care inbox and a member app. The overview and the journey explain it." },
        { sel: [".close-band .actions", ".close-band"], h: "See it working", p: "Start the Guided Demo opens Today and follows one church's week, a few stops on each screen, with sample data." }
      ] },
      journey: { title: "The journey", done: "That is how Genesis Ministry works, start to finish. Now see it working, screen by screen.", steps: [
        { sel: [".chapters", ".hero"], h: "Five chapters", p: "A guest's path, how a church gets started, privacy, what the AI does, and the plans." },
        { sel: ["#guest .intro > div:first-child", "#guest .intro", "#guest"], phoneSel: ["#guest .intro", "#guest"], h: "From a late-night search to a place to serve", p: "Maya T. found the church on a Wednesday night. Every first-time guest like her gets an owner, a next step and a date, from New to Serving." },
        { sel: ["#start .intro > div:first-child", "#start .intro", "#start"], phoneSel: ["#start .intro", "#start"], h: "From a first conversation to launch", p: "Consultation, Scoping, Implementation, Launch and the Managed Platform, with what the church receives at each step. Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month." },
        { sel: ["#privacy .intro > div:first-child", "#privacy .intro", "#privacy"], phoneSel: ["#privacy .intro", "#privacy"], h: "One record per person", p: "Prayer for pastors and the prayer team, alerts with no private words, a record of who opened what, and archive instead of delete." },
        { sel: ["#ai .intro > div:first-child", "#ai .intro", "#ai"], phoneSel: ["#ai .intro", "#ai"], h: "It drafts, then waits", p: AN + " drafts, summarizes and sorts. A person approves everything, and " + AN + " never sets a gifts score." },
        { sel: ["#levels .intro > div:first-child", "#levels .intro", "#levels"], phoneSel: ["#levels .intro", "#levels"], h: "Care, Shepherd, Plus", p: "Each plan adds to the one before: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month. Enterprise, for more than one campus, is scoped on a call." }
      ] }
    };
    var t = TS[file] || TS.index;
    function demoHref() {
      var slug = null, plan = null;
      try { slug = sessionStorage.getItem("gm.church"); plan = sessionStorage.getItem("gm.plan"); } catch (e) {}
      slug = slug || (STORY.church && STORY.church.slug) || "bright-modern";
      plan = plan || String(STORY.plan || 3);
      return PRE + "church-today.html?church=" + encodeURIComponent(slug) + "&plan=" + encodeURIComponent(plan) + "&tour=1&pace=short";
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
      greeting: "Hi, I am " + AN + ". This is the Genesis Ministry design preview, with sample data. Want a short tour of this page, or tap a question below?",
      menu: [
        { label: "Take the Tour", key: "tour", cta: true },
        { label: "Start the Guided Demo", key: "startdemo" },
        { label: "What Is Genesis Ministry?", key: "platform" },
        { label: "Who Sees Prayer Requests?", key: "prayerwho" },
        { label: "Is Our Data Safe?", key: "hosting" },
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
        price: a(ANSWERS.price, [{ label: "What Does Each Plan Include?", key: "levels" }]),
        call: a(ANSWERS.call, [{ label: "Talk With Genesis", href: CONTACT }]),
        /* A buyer's next question after these is usually "can we talk", so the call is one tap away. */
        trial: a(ANSWERS.trial, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does Each Plan Include?", key: "levels" }]),
        contract: a(ANSWERS.contract, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does It Cost?", key: "price" }]),
        company: a(ANSWERS.company, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Is Genesis Ministry?", key: "platform" }]),
        size: a(ANSWERS.size, [{ label: "What Does Each Plan Include?", key: "levels" }, { label: "Talk With Genesis", href: CONTACT }]),
        domain: a(ANSWERS.domain, [{ label: "Talk With Genesis", href: CONTACT }]),
        cancel: a(ANSWERS.cancel, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does It Cost?", key: "price" }]),
        discount: a(ANSWERS.discount, [{ label: "Talk With Genesis", href: CONTACT }, { label: "What Does Each Plan Include?", key: "levels" }])
      }, a, more),
      match: RULES.map(function (r) { return [r[0], r[1] === "prayer" ? "prayerwho" : r[1] === "crisis" ? "crisisinfo" : r[1]]; }),
      fallback: "I am not sure about that one, and I would rather not guess. A person at Genesis can answer it on a call, and the guided demo shows every screen with sample data. For now, try one of these.",
      /* Tap to ask only: the questions a visitor can tap, each with the answer written for it. */
      questions: [
        { title: "Popular Questions", items: [
          ["What Is Genesis Ministry?", "platform"], ["What Does It Cost?", "price"], ["What Does Each Plan Include?", "levels"],
          ["Who Sees Prayer Requests?", "prayerwho"], ["What Happens in a Crisis?", "crisisinfo"], ["How Is the AI Limited?", "ai"]] },
        { title: "How It Works", more: true, items: [
          ["Does It Replace Planning Center?", "pco"], ["Is Our Data Safe?", "hosting"], ["How Do Members Sign In?", "signin"], ["Can We Customize It?", "custom"]] },
        { title: "Getting Started", more: true, items: [
          ["How Do We Get Started?", "start"], ["Does It Work for a Small Church?", "size"], ["Is There a Free Trial?", "trial"]] }
      ],
      tour: function () { var phone = window.innerWidth <= 640; return t.steps.map(function (s) { return { sel: phone && s.phoneSel ? s.phoneSel : s.sel, h: s.h, p: s.p, k: GUIDE + " · " + t.title, place: s.place }; }); },
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
    /* Take the Tour, Help and Jump to always show every step of the screen. */
    start: function () { fullTour = true; if (window.HopeDemo) window.HopeDemo.tour(); else pending = true; },
    end: function () { if (window.HopeDemo) window.HopeDemo.end(); },
    next: null
  };

  /* Demo This Plan starts the church part of the demo path on that plan. */
  function isDemoLink(a) {
    var label = (a.textContent || "").replace(/\s+/g, " ").trim();
    return a.hasAttribute("data-demo") || a.id === "sa-demo-btn" || /^Demo (This Plan|Care|Shepherd|Plus)$/i.test(label);
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
    addSkipLink(nx);
    markContactLinks();
  }
  /* Talk With Genesis always opens the contact page in a new tab, and says so to screen readers,
     wherever it is drawn (the Done cards, the chat chips are opened by hope-demo.js itself). */
  function markContactLinks() {
    if (!("MutationObserver" in window)) return;
    var mark = function () {
      document.querySelectorAll('a[href="' + CONTACT + '"]:not([target])').forEach(function (a) {
        a.target = "_blank"; a.rel = "noopener";
        if (!a.querySelector(".sr-only")) a.insertAdjacentHTML("beforeend", '<span class="sr-only"> (opens in a new tab)</span>');
      });
    };
    mark();
    new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  }
  /* A quiet "Skip to Next Screen" on every card but the last (which already links on),
     so a pastor short on time keeps the chain without clicking through every step. */
  function addSkipLink(nx) {
    if (!nx || !nx.href || nx.last || !("MutationObserver" in window)) return;
    var href = nx.href, hash = "", hi = href.indexOf("#"); if (hi >= 0) { hash = href.slice(hi); href = href.slice(0, hi); }
    var q = "", qi = href.indexOf("?"); if (qi >= 0) { q = href.slice(qi + 1); href = href.slice(0, qi); }
    var p = new URLSearchParams(q);
    ["church", "plan", "from", "pace"].forEach(function (k) { if (!p.has(k) && P.get(k)) p.set(k, P.get(k)); });
    if (ORIGIN === "desk") p.set("from", "desk");
    if (nx.tour !== false) p.set("tour", "1");
    var url = href + "?" + p.toString() + hash;
    /* The card keeps room for the link from the moment it is drawn (genesis.css, html.gm-skip-on), so
       adding it never makes the card taller after the tour has placed the card and its target. */
    document.documentElement.classList.add("gm-skip-on");
    new MutationObserver(function () {
      var card = document.querySelector('.hd-g.v2-guide[role="dialog"], .hd-card');
      if (!card || card.querySelector(".gm-skip-screen")) return;
      var cnt = card.querySelector(".v2-guide-foot .v2-guide-count, .k");
      var m = cnt && /(\d+) of (\d+)/.exec(cnt.textContent || "");
      if (!m || +m[1] >= +m[2]) return;
      var a = document.createElement("a");
      a.className = "gm-skip-screen"; a.href = url; a.textContent = "Skip to Next Screen";
      a.setAttribute("aria-label", "Skip to the next screen: " + nx.label.replace(/^Next: /, ""));
      /* After the card's foot (a site or member card keeps Back and Next in .hd-cfoot), as the card's own child. */
      var after = card.querySelector(".v2-guide-foot") || card.querySelector(".hd-cfoot") || card.querySelector(".bar");
      if (after) after.insertAdjacentElement("afterend", a); else card.appendChild(a);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
