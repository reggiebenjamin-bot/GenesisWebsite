/*
 * The Genesis Ministry page (Edition 05): every visitor string on /ministry,
 * the four website looks, the platform rows, the three plans, the church
 * version of the process, the free Church Website Check and the questions, in
 * one place. The page and its tests read from here, so the copy cannot drift.
 *
 * The proof standard applies: no statistics, results or testimonials. Ministry
 * shows its three plan prices (Care, Shepherd and Plus, per month); Enterprise,
 * for more than one campus, is scoped on a call. There is no setup fee, and
 * the page says so beside each price.
 *
 * Copy rules: warm, plain, short sentences. No em dashes, no emojis, and no
 * hyphens in visitor copy (the tests check all three).
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { ministryEdition } from "./editions.ts";
import { USAGE_BILLING_LINE } from "./legal.ts";

export type MinistryLink = { label: string; href: string };

/**
 * The consultation route, with a topic the contact form turns into a starting
 * note, landing on the form itself rather than on the page's intro.
 */
export const consult = (topic: string) => `/contact?topic=${topic}#consultation-form`;

/**
 * The clickable previews, served as static files from public/ministry-demo/
 * (copied in by scripts/sync-ministry-demo.mjs). The page links to each one
 * only once its file is there: see ministryDemoAction below.
 */
export const ministryDemo = {
  gallery: "/ministry-demo/index.html",
  platform: "/ministry-demo/platform/index.html",
  /* Starts as Lampstand Church, the sample church in the stills on /ministry. Its
     account is on Plus, the plan the demo opens at, so no plan note shows. */
  /* pace=short: five screens (Today, Guests, the Care Inbox, Sunday's Notes, the member app), about two
     minutes on a phone, with See Every Screen on its last card. */
  tour: "/ministry-demo/platform/index.html?tour=1&church=bold-dark&pace=short",
  template: (slug: string) => `/ministry-demo/templates/${slug}/index.html`,
} as const;

