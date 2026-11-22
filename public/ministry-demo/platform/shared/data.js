/* Genesis Ministry design preview: the shared sample data.
   Every person, church and number here is fictional. Nothing is fetched, nothing is sent.
   One shared set of people and care is shown under whichever church is selected.
   Text may carry placeholders that GM.fill() resolves for the selected church:
   {church.name} {church.short} {church.city} {church.leadPastor} {church.carePastor}
   {church.email} {church.phone} {church.times}
   Read it as window.GM_DATA. Do not mutate it from a page; copy what you change. */
(function () {
  "use strict";

  var D = {};

  /* The demo clock. Every "today", "overdue" and "2 days ago" is measured from here. */
  D.now = "2026-11-19T10:30:00";

  /* ------------------------------------------------------------------ churches */
  /* The four demo churches. Colors, fonts and marks come from each template's
     design.json. Member screens wear these tokens; Genesis screens never do. */
  D.churches = [
    {
      slug: "bright-modern", look: "Bright and Modern",
      name: "Lightwell Church", short: "Lightwell", city: "Raleigh", state: "NC",
      pastors: ["Theo", "Priya"], leadPastor: "Pastor Theo", carePastor: "Pastor Priya",
      times: "Sundays 9:00 and 10:45 AM", phone: "(919) 555-0142", email: "hello@lightwell.example",
      size: "About 340 on a Sunday", sizeNumber: 340, founded: 2023,
      site: "../templates/bright-modern/index.html", brandBoard: "../templates/bright-modern/brand-board.html", socialPlan: "../templates/bright-modern/social-plan.html",
      mark: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="9" fill="#1F4FFF"/><path d="M11 0h6.5v26H31v6.5H11z" fill="#fff"/><rect x="23.5" y="8" width="7.5" height="7.5" rx="1.6" fill="#E4ECFF"/></svg>',
      fontsUrl: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Hanken+Grotesk:wght@400..700&display=swap",
      theme: {
        scheme: "light",
        bg: "#F4F7FC", surface: "#FFFFFF", surface2: "#F4F7FC", surface3: "#E4ECFF",
        text: "#0B1220", muted: "#475166", line: "#DCE2EC", lineStrong: "#C5CEDC",
        accent: "#1F4FFF", accentPress: "#1739CC", onAccent: "#FFFFFF", accentInk: "#1F4FFF", accentSoft: "#E4ECFF",
        focus: "#1F4FFF", display: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif', body: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
        displayWeight: "800", displayTracking: "-0.03em", displayCase: "none",
        radius: "10px", radiusLg: "16px", btnRadius: "8px"
      }
    },
    {
      slug: "bold-dark", look: "Bold and Dark",
      name: "Lampstand Church", short: "Lampstand", city: "Columbus", state: "OH",
      pastors: ["Andre", "Talia"], leadPastor: "Pastor Andre", carePastor: "Pastor Talia",
      times: "Sundays 10 AM and 6 PM", phone: "(614) 555-0142", email: "hello@lampstand.example",
      size: "About 520 on a Sunday", sizeNumber: 520, founded: 2019,
      site: "../templates/bold-dark/index.html", brandBoard: "../templates/bold-dark/brand-board.html", socialPlan: "../templates/bold-dark/social-plan.html",
      mark: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="3" fill="#14110E"/><g transform="translate(7.2 4) scale(.8)"><path d="M16 1.5c3.6 4.3 6 7.6 6 11.2 0 3.4-2.7 6-6 6s-6-2.6-6-6c0-3.6 2.4-6.9 6-11.2z" fill="#FF9A1F"/><rect x="8" y="21" width="16" height="3" fill="#F4EEE4"/><rect x="13.5" y="24" width="5" height="11" fill="#F4EEE4"/><rect x="6" y="35" width="20" height="4" fill="#F4EEE4"/></g></svg>',
      fontsUrl: "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Instrument+Sans:wght@400;500;600;700&display=swap",
      theme: {
        scheme: "dark",
        bg: "#14110E", surface: "#1F1A16", surface2: "#29231D", surface3: "#332B23",
        text: "#F4EEE4", muted: "#B8AD9E", line: "#3A332C", lineStrong: "#554B41",
        accent: "#FF9A1F", accentPress: "#FFB04F", onAccent: "#14110E", accentInk: "#FF9A1F", accentSoft: "rgba(255,154,31,.14)",
        focus: "#FFC36E", display: '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif', body: '"Instrument Sans", system-ui, sans-serif',
        displayWeight: "800", displayTracking: "0", displayCase: "uppercase",
        radius: "2px", radiusLg: "4px", btnRadius: "2px"
      }
    },
    {
      slug: "classic-timeless", look: "Classic and Timeless",
      name: "Calder Hill Chapel", short: "Calder Hill", city: "Richmond", state: "VA",
      pastors: ["Samuel", "Ruth"], leadPastor: "Pastor Samuel", carePastor: "Pastor Ruth",
      times: "Sundays 9:00 and 11:00 AM", phone: "(804) 555-0142", email: "hello@calderhill.example",
      size: "About 460 on a Sunday", sizeNumber: 460, founded: 1891,
      site: "../templates/classic-timeless/index.html", brandBoard: "../templates/classic-timeless/brand-board.html", socialPlan: "../templates/classic-timeless/social-plan.html",
      mark: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="3" fill="#1F3D2F"/><g transform="translate(7.6 3.9) scale(.62)" fill="none"><path d="M2 51V20a18 18 0 0 1 36 0v31" stroke="#FCF9F1" stroke-width="2.6"/><path d="M7 51V21a13 13 0 0 1 26 0v30" stroke="#FCF9F1" stroke-width="1.3"/><path d="M20 11v24M14.5 18h11" stroke="#D2B574" stroke-width="2.6" stroke-linecap="square"/><path d="M7 51v-8c4-4.6 8.4-6.8 13-6.8s9 2.2 13 6.8v8z" fill="#FCF9F1"/></g></svg>',
      fontsUrl: "https://fonts.googleapis.com/css2?family=Commissioner:wght@400..700&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap",
      theme: {
        scheme: "light",
        bg: "#F5EFE2", surface: "#FCF9F1", surface2: "#EBE2CE", surface3: "#E2D7BF",
        text: "#24221D", muted: "#5B564B", line: "#D6CAB0", lineStrong: "#BFAF8D",
        accent: "#1F3D2F", accentPress: "#152A20", onAccent: "#FCF9F1", accentInk: "#7A2532", accentSoft: "rgba(31,61,47,.09)",
        focus: "#7A2532", display: '"Newsreader", Georgia, "Times New Roman", serif', body: '"Commissioner", "Segoe UI", system-ui, sans-serif',
        displayWeight: "500", displayTracking: "-0.01em", displayCase: "none",
        radius: "2px", radiusLg: "4px", btnRadius: "2px"
      }
    },
    {
      slug: "warm-community", look: "Warm Community",
      name: "Goldenrod Commons Church", short: "Goldenrod Commons", city: "Des Moines", state: "IA",
      pastors: ["Marcus", "Ellie"], leadPastor: "Pastor Marcus", carePastor: "Pastor Ellie",
      times: "Sundays 9:00 and 10:45 AM", phone: "(515) 555-0142", email: "hello@goldenrod.example",
      size: "About 380 on a Sunday", sizeNumber: 380, founded: 2012,
      site: "../templates/warm-community/index.html", brandBoard: "../templates/warm-community/brand-board.html", socialPlan: "../templates/warm-community/social-plan.html",
      mark: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#FFFBF3"/><circle cx="24" cy="24" r="20" fill="#FFC83A"/><path d="M16.5 38.5V27a7.5 7.5 0 0 1 15 0v11.5z" fill="#3A2618"/><rect x="13" y="37.6" width="22" height="3" rx="1.5" fill="#3A2618"/><path d="M28.6 20.2c.6-5 4.6-8 9.6-7.4-.5 4.8-4.5 8-9.6 7.4z" fill="#3B7A37"/></svg>',
      fontsUrl: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito+Sans:opsz,wght@6..12,400..800&display=swap",
      theme: {
        scheme: "light",
        bg: "#FFFBF3", surface: "#FFFFFF", surface2: "#FFF4DE", surface3: "#DDEBD3",
        text: "#3A2618", muted: "#6A5242", line: "rgba(58,38,24,.14)", lineStrong: "rgba(58,38,24,.28)",
        accent: "#FFC83A", accentPress: "#F2B01E", onAccent: "#3A2618", accentInk: "#2F6430", accentSoft: "#DDEBD3",
        focus: "#2F6430", display: '"Fredoka", ui-rounded, "Segoe UI", system-ui, sans-serif', body: '"Nunito Sans", system-ui, sans-serif',
        displayWeight: "600", displayTracking: "-0.015em", displayCase: "none",
        radius: "20px", radiusLg: "28px", btnRadius: "999px"
      }
    }
  ];
  D.defaultChurch = "bright-modern";

  /* ------------------------------------------------------------------ levels */
  /* DRAFT plan levels, to be confirmed by the owner. Never show a price.
     Where a price would sit, show D.pricingLine. */
  D.pricingLine = "Pricing set with Genesis";
  D.customLine = "Customization beyond the template is available for an additional cost.";
  D.levels = [
    { n: 1, code: "Level 01", name: "Welcome", draft: true, seats: "No seats needed. Forms arrive by email",
      summary: "A website people can find and use, with Hope answering questions and every form arriving by email.",
      includes: ["The website in one of four looks", "The brand board", "The social marketing plan", "Hope on the website, trained on facts the church approves", "Plan a Visit and prayer forms delivered by email", "Newsletter sign-up"] },
    { n: 2, code: "Level 02", name: "Connect", draft: true, seats: "Up to 8 staff seats",
      summary: "Everything in Welcome, plus a front office for guests and a member app, so nobody falls through the cracks.",
      includes: ["Everything in Welcome", "The Today view", "The Front Office guest pipeline", "The member app: sign in, home, prayer with history, messages, Give", "The care inbox for prayer and messages, with every open recorded", "Team roles: pastor, prayer team, staff and admin, with the prayer team named", "Hope drafts that wait for approval"] },
    { n: 3, code: "Level 03", name: "Shepherd", draft: true, seats: "Up to 15 staff seats",
      summary: "Everything in Connect, plus one page per person, the spiritual gifts picture and reports for pastors.",
      includes: ["Everything in Connect", "Person pages and the Access Record screen", "The spiritual gifts conversation and the pastor's gifts picture", "Reports", "Custom roles and named gift viewers", "More staff seats"] },
    { n: 4, code: "Enterprise", name: "Enterprise", draft: true, seats: "Scoped on a call",
      summary: "For multi-campus churches. Everything in Shepherd, scoped on a call.",
      includes: ["Everything in Shepherd", "More than one campus", "Scoped on a call"] }
  ];
  D.defaultPlan = 3;

  /* Modules and the level that includes each. The nav and the locked state read this. */
  D.modules = {
    website:  { label: "Website", level: 1, side: "church", adds: "The website in its chosen look, the brand board, the social marketing plan, and the forms that reach the church.", points: ["The website, with Hope answering questions", "The brand board and the social plan", "Plan a Visit and prayer forms by email"] },
    today:    { label: "Today", level: 2, side: "church", adds: "One calm list of what needs a person today: new guests, care waiting on us and follow-ups due.", points: ["New guests since Sunday, each with an owner", "Care waiting on us, oldest first", "Follow-ups due today and overdue", "Hope drafts ready for your approval"] },
    guests:   { label: "Guests", level: 2, side: "church", adds: "The front office: every first-time guest moves from New to Serving with an owner, a next step and a due date.", points: ["Guests arrive from Plan a Visit, Hope, connect cards, events and the newsletter", "Six stages from New to Serving", "Hope drafts welcome notes that wait for approval", "Follow-up by email by default; texting only if the church turns it on"] },
    care:     { label: "Care", level: 2, side: "church", adds: "One shared inbox for prayer and messages, with an owner on every thread and a waiting-on-us list.", points: ["Prayer visible only to pastors and the prayer team", "Alert emails carry no private words", "Every open, reply and archive is recorded", "Archive, never delete"] },
    people:   { label: "People", level: 3, side: "church", adds: "One page per person with everything from them in one place.", points: ["Contact card, threads and prayer history (for those allowed)", "Gifts when the person said yes", "Private pastor notes", "Every open is recorded"] },
    access:   { label: "Access Record", level: 3, side: "church", adds: "The Access Record screen: search and export every open, reply, change and archive. From Level 02 every open is already recorded; Shepherd adds this screen.", points: ["Search by person, record or action", "Export a copy, and the export is recorded too", "Role changes are emailed to the lead pastor", "Nobody can edit an entry"] },
    gifts:    { label: "Gifts", level: 3, side: "church", adds: "The spiritual gifts conversation for members and a church-wide picture for pastors.", points: ["Plain arithmetic scoring; the AI never sets a score", "The chart stays hidden until 25 people finish", "Small counts show as fewer than 5", "Names only for people who said yes"] },
    reports:  { label: "Reports", level: 3, side: "church", adds: "Plain reports on guests, care and response times, counts only.", points: ["Guest path from first contact to serving", "Care volume and how fast we reply", "Counts only, never names or private words"] },
    team:     { label: "Team Roles", level: 2, side: "church", adds: "Who holds each role and what each role can see. Connect has the four roles and a named prayer team; Shepherd adds custom roles, named gift viewers and more seats.", points: ["Pastor, prayer team, staff and admin roles", "The prayer team named by the pastors", "Changes are emailed to the lead pastor", "Two-step sign in for everyone"] },
    "custom-roles": { label: "Custom Roles", level: 3, side: "church", adds: "Roles shaped to your church, like a care meals coordinator, and people named to see gift names for serving.", points: ["Custom roles with exactly what they need", "Named gift viewers", "Up to 15 staff seats"] },
    settings: { label: "Settings", level: 1, side: "church", adds: "The tools your church already uses, how follow-up and alerts travel, and when Genesis may sign in.", points: ["Giving, events and kids check-in links", "Follow-up and alert settings", "Support sessions, off by default"] },
    genesis:  { label: "Hope", level: 2, side: "church", adds: "Hope drafts welcome notes and everyday replies, and summarizes the week. A person approves everything.", points: ["Drafts are labelled and wait for approval", "Never drafts a reply to prayer or a personal message", "Never sets a gifts score"] },
    "member-app":   { label: "Member App", level: 2, side: "member", adds: "What members see on their phones: sign in, home, prayer with history, messages and Give.", points: ["Sign in with a 6 digit code sent by email", "Adults only", "Prayer with a history and any reply", "Private message threads with the church"] },
    "member-gifts": { label: "My Gifts", level: 3, side: "member", adds: "The spiritual gifts conversation, one statement at a time, in the church's own voice.", points: ["Saves after every tap", "Results kept under My Gifts", "Names shared with pastors only after a yes"] }
  };

  /* ------------------------------------------------------------------ church staff */
  /* "s-lead" and "s-care" are the selected church's two pastors (resolved by GM.staff).
     Everyone else is shared across churches. */
  D.staff = [
    { id: "s-lead",  pastorSlot: 0, role: "Lead Pastor", roleKey: "pastor", caps: ["pastor", "prayer", "giftNames", "accessRecord"], email: "pastor@church.example", tone: 1 },
    { id: "s-care",  pastorSlot: 1, role: "Care Pastor", roleKey: "pastor", caps: ["pastor", "prayer", "giftNames"], onCall: true, email: "care@church.example", tone: 5 },
    { id: "s-nadia", name: "Nadia K.",  initials: "NK", role: "Connections Lead", roleKey: "staff", caps: ["guests"], email: "nadia@church.example", tone: 2 },
    { id: "s-owen",  name: "Owen B.",   initials: "OB", role: "Prayer Team Lead", roleKey: "prayer", caps: ["prayer"], email: "owen@church.example", tone: 3 },
    { id: "s-sofia", name: "Sofia R.",  initials: "SR", role: "Prayer Team", roleKey: "prayer", caps: ["prayer"], email: "sofia@church.example", tone: 4, addedOn: "2026-11-17" },
    { id: "s-hector",name: "Hector M.", initials: "HM", role: "Groups Lead", roleKey: "staff", caps: ["guests"], email: "hector@church.example", tone: 6, away: { from: "2026-11-19", until: "2026-11-27", coveredBy: "s-nadia", note: "Away for a family wedding. His guests moved to Nadia K. until he is back." } },
    { id: "s-imani", name: "Imani W.",  initials: "IW", role: "Office Manager", roleKey: "staff", caps: ["messages"], email: "office@church.example", tone: 2 },
    { id: "s-jun",   name: "Jun P.",    initials: "JP", role: "Serving Teams Lead", roleKey: "staff", caps: ["guests", "giftNames"], email: "jun@church.example", tone: 3, note: "Named by the pastors to see gift names for serving." },
    { id: "s-web",   name: "Genesis Support", initials: "GS", role: "Website Admin", roleKey: "admin", caps: ["admin"], email: "support@geai.example", tone: 6, note: "Runs the system. Cannot read pastoral content. Signs in only when the church opens a support session." }
  ];
  D.viewer = { church: "s-lead", genesis: "g-victor" };

  D.roles = [
    { key: "pastor", label: "Pastor", sees: "Everything, including prayer, private threads, pastor notes and gift names." },
    { key: "prayer", label: "Prayer Team", sees: "Prayer requests and nothing more." },
    { key: "staff",  label: "Staff", sees: "Guests, everyday messages and person contact cards. No prayer, no pastor notes." },
    { key: "admin",  label: "Admin", sees: "Runs the system and settings. Does not read pastoral content." }
  ];

  /* ------------------------------------------------------------------ people */
  /* One record per person. Adults only. Initials avatars, never photos.
     attends: "in person" | "online" | "exploring". status: "member" | "regular" | "guest". */
  D.people = [
    { id: "p-sarah",   name: "Sarah N.",   initials: "SN", tone: 1, attends: "in person", status: "member",  since: "2024-03-10", email: "sarah.n@example.com",  phone: "(555) 010-2231", contact: "Email", adultConfirmed: "2026-09-14", knownMember: true,  serving: ["Coffee and Hospitality"], groups: ["New Parents Group"], gifts: "g-sarah", giftsShared: true, wantsToTalk: true, prayer: ["pr-01", "pr-09"], threads: ["t-06", "t-08"], shepherd: "s-care", notes: "Mom starts treatment next week. Check in after Sunday." },
    { id: "p-wyatt",   name: "Wyatt F.",   initials: "WF", tone: 2, attends: "in person", status: "member",  since: "2021-06-02", email: "wyatt.f@example.com",  phone: "(555) 010-4410", contact: "Email", adultConfirmed: "2026-09-15", knownMember: true,  serving: ["Setup and Parking"], groups: [], prayer: ["pr-02"], threads: [], shepherd: "s-lead" },
    { id: "p-fatima",  name: "Fatima A.",  initials: "FA", tone: 3, attends: "in person", status: "member",  since: "2022-01-16", email: "fatima.a@example.com", phone: "(555) 010-7782", contact: "Text if the church allows", adultConfirmed: "2026-09-21", knownMember: true,  serving: ["Kids"], groups: ["Tuesday Night Group"], prayer: ["pr-03"], threads: [], gifts: "g-fatima", giftsShared: true },
    { id: "p-caleb",   name: "Caleb E.",   initials: "CE", tone: 4, attends: "online",    status: "regular", since: "2025-08-03", email: "caleb.e@example.com",  phone: "(555) 010-3095", contact: "Email", adultConfirmed: "2026-10-04", knownMember: false, serving: [], groups: [], prayer: ["pr-04"], threads: [], shepherd: "s-care" },
    { id: "p-naomi",   name: "Naomi V.",   initials: "NV", tone: 5, attends: "in person", status: "member",  since: "2020-09-13", email: "naomi.v@example.com",  phone: "(555) 010-6624", contact: "Email", adultConfirmed: "2026-09-14", knownMember: true,  serving: ["Welcome Team"], groups: ["Women's Morning Group"], prayer: ["pr-05"], threads: [] },
    { id: "p-diego",   name: "Diego S.",   initials: "DS", tone: 6, attends: "in person", status: "member",  since: "2019-04-21", email: "diego.s@example.com",  phone: "(555) 010-1187", contact: "Phone call", adultConfirmed: "2026-09-28", knownMember: true,  serving: ["Production"], groups: ["Men's Breakfast"], prayer: ["pr-06"], threads: [], gifts: "g-diego", giftsShared: true },
    { id: "p-peter",   name: "Peter K.",   initials: "PK", tone: 2, attends: "online",    status: "regular", since: "2026-02-08", email: "peter.k@example.com",  phone: "(555) 010-9043", contact: "Phone call", adultConfirmed: "2026-10-11", knownMember: false, serving: [], groups: [], prayer: ["pr-07"], threads: [], shepherd: "s-care" },
    { id: "p-jasmine", name: "Jasmine Y.", initials: "JY", tone: 3, attends: "in person", status: "regular", since: "2025-11-30", email: "jasmine.y@example.com", phone: "(555) 010-5520", contact: "Email", adultConfirmed: "2026-10-18", knownMember: false, serving: [], groups: ["Young Adults"], prayer: ["pr-08"], threads: [] },
    { id: "p-abigail", name: "Abigail R.", initials: "AR", tone: 4, attends: "in person", status: "regular", since: "2026-06-14", email: "abigail.r@example.com", phone: "(555) 010-2806", contact: "Email", adultConfirmed: "2026-11-02", knownMember: false, serving: [], groups: [], prayer: [], threads: ["t-01"] },
    { id: "p-kwame",   name: "Kwame A.",   initials: "KA", tone: 5, attends: "in person", status: "member",  since: "2023-02-19", email: "kwame.a@example.com",  phone: "(555) 010-4471", contact: "Email", adultConfirmed: "2026-09-14", knownMember: true,  serving: [], groups: ["Men's Breakfast"], prayer: [], threads: ["t-02"], gifts: "g-kwame", giftsShared: true, wantsToTalk: true },
    { id: "p-lucia",   name: "Lucia P.",   initials: "LP", tone: 6, attends: "in person", status: "member",  since: "2018-10-07", email: "lucia.p@example.com",  phone: "(555) 010-8810", contact: "Phone call", adultConfirmed: "2026-09-20", knownMember: true,  serving: ["Care Meals"], groups: [], prayer: [], threads: ["t-03"], shepherd: "s-lead" },
    { id: "p-noah",    name: "Noah B.",    initials: "NB", tone: 1, attends: "in person", status: "regular", since: "2025-05-11", email: "noah.b@example.com",   phone: "(555) 010-3352", contact: "Email", adultConfirmed: "2026-10-01", knownMember: false, serving: [], groups: [], prayer: [], threads: ["t-04"] },
    { id: "p-ivy",     name: "Ivy H.",     initials: "IH", tone: 2, attends: "in person", status: "member",  since: "2022-09-04", email: "ivy.h@example.com",    phone: "(555) 010-6012", contact: "Email", adultConfirmed: "2026-09-14", knownMember: true,  serving: ["Welcome Team"], groups: ["Tuesday Night Group"], gifts: "g-ivy", giftsShared: true },
    { id: "p-samir",   name: "Samir Q.",   initials: "SQ", tone: 3, attends: "online",    status: "regular", since: "2025-01-12", email: "samir.q@example.com",  phone: "(555) 010-7350", contact: "Email", adultConfirmed: "2026-10-09", knownMember: false, serving: [], groups: [], gifts: "g-samir", giftsShared: true, wantsToTalk: true },
    { id: "p-ruby",    name: "Ruby T.",    initials: "RT", tone: 4, attends: "in person", status: "member",  since: "2017-03-26", email: "ruby.t@example.com",   phone: "(555) 010-2264", contact: "Phone call", adultConfirmed: "2026-09-14", knownMember: true,  serving: ["Prayer Team"], groups: ["Women's Morning Group"], gifts: "g-ruby", giftsShared: true },
    { id: "p-andres",  name: "Andres L.",  initials: "AL", tone: 5, attends: "in person", status: "regular", since: "2026-04-05", email: "andres.l@example.com", phone: "(555) 010-9917", contact: "Email", adultConfirmed: "2026-10-25", knownMember: false, serving: [], groups: [], gifts: "g-andres", giftsShared: true, wantsToTalk: true },
    /* guests: people who first arrived as guests (see D.guests) */
    { id: "p-maya",    name: "Maya T.",    initials: "MT", tone: 1, attends: "exploring", status: "guest", since: "2026-11-18", email: "maya.t@example.com",   phone: "(555) 010-1450", contact: "Email", household: "Married, two kids (4 and 7)", threads: ["t-05"] },
    { id: "p-daniel",  name: "Daniel O.",  initials: "DO", tone: 2, attends: "exploring", status: "guest", since: "2026-11-18", email: "daniel.o@example.com", contact: "Email", household: "Single" },
    { id: "p-aisha",   name: "Aisha B.",   initials: "AB", tone: 3, attends: "online",    status: "guest", since: "2026-11-17", email: "aisha.b@example.com",  contact: "Email" },
    { id: "p-kenji",   name: "Kenji W.",   initials: "KW", tone: 4, attends: "exploring", status: "guest", since: "2026-11-16", email: "kenji.w@example.com",  contact: "Email", household: "Couple" },
    { id: "p-rosa",    name: "Rosa M.",    initials: "RM", tone: 5, attends: "exploring", status: "guest", since: "2026-11-12", email: "rosa.m@example.com",   contact: "Email", household: "Mom and teenage son" },
    { id: "p-tomas",   name: "Tomás R.",   initials: "TR", tone: 6, attends: "in person", status: "guest", since: "2026-11-15", email: "tomas.r@example.com",  contact: "Email", household: "Family of five" },
    { id: "p-hannah",  name: "Hannah L.",  initials: "HL", tone: 1, attends: "exploring", status: "guest", since: "2026-11-14", email: "hannah.l@example.com", contact: "Email", household: "Mom with a toddler", threads: ["t-07"] },
    { id: "p-malik",   name: "Malik J.",   initials: "MJ", tone: 2, attends: "in person", status: "guest", since: "2026-11-15", email: "malik.j@example.com",  contact: "Email" },
    { id: "p-grace",   name: "Grace C.",   initials: "GC", tone: 3, attends: "in person", status: "guest", since: "2026-11-08", email: "grace.c@example.com",  contact: "Phone call", household: "Recently widowed, new to the city" },
    { id: "p-evan",    name: "Evan P.",    initials: "EP", tone: 4, attends: "online",    status: "guest", since: "2026-11-01", email: "evan.p@example.com",   contact: "Email" },
    { id: "p-leilani", name: "Leilani K.", initials: "LK", tone: 5, attends: "in person", status: "regular", since: "2026-10-18", email: "leilani.k@example.com", contact: "Email" },
    { id: "p-omar",    name: "Omar H.",    initials: "OH", tone: 6, attends: "in person", status: "regular", since: "2026-10-25", email: "omar.h@example.com",   contact: "Email" },
    { id: "p-bethany", name: "Bethany S.", initials: "BS", tone: 1, attends: "in person", status: "regular", since: "2026-09-27", email: "bethany.s@example.com", contact: "Email", groups: ["Tuesday Night Group"] },
    { id: "p-luis",    name: "Luis G.",    initials: "LG", tone: 2, attends: "in person", status: "regular", since: "2026-09-20", email: "luis.g@example.com",   contact: "Email", groups: ["Young Adults"] },
    { id: "p-mei",     name: "Mei C.",     initials: "MC", tone: 3, attends: "in person", status: "regular", since: "2026-09-06", email: "mei.c@example.com",    contact: "Email", serving: ["Welcome Team"], gifts: "g-mei", giftsShared: true },
    { id: "p-jamal",   name: "Jamal D.",   initials: "JD", tone: 4, attends: "in person", status: "member",  since: "2026-08-23", email: "jamal.d@example.com",  contact: "Email", serving: ["Production"] },
    { id: "p-yusuf",   name: "Yusuf E.",   initials: "YE", tone: 5, attends: "exploring", status: "guest", since: "2026-10-28", email: "yusuf.e@example.com",  contact: "Email" },
    { id: "p-ingrid",  name: "Ingrid S.",  initials: "IS", tone: 6, attends: "exploring", status: "guest", since: "2026-10-30", email: "ingrid.s@example.com", contact: "Email", household: "Coming with a friend" }
  ];
  /* The whole church, for scale. The people above are the sample records shown in this preview. */
  D.peopleTotals = { records: 412, members: 214, regulars: 168, guests: 18, note: "About 340 to 520 on a Sunday, depending on the church" };
  /* The member the member app is signed in as. */
  D.memberId = "p-sarah";

  /* ------------------------------------------------------------------ front office: guests */
  D.guestStages = [
    { key: "new",        label: "New",        hint: "Arrived, not welcomed yet" },
    { key: "welcomed",   label: "Welcomed",   hint: "A person has said hello" },
    { key: "visited",    label: "Visited",    hint: "Came on a Sunday" },
    { key: "start-here", label: "Start Here", hint: "Signed up or attended" },
    { key: "group",      label: "In a Group", hint: "Found a group" },
    { key: "serving",    label: "Serving",    hint: "On a team" }
  ];
  D.guestSources = ["Plan a Visit form", "Hope conversation", "Connect card", "Event sign-up", "Newsletter"];
  D.guestSettings = { followUpChannel: "Email", textingEnabled: false, textingNote: "Texting is off. Guest follow-up goes by email unless the church turns texting on." };

  D.guests = [
    { id: "g-01", personId: "p-maya",    stage: "new",        source: "Plan a Visit form", arrived: "2026-11-18T19:42", owner: "s-nadia", next: "Send a welcome note", due: "2026-11-19", draft: "d-01", visitDate: "2026-11-22", note: "Coming Sunday at the second gathering with her husband and two kids, ages 4 and 7. Asked where to check in the kids." },
    { id: "g-02", personId: "p-daniel",  stage: "new",        source: "Hope conversation", arrived: "2026-11-18T22:15", owner: "s-nadia", next: "Send a welcome note", due: "2026-11-19", draft: "d-02", note: "Asked Hope about parking and what people wear. Left an email for a welcome note." },
    { id: "g-03", personId: "p-aisha",   stage: "new",        source: "Newsletter", arrived: "2026-11-17T08:05", owner: "s-nadia", next: "Invite to a Sunday", due: "2026-11-20", draft: "d-03", note: "Signed up for the newsletter after watching online for a month." },
    { id: "g-04", personId: "p-kenji",   stage: "new",        source: "Event sign-up", arrived: "2026-11-16T13:30", owner: "s-jun", next: "Welcome and confirm Serve Day details", due: "2026-11-18", note: "Signed up with his wife for the Thanksgiving Serve Day. First time with us." },
    { id: "g-05", personId: "p-rosa",    stage: "welcomed",   source: "Plan a Visit form", arrived: "2026-11-12T10:10", owner: "s-nadia", next: "Meet at the welcome table Sunday", due: "2026-11-22", visitDate: "2026-11-22", note: "Welcome note sent Nov 13. Her son is 15 and curious about students." },
    { id: "g-06", personId: "p-tomas",   stage: "welcomed",   source: "Connect card", arrived: "2026-11-15T11:20", owner: "s-nadia", coverFor: "s-hector", next: "Follow up after first visit", due: "2026-11-19", note: "Filled a connect card at the first gathering. Family of five, new to the area." },
    { id: "g-07", personId: "p-hannah",  stage: "welcomed",   source: "Hope conversation", arrived: "2026-11-14T21:02", owner: "s-nadia", next: "Answer the kids check-in question", due: "2026-11-21", note: "Asked about the nursery for her toddler. Waiting on her reply." },
    { id: "g-08", personId: "p-malik",   stage: "visited",    source: "Connect card", arrived: "2026-11-15T11:05", owner: "s-nadia", next: "Invite to Start Here on Dec 6", due: "2026-11-19", visitDate: "2026-11-15", note: "Second Sunday. Said he wants to know what the church believes." },
    { id: "g-09", personId: "p-grace",   stage: "visited",    source: "Plan a Visit form", arrived: "2026-11-03T16:40", owner: "s-care", next: "Personal call from a pastor", due: "2026-11-17", visitDate: "2026-11-08", note: "New to the city after losing her husband this year. Prefers a phone call." },
    { id: "g-10", personId: "p-evan",    stage: "visited",    source: "Hope conversation", arrived: "2026-11-01T09:30", owner: "s-nadia", next: "Send Start Here invite", due: "2026-11-20", visitDate: "2026-11-15", note: "Watched online for a few weeks, then came in person." },
    { id: "g-11", personId: "p-leilani", stage: "start-here", source: "Plan a Visit form", arrived: "2026-10-18T12:00", owner: "s-nadia", coverFor: "s-hector", next: "Help choose a group", due: "2026-11-24", note: "Came to Start Here on Nov 8. Interested in a weeknight group." },
    { id: "g-12", personId: "p-omar",    stage: "start-here", source: "Connect card", arrived: "2026-10-25T11:15", owner: "s-nadia", next: "Send Start Here reminder", due: "2026-12-03", note: "Signed up for Start Here on Dec 6." },
    { id: "g-13", personId: "p-bethany", stage: "group",      source: "Event sign-up", arrived: "2026-09-27T10:00", owner: "s-nadia", coverFor: "s-hector", next: "Ask about serving", due: "2026-11-26", note: "Joined the Tuesday Night Group on Oct 27." },
    { id: "g-14", personId: "p-luis",    stage: "group",      source: "Hope conversation", arrived: "2026-09-20T20:45", owner: "s-nadia", coverFor: "s-hector", next: "Invite to the gifts conversation", due: "2026-12-01", note: "Joined Young Adults. Asked how to find a place to serve." },
    { id: "g-15", personId: "p-mei",     stage: "serving",    source: "Plan a Visit form", arrived: "2026-09-06T09:00", owner: "s-jun", next: "Thirty day check-in", due: "2026-12-01", note: "On the Welcome Team since Nov 1." },
    { id: "g-16", personId: "p-jamal",   stage: "serving",    source: "Newsletter", arrived: "2026-08-23T08:30", owner: "s-jun", next: "Thank-you note from a pastor", due: "2026-11-30", note: "On the Production team since Oct 18." },
    /* Gone quiet: no reply after two emails, or a planned visit missed. Each gets one gentle last note, then a choice to close. */
    { id: "g-17", personId: "p-yusuf",   stage: "welcomed",   source: "Hope conversation", arrived: "2026-10-28T21:10", owner: "s-nadia", next: "Send a gentle last note", due: "2026-11-21", note: "Asked Hope about Sunday times and left his email. Two welcome emails, Nov 4 and Nov 12, with no reply yet.",
      quiet: { reason: "No reply after two emails", detail: "Emails on Nov 4 and Nov 12. No reply yet.", since: "2026-11-12" } },
    { id: "g-18", personId: "p-ingrid",  stage: "welcomed",   source: "Plan a Visit form", arrived: "2026-10-30T18:25", owner: "s-nadia", next: "Send a gentle last note", due: "2026-11-21", visitDate: "2026-11-15", note: "Planned to visit Sunday, Nov 15, with a friend, and did not come. Welcome note sent Nov 2.",
      quiet: { reason: "Planned visit missed", detail: "Planned to visit Sunday, Nov 15, and did not come.", since: "2026-11-15" } }
  ];
  /* The gentle last note for a guest who has gone quiet. The church writes this wording once; a person sends it. */
  D.lastNote = { subject: "We would love to see you, whenever you are ready", body: "Hi {first},\n\nJust a short note to say you are welcome at {church.short} any Sunday, whenever the time is right. We will not keep emailing, but if you ever have a question, reply here and a real person will answer.\n\nWith care,\n{owner}, {church.short}" };
  /* Closing a guest: a reason, then archived (never deleted) and counted in the Guest Report. */
  D.closeReasons = ["Moved", "Found Another Church", "Asked Us to Stop"];
  D.closedGuests = [
    { id: "gc-01", name: "Marco V.", initials: "MV", closed: "2026-11-10", reason: "Moved", note: "Moved to Denver for work. Sent a warm goodbye." },
    { id: "gc-02", name: "Ayana T.", initials: "AT", closed: "2026-11-06", reason: "Found Another Church", note: "Found a church closer to home. Wished her well." },
    { id: "gc-03", name: "Bo L.",    initials: "BL", closed: "2026-10-29", reason: "Asked Us to Stop", note: "Asked us to stop emailing. Guest emails ended that day." }
  ];
  /* Closed in the last twelve months, by reason (Guest Report). */
  D.closedByReason12 = [{ label: "Moved", value: 7 }, { label: "Found another church", value: 9 }, { label: "Asked us to stop", value: 3 }];

  /* ------------------------------------------------------------------ care: prayer */
  /* visibility: "prayer" = pastors and the prayer team. "pastors" = pastors only (the sender chose it).
     Prayer requests never go to the AI. Genesis never drafts a reply to prayer. */
  D.prayer = [
    { id: "pr-01", personId: "p-sarah",   received: "2026-11-18T07:55", topic: "Health", visibility: "prayer", status: "new", owner: "s-owen", waitingOnUs: true,
      text: "My mom starts treatment next week in Durham. Please pray for her strength and for our family as we take turns driving her." },
    { id: "pr-02", personId: "p-wyatt",   received: "2026-11-17T12:20", topic: "Job search", visibility: "prayer", status: "praying", owner: "s-sofia",
      text: "I have a second interview on Monday after eight months of looking. Please pray for peace and clear thinking.",
      replies: [{ from: "s-sofia", at: "2026-11-17T16:05", text: "Wyatt, the prayer team is praying for Monday. We are cheering you on." }] },
    { id: "pr-03", personId: "p-fatima",  received: "2026-11-16T09:40", topic: "New baby", visibility: "prayer", status: "replied", owner: "s-owen",
      text: "Our daughter Amira arrived on Saturday. We are tired and thankful. Please pray for good sleep and for my recovery.",
      replies: [{ from: "s-care", at: "2026-11-16T14:12", text: "Congratulations, Fatima. A meal team will drop dinner on Thursday. We are so happy for you." }] },
    { id: "pr-04", personId: "p-caleb",   received: "2026-11-18T18:30", topic: "Grief", visibility: "pastors", status: "new", owner: "s-care", waitingOnUs: true,
      text: "My grandfather passed away last week. Please pray for my grandmother, who is now on her own." },
    { id: "pr-05", personId: "p-naomi",   received: "2026-11-15T20:10", topic: "A move", visibility: "prayer", status: "replied", owner: "s-sofia",
      text: "We are moving to Columbus in January for my husband's job. Please pray for the move and for a new church home.",
      replies: [{ from: "s-sofia", at: "2026-11-16T10:00", text: "We will miss you, Naomi. We are praying for every box and every goodbye." }] },
    { id: "pr-06", personId: "p-diego",   received: "2026-11-12T08:15", topic: "Health", visibility: "prayer", status: "replied", owner: "s-owen",
      text: "Knee surgery on Thursday. Thankful for a good doctor. Please pray for a smooth recovery.",
      replies: [{ from: "s-owen", at: "2026-11-12T12:30", text: "Praying for Thursday, Diego. Let us know if you need rides." }] },
    { id: "pr-07", personId: "p-peter",   received: "2026-11-17T21:12", topic: "Urgent care", visibility: "pastors", status: "following-up", owner: "s-care", crisis: true,
      text: "Things feel very heavy tonight and I do not know who to talk to.",
      crisisLog: [
        { at: "2026-11-17T21:12", text: "The crisis check ran on the prayer form. Peter was shown 988 and 911 right away, with the church phone." },
        { at: "2026-11-17T21:12", text: "The pastor on call was alerted by email and a phone notification: \"Urgent request. Sign in to read.\" No private words were sent." },
        { at: "2026-11-17T21:31", text: "The pastor on call read the request and called Peter." },
        { at: "2026-11-18T09:00", text: "Follow-up call. Peter is connected with a counselor and has a plan for this week." }
      ] },
    { id: "pr-08", personId: "p-jasmine", received: "2026-11-18T23:05", topic: "Family", visibility: "prayer", status: "new", owner: "s-owen", waitingOnUs: true,
      text: "Please pray for my sister and me as we try to talk again after a long time apart." },
    { id: "pr-09", personId: "p-sarah",   received: "2026-08-04T19:20", topic: "Job search", visibility: "prayer", status: "replied", owner: "s-sofia",
      text: "Interview for a teaching job this Thursday. Please pray I can rest the night before.",
      replies: [{ from: "s-sofia", at: "2026-08-05T08:30", text: "Praying for Thursday, Sarah. You are ready." }, { from: "member", at: "2026-08-12T17:45", text: "I got the job! Thank you for praying." }] }
  ];
  D.crisisLine = "If you or someone else is in danger, call 911. To talk with someone now, call or text 988.";

  /* ------------------------------------------------------------------ care: message threads */
  /* kind: "everyday" = staff can see it, Genesis may draft a reply.
     kind: "private" = pastors only, no AI draft ever. */
  D.threads = [
    { id: "t-01", personId: "p-abigail", subject: "Is there a nursing room?", kind: "everyday", owner: "s-imani", status: "waiting-on-us", started: "2026-11-19T07:20", draft: "d-04",
      messages: [{ from: "member", at: "2026-11-19T07:20", text: "Hi! We are bringing our newborn on Sunday for the first time. Is there a quiet place to nurse during the service?" }] },
    { id: "t-02", personId: "p-kwame", subject: "Joining the setup team", kind: "everyday", owner: "s-jun", status: "waiting-on-us", started: "2026-11-17T09:10",
      messages: [{ from: "member", at: "2026-11-17T09:10", text: "My gifts result said Service and I would like to help with setup. Who do I talk to?" }] },
    { id: "t-03", personId: "p-lucia", subject: "Time with a pastor", kind: "private", owner: "s-lead", status: "waiting-on-us", started: "2026-11-18T08:45",
      messages: [{ from: "member", at: "2026-11-18T08:45", text: "Could I meet with a pastor sometime next week? There is something going on at home I would like to talk through." }] },
    { id: "t-04", personId: "p-noah", subject: "Lost water bottle", kind: "everyday", owner: "s-imani", status: "archived", started: "2026-11-16T13:00",
      messages: [{ from: "member", at: "2026-11-16T13:00", text: "I left a green water bottle in the back row on Sunday." }, { from: "s-imani", at: "2026-11-16T15:20", text: "Found it. It is at the welcome desk for you." }, { from: "member", at: "2026-11-16T15:31", text: "Thank you!" }] },
    { id: "t-05", personId: "p-maya", subject: "Arriving with kids", kind: "everyday", owner: "s-nadia", status: "waiting-on-them", started: "2026-11-18T19:50",
      messages: [{ from: "member", at: "2026-11-18T19:50", text: "What time should we arrive on Sunday so the kids can check in?" }, { from: "s-nadia", at: "2026-11-19T08:10", text: "Hi Maya! Kids check-in opens 20 minutes before each gathering. I will meet you at the welcome table." }] },
    { id: "t-06", personId: "p-sarah", subject: "Thank you for praying", kind: "private", owner: "s-care", status: "waiting-on-them", started: "2026-11-18T08:30",
      messages: [{ from: "s-care", at: "2026-11-18T08:30", text: "Sarah, I saw your request about your mom. Would it help if I called this week, or would a meal be better?" }, { from: "member", at: "2026-11-18T12:05", text: "A call would mean a lot. Thursday evening works best." }, { from: "s-care", at: "2026-11-18T12:40", text: "Thursday at 7 it is. I will call you then." }] },
    { id: "t-07", personId: "p-hannah", subject: "Nursery question", kind: "everyday", owner: "s-nadia", status: "waiting-on-them", started: "2026-11-15T09:00",
      messages: [{ from: "member", at: "2026-11-15T09:00", text: "Do you have a nursery for an 18 month old?" }, { from: "s-nadia", at: "2026-11-15T11:30", text: "We do! It is staffed by two checked volunteers every Sunday. Would you like a tour before the service?" }] },
    { id: "t-08", personId: "p-sarah", subject: "Groups for new parents", kind: "everyday", owner: "s-hector", status: "closed", started: "2026-10-02T20:15",
      messages: [{ from: "member", at: "2026-10-02T20:15", text: "Is there a group for parents of little kids?" }, { from: "s-hector", at: "2026-10-03T09:05", text: "Yes, the New Parents Group meets Tuesdays at 6:30 with childcare. I will save you a seat." }] }
  ];

  /* ------------------------------------------------------------------ access record */
  /* Append only. No private words. The lead pastor can read it; nobody can edit it. */
  D.access = [
    { at: "2026-11-19T09:41", who: "s-lead",  action: "Opened", what: "Prayer request from Sarah N.", where: "Care inbox" },
    { at: "2026-11-19T09:15", who: "s-owen",  action: "Opened", what: "Prayer request from Jasmine Y.", where: "Care inbox" },
    { at: "2026-11-19T08:10", who: "s-nadia", action: "Replied", what: "Thread with Maya T.", where: "Care inbox" },
    { at: "2026-11-18T14:02", who: "s-nadia", action: "Opened", what: "Person page for Maya T.", where: "People" },
    { at: "2026-11-18T09:00", who: "s-care",  action: "Added a note", what: "Urgent request from Peter K.", where: "Care inbox" },
    { at: "2026-11-17T21:31", who: "s-care",  action: "Opened", what: "Urgent request from Peter K.", where: "Care inbox" },
    { at: "2026-11-17T21:12", who: "system",  action: "Alerted", what: "Pastor on call, by email and phone notification, with no private words", where: "Crisis check" },
    { at: "2026-11-17T11:00", who: "s-lead",  action: "Changed a role", what: "Sofia R. added to the prayer team. Emailed to the lead pastor.", where: "Team roles" },
    { at: "2026-11-16T15:40", who: "s-imani", action: "Archived", what: "Thread with Noah B. (archived, not deleted)", where: "Care inbox" },
    { at: "2026-11-15T10:20", who: "s-jun",   action: "Viewed names", what: "Gifts finder: Hospitality, 6 people who said yes", where: "Gifts" },
    { at: "2026-11-14T16:05", who: "s-imani", action: "Blocked", what: "Opened an old forwarded link to a prayer request. Staff cannot open prayer, so nothing was shown.", where: "Care inbox", blocked: true },
    { at: "2026-11-13T13:30", who: "s-lead",  action: "Exported", what: "A copy of Diego S.'s record, at his request", where: "People" },
    { at: "2026-11-12T08:40", who: "s-owen",  action: "Opened", what: "Prayer request from Diego S.", where: "Care inbox" }
  ];

  /* ------------------------------------------------------------------ gifts */
  /* The church decides the list and signs off every statement. Scoring is plain
     arithmetic. The AI never sets a score. The chart stays hidden under 25 finishers.
     Counts of 1 to 4 always show as "fewer than 5". */
  D.gifts = {
    threshold: 25,
    invited: 142, started: 81, finished: 64, finishedInPerson: 45, finishedOnline: 19, sharedNames: 38, wantsToTalk: 17,
    answerScale: ["Not me", "Rarely me", "Sometimes me", "Often me", "That is me"],
    list: [
      { key: "hospitality",    name: "Hospitality",    def: "Making people feel at home, especially people who are new.", ref: "Romans 12:13", teams: ["Welcome Team", "Coffee and Hospitality"], inPerson: 20, online: 7 },
      { key: "encouragement",  name: "Encouragement",  def: "Lifting people up with words that help them keep going.", ref: "1 Thessalonians 5:11", teams: ["Care Meals", "Groups Hosts"], inPerson: 16, online: 7 },
      { key: "service",        name: "Service",        def: "Seeing what needs doing and doing it gladly.", ref: "1 Peter 4:10", teams: ["Setup and Parking", "Production"], inPerson: 16, online: 6 },
      { key: "mercy",          name: "Mercy",          def: "Moving toward people who are hurting.", ref: "Luke 10:33-34", teams: ["Care Meals", "Prayer Team"], inPerson: 13, online: 6 },
      { key: "teaching",       name: "Teaching",       def: "Helping people understand and live what the Bible says.", ref: "Romans 12:7", teams: ["Kids", "Students", "Groups Hosts"], inPerson: 10, online: 4 },
      { key: "intercession",   name: "Intercession",   def: "Praying faithfully for others.", ref: "Colossians 4:12", teams: ["Prayer Team"], inPerson: 9, online: 6 },
      { key: "administration", name: "Administration", def: "Bringing order so that good work can happen.", ref: "1 Corinthians 12:28", teams: ["Office Helpers", "Setup and Parking"], inPerson: 9, online: 3 },
      { key: "faith",          name: "Faith",          def: "Trusting God for what others cannot yet see.", ref: "Hebrews 11:1", teams: ["Prayer Team"], inPerson: 8, online: 3 },
      { key: "leadership",     name: "Leadership",     def: "Helping a group move toward a shared goal.", ref: "Romans 12:8", teams: ["Groups Hosts", "Students"], inPerson: 7, online: 2 },
      { key: "wisdom",         name: "Wisdom",         def: "Seeing what is good and true and helping others see it.", ref: "James 3:17", teams: ["Groups Hosts"], inPerson: 7, online: 4 },
      { key: "giving",         name: "Giving",         def: "Sharing generously and cheerfully.", ref: "2 Corinthians 9:7", teams: ["Care Meals"], inPerson: 7, online: 3 },
      { key: "shepherding",    name: "Shepherding",    def: "Caring for a small group of people over time.", ref: "1 Peter 5:2", teams: ["Groups Hosts", "Students"], inPerson: 5, online: 2 },
      { key: "evangelism",     name: "Evangelism",     def: "Sharing the good news in ways people can hear.", ref: "Acts 8:35", teams: ["Welcome Team"], inPerson: 4, online: 3 },
      { key: "craftsmanship",  name: "Craftsmanship",  def: "Making and fixing things with skill.", ref: "Exodus 31:3-5", teams: ["Setup and Parking", "Production"], inPerson: 4, online: 1 }
    ],
    talkWithPastor: ["Tongues", "Healing", "Prophecy", "Miracles"],
    /* Sample statements for the member conversation (Genesis writes fresh ones for each church to approve). */
    statements: [
      { gift: "hospitality",   text: "When someone new walks in, I notice them before they notice me." },
      { gift: "encouragement", text: "People tell me they leave a conversation with me feeling lighter." },
      { gift: "service",       text: "I would rather stack chairs than give a speech." },
      { gift: "mercy",         text: "I find myself drawn to people who are going through a hard season." },
      { gift: "teaching",      text: "I enjoy explaining a Bible passage so it makes sense to someone." },
      { gift: "intercession",  text: "I keep a list of people I pray for, and I come back to it often." },
      { gift: "administration",text: "I like turning a messy plan into clear steps." },
      { gift: "leadership",    text: "When a group stalls, people look to me to help it move." }
    ],
    /* Results that people chose to share by name. Used by the pastor's finder. */
    results: [
      { id: "g-sarah",  personId: "p-sarah",  top: ["hospitality", "encouragement", "mercy"], shared: true, wantsToTalk: true,  servingNow: true,  finished: "2026-11-02" },
      { id: "g-fatima", personId: "p-fatima", top: ["teaching", "mercy", "service"], shared: true, wantsToTalk: false, servingNow: true,  finished: "2026-10-26" },
      { id: "g-diego",  personId: "p-diego",  top: ["craftsmanship", "service", "faith"], shared: true, wantsToTalk: false, servingNow: true,  finished: "2026-10-19" },
      { id: "g-kwame",  personId: "p-kwame",  top: ["service", "hospitality", "administration"], shared: true, wantsToTalk: true,  servingNow: false, finished: "2026-11-15" },
      { id: "g-ivy",    personId: "p-ivy",    top: ["hospitality", "evangelism", "encouragement"], shared: true, wantsToTalk: false, servingNow: true,  finished: "2026-10-12" },
      { id: "g-samir",  personId: "p-samir",  top: ["intercession", "wisdom", "mercy"], shared: true, wantsToTalk: true,  servingNow: false, finished: "2026-11-09" },
      { id: "g-ruby",   personId: "p-ruby",   top: ["intercession", "faith", "shepherding"], shared: true, wantsToTalk: false, servingNow: true,  finished: "2026-10-05" },
      { id: "g-andres", personId: "p-andres", top: ["hospitality", "leadership", "service"], shared: true, wantsToTalk: true,  servingNow: false, finished: "2026-11-16" },
      { id: "g-mei",    personId: "p-mei",    top: ["hospitality", "encouragement", "administration"], shared: true, wantsToTalk: false, servingNow: true,  finished: "2026-11-01" }
    ],
    /* The signed-in member's own result (member-gifts-result). */
    memberResult: { personId: "p-sarah", finished: "2026-11-02", top: [
      { gift: "hospitality", score: 23, of: 25 }, { gift: "encouragement", score: 21, of: 25 }, { gift: "mercy", score: 21, of: 25 }, { gift: "service", score: 18, of: 25 }, { gift: "teaching", score: 14, of: 25 }
    ], tieNote: "Encouragement and Mercy tied. Both are shown.", shared: true, wantsToTalk: true }
  };

  /* ------------------------------------------------------------------ teams */
  D.teams = [
    { key: "welcome",     name: "Welcome Team",          lead: "s-nadia",  size: 14, gifts: ["hospitality", "evangelism", "encouragement"] },
    { key: "coffee",      name: "Coffee and Hospitality",lead: "s-imani",  size: 9,  gifts: ["hospitality", "service"] },
    { key: "kids",        name: "Kids",                  lead: "s-hector", size: 22, gifts: ["teaching", "shepherding", "service"], note: "Every kids volunteer is background checked." },
    { key: "students",    name: "Students",              lead: "s-hector", size: 8,  gifts: ["teaching", "leadership", "shepherding"] },
    { key: "worship",     name: "Worship",               lead: "s-lead",   size: 12, gifts: ["encouragement"] },
    { key: "production",  name: "Production",            lead: "s-jun",    size: 7,  gifts: ["craftsmanship", "service"] },
    { key: "prayer",      name: "Prayer Team",           lead: "s-owen",   size: 6,  gifts: ["intercession", "faith", "mercy"] },
    { key: "care-meals",  name: "Care Meals",            lead: "s-care",   size: 11, gifts: ["mercy", "giving", "service"] },
    { key: "groups",      name: "Groups Hosts",          lead: "s-hector", size: 16, gifts: ["shepherding", "hospitality", "teaching"] },
    { key: "setup",       name: "Setup and Parking",     lead: "s-jun",    size: 10, gifts: ["service", "craftsmanship", "administration"] }
  ];

  /* ------------------------------------------------------------------ metrics */
  /* Sample numbers for a church of about 300 to 600 people. Nov 2026 is partial (through Nov 19). */
  D.metrics = {
    months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    monthsLong: ["December 2025", "January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026", "July 2026", "August 2026", "September 2026", "October 2026", "November 2026"],
    currentMonthIndex: 11, currentMonthPartial: true,
    newGuests:     [11, 16, 13, 14, 18, 12, 10, 9, 21, 17, 15, 10],
    firstVisits:   [7, 10, 9, 9, 12, 8, 6, 6, 14, 12, 10, 6],
    startHere:     [3, 4, 4, 3, 5, 4, 2, 2, 6, 5, 4, 3],
    groupJoins:    [2, 3, 3, 3, 4, 3, 2, 1, 5, 4, 4, 2],
    prayerRequests:[22, 26, 24, 21, 25, 19, 18, 20, 27, 24, 23, 15],
    messages:      [31, 35, 30, 28, 33, 26, 24, 27, 38, 34, 32, 21],
    memberAccounts:[0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 168, 241],
    weeks: ["Aug 30", "Sep 6", "Sep 13", "Sep 20", "Sep 27", "Oct 4", "Oct 11", "Oct 18", "Oct 25", "Nov 1", "Nov 8", "Nov 15"],
    medianReplyHours: [14, 11, 9, 12, 8, 7, 10, 6, 7, 5, 6, 5],
    threadsPerWeek:   [9, 11, 10, 8, 12, 9, 10, 11, 8, 12, 10, 9],
    replyGoalHours: 24,
    waitingBuckets: [{ label: "Under 1 day", value: 3 }, { label: "1 to 2 days", value: 2 }, { label: "3 to 7 days", value: 1 }, { label: "Over a week", value: 0 }],
    guestSources90: [{ label: "Plan a Visit form", value: 19 }, { label: "Hope conversation", value: 13 }, { label: "Connect card", value: 11 }, { label: "Event sign-up", value: 6 }, { label: "Newsletter", value: 4 }],
    guestPathFall: [{ label: "New", value: 53 }, { label: "Welcomed", value: 49 }, { label: "Visited", value: 32 }, { label: "Start Here", value: 15 }, { label: "In a Group", value: 10 }, { label: "Serving", value: 6 }],
    welcomedWithin48h: 92,
    adultsInMemberApp: 241
  };

  /* ------------------------------------------------------------------ Genesis drafts (church side) */
  /* Every draft is labelled and waits for a person. Genesis never drafts prayer or personal replies. */
  D.drafts = [
    { id: "d-01", side: "church", kind: "Welcome note", to: "p-maya", guest: "g-01", channel: "Email", owner: "s-nadia",
      why: "Planned a visit for Sunday with two kids, ages 4 and 7.",
      subject: "See you Sunday, Maya",
      body: "Hi Maya,\n\nThank you for letting us know you are coming on Sunday. We are glad you are bringing the kids.\n\nKids check-in opens 20 minutes before each gathering. Look for the welcome table just inside the main doors and ask for Nadia. I will walk you over and make sure everyone feels at home.\n\nSee you soon,\nNadia K., {church.short}" },
    { id: "d-02", side: "church", kind: "Welcome note", to: "p-daniel", guest: "g-02", channel: "Email", owner: "s-nadia",
      why: "Asked Hope about parking and what to wear.",
      subject: "A little help for your first Sunday",
      body: "Hi Daniel,\n\nHope mentioned you had a couple of questions. There is free parking in the lot beside the building, with spots saved for first-time guests near the doors.\n\nAs for what to wear, come as you are. You will see jeans and you will see a few jackets.\n\nIf you want, reply and I will save you a seat.\n\nNadia K., {church.short}" },
    { id: "d-03", side: "church", kind: "Welcome note", to: "p-aisha", guest: "g-03", channel: "Email", owner: "s-nadia",
      why: "Joined the newsletter after a month of watching online.",
      subject: "Glad you are here, Aisha",
      body: "Hi Aisha,\n\nThanks for signing up for our newsletter. It is good to have you with us online.\n\nWhenever you are ready to visit in person, we gather {church.times}. You are welcome any week, and there is always a seat saved.\n\nNadia K., {church.short}" },
    { id: "d-04", side: "church", kind: "Everyday reply", to: "p-abigail", thread: "t-01", channel: "Email notice", owner: "s-imani",
      why: "An everyday question about the building.",
      subject: "Re: Is there a nursing room?",
      body: "Congratulations on your little one, Abigail! Yes. There is a quiet nursing room with a rocking chair and a speaker for the service, just past the kids check-in desk. Any of our welcome team can show you the way." }
  ];
  D.summaries = [
    { id: "sum-week", side: "church", title: "This week, in counts only",
      body: "Ten new guests this month so far, four of them since Sunday. Six follow-ups are due today and two are overdue. Care has six items waiting on us; the oldest is two days. The urgent request from Tuesday night was handled: the person was given 988 and 911 right away and the pastor on call followed up." }
  ];

  /* ================================================================== GENESIS SIDE */

  D.genesisTeam = [
    { id: "g-victor", name: "Victor N.", initials: "VN", role: "Sales Lead", tone: 1 },
    { id: "g-renee",  name: "Renee S.",  initials: "RS", role: "Acquisition Seat", tone: 2 },
    { id: "g-amara",  name: "Amara O.",  initials: "AO", role: "Onboarding Lead", tone: 3 },
    { id: "g-jordan", name: "Jordan A.", initials: "JA", role: "Site Designer", tone: 5 }
  ];

  /* "How it runs", mirrored from geai.us. */
  D.howItRuns = [
    { n: "01", name: "Consultation", line: "Free fit conversation", church: "A short call with the pastor or executive pastor about guests, care and the website today." },
    { n: "02", name: "Scoping", line: "Recommendation and next step", church: "A guided demo, then a proposal with a chosen look and plan level." },
    { n: "03", name: "Implementation", line: "The system build", church: "Content and photos, brand board, social plan, site build, Hope facts and platform set up." },
    { n: "04", name: "Launch", line: "Live in the church", church: "The site goes live, staff sign in, and the first guests flow through." },
    { n: "05", name: "Managed Platform", line: "Support and improve", church: "Genesis keeps the site, Hope and the platform running and improving." }
  ];

  /* ------------------------------------------------------------------ acquisition */
  D.acquisition = {
    rules: [
      "Public information only: the church's own website, its public Google listing, public directories and public staff contact pages.",
      "No personal data beyond public church contact details.",
      "Outreach is email only. No texting of cold prospects.",
      "Every message is a Genesis draft that waits for a person's approval.",
      "Every email has an unsubscribe line and honors the suppression list.",
      "A prospect clears only when it is properly worked. Then a new one is delivered."
    ],
    seat: { id: "g-renee", weeklyDelivery: 50, weekOf: "2026-11-16", delivered: 50, worked: 34, cleared: 31, replaced: 31, waiting: 16, checksSent: 12, replies: 2, callsBooked: 1 },
    /* Plain arithmetic: each signal adds its points; size in range is required. */
    signals: [
      { key: "no-mobile",    label: "Site not built for phones",  points: 20 },
      { key: "no-giving",    label: "No online giving",           points: 15 },
      { key: "no-visit",     label: "No Plan a Visit form",       points: 15 },
      { key: "times-hidden", label: "Service times hard to find", points: 10 },
      { key: "stale",        label: "Site not updated in a year", points: 10 },
      { key: "new-pastor",   label: "New lead pastor",            points: 15 },
      { key: "building",     label: "Building campaign",          points: 10 },
      { key: "new-campus",   label: "New campus",                 points: 10 },
      { key: "size",         label: "Size of roughly 100 to 1,000", points: 5, required: true }
    ],
    workedStates: ["Email approved and sent, with an outcome logged", "Not a fit, with a reason", "Next step with an owner and a date", "Suppressed at the church's request"],
    prospects: [
      { id: "cp-01", name: "Harrow Creek Church", city: "Knoxville", state: "TN", size: 310, sizeSource: "About page says about 300 on Sundays", site: "harrowcreek.example", fit: 85, status: "drafted", delivered: "2026-11-16", owner: "g-renee",
        signals: ["no-mobile", "no-visit", "times-hidden", "stale", "new-pastor", "size"],
        whyNow: "A new lead pastor started in September and the website still welcomes visitors with the previous pastor's letter.",
        evidence: [
          { signal: "new-pastor", detail: "Staff page lists Pastor Nathan as lead pastor since September 2026.", source: "Church website, staff page", seen: "2026-11-16" },
          { signal: "no-mobile", detail: "Home page text runs off a phone screen and the menu needs pinch zoom.", source: "Church website, home page on a phone", seen: "2026-11-16" },
          { signal: "times-hidden", detail: "Service times sit three clicks deep, under About, then Visit, then FAQ.", source: "Church website", seen: "2026-11-16" },
          { signal: "no-visit", detail: "No form to plan a visit. Only a general contact form.", source: "Church website, contact page", seen: "2026-11-16" },
          { signal: "stale", detail: "Latest news post is from August 2025.", source: "Church website, news page", seen: "2026-11-16" }
        ],
        contact: { label: "Church office", email: "office@harrowcreek.example", phone: "(865) 555-0131", source: "Public contact page" },
        listedPastor: "Pastor Nathan (listed on the staff page)",
        nextStep: "Approve the first email with the Website Check offer", due: "2026-11-19" },
      { id: "cp-02", name: "Saltbox Hill Church", city: "Lancaster", state: "PA", size: 540, sizeSource: "Public directory listing", site: "saltboxhill.example", fit: 75, status: "new", delivered: "2026-11-16", owner: "g-renee",
        signals: ["no-giving", "building", "times-hidden", "no-visit", "size"],
        whyNow: "A building campaign launched in October, and giving is still paper envelopes and checks.",
        evidence: [
          { signal: "building", detail: "Home page banner announces the Room to Grow campaign, launched October 2026.", source: "Church website, home page", seen: "2026-11-17" },
          { signal: "no-giving", detail: "Give page lists a mailing address only.", source: "Church website, give page", seen: "2026-11-17" },
          { signal: "times-hidden", detail: "Times are only in a PDF bulletin.", source: "Church website", seen: "2026-11-17" },
          { signal: "no-visit", detail: "No visit form found.", source: "Church website", seen: "2026-11-17" }
        ],
        contact: { label: "Church office", email: "hello@saltboxhill.example", phone: "(717) 555-0188", source: "Public Google listing" },
        nextStep: "Run the Website Check", due: "2026-11-20" },
      { id: "cp-03", name: "Kestrel Park Church", city: "Boise", state: "ID", size: 220, sizeSource: "About page", site: "kestrelpark.example", fit: 70, status: "contacted", delivered: "2026-11-09", owner: "g-renee",
        signals: ["no-mobile", "no-visit", "new-campus", "times-hidden", "size"],
        whyNow: "Opening a second campus in Meridian in February, with one website for both.",
        evidence: [
          { signal: "new-campus", detail: "News post: Meridian campus opens February 2027.", source: "Church website, news page", seen: "2026-11-10" },
          { signal: "no-mobile", detail: "Fixed-width layout from an older theme.", source: "Church website on a phone", seen: "2026-11-10" }
        ],
        contact: { label: "Church office", email: "office@kestrelpark.example", phone: "(208) 555-0119", source: "Public contact page" },
        outcome: "First email approved and sent Nov 11. No reply yet.", nextStep: "Follow-up email waits for approval on Nov 23", due: "2026-11-23" },
      { id: "cp-04", name: "Willowmere Fellowship", city: "Omaha", state: "NE", size: 430, sizeSource: "Public directory listing", site: "willowmere.example", fit: 65, status: "replied", delivered: "2026-11-02", owner: "g-renee",
        signals: ["no-giving", "no-visit", "stale", "times-hidden", "size"],
        whyNow: "The site was last updated in 2024 and the Easter page still leads the home page.",
        evidence: [{ signal: "stale", detail: "Home page leads with Easter 2025 service times.", source: "Church website, home page", seen: "2026-11-03" }],
        contact: { label: "Executive pastor's office", email: "xp@willowmere.example", phone: "(402) 555-0170", source: "Public staff page" },
        outcome: "Replied Nov 14: would like the Website Check report.", nextStep: "Send the Website Check and offer a call", due: "2026-11-19", handedTo: "g-victor" },
      { id: "cp-05", name: "Red Clay Community Church", city: "Chattanooga", state: "TN", size: 180, sizeSource: "Google listing", site: "redclay.example", fit: 60, status: "new", delivered: "2026-11-16", owner: "g-renee",
        signals: ["no-mobile", "no-giving", "stale", "times-hidden", "size"],
        whyNow: "Their Google listing shows service times that differ from the website.",
        evidence: [{ signal: "times-hidden", detail: "Google listing says 10:30 AM; website says 10:00 AM.", source: "Public Google listing and church website", seen: "2026-11-17" }],
        contact: { label: "Church office", email: "info@redclay.example", phone: "(423) 555-0102", source: "Public contact page" },
        nextStep: "Run the Website Check", due: "2026-11-20" },
      { id: "cp-06", name: "Larkmoor Church", city: "Springfield", state: "MO", size: 760, sizeSource: "About page", site: "larkmoor.example", fit: 55, status: "new", delivered: "2026-11-16", owner: "g-renee",
        signals: ["no-visit", "new-pastor", "times-hidden", "size"],
        whyNow: "A new lead pastor was announced in October.",
        evidence: [{ signal: "new-pastor", detail: "News post welcoming Pastor Ezra, October 2026.", source: "Church website, news page", seen: "2026-11-17" }],
        contact: { label: "Church office", email: "office@larkmoor.example", phone: "(417) 555-0155", source: "Public contact page" },
        nextStep: "Run the Website Check", due: "2026-11-21" },
      { id: "cp-07", name: "Juniper Street Church", city: "Spokane", state: "WA", size: 140, sizeSource: "Public directory listing", site: "juniperstreet.example", fit: 50, status: "checking", delivered: "2026-11-16", owner: "g-renee",
        signals: ["no-mobile", "no-giving", "no-visit", "size"],
        whyNow: "A small church with no way to give online and a site that does not work on phones.",
        evidence: [{ signal: "no-giving", detail: "No give page.", source: "Church website", seen: "2026-11-18" }],
        contact: { label: "Church office", email: "hello@juniperstreet.example", phone: "(509) 555-0144", source: "Public contact page" },
        nextStep: "Finish the Website Check", due: "2026-11-19" },
      { id: "cp-08", name: "Old Mill Commons Church", city: "Fort Wayne", state: "IN", size: 290, sizeSource: "About page", site: "oldmillcommons.example", fit: 45, status: "not-a-fit", delivered: "2026-11-09", owner: "g-renee",
        signals: ["stale", "times-hidden", "size"],
        whyNow: "Older site, but a new one is already in progress.",
        evidence: [{ signal: "stale", detail: "Coming soon page for a new site, built by a volunteer.", source: "Church website", seen: "2026-11-10" }],
        contact: { label: "Church office", email: "office@oldmillcommons.example", phone: "(260) 555-0127", source: "Public contact page" },
        outcome: "Not a fit: a new site is being built by a volunteer. Revisit in six months.", nextStep: "None", due: null },
      { id: "cp-09", name: "Brightford Chapel", city: "Lexington", state: "KY", size: 360, sizeSource: "Public directory listing", site: "brightford.example", fit: 40, status: "suppressed", delivered: "2026-11-02", owner: "g-renee",
        signals: ["no-visit", "times-hidden", "size"],
        whyNow: "No visit form.",
        evidence: [{ signal: "no-visit", detail: "No visit form.", source: "Church website", seen: "2026-11-03" }],
        contact: { label: "Church office", email: "office@brightford.example", phone: "(859) 555-0166", source: "Public contact page" },
        outcome: "Unsubscribed Nov 6. On the suppression list.", nextStep: "None", due: null },
      { id: "cp-10", name: "Riverglass Church", city: "Little Rock", state: "AR", size: 610, sizeSource: "About page", site: "riverglass.example", fit: 80, status: "booked", delivered: "2026-10-26", owner: "g-renee",
        signals: ["no-mobile", "no-visit", "building", "stale", "times-hidden", "size"],
        whyNow: "Building campaign plus a site that is hard to use on phones.",
        evidence: [{ signal: "building", detail: "Capital campaign page launched September 2026.", source: "Church website", seen: "2026-10-27" }],
        contact: { label: "Executive pastor's office", email: "xp@riverglass.example", phone: "(501) 555-0181", source: "Public staff page" },
        outcome: "Discovery call booked for Nov 24.", nextStep: "Handed to Sales", due: "2026-11-24", handedTo: "g-victor" }
    ],
    /* The Website Check sample report for cp-01 (the door opener). */
    websiteCheck: {
      prospectId: "cp-01", runOn: "2026-11-17", overall: "Needs attention",
      areas: [
        { key: "phones",  label: "Works on a phone",          result: "Needs work", detail: "Text runs off the screen at phone width and the menu needs zooming. Most first-time guests look on a phone." },
        { key: "times",   label: "Service times and address", result: "Hard to find", detail: "Times are three clicks deep. Guests expect them on the first screen." },
        { key: "visit",   label: "Plan a Visit",              result: "Missing", detail: "There is no way to say \"I am coming Sunday\", so nobody can get ready to welcome them." },
        { key: "giving",  label: "Online giving",             result: "Working", detail: "A giving link works, though it opens a separate site." },
        { key: "fresh",   label: "Up to date",                result: "Out of date", detail: "The newest post is from August 2025, and the welcome letter is from the previous pastor." },
        { key: "speed",   label: "Speed on a phone",          result: "Slow", detail: "The home page takes about 5 seconds to show on a typical phone connection." },
        { key: "access",  label: "Easy to read",              result: "Needs work", detail: "Light gray text on white is hard to read for many people." }
      ],
      recommendations: ["Put service times and the address on the first screen", "Add a Plan a Visit form that tells a person to get ready", "Rebuild the site so it works on phones first", "Refresh the welcome page with the new pastor"]
    },
    sequence: [
      { step: 1, day: 0, name: "The Website Check offer", note: "Opens with what already works, then offers the free report." },
      { step: 2, day: 5, name: "A gentle follow-up", note: "One more finding and a link to see a sample site." },
      { step: 3, day: 12, name: "The last note", note: "Says we will not write again unless they reply." }
    ],
    outreach: [
      { id: "o-01", prospectId: "cp-01", step: 1, status: "waiting", createdBy: "Genesis", to: "office@harrowcreek.example",
        subject: "A free website check for Harrow Creek",
        body: "Hello Harrow Creek team,\n\nWelcome to Pastor Nathan. I looked at your website the way a first-time guest would. Your giving link is easy to find, and the welcome letter on your home page is warm. A few things are harder on a phone, like service times sitting three clicks deep.\n\nI put together a free Church Website Check: what already works, what we saw and a plain fix for each. Would you like me to send it?\n\nRenee S., Genesis Ministry",
        footer: "Genesis AI, [business postal address]. You are getting this because office@harrowcreek.example is listed on your public contact page. Unsubscribe with one click, or reply \"unsubscribe\" and we will not write again." },
      { id: "o-02", prospectId: "cp-03", step: 2, status: "waiting", createdBy: "Genesis", to: "office@kestrelpark.example", sendOn: "2026-11-23",
        subject: "One more thought for the Meridian campus",
        body: "Hello again,\n\nWith Meridian opening in February, one site will need to show two sets of service times clearly. Here is a sample church site that does that well on a phone.\n\nThe free Website Check is still yours if it would help.\n\nRenee S., Genesis Ministry",
        footer: "Genesis AI, [business postal address]. You are getting this because office@kestrelpark.example is listed on your public contact page. Unsubscribe with one click, or reply \"unsubscribe\" and we will not write again." },
      { id: "o-03", prospectId: "cp-04", step: 0, status: "waiting", createdBy: "Genesis", to: "xp@willowmere.example",
        subject: "Your Website Check, as promised",
        body: "Thank you for writing back. Your Website Check is attached. The two biggest wins would be service times on the first screen and a Plan a Visit form.\n\nIf it would help, Victor can walk you through it in 20 minutes. Any time next week works.\n\nRenee S., Genesis Ministry",
        footer: "Genesis AI, [business postal address]. You are getting this because xp@willowmere.example is listed on your public staff page. Unsubscribe with one click, or reply \"unsubscribe\" and we will not write again." },
      { id: "o-04", prospectId: "cp-03", step: 1, status: "sent", createdBy: "Genesis", approvedBy: "g-renee", sentOn: "2026-11-11", to: "office@kestrelpark.example", subject: "A free website check for Kestrel Park", outcome: "No reply yet" },
      { id: "o-05", prospectId: "cp-04", step: 1, status: "replied", createdBy: "Genesis", approvedBy: "g-renee", sentOn: "2026-11-04", to: "xp@willowmere.example", subject: "A free website check for Willowmere", outcome: "Replied Nov 14" },
      { id: "o-06", prospectId: "cp-09", step: 1, status: "unsubscribed", createdBy: "Genesis", approvedBy: "g-renee", sentOn: "2026-11-04", to: "office@brightford.example", subject: "A free website check for Brightford", outcome: "Unsubscribed Nov 6" }
    ],
    suppression: [
      { entry: "office@brightford.example", reason: "Unsubscribed", added: "2026-11-06" },
      { entry: "pastor@eastgatefellowship.example", reason: "Asked not to be contacted", added: "2026-10-28" },
      { entry: "lightwell.example", reason: "Already a Genesis client (domain)", added: "2026-09-01" },
      { entry: "lampstand.example", reason: "Already a Genesis client (domain)", added: "2026-10-22" },
      { entry: "goldenrod.example", reason: "Already a Genesis client (domain)", added: "2026-11-12" },
      { entry: "calderhill.example", reason: "In a conversation with Genesis (domain)", added: "2026-10-14" },
      { entry: "office@stonecrop.example", reason: "Bounced twice", added: "2026-10-15" },
      { entry: "info@fernway.example", reason: "Unsubscribed", added: "2026-10-09" }
    ],
    weekly: {
      weeks: ["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16"],
      delivered: [50, 50, 50, 50, 50, 50, 50, 50],
      worked:    [38, 41, 44, 40, 46, 43, 45, 34],
      checksSent:[9, 11, 12, 10, 14, 12, 13, 12],
      replies:   [1, 1, 1, 1, 2, 1, 1, 2],
      callsBooked:[0, 1, 0, 1, 1, 0, 1, 1]
    }
  };

  /* ------------------------------------------------------------------ sales */
  /* Never a dollar amount. Plans show a level, and "Pricing set with Genesis". */
  D.sales = {
    stages: [
      { key: "lead",      label: "Lead" },
      { key: "discovery", label: "Discovery Call" },
      { key: "demo",      label: "Guided Demo" },
      { key: "proposal",  label: "Proposal" },
      { key: "signed",    label: "Signed" }
    ],
    afterStages: [{ key: "onboarding", label: "Onboarding" }, { key: "managed", label: "Managed" }],
    deals: [
      { id: "a-lightwell",  church: "bright-modern",    name: "Lightwell Church", city: "Raleigh", state: "NC", stage: "managed", level: 2, look: "bright-modern", owner: "g-amara", since: "2026-09-14", next: "Quarterly review, and a look at Level 03", due: "2026-12-10", source: "Referral from a pastor friend", demo: true },
      { id: "a-lampstand",  church: "bold-dark",        name: "Lampstand Church", city: "Columbus", state: "OH", stage: "onboarding", level: 3, look: "bold-dark", owner: "g-amara", signed: "2026-10-22", launchTarget: "2027-01-10", next: "Site build review with Pastor Talia", due: "2026-11-24", source: "Inbound from geai.us", demo: true },
      { id: "a-goldenrod",  church: "warm-community",   name: "Goldenrod Commons Church", city: "Des Moines", state: "IA", stage: "signed", level: 2, look: "warm-community", owner: "g-victor", signed: "2026-11-12", launchTarget: "2027-02-01", next: "Kickoff call and photo checklist", due: "2026-11-20", source: "Website Check reply", demo: true },
      { id: "a-calderhill", church: "classic-timeless", name: "Calder Hill Chapel", city: "Richmond", state: "VA", stage: "proposal", level: 3, look: "classic-timeless", owner: "g-victor", proposalSent: "2026-11-16", next: "Elder board decision", due: "2026-12-01", source: "Conference conversation", demo: true },
      { id: "a-riverglass", prospectId: "cp-10", name: "Riverglass Church", city: "Little Rock", state: "AR", stage: "discovery", level: null, look: null, owner: "g-victor", next: "Discovery call", due: "2026-11-24", source: "Acquisition: Website Check" },
      { id: "a-willowmere", prospectId: "cp-04", name: "Willowmere Fellowship", city: "Omaha", state: "NE", stage: "lead", level: null, look: null, owner: "g-victor", next: "Send the Website Check and offer a call", due: "2026-11-19", source: "Acquisition: reply" },
      { id: "a-ashgrove",   name: "Ashgrove Chapel", city: "Greenville", state: "SC", stage: "demo", level: 2, look: "classic-timeless", owner: "g-victor", next: "Guided demo with the executive pastor", due: "2026-11-21", source: "Inbound from geai.us" },
      { id: "a-mapleshade", name: "Mapleshade Bible Church", city: "Wichita", state: "KS", stage: "demo", level: 3, look: "warm-community", owner: "g-victor", next: "Second demo for the care team", due: "2026-11-25", source: "Referral" },
      { id: "a-fernhollow", name: "Fern Hollow Church", city: "Madison", state: "WI", stage: "discovery", level: null, look: null, owner: "g-victor", next: "Discovery call", due: "2026-11-20", source: "Acquisition: Website Check" },
      { id: "a-tidewater",  name: "Tidewater Lantern Church", city: "Norfolk", state: "VA", stage: "proposal", level: 2, look: "bright-modern", owner: "g-victor", proposalSent: "2026-11-13", next: "Follow up on the proposal", due: "2026-11-20", source: "Inbound from geai.us" },
      { id: "a-stonebridge",name: "Stonebridge Crossing Church", city: "Charlotte", state: "NC", stage: "lead", level: null, look: null, owner: "g-victor", next: "First call", due: "2026-11-22", source: "Inbound from geai.us" },
      { id: "a-northfold",  name: "Northfold Church", city: "Columbia", state: "MO", stage: "proposal", level: 4, look: "bold-dark", owner: "g-victor", proposalSent: "2026-11-05", next: "Enterprise scoping call for the second campus, before signing", due: "2026-11-23", source: "Referral" }
    ],
    onboardingSteps: [
      { key: "content",  label: "Content and photos collected", who: "Church" },
      { key: "brand",    label: "Brand board approved", who: "Church" },
      { key: "social",   label: "Social plan delivered", who: "Genesis" },
      { key: "build",    label: "Site build", who: "Genesis" },
      { key: "hope",     label: "Hope facts approved by the church", who: "Church" },
      { key: "privacy",  label: "Privacy page and reporting wording approved", who: "Church" },
      { key: "connect",  label: "Giving, events and people import connected", who: "Genesis" },
      { key: "platform", label: "Platform set up", who: "Genesis", minLevel: 2 },
      { key: "roles",    label: "Roles and prayer team named", who: "Church", minLevel: 2 },
      { key: "training", label: "Staff walkthrough", who: "Both", minLevel: 2 },
      { key: "launch",   label: "Launch", who: "Both" }
    ],
    /* status: "done" | "current" | "waiting" (on the church) | "todo" | "skip" (not in the plan) */
    onboarding: {
      "a-lightwell":  { content: "done", brand: "done", social: "done", build: "done", hope: "done", privacy: "done", connect: "done", platform: "done", roles: "done", training: "done", launch: "done", launched: "2026-09-14" },
      "a-lampstand":  { content: "done", brand: "done", social: "done", build: "current", hope: "waiting", privacy: "todo", connect: "current", platform: "todo", roles: "todo", training: "todo", launch: "todo", notes: "Hope facts are with Pastor Talia for approval." },
      "a-goldenrod":  { content: "current", brand: "todo", social: "todo", build: "todo", hope: "todo", privacy: "todo", connect: "todo", platform: "todo", roles: "todo", training: "todo", launch: "todo", notes: "Photo checklist sent. 18 of 40 photos in." },
      "a-kettleridge":{ content: "done", brand: "done", social: "done", build: "done", hope: "done", privacy: "waiting", connect: "done", platform: "current", roles: "done", training: "todo", launch: "todo", notes: "The privacy page and reporting wording are with the church for approval." }
    },
    /* Churches signed or live that the four demo accounts do not cover, so counts match monthly.signed. All fictional. */
    extraAccounts: [
      { id: "a-thistlebrook", name: "Thistlebrook Church", city: "Fayetteville", state: "AR", stage: "managed", level: 2, look: "warm-community", owner: "g-amara", size: 340, signed: "2026-08-11", launched: "2026-10-05", source: "Referral", next: "First monthly check-in", due: "2026-12-03" },
      { id: "a-saltmeadow", name: "Saltmeadow Chapel", city: "Mobile", state: "AL", stage: "managed", level: 3, look: "classic-timeless", owner: "g-amara", size: 480, signed: "2026-09-02", launched: "2026-10-29", source: "Inbound from geai.us", next: "Open the gifts conversation to members", due: "2026-12-01" },
      { id: "a-larkspur", name: "Larkspur Hill Church", city: "Boise", state: "ID", stage: "managed", level: 2, look: "bold-dark", owner: "g-amara", size: 260, signed: "2026-09-23", launched: "2026-11-16", source: "Acquisition: Website Check", next: "Two-week check-in after launch", due: "2026-11-30" },
      { id: "a-kettleridge", name: "Kettle Ridge Church", city: "Tulsa", state: "OK", stage: "onboarding", level: 2, look: "bright-modern", owner: "g-amara", size: 390, signed: "2026-10-07", launchTarget: "2026-12-07", source: "Referral", next: "Approve the privacy page with the church office", due: "2026-11-23" }
    ],
    monthly: {
      months: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      leads:     [6, 9, 11, 14, 17, 12],
      discovery: [3, 5, 6, 8, 9, 7],
      demos:     [2, 3, 4, 6, 6, 5],
      proposals: [1, 2, 2, 4, 4, 3],
      signed:    [0, 1, 1, 2, 2, 1]
    },
    sourcesThisQuarter: [{ label: "Acquisition: Website Check", value: 9 }, { label: "Inbound from geai.us", value: 8 }, { label: "Referral", value: 6 }, { label: "Conference", value: 2 }]
  };

  /* Genesis drafts on the Genesis side (outreach and sales follow-ups). */
  D.genesisDrafts = [
    { id: "gd-01", side: "genesis", kind: "Outreach email", outreach: "o-01", prospect: "cp-01", channel: "Email", owner: "g-renee", why: "New lead pastor, and three Website Check findings.", subject: "A free website check for Harrow Creek", body: "Hello Harrow Creek team,\n\nWelcome to Pastor Nathan. I looked at your website the way a first-time guest would. Your giving link is easy to find, and the welcome letter on your home page is warm. A few things are harder on a phone, like service times sitting three clicks deep.\n\nI put together a free Church Website Check: what already works, what we saw and a plain fix for each. Would you like me to send it?\n\nRenee S., Genesis Ministry", footer: "Genesis AI, [business postal address]. You are getting this because office@harrowcreek.example is listed on your public contact page. Unsubscribe with one click, or reply \"unsubscribe\" and we will not write again." },
    { id: "gd-02", side: "genesis", kind: "Proposal follow-up", deal: "a-tidewater", channel: "Email", owner: "g-victor", why: "Proposal sent Nov 13, no reply in 6 days.", subject: "Questions on the Connect proposal?", body: "Hi Pastor Grant,\n\nChecking in on the Level 02 Connect proposal. Happy to walk your team through the guest pipeline again, or answer anything the board asked.\n\nVictor N., Genesis Ministry" }
  ];
  D.genesisSummaries = [
    { id: "gs-week", side: "genesis", title: "This week, in counts", body: "Fifty prospects delivered on Monday; 34 worked and 31 replaced so far. Twelve Website Checks sent, two replies and one call booked. Three outreach emails wait for approval. Calder Hill's proposal is with their elder board until Dec 1." }
  ];

  window.GM_DATA = D;
})();
