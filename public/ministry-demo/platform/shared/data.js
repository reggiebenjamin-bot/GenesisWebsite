/* Genesis Ministry design preview: the shared sample data.
   Every person, church and number here is fictional. Nothing is fetched, nothing is sent.
   One shared set of people and care is shown under whichever church is selected.
   Text may carry placeholders that GM.fill() resolves for the selected church:
   {church.name} {church.short} {church.city} {church.leadPastor} {church.carePastor}
   {church.email} {church.phone} {church.times} {church.kidsCheckIn} {church.visitGathering}
   The shell fills the church placeholders in guest notes, thread messages, prayer and drafts at load,
   so a page that prints them as they are still shows the right church.
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
      /* The site's own facts (templates/<slug>/hope.json): kids check-in, the gathering a first-time family
         comes to, where a greeter meets them (welcomeSpot, read after "look for Nadia"), parking and baptism. */
      kidsCheckIn: "Kids check-in opens 20 minutes before each gathering.", visitGathering: "the 10:45 AM gathering",
      welcomeSpot: "at the front door by the blue flags",
      parking: "There is free parking in the lot behind the building, plus street parking on Brightwater. Look for the blue flags.",
      baptism: "Our next Baptism Sunday is December 6. If you are ready to go public with your faith, or you are still wondering about it, talk to us and we will walk through it with you first.",
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
      kidsCheckIn: "Lampstand Kids runs during the 10 AM gathering. Come a few minutes early and check in at the kids desk.", visitGathering: "the 10 AM gathering",
      welcomeSpot: "at the door by the amber flags",
      parking: "Park free in the lot behind the building or on the street. Look for the amber flags, and a greeter will meet you at the door.",
      baptism: "Our next Baptism Sunday is December 6, at 10 AM and 6 PM. It is one of our loudest days, with friends cheering you up out of the water. If you are ready to go public with your faith, ask about baptism and a pastor will talk it through with you first.",
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
      kidsCheckIn: "Calder Kids runs during the 11:00 AM service. Come a few minutes early and check in at the welcome table.", visitGathering: "the 11:00 AM service",
      welcomeSpot: "at the side door off Calder Lane",
      parking: "Park free on Calder Lane or in the lot behind the parish hall. A greeter at the side door will point you to coffee and the sanctuary.",
      baptism: "We baptize in the river each June, and our next river baptism is Sunday, June 6, 2027. If you have been wondering about it, Pastor Samuel and Pastor Ruth would be glad to talk it through with you.",
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
      kidsCheckIn: "Kids check-in opens 15 minutes before each service.", visitGathering: "the 10:45 AM service",
      welcomeSpot: "under the yellow umbrellas out front",
      parking: "Park in the lot off Wrenfield or along the street. The yellow umbrellas out front mark the way in, and a greeter will be right there.",
      baptism: "Our next Baptism Sunday is January 10, and we would love to walk into the water with you. Ask about baptism and one of our pastors will talk it through with you first. Then we celebrate together.",
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
  /* The three plans and their prices, as /ministry shows them.
     D.pricingLine is the one sentence with every price. */
  D.pricingLine = "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.";
  /* Where "Talk With Genesis" goes, everywhere in the preview: the story pages (story/story.js reads the
     same address), the guided demo's last card and Hope's answer to "how do I book a call".
     It is the one address to change if the contact page moves. */
  D.genesisContact = "/contact?topic=ministry-demo";
  D.customLine = "Customization beyond the template is available for an additional cost.";
  D.levels = [
    { n: 1, code: "Care", name: "Care", price: "$149 a month", seats: "One sign-in for the pastors, with no staff seats needed",
      summary: "A website people can find and use, with Hope answering questions and every form arriving by email.",
      includes: ["The website in one of four looks", "The brand board", "The social marketing plan", "Hope on the website, answering from facts the church approves", "Plan a Visit and prayer forms delivered by email", "Newsletter sign-up", "Sunday sermon notes on the website, shaped from the pastor's own words"] },
    { n: 2, code: "Shepherd", name: "Shepherd", price: "$299 a month", seats: "Up to 8 staff seats",
      summary: "Everything in Care, plus a front office for guests and a member app, so nobody falls through the cracks.",
      includes: ["Everything in Care", "The Today view", "The Front Office guest pipeline", "The member app: sign in, home, prayer with history, messages, Give", "The care inbox for prayer and messages, with every open recorded", "Team roles: pastor, prayer team, staff and admin, with the prayer team named", "Hope drafts that wait for approval", "Daily devotionals, notes in the member app, and email to members who opt in"] },
    { n: 3, code: "Plus", name: "Plus", price: "$499 a month", seats: "Up to 15 staff seats",
      summary: "Everything in Shepherd, plus one page per person, the spiritual gifts picture and reports for pastors.",
      includes: ["Everything in Shepherd", "Person pages and the Access Record screen", "The spiritual gifts conversation and the pastor's gifts picture", "Reports", "Custom roles and named gift viewers", "Up to 15 staff seats"] },
    { n: 4, code: "Enterprise", name: "Enterprise", price: "Scoped on a call", seats: "Scoped on a call",
      summary: "For multi-campus churches. Everything in Plus, scoped on a call.",
      includes: ["Everything in Plus", "More than one campus", "Scoped on a call"] }
  ];
  D.defaultPlan = 3;

  /* Modules and the plan that includes each. The nav and the locked state read this. */
  D.modules = {
    website:  { label: "Website", level: 1, side: "church", adds: "The website in its chosen look, the brand board, the social marketing plan, and the forms that reach the church.", points: ["The website, with Hope answering questions", "The brand board and the social plan", "Plan a Visit and prayer forms by email"] },
    notes:    { label: "Sermon Notes", level: 1, side: "church", adds: "Sunday sermon notes on your website, shaped from the pastor's own words and searchable.", points: ["Shaped only from the pastor's outline, file, video or voice memo", "Scripture printed with its translation named", "Nothing goes out until a person taps Publish or Schedule", "Searchable Notes page on the website"] },
    devotionals: { label: "Devotionals", level: 2, side: "church", adds: "Daily devotionals from the pastor's own words, notes and a devotional reader in the member app, and email or text to members who opt in.", points: ["A short reading each morning: a verse, a few paragraphs and a prayer", "Scheduled ahead, at 6 AM by default", "Email only to members who chose it; texting only if the church turns it on"] },
    today:    { label: "Today", level: 2, side: "church", adds: "One calm list of what needs a person today: new guests, care waiting on us and follow-ups due.", points: ["New guests since Sunday, each with an owner", "Care waiting on us, oldest first", "Follow-ups due today and overdue", "Hope drafts ready for your approval"] },
    guests:   { label: "Guests", level: 2, side: "church", adds: "The front office: every first-time guest moves from New to Serving with an owner, a next step and a due date.", points: ["Guests arrive from Plan a Visit, Hope, connect cards, events and the newsletter", "Six stages from New to Serving", "Hope drafts welcome notes that wait for approval", "Follow-up by email by default; texting only if the church turns it on"] },
    care:     { label: "Care Inbox", level: 2, side: "church", adds: "One shared inbox for prayer and messages, with an owner on every thread and a waiting-on-us list.", points: ["Prayer visible only to pastors and the prayer team", "Alert emails carry no private words", "Every open, reply and archive is recorded", "Archive, never delete"] },
    people:   { label: "People", level: 3, side: "church", adds: "One page per person with everything from them in one place.", points: ["Contact card, threads and prayer history (for those allowed)", "Gifts when the person said yes", "Private pastor notes", "Every open is recorded"] },
    access:   { label: "Access Record", level: 3, side: "church", adds: "The Access Record screen: search and export every open, reply, change and archive. From the Shepherd plan every open is already recorded. The Plus plan adds this screen.", points: ["Search by person, record or action", "Export a copy, and the export is recorded too", "Nobody can edit an entry"] },
    gifts:    { label: "Gifts", level: 3, side: "church", adds: "The spiritual gifts conversation for members and a church-wide picture for pastors.", points: ["Plain arithmetic scoring; the AI never sets a score", "The chart stays hidden until 25 people finish", "Small counts show as fewer than 5", "Names only for people who said yes"] },
    reports:  { label: "Reports", level: 3, side: "church", adds: "Plain reports on guests, care and response times, counts only.", points: ["Guest path from first contact to serving", "Care volume and how fast we reply", "Counts only, never names or private words"] },
    team:     { label: "Team Roles", level: 2, side: "church", adds: "Who holds each role and what each role can see. The Shepherd plan has the four roles and a named prayer team; the Plus plan adds custom roles, named gift viewers and more seats.", points: ["Pastor, prayer team, staff and admin roles", "The prayer team named by the pastors", "Changes are emailed to the lead pastor", "Two-step sign in for everyone"] },
    "custom-roles": { label: "Custom Roles", level: 3, side: "church", adds: "Roles shaped to your church, like a care meals coordinator, and people named to see gift names for serving.", points: ["Custom roles with exactly what they need", "Named gift viewers", "Up to 15 staff seats"] },
    settings: { label: "Settings", level: 1, side: "church", adds: "The tools your church already uses, how follow-up and alerts travel, and when Genesis may sign in.", points: ["Giving, events and kids check-in links", "Follow-up and alert settings", "Support sessions, off by default"] },
    genesis:  { label: "Hope", level: 2, side: "church", adds: "Hope drafts welcome notes and everyday replies, and summarizes the week. A person approves everything.", points: ["Drafts are labeled and wait for approval", "Never drafts a reply to prayer or a personal message", "Never sets a gifts score"] },
    "member-app":   { label: "Member App", level: 2, side: "member", adds: "What members see on their phones: sign in, home, prayer with history, messages and Give.", points: ["Sign in with a 6-digit code sent by email", "Adults only", "Prayer with a history and any reply", "Private message threads with the church", "This week's notes and today's devotional, with email to members who opt in"] },
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
  /* Sermon notes and devotionals (the notes themselves are in ../../shared/notes-data.js, GM_NOTES):
     when each goes out by default, and the share of members who chose email for each. Opt-ins show only
     as rounded counts for the church's size. Texting follows D.guestSettings.textingEnabled. */
  D.notesSettings = { sermonAt: "Sunday, 30 minutes before the first service", devotionalAt: "6:00 AM", translation: "King James Version", emailOptIn: { notes: 0.4, devotionals: 0.3 } };
  D.guestSettings = { followUpChannel: "Email", textingEnabled: false, textingNote: "Texting is off. Guest follow-up goes by email unless the church turns texting on." };

  D.guests = [
    { id: "g-01", personId: "p-maya",    stage: "new",        source: "Plan a Visit form", arrived: "2026-11-18T19:42", owner: "s-nadia", next: "Send a welcome note", due: "2026-11-19", draft: "d-01", visitDate: "2026-11-22", note: "Coming Sunday to {church.visitGathering} with her husband and two kids, ages 4 and 7. Asked where to check in the kids." },
    { id: "g-02", personId: "p-daniel",  stage: "new",        source: "Hope conversation", arrived: "2026-11-18T22:15", owner: "s-nadia", next: "Send a welcome note", due: "2026-11-19", draft: "d-02", note: "Asked {assistant.name} about parking and what people wear. Left an email for a welcome note." },
    { id: "g-03", personId: "p-aisha",   stage: "new",        source: "Newsletter", arrived: "2026-11-17T08:05", owner: "s-nadia", next: "Invite to a Sunday", due: "2026-11-20", draft: "d-03", note: "Signed up for the newsletter after watching online for a month." },
    { id: "g-04", personId: "p-kenji",   stage: "new",        source: "Event sign-up", arrived: "2026-11-16T13:30", owner: "s-jun", next: "Welcome and confirm Serve Day details", due: "2026-11-18", note: "Signed up with his wife for the Thanksgiving Serve Day. First time with us." },
    { id: "g-05", personId: "p-rosa",    stage: "welcomed",   source: "Plan a Visit form", arrived: "2026-11-12T10:10", owner: "s-nadia", next: "Meet {church.welcomeSpot} Sunday", due: "2026-11-22", visitDate: "2026-11-22", note: "Welcome note sent Nov 13. Her son is 15 and curious about students." },
    { id: "g-06", personId: "p-tomas",   stage: "welcomed",   source: "Connect card", arrived: "2026-11-15T11:20", owner: "s-nadia", coverFor: "s-hector", next: "Follow up after first visit", due: "2026-11-19", note: "Filled a connect card at the first gathering. Family of five, new to the area." },
    { id: "g-07", personId: "p-hannah",  stage: "welcomed",   source: "Hope conversation", arrived: "2026-11-14T21:02", owner: "s-nadia", next: "Answer the kids check-in question", due: "2026-11-21", note: "Asked about the nursery for her toddler. Waiting on her reply." },
    { id: "g-08", personId: "p-malik",   stage: "visited",    source: "Connect card", arrived: "2026-11-15T11:05", owner: "s-nadia", next: "Invite to Start Here on Dec 6", due: "2026-11-19", visitDate: "2026-11-15", note: "Second Sunday. Said he wants to know what the church believes." },
    { id: "g-09", personId: "p-grace",   stage: "visited",    source: "Plan a Visit form", arrived: "2026-11-03T16:40", owner: "s-care", next: "Personal call from a pastor", due: "2026-11-17", visitDate: "2026-11-08", note: "New to the city after losing her husband this year. Prefers a phone call." },
    { id: "g-10", personId: "p-evan",    stage: "visited",    source: "Hope conversation", arrived: "2026-11-01T09:30", owner: "s-nadia", next: "Send Start Here invite", due: "2026-11-20", visitDate: "2026-11-15", note: "Watched online for a few weeks, then came in person." },
    { id: "g-11", personId: "p-leilani", stage: "start-here", source: "Plan a Visit form", arrived: "2026-10-18T12:00", owner: "s-nadia", coverFor: "s-hector", next: "Help choose a group", due: "2026-11-24", note: "Came to Start Here on Nov 8. Interested in a weeknight group." },
    { id: "g-12", personId: "p-omar",    stage: "start-here", source: "Connect card", arrived: "2026-10-25T11:15", owner: "s-nadia", next: "Send Start Here reminder", due: "2026-12-03", note: "Signed up for Start Here on Dec 6." },
    { id: "g-13", personId: "p-bethany", stage: "group",      source: "Event sign-up", arrived: "2026-09-27T10:00", owner: "s-nadia", coverFor: "s-hector", next: "Ask about serving", due: "2026-11-26", note: "Joined the Tuesday Night Group on Oct 27." },
    { id: "g-14", personId: "p-luis",    stage: "group",      source: "Hope conversation", arrived: "2026-09-20T20:45", owner: "s-nadia", coverFor: "s-hector", next: "Invite to the gifts conversation", due: "2026-12-01", note: "Joined Young Adults. Asked how to find a place to serve." },
    { id: "g-15", personId: "p-mei",     stage: "serving",    source: "Plan a Visit form", arrived: "2026-09-06T09:00", owner: "s-jun", next: "Thirty-day check-in", due: "2026-12-01", note: "On the Welcome Team since Nov 1." },
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
      text: "My mom starts treatment next week, about two hours away. Please pray for her strength and for our family as we take turns driving her." },
    { id: "pr-02", personId: "p-wyatt",   received: "2026-11-17T12:20", topic: "Job search", visibility: "prayer", status: "praying", owner: "s-sofia",
      text: "I have a second interview on Monday after eight months of looking. Please pray for peace and clear thinking.",
      replies: [{ from: "s-sofia", at: "2026-11-17T16:05", text: "Wyatt, the prayer team is praying for Monday. We are cheering you on." }] },
    { id: "pr-03", personId: "p-fatima",  received: "2026-11-16T09:40", topic: "New baby", visibility: "prayer", status: "replied", owner: "s-owen",
      text: "Our daughter Amira arrived on Saturday. We are tired and thankful. Please pray for good sleep and for my recovery.",
      replies: [{ from: "s-care", at: "2026-11-16T14:12", text: "Congratulations, Fatima. A meal team will drop dinner on Thursday. We are so happy for you." }] },
    { id: "pr-04", personId: "p-caleb",   received: "2026-11-18T18:30", topic: "Grief", visibility: "pastors", status: "new", owner: "s-care", waitingOnUs: true,
      text: "My grandfather passed away last week. Please pray for my grandmother, who is now on her own." },
    { id: "pr-05", personId: "p-naomi",   received: "2026-11-15T20:10", topic: "A move", visibility: "prayer", status: "replied", owner: "s-sofia",
      text: "We are moving out of state in January for my husband's job. Please pray for the move and for a new church home.",
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
  D.crisisLine = "In danger or crisis? Call 911, or call or text 988.";

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
      messages: [{ from: "member", at: "2026-11-18T19:50", text: "What time should we arrive on Sunday so the kids can check in?" }, { from: "s-nadia", at: "2026-11-19T08:10", text: "Hi Maya, great question! I am sending you a short welcome note today with everything for Sunday, kids check-in included." }] },
    { id: "t-06", personId: "p-sarah", subject: "A call about your mom", kind: "private", owner: "s-care", status: "waiting-on-them", started: "2026-11-18T08:30",
      messages: [{ from: "s-care", at: "2026-11-18T08:30", text: "Sarah, I saw your request about your mom. Would it help if I called this week, or would a meal be better?" }, { from: "member", at: "2026-11-18T12:05", text: "A call would mean a lot. Thursday evening works best." }, { from: "s-care", at: "2026-11-18T12:40", text: "Thursday at 7 it is. I will call you then." }] },
    { id: "t-07", personId: "p-hannah", subject: "Nursery question", kind: "everyday", owner: "s-nadia", status: "waiting-on-them", started: "2026-11-15T09:00",
      messages: [{ from: "member", at: "2026-11-15T09:00", text: "Do you have a nursery for an 18 month old?" }, { from: "s-nadia", at: "2026-11-15T11:30", text: "We do! It is staffed by two checked volunteers every Sunday. Would you like a tour before the service?" }] },
    { id: "t-08", personId: "p-sarah", subject: "Groups for new parents", kind: "everyday", owner: "s-hector", status: "closed", started: "2026-10-02T20:15",
      messages: [{ from: "member", at: "2026-10-02T20:15", text: "Is there a group for parents of little kids?" }, { from: "s-hector", at: "2026-10-03T09:05", text: "Yes, the New Parents Group meets Tuesdays at 6:30 with childcare. I will save you a seat." }] }
  ];

  /* ------------------------------------------------------------------ access record */
  /* Append only. No private words. The lead pastor can read it; nobody can edit it. */
  D.access = [
    { at: "2026-11-19T09:41", who: "s-lead",  action: "Opened", what: "Prayer request from Sarah N.", where: "Care Inbox" },
    { at: "2026-11-19T09:15", who: "s-owen",  action: "Opened", what: "Prayer request from Jasmine Y.", where: "Care Inbox" },
    { at: "2026-11-19T08:10", who: "s-nadia", action: "Replied", what: "Thread with Maya T.", where: "Care Inbox" },
    { at: "2026-11-19T08:05", who: "s-nadia", action: "Opened", what: "Guest record for Maya T.", where: "Guests" },
    { at: "2026-11-18T09:00", who: "s-care",  action: "Added a note", what: "Urgent request from Peter K.", where: "Care Inbox" },
    { at: "2026-11-17T21:31", who: "s-care",  action: "Opened", what: "Urgent request from Peter K.", where: "Care Inbox" },
    { at: "2026-11-17T21:12", who: "system",  action: "Alerted", what: "Pastor on call, by email and phone notification, with no private words", where: "Crisis check" },
    { at: "2026-11-17T11:00", who: "s-lead",  action: "Changed a role", what: "Sofia R. added to the prayer team. Emailed to the lead pastor.", where: "Team roles" },
    { at: "2026-11-16T15:40", who: "s-imani", action: "Archived", what: "Thread with Noah B. (archived, not deleted)", where: "Care Inbox" },
    { at: "2026-11-15T10:20", who: "s-jun",   action: "Viewed names", what: "Gifts finder: Hospitality, 6 people who said yes", where: "Gifts" },
    { at: "2026-11-14T16:05", who: "s-imani", action: "Blocked", what: "Opened an old forwarded link to a prayer request. Staff cannot open prayer, so nothing was shown.", where: "Care Inbox", blocked: true },
    { at: "2026-11-13T13:30", who: "s-lead",  action: "Exported", what: "A copy of Diego S.'s record, at his request", where: "People" },
    { at: "2026-11-12T08:40", who: "s-owen",  action: "Opened", what: "Prayer request from Diego S.", where: "Care Inbox" }
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
  /* Every draft is labeled and waits for a person. Genesis never drafts prayer or personal replies. */
  D.drafts = [
    { id: "d-01", side: "church", kind: "Welcome note", to: "p-maya", guest: "g-01", channel: "Email", owner: "s-nadia",
      why: "Planned a visit for Sunday with two kids, ages 4 and 7.",
      subject: "See you Sunday, Maya",
      body: "Hi Maya,\n\nThank you for letting us know you are coming on Sunday. We are glad you are bringing the kids.\n\n{church.kidsCheckIn} When you arrive, look for me {church.welcomeSpot}. I will walk you over and make sure everyone feels at home.\n\nSee you soon,\nNadia K., {church.short}" },
    { id: "d-02", side: "church", kind: "Welcome note", to: "p-daniel", guest: "g-02", channel: "Email", owner: "s-nadia",
      why: "Asked {assistant.name} about parking and what to wear.",
      subject: "A little help for your first Sunday",
      body: "Hi Daniel,\n\n{assistant.name} mentioned you had a couple of questions. {church.parking}\n\nAs for what to wear, come as you are. You will see jeans and you will see a few jackets.\n\nIf you want, reply and I will save you a seat.\n\nNadia K., {church.short}" },
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
      body: "Ten new guests this month so far, four of them since Sunday. Six follow-ups are due, two of them overdue. Care has six items waiting on us; the oldest is two days. The urgent request from Tuesday night was handled: the person was given 988 and 911 right away and the pastor on call followed up." }
  ];

  /* ================================================================== GENESIS SIDE */

  D.genesisTeam = [];

  /* "How it runs", mirrored from geai.us. */
  D.howItRuns = [
    { n: "01", name: "Consultation", line: "Free fit conversation", church: "A short call with the pastor or executive pastor about guests, care and the website today." },
    { n: "02", name: "Scoping", line: "Recommendation and next step", church: "A guided demo, then a proposal with a chosen look and plan." },
    { n: "03", name: "Implementation", line: "The system build", church: "Content and photos, brand board, social plan, site build, Hope facts and platform set up." },
    { n: "04", name: "Launch", line: "Live in the church", church: "The site goes live, staff sign in, and the first guests flow through." },
    { n: "05", name: "Managed Platform", line: "Support and improve", church: "Genesis keeps the site, Hope and the platform running and improving." }
  ];

  /* ------------------------------------------------------------------ sales */
  /* Plans show a plan name and its price, from D.levels. */
  D.sales = { stages: [], afterStages: [], deals: [] };

  /* The Genesis side has no drafts or summaries in the public preview. */
  D.genesisDrafts = [];
  D.genesisSummaries = [];

  window.GM_DATA = D;
})();