/** The file in public/ behind a demo link: the link without its query or hash. */
export function ministryDemoFile(href: string): string {
  return href.split(/[?#]/)[0];
}

/** Until the guided demo is published, its buttons ask for a walkthrough with a person instead. */
export const ministryWalkthrough = {
  label: "Request a Walkthrough",
  href: consult("ministry-demo"),
} as const;

/**
 * The guided demo button: the demo itself once its files are in public/, and
 * a walkthrough request until then, so the page never links to a missing
 * page. `hasFile` answers whether a path exists under public/.
 */
export function ministryDemoAction(hasFile: (path: string) => boolean): MinistryLink & { isDemo: boolean } {
  return hasFile(ministryDemoFile(ministryDemo.tour))
    ? { label: "Take the Guided Demo", href: ministryDemo.tour, isDemo: true }
    : { ...ministryWalkthrough, isDemo: false };
}

/*
 * Where each film lives in public/. The films do not exist yet: the page
 * checks for each file when it renders, and shows the poster, or a placeholder
 * drawn from the site's visual kit, until the film is there. Add the file and
 * rebuild; no code changes.
 *
 * The posters are stills from the public demo (public/ministry-demo/), with
 * Lampstand Church, a made up sample church: Today on Plus in the light
 * theme, the Guests view, the care inbox, and the member app home screen in a
 * phone. Each also has a phone still (posterPhone): the same screen as a
 * phone shows it, 390 by 520 at three times the pixels, scrolled to the part
 * the alt text names, so its words stay readable in a phone sized frame.
 * Each stillAlt below is true of both stills; update them together.
 */
export const ministryMedia = {
  demo: {
    video: "/video/ministry/demo-landscape.mp4",
    poster: "/video/ministry/demo-landscape.jpg",
    posterPhone: "/video/ministry/demo-landscape-phone.jpg",
    captions: "/video/ministry/demo-landscape.en.vtt",
  },
  frontOffice: {
    video: "/video/ministry/loop-front-office.mp4",
    poster: "/video/ministry/loop-front-office.jpg",
    posterPhone: "/video/ministry/loop-front-office-phone.jpg",
  },
  backOffice: {
    video: "/video/ministry/loop-back-office.mp4",
    poster: "/video/ministry/loop-back-office.jpg",
    posterPhone: "/video/ministry/loop-back-office-phone.jpg",
  },
  memberApp: {
    video: "/video/ministry/loop-member-app.mp4",
    poster: "/video/ministry/loop-member-app.jpg",
    posterPhone: "/video/ministry/loop-member-app-phone.jpg",
  },
} as const;

export const ministryHero = {
  /** Said beside the name instead of an edition number, which means nothing to a church arriving from search. */
  audience: "For churches",
  eyebrow: ministryEdition.eyebrow,
  headline: ministryEdition.headline,
  /** The part of the headline set in gold. */
  accent: "Care for every person.",
  lede: ministryEdition.body,
  primary: { label: "Book a Call", href: consult("ministry") },
  secondary: { label: "Take the Guided Demo", href: ministryDemo.tour },
  filmLabel:
    "A guided film of Genesis Ministry: the church website, Hope, the list of every new guest, the care inbox and the member app, shown with a made up sample church.",
  /** Describes the poster image when it is shown without the film. Keep it true to the still. */
  stillAlt:
    "The Today view for Lampstand Church, a made up sample church, in the light theme. Hope's briefing puts today's list in order and starts with Maya T., a first time guest visiting on Sunday, and 4 drafts wait for a person's judgment.",
  filmPlay: "Play the guided film",
  filmNote: "Sample church and sample people shown.",
} as const;

export type MinistryPackageItem = {
  no: string;
  title: string;
  body: string;
  points: readonly string[];
  /** Where to see it in the demo. */
  links?: readonly { label: string; href: string }[];
  /** A plan tag for a part that is not in every plan, shown as a small chip. */
  plan?: string;
};

export const ministryPackage = {
  eyebrow: "What a church gets",
  title: "Everything you need to welcome people well.",
  aside:
    "Every church starts with a website, a brand and a plan to share it, with Hope on the site from day one. The platform comes with the plan you choose.",
  items: [
    {
      no: "01",
      title: "A website in your own look",
      body: "One of four looks, filled with your times, your address, your ministries and your photos. Built for the phone first, because that is where a guest finds you.",
      points: ["One of four looks", "Your content and photos", "Clear on every phone"],
    },
    {
      no: "02",
      title: "A brand board",
      body: "One page that keeps your church consistent: logo versions, colors, type, photo direction, buttons and the voice you write in.",
      points: ["Logo, color and type", "Photo direction", "Voice and tone"],
    },
    {
      no: "03",
      title: "A social marketing plan",
      body: "Who you want to reach, a weekly rhythm, a 30 day calendar and sample captions. One Sunday message becomes a week of posts.",
      points: ["Weekly rhythm", "30 day calendar", "Sample captions"],
    },
    {
      no: "04",
      title: "Hope, on your website",
      body: "Hope answers visitors from the facts your church approves, like service times, parking and kids check in. Prayer goes to real people.",
      points: ["Answers from approved facts", "Hands prayer to people", "988 and 911 in a crisis"],
    },
    {
      no: "05",
      title: "Sunday notes and daily devotionals",
      body: "Your pastor's own words, shaped into Sunday notes with the scripture, the key points and questions for small groups. From the Shepherd plan, a short devotional each morning too, shaped from your pastors' own words, like Sunday's message or a short note. Nothing goes out until a person approves it.",
      points: ["From your pastor's own words", "Scripture, points and questions", "Daily devotionals from the Shepherd plan"],
      plan: "Devotionals: Shepherd plan and up",
      links: [
        { label: "See Sunday's Notes", href: `${ministryDemo.template("bold-dark")}#/notes` },
        { label: "See a Devotional", href: "/ministry-demo/platform/member-devotional.html?church=bold-dark" },
      ],
    },
    {
      no: "06",
      title: "The platform, by plan",
      body: "Tools for welcoming guests, tools for caring for people and a member app on phones. Which parts you get depends on the plan you choose.",
      points: ["For guests", "For care", "Member app"],
    },
  ] satisfies readonly MinistryPackageItem[],
} as const;

export type MinistryLook = {
  slug: string;
  name: string;
  /** Who the look is made for. */
  forChurches: string;
  /** The made up sample church each preview is shown with. */
  sampleChurch: string;
  image: string;
  alt: string;
};

export const ministryLooks = {
  eyebrow: "Four looks",
  title: "Pick the look that feels like your church.",
  aside:
    "Each look is a complete church website built to the same standard underneath, shown here with a made up sample church.",
  /** Added to the aside once the previews are published and the cards open them. */
  asideOpen: "Open one and look around.",
  gallery: { label: "See all four side by side", href: ministryDemo.gallery },
  items: [
    {
      slug: "bright-modern",
      name: "Bright and Modern",
      forChurches: "Church plants and young families",
      sampleChurch: "Lightwell Church",
      image: "/images/ministry/look-bright-modern.jpg",
      alt: "The Bright and Modern look: a white home page with bold type, a cobalt Plan Your Visit button and a photo of friends laughing together.",
    },
    {
      slug: "bold-dark",
      name: "Bold and Dark",
      forChurches: "Worship led churches with students and young adults",
      sampleChurch: "Lampstand Church",
      image: "/images/ministry/look-bold-dark.jpg",
      alt: "The Bold and Dark look: a dark home page with tall orange and ivory type over a photo of hands raised in worship.",
    },
    {
      slug: "classic-timeless",
      name: "Classic and Timeless",
      forChurches: "Established congregations with history",
      sampleChurch: "Calder Hill Chapel",
      image: "/images/ministry/look-classic-timeless.jpg",
      alt: "The Classic and Timeless look: a forest green home page with serif type and a brick church with a white steeple, framed in an arch.",
    },
    {
      slug: "warm-community",
      name: "Warm Community",
      forChurches: "Family and neighborhood churches",
      sampleChurch: "Goldenrod Commons Church",
      image: "/images/ministry/look-warm-community.jpg",
      alt: "The Warm Community look: a cream home page with rounded type, a yellow Plan Your Visit button and a family laughing together by an outdoor table under string lights.",
    },
  ] satisfies readonly MinistryLook[],
} as const;

export type MinistryPlatformRow = {
  id: "frontOffice" | "backOffice" | "memberApp";
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  /** Describes the silent loop for screen readers. */
  filmLabel: string;
  /** Describes the poster image when it is shown without the loop. Keep it true to the still. */
  stillAlt: string;
};

/*
 * Draft: the platform copy describes the previews being built now. The owner
 * should confirm each line against the finished demo before launch.
 */
export const ministryPlatform = {
  eyebrow: "The Genesis Ministry platform",
  title: "Guests, care and a member app, in one place.",
  aside: "Hope works in two places: on your website it answers guests, and in your workspace it drafts and summarizes for your team. A person on your team always decides.",
  rows: [
    {
      id: "frontOffice",
      eyebrow: "For guests",
      title: "No first time guest falls through the cracks.",
      body: "Every guest who fills in a card, a form or a chat with Hope lands in one list of new guests. The Today view shows your team who to welcome and who is ready for a next step.",
      points: ["One list of every new guest", "The Today view", "Welcome notes drafted for approval"],
      filmLabel:
        "Silent looping film of the guest tools with sample data: a new guest arrives in the guest list and a welcome note waits for a person to approve it.",
      stillAlt:
        "The Guests view for Lampstand Church, a made up sample church. It counts 18 guests with an open next step, 4 new this week and 6 follow ups due, and shows Maya T. as the guest to welcome first, with her welcome note ready for review.",
    },
    {
      id: "backOffice",
      eyebrow: "For care",
      title: "One record per person. Care that stays private.",
      body: "Prayer requests and messages arrive in a shared care inbox for the people who should see them. Each person has one page, with a record of who opened it.",
      points: ["Shared care inbox", "Person pages, with a record of who opened each one", "Gifts and reports, with a church wide view for pastors"],
      filmLabel:
        "Silent looping film of the care tools with sample data: a prayer request reaches the care inbox and a pastor opens one person's page.",
      stillAlt:
        "The shared care inbox for Lampstand Church, a made up sample church. Six conversations wait on the team, oldest first. Prayer requests show only a topic behind a lock, beside everyday messages like Kwame A.'s question about serving.",
    },
    {
      id: "memberApp",
      eyebrow: "Member app",
      title: "Your church, on every member's phone.",
      body: "Members see what is coming up, read Sunday's notes and the day's devotional, reach a person on staff and send a prayer request from their phone. What they send lands in the care inbox, with the right people.",
      points: ["What is coming up", "Messages to staff", "Prayer requests, kept private"],
      filmLabel:
        "Silent looping film of the member app with sample data: a member opens the app, sees the week ahead and sends a prayer request.",
      stillAlt:
        "The member app home screen for Lampstand Church, a made up sample church, on a phone. Sarah sees a reply from her pastor and buttons to ask for prayer, send a message or talk about serving.",
    },
  ] satisfies readonly MinistryPlatformRow[],
} as const;

export const ministryProtection = {
  eyebrow: "Protecting people",
  title: "Care comes with rules. Here they are, in plain words.",
  rules: [
    {
      title: "Prayer stays with your pastors and prayer team.",
      plan: "Shepherd plan and up",
      body: "Only your pastors and the prayer team you choose can see prayer requests. Nobody else in your church can open them. On the Care plan, prayer forms go by email to the pastors' address only.",
    },
    {
      title: "A person approves every draft.",
      body: "Hope drafts welcome notes, follow up notes and posts, and none of them goes out until someone on your team approves it. Only two things are sent without a person: Hope's answers from your approved facts, and the fixed crisis reply.",
    },
    {
      title: "Hope answers only from your approved facts.",
      body: "Hope uses the facts your church has approved. When it does not know, it says so and connects a real person.",
    },
    {
      title: "A crisis gets a fixed reply, written by people.",
      body: "If someone writes in crisis, Hope does not improvise. It shows a reply written by people, with 988 for the Suicide and Crisis Lifeline and 911 for an emergency.",
    },
    {
      title: "Every person has one private record.",
      /* Person pages and the record of every open start at Shepherd; Plus adds the screen to search it. */
      plan: "Shepherd plan and up",
      body: "Each person has one page, not copies in five places. Every open is recorded from the Shepherd plan, and the Plus plan adds the Access Record screen to search it.",
    },
  ],
  footnote: "Hope is not a counselor and not an emergency service. Your people are the care.",
  crisis: {
    label: "Always in Hope's crisis reply",
    lines: [
      { number: "988", text: "Call or text the Suicide and Crisis Lifeline" },
      { number: "911", text: "Call for an emergency" },
    ],
  },
} as const;

export type MinistryPlanId = "care" | "shepherd" | "plus";

export type MinistryLevel = {
  id: MinistryPlanId;
  name: string;
  /** The monthly price in US dollars, as the structured data carries it. */
  monthlyPriceUsd: number;
  /** The monthly price as the card prints it. */
  priceDisplay: string;
  /** How many staff members can sign in on this plan. */
  staffLogins: number;
  summary: string;
  /** Who the plan suits, from what it includes. Not a claim about which plan churches pick. */
  suits: string;
  bullets: readonly string[];
  action: MinistryLink;
};

/*
 * THE THREE PLANS. The owner set the names and the prices: Care at $149 a
 * month, Shepherd at $299 and Plus at $499. They replace the draft levels
 * Welcome, Connect and Shepherd, and the section keeps its #levels anchor.
 *
 * What each plan includes is a working mapping until the owner lists it: Care
 * has exactly what Level 01 (Welcome) had, Shepherd what Level 02 (Connect)
 * had, and Plus what Level 03 (Shepherd) had.
 *
 * The owner also set the staff logins (2, 5 and 15) and the terms every plan
 * shares: no setup fee, month to month, the website live in 2 weeks and
 * Shepherd and Plus fully live in 30 days, the move of the website and domain
 * included, and the church's data its own, with a spreadsheet export.
 *
 * Enterprise, for more than one campus, is a line under the three cards
 * rather than a fourth card, the way Genesis Enterprise sits under the
 * edition levels, and it stays scoped on a call: most churches of 100 to
 * 1,000 people meet on one campus.
 */
export const ministryLevels = {
  eyebrow: "Choose your plan",
  title: "Start where your church is.",
  aside:
    "Every plan includes the website, the brand board, the social marketing plan, Hope and Sunday sermon notes. Prices are monthly, for one campus.",
  /** Printed beside each price, as on the edition Levels. */
  priceUnit: "per month",
  /** Under each price, where a business Level names its setup fee. */
  setupLine: "No setup fee",
  /** What every plan shares, listed once under the three cards. */
  terms: {
    title: "With every plan",
    /** Also the start of the answer to the price question. */
    commitment: "No setup fee. Month to month, cancel anytime.",
    timeline: "Your website is live in 2 weeks. Shepherd and Plus are fully live in 30 days.",
    move: "Genesis moves your website and domain for you, included.",
    data: "Your church owns its data, with a spreadsheet export anytime, including when you cancel.",
  },
  /** How usage is paid for, once, under the terms. */
  usage: USAGE_BILLING_LINE,
  levels: [
    {
      id: "care",
      name: "Care",
      monthlyPriceUsd: 149,
      priceDisplay: "$149",
      staffLogins: 2,
      summary: "Everything a guest sees first.",
      suits: "For a church that wants a better website and first impression.",
      bullets: [
        "Website in one of four looks",
        "Brand board",
        "Social marketing plan",
        "Hope on your website",
        "Plan a Visit and prayer forms by email",
        "Newsletter sign up",
        "Sunday sermon notes on your website",
      ],
      action: { label: "Book a Call", href: consult("ministry-care") },
    },
    {
      id: "shepherd",
      name: "Shepherd",
      monthlyPriceUsd: 299,
      priceDisplay: "$299",
      staffLogins: 5,
      summary: "Every guest followed up.",
      suits: "For a church with a team that follows up guests and care.",
      bullets: [
        "Everything in Care",
        "The Today view",
        "One list of every new guest",
        "Member app",
        "Care inbox",
        "Team roles, with your prayer team named",
        "Hope drafts that wait for approval",
        "Daily devotionals, in the member app and by email",
      ],
      action: { label: "Book a Call", href: consult("ministry-shepherd") },
    },
    {
      id: "plus",
      name: "Plus",
      monthlyPriceUsd: 499,
      priceDisplay: "$499",
      staffLogins: 15,
      summary: "Care for every person, over time.",
      suits: "For a staff that wants to see care for each person over time.",
      bullets: [
        "Everything in Shepherd",
        "Person pages",
        "A record of who opened each person's page",
        "Spiritual gifts, with a church wide view for pastors",
        "Reports",
        "Custom roles and named gift viewers",
      ],
      action: { label: "Book a Call", href: consult("ministry-plus") },
    },
  ] satisfies readonly MinistryLevel[],
  /** Enterprise is everything in Plus, across more than one campus. */
  enterprise: {
    name: "Enterprise",
    line: "More than one campus? Enterprise is scoped with you on a call.",
    action: { label: "Book a Call", href: consult("ministry-enterprise") },
  },
  footnote: "Customization beyond the template is quoted separately.",
} as const;

/** "2 staff logins": how many of a church's staff can sign in on a plan, as its card prints it. */
export function ministryStaffLogins(plan: Pick<MinistryLevel, "staffLogins">): string {
  return `${plan.staffLogins} staff logins`;
}

/** The shared terms in the order the page lists them. */
export const ministryTermsList: readonly string[] = [
  ministryLevels.terms.commitment,
  ministryLevels.terms.timeline,
  ministryLevels.terms.move,
  ministryLevels.terms.data,
];

/** "Care at $149 a month", one per plan, in order. */
const planPrices = ministryLevels.levels.map((plan) => `${plan.name} at ${plan.priceDisplay} a month`);

/**
 * How Genesis states the plans and prices in one sentence: the price question
 * on this page, and Hope's price answer in the public demo
 * (PRICE_ANSWER in scripts/ministry-demo-public.mjs, which a test keeps equal).
 */
/** The line under the hero buttons: the first plan price, and a link down to the plans. */
export const ministryPlansCue = {
  line: `Plans from ${ministryLevels.levels[0].priceDisplay} a month.`,
  link: { label: "See the Plans", href: "/ministry#levels" },
} as const;

/**
 * The lower commitment next step for a church that is not ready for a call:
 * the assessment, opened on the church path.
 */
export const ministryAssessment = {
  lead: "Not sure which plan fits?",
  label: "Take the free church assessment",
  href: "/assessment?for=church",
} as const;

export const ministryPriceAnswer = `Genesis Ministry has three plans: ${planPrices.slice(0, -1).join(", ")} and ${planPrices.at(-1)}.`;

/** The church version of the five stages, for the shared process timeline. */
export const ministryProcess = {
  eyebrow: "How it runs",
  title: "From a first conversation to a church that runs on it.",
  steps: [
    {
      number: "01",
      title: "Consultation",
      summary: "A free conversation",
      description:
        "We talk about your church: how guests find you today, how care happens, and where people slip through.",
    },
    {
      number: "02",
      title: "Scoping",
      summary: "Your look and your plan",
      description:
        "Together we choose the look, the plan and the tools to link to, and agree on the facts Hope may use.",
    },
    {
      number: "03",
      title: "Implementation",
      summary: "Your site and platform built",
      description:
        "Genesis builds your website with your content and photos, sets up Hope and configures the platform for your plan.",
    },
    {
      number: "04",
      title: "Launch",
      summary: "Live, with your team ready",
      description:
        "Your team learns the Today view and the care inbox, and the site goes live when you are ready.",
    },
    {
      number: "05",
      title: "Managed Platform",
      summary: "Supported as you grow",
      description:
        "Genesis keeps your site, Hope and the platform supported and current as your church changes.",
    },
  ],
} as const;

/**
 * The quiet church cue on the homepage hero and at the top of the phone menu:
 * a text link with the gold G, not a button, so a pastor who lands on a
 * business homepage sees at once that there is a version built for churches.
 */
export const ministryCue = {
  lead: "Leading a church?",
  label: "See Genesis Ministry",
  href: ministryEdition.href,
  /** Read as one phrase by a screen reader, whatever the layout does with the two spans. */
  ariaLabel: "Leading a church? See Genesis Ministry",
} as const;

export const ministryWebsiteCheck = {
  eyebrow: "Free offer",
  title: "A free church website check.",
  body: "Send us your church's website. We look at it the way a first time guest does, on a phone, and send you a short, plain note on what to fix first. It is free, and there is no obligation.",
  checks: [
    "Service times and address on the first screen",
    "What to expect on a first Sunday",
    "A clear way to reach a person",
    "How it reads on a phone",
  ],
  action: { label: "Request a Website Check", href: consult("church-website-check") },
  note: "The form asks for your website address first. That is all we need to start.",
} as const;

export const ministryFaq = {
  eyebrow: "Questions",
  title: "What churches ask us first.",
  items: [
    {
      question: "Does Genesis Ministry replace Planning Center or Subsplash?",
      answer:
        "No. It links to them. If your church uses Planning Center, Subsplash or another tool for giving, check in or your app, your website and Hope send people there. Genesis Ministry adds the welcome, the guest follow up and the care around them.",
    },
    {
      question: "Who sees prayer requests?",
      answer:
        "From the Shepherd plan, only your pastors and the prayer team you name. On the Care plan, prayer forms go by email to the pastors' address only. Hope never answers a prayer request on its own. It thanks the person and hands the request to real people.",
    },
    {
      question: "What does the AI do, and what does it not do?",
      answer:
        "Hope is one assistant that works in two places. In your workspace it drafts and summarizes: a welcome note for a first time guest, a summary of the week's care, a suggested next step. Every draft waits for a person to approve it. On your website, Hope answers visitors on its own, but only from the facts your church approved. It does not counsel, and it does not answer prayer. Anyone in crisis gets a fixed reply written by people, with 988 and 911.",
    },
    {
      question: "Can we use our own photos?",
      answer:
        "Yes, and we hope you will. The previews use free stock photos so you can see each look. Your website is built with your own photos, your own words and your own times.",
    },
    {
      question: "What does Genesis Ministry cost?",
      answer: `${ministryPriceAnswer} ${ministryLevels.terms.commitment} Every plan includes the website, the brand board, the social marketing plan, Hope and Sunday sermon notes on your website. Shepherd and Plus add daily devotionals, the member app and email to members who opt in. Devotionals are shaped from your pastors' own words too, and each one waits for a pastor to approve it. More than one campus? Enterprise is scoped with you on a call.`,
    },
    {
      question: "What does customization cost?",
      answer: "Customization beyond the template is quoted separately, once we know what you want.",
    },
  ],
} as const;

export const ministryClose = {
  eyebrow: "Genesis Ministry",
  title: "Be ready for whoever walks in this Sunday.",
  line: "Book a call and we will walk through your church, the look that fits and the plan to start with.",
  primary: ministryHero.primary,
  secondary: ministryHero.secondary,
  footnote: ministryEdition.disclaimer,
} as const;

/*
 * The contact page and consultation form, as a church sees them. A link with
 * a known Ministry topic (below) opens /contact in this version: church
 * words, church roles, and never the business plans or their prices. A plan
 * link names the church plan and its price in the starting note.
 */
export const ministryContact = {
  intro: {
    eyebrow: "Genesis Ministry",
    title: "Start with a conversation about your church.",
    description: [
      "Tell us about your church and how guests find you today.",
      "The first conversation is free. We listen first, then suggest the look and the plan that fit.",
    ],
  },
  aside: {
    eyebrow: "The consultation",
    title: "We listen first.",
    body: "A Genesis Ministry consultation is a free conversation about how your church welcomes guests and cares for people today, and where Genesis could help.",
    areasLead: "We may talk about:",
    areas: [
      "Your website",
      "First time guests",
      "Follow up",
      "Prayer and care",
      "Hope on your website",
      "Sermon notes and devotionals",
      "A member app",
      "Social media",
      "Tools you already use",
    ],
    closingLead: "Not everything needs to change.",
    closing: "We look at what to keep, what to link to, and where Genesis could carry more of the work.",
    /** The plans and prices, in the same sentence /ministry, /pricing, the demo and Hope use. */
    plans: {
      line: `${ministryPriceAnswer} Enterprise, for more than one campus, is scoped on a call.`,
      link: { label: "See the Plans", href: "/ministry#levels" },
    },
  },
  form: {
    title: "A few details about your church.",
    lede: "This helps us prepare for the call. You do not need anything technical for the first conversation.",
    company: "Church name",
    /* The executive pastor or administrator often makes this decision, so each has a role of their own. */
    roles: [
      "Senior or lead pastor",
      "Executive pastor",
      "Church administrator or operations",
      "Communications or guest services",
      "Other staff",
      "Volunteer",
    ],
    teamSize: "Staff size",
    /** Church staff sizes, paid and volunteer. app/api/consultation accepts these too. */
    staffSizes: ["1 or 2", "3 to 5", "6 to 15", "16 or more"],
    notes: "What would you like help with?",
    notesPlaceholder: "Tell us about your church, your website address and what you would like help with first.",
    submit: "Book a Call",
    footnotes: [
      "Your request starts a conversation. It does not sign your church up for anything or commit you to a plan.",
      "Genesis uses these details only to prepare for the call and to follow up about your request.",
    ],
    success:
      "Genesis will reach out to confirm a time. The call is a conversation about your church, how guests find you and the tools you use today. If it looks like a fit, we will suggest a look and a plan before anything is proposed in writing.",
  },
  /*
   * The free Church Website Check (the church-website-check topic): the same
   * church form, with its own words and the website address asked for first.
   */
  websiteCheck: {
    intro: {
      eyebrow: "Free Church Website Check",
      title: "Request your free Church Website Check.",
      description: [
        "Send us your church's website. We look at it the way a first time guest does, on a phone.",
        "Then we send you a short, plain note on what to fix first. It is free, and there is no obligation.",
      ],
    },
    aside: {
      eyebrow: "The Website Check",
      title: "A short note on what to fix first.",
      body: "A person at Genesis opens your website on a phone, the way a first time guest would, and writes down what helps and what gets in the way.",
      areasLead: "We look at:",
      areas: ministryWebsiteCheck.checks,
      closingLead: "No obligation.",
      closing: "The note is yours to keep. If you would like help after that, we can talk.",
    },
    form: {
      eyebrow: "Website Check request",
      title: "Where should we send your Website Check?",
      lede: "Your website address first, then a few details so we know who to write to.",
      website: "Church Website",
      websitePlaceholder: "yourchurch.org",
      submit: "Request My Website Check",
      footnotes: [
        "The Website Check is free. It does not sign your church up for anything.",
        "Genesis uses these details only to send your Website Check and to follow up about it.",
      ],
      success:
        "A person at Genesis will look at your website on a phone, the way a first time guest does, and send you a short note on what to fix first. If you would like to talk after that, just reply to the note.",
    },
  },
} as const;

/** The operation type a church's consultation is sent with. */
export const MINISTRY_OPERATION_TYPE = "Church";

/*
 * The starting note the contact form fills in for each Ministry topic, so a
 * church that clicks "Book a Call" or "Request a Website Check" does
 * not have to explain what it came for. A plan's note names the plan and its
 * price, from ministryLevels, so the note cannot drift from the card. Only
 * these topics are recognized; any other value leaves the note empty.
 */
export const ministryConsultationNotes: Readonly<Record<string, string>> = {
  ministry: "Genesis Ministry for our church. ",
  "ministry-demo": "A walkthrough of the Genesis Ministry demo. ",
  ...Object.fromEntries(
    ministryLevels.levels.map((plan) => [
      `ministry-${plan.id}`,
      `Genesis Ministry, the ${plan.name} plan at ${plan.priceDisplay} a month. `,
    ]),
  ),
  "ministry-enterprise": "Genesis Ministry, Enterprise for more than one campus. ",
  "church-website-check": "Free Church Website Check. ",
};

export function ministryConsultationNote(topic: unknown): string {
  return typeof topic === "string" && Object.hasOwn(ministryConsultationNotes, topic)
    ? ministryConsultationNotes[topic]
    : "";
}

/** The church plans a /contact topic can name, sent as the request's plan. */
export const MINISTRY_PLAN_IDS = ["care", "shepherd", "plus", "enterprise"] as const;

/** "shepherd" for topic=ministry-shepherd; empty for any other topic. */
export function ministryPlanFromTopic(topic: unknown): string {
  const id = typeof topic === "string" ? /^ministry-([a-z]+)$/.exec(topic)?.[1] : undefined;
  return id && (MINISTRY_PLAN_IDS as readonly string[]).includes(id) ? id : "";
}

/** Whether a /contact topic opens the church version of the page. */
export function isMinistryTopic(topic: unknown): boolean {
  return ministryConsultationNote(topic) !== "";
}

/** Whether a /contact topic opens the free Church Website Check version of it. */
export function isWebsiteCheckTopic(topic: unknown): boolean {
  return topic === "church-website-check";
}

/*
 * The church links' tab titles and link previews: /assessment?for=church and
 * the Ministry topics of /contact. The canonical stays on the page itself.
 */
export const ministryMeta = {
  assessment: {
    title: "Free Church Assessment | Genesis AI",
    description:
      "Free church assessment: see where first time guests and care requests may be slipping. Seven short steps, no account needed.",
  },
  contact: {
    title: "Book a Call About Genesis Ministry | Genesis AI",
    description:
      "Book a free call about Genesis Ministry: how first time guests and care requests reach your church today, and which of the three plans fits.",
  },
} as const;
