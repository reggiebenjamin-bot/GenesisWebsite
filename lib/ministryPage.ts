/*
 * The Genesis Ministry page (Edition 05): every visitor string on /ministry,
 * the four website looks, the platform rows, the draft levels, the church
 * version of the process, the free Church Website Check and the questions, in
 * one place. The page and its tests read from here, so the copy cannot drift.
 *
 * The proof standard applies: no statistics, results or testimonials. Ministry
 * has no public prices; pricing is set with Genesis on a call.
 *
 * Copy rules: warm, plain, short sentences. No em dashes, no emojis, and no
 * hyphens in visitor copy (the tests check all three).
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { ministryEdition } from "./editions.ts";

export type MinistryLink = { label: string; href: string };

/** The consultation route, with a topic the contact form turns into a starting note. */
const consult = (topic: string) => `/contact?topic=${topic}`;

/**
 * The clickable previews, served as static files from public/ministry-demo/
 * (copied in by scripts/sync-ministry-demo.mjs). The page links to each one
 * only once its file is there: see ministryDemoAction below.
 */
export const ministryDemo = {
  gallery: "/ministry-demo/index.html",
  platform: "/ministry-demo/platform/index.html",
  tour: "/ministry-demo/platform/index.html?tour=1",
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
 * Where each film lives in public/. None of these files exist yet: the page
 * checks for each one when it renders, and shows the poster, or a placeholder
 * drawn from the site's visual kit, until the file is there. Add the file and
 * rebuild; no code changes.
 */
export const ministryMedia = {
  demo: {
    video: "/video/ministry/demo-landscape.mp4",
    poster: "/video/ministry/demo-landscape.jpg",
    captions: "/video/ministry/demo-landscape.en.vtt",
  },
  frontOffice: {
    video: "/video/ministry/loop-front-office.mp4",
    poster: "/video/ministry/loop-front-office.jpg",
  },
  backOffice: {
    video: "/video/ministry/loop-back-office.mp4",
    poster: "/video/ministry/loop-back-office.jpg",
  },
  memberApp: {
    video: "/video/ministry/loop-member-app.mp4",
    poster: "/video/ministry/loop-member-app.jpg",
  },
} as const;

export const ministryHero = {
  edition: `Edition ${ministryEdition.no}`,
  eyebrow: ministryEdition.eyebrow,
  headline: ministryEdition.headline,
  /** The part of the headline set in gold. */
  accent: "Care for every person.",
  lede: ministryEdition.body,
  primary: { label: "Book a Consultation", href: consult("ministry") },
  secondary: { label: "Take the Guided Demo", href: ministryDemo.tour },
  filmLabel:
    "A guided film of Genesis Ministry: the church website, Hope, the guest pipeline, the care inbox and the member app, shown with a made up sample church.",
  /** Describes the poster image when it is shown without the film. Keep it true to the still. */
  stillAlt:
    "The Genesis Ministry Today view for a made up sample church: first time guests to welcome, care to follow up and the week ahead.",
  filmPlay: "Play the guided film",
  filmNote: "Sample church and sample people shown.",
} as const;

export type MinistryPackageItem = {
  no: string;
  title: string;
  body: string;
  points: readonly string[];
};

export const ministryPackage = {
  eyebrow: "What a church gets",
  title: "Everything you need to welcome people well.",
  aside:
    "Every church starts with a website, a brand and a plan to share it, with Hope on the site from day one. The platform comes with the level you choose.",
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
      body: "One page that keeps your church consistent: logo lockups, colors, type, photo direction, buttons and the voice you write in.",
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
      title: "The platform, by level",
      body: "A front office for guests, a back office for care and a member app on phones. Which parts you get depends on the level you choose.",
      points: ["Front office for guests", "Back office for care", "Member app"],
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
  title: "Pick the look that sounds like your church.",
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
  title: "A front office, a back office and an app, built for care.",
  aside: "Genesis AI drafts and summarizes. A person on your team always decides.",
  rows: [
    {
      id: "frontOffice",
      eyebrow: "Front office",
      title: "No first time guest falls through the cracks.",
      body: "Every guest who fills in a card, a form or a chat with Hope lands in one guest pipeline. The Today view shows your team who to welcome and who is ready for a next step.",
      points: ["One guest pipeline", "The Today view", "Welcome notes drafted for approval"],
      filmLabel:
        "Silent looping film of the front office with sample data: a new guest arrives in the pipeline and a welcome note waits for a person to approve it.",
      stillAlt:
        "The Today view for a made up sample church, with first time guests to welcome and next steps waiting for a person.",
    },
    {
      id: "backOffice",
      eyebrow: "Back office",
      title: "One record per person. Care that stays private.",
      body: "Prayer requests and messages arrive in a shared care inbox for the people who should see them. Each person has one page, and an access record shows who opened it.",
      points: ["Shared care inbox", "Person pages and an access record", "Gifts and reports, with a church wide view for pastors"],
      filmLabel:
        "Silent looping film of the back office with sample data: a prayer request reaches the care inbox and a pastor opens one person's page.",
      stillAlt:
        "The shared care inbox for a made up sample church, with prayer requests and messages for the pastors and prayer team.",
    },
    {
      id: "memberApp",
      eyebrow: "Member app",
      title: "Your church, on every member's phone.",
      body: "Members see what is coming up, reach a person on staff and send a prayer request from their phone. What they send lands in the care inbox, with the right people.",
      points: ["What is coming up", "Messages to staff", "Prayer requests, kept private"],
      filmLabel:
        "Silent looping film of the member app with sample data: a member opens the app, sees the week ahead and sends a prayer request.",
      stillAlt:
        "The member app home screen on a phone for a made up sample church, with the week ahead and a way to send a prayer request.",
    },
  ] satisfies readonly MinistryPlatformRow[],
} as const;

export const ministryProtection = {
  eyebrow: "Protecting people",
  title: "Care comes with rules. Here they are, in plain words.",
  rules: [
    {
      title: "Prayer stays with your pastors and prayer team.",
      body: "Only your pastors and the prayer team you choose can see prayer requests. Nobody else.",
    },
    {
      title: "A person approves before anything goes out.",
      body: "Genesis AI drafts and summarizes. It never sends a message, a post or a reply on its own. Someone on your team reads it first.",
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
      body: "Each person has one page, not copies in five places. An access record shows who opened it and when.",
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

export type MinistryLevel = {
  id: "welcome" | "connect" | "shepherd";
  /** "01" to "03". */
  step: string;
  name: string;
  summary: string;
  bullets: readonly string[];
  action: MinistryLink;
};

/*
 * DRAFT LEVELS. The names (Welcome, Connect, Shepherd, Enterprise), what each
 * includes, and the decision to show no prices are a draft for the owner to
 * confirm. Prices are deliberately absent: every card reads "Pricing set with
 * Genesis" until the owner approves real numbers. Enterprise, for more than
 * one campus, is a line under the three cards rather than a fourth card, the
 * way Genesis Enterprise sits under the edition levels: most churches of 100
 * to 1,000 people meet on one campus.
 */
export const ministryLevels = {
  eyebrow: "Choose your level",
  title: "Start where your church is.",
  aside:
    "Every level includes the website, the brand board, the social plan and Hope. Pricing is set with Genesis on a call, once we understand your church.",
  priceLine: "Pricing set with Genesis",
  levels: [
    {
      id: "welcome",
      step: "01",
      name: "Welcome",
      summary: "Everything a guest sees first.",
      bullets: ["Website in one of four looks", "Brand board", "Social marketing plan", "Hope on your website"],
      action: { label: "Book a Consultation", href: consult("ministry-welcome") },
    },
    {
      id: "connect",
      step: "02",
      name: "Connect",
      summary: "Every guest followed up.",
      bullets: ["Everything in Level 01", "The Today view", "Guest pipeline", "Member app", "Care inbox"],
      action: { label: "Book a Consultation", href: consult("ministry-connect") },
    },
    {
      id: "shepherd",
      step: "03",
      name: "Shepherd",
      summary: "Care for every person, over time.",
      bullets: [
        "Everything in Level 02",
        "Person pages",
        "Access record",
        "Spiritual gifts, with a church wide view for pastors",
        "Reports",
        "Team roles",
      ],
      action: { label: "Book a Consultation", href: consult("ministry-shepherd") },
    },
  ] satisfies readonly MinistryLevel[],
  /** Draft: Enterprise is everything in Level 03, across more than one campus. */
  enterprise: {
    name: "Enterprise",
    line: "More than one campus? Enterprise is scoped with you on a call.",
    action: { label: "Book a Consultation", href: consult("ministry-enterprise") },
  },
  footnote: "Customization beyond the template is quoted separately.",
} as const;

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
      summary: "Your look and your level",
      description:
        "Together we choose the look, the level and the tools to link to, and agree on the facts Hope may use.",
    },
    {
      number: "03",
      title: "Implementation",
      summary: "Your site and platform built",
      description:
        "Genesis builds your website with your content and photos, sets up Hope and configures the platform for your level.",
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

export const ministryWebsiteCheck = {
  eyebrow: "Free offer",
  title: "A free Church Website Check.",
  body: "Send us your church's website. We look at it the way a first time guest does, on a phone, and send you a short, plain note on what to fix first. It is free, and there is no obligation.",
  checks: [
    "Service times and address on the first screen",
    "What to expect on a first Sunday",
    "A clear way to reach a person",
    "How it reads on a phone",
  ],
  action: { label: "Request a Website Check", href: consult("church-website-check") },
  note: "Add your church's website address in the notes field and we will take it from there.",
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
        "Only your pastors and your prayer team. Hope never answers a prayer request on its own. It thanks the person and hands the request to real people.",
    },
    {
      question: "What does the AI do, and what does it not do?",
      answer:
        "Genesis AI drafts and summarizes: a welcome note for a first time guest, a summary of the week's care, a suggested next step. It always waits for a person to approve. It does not send on its own, it does not counsel, and it does not answer prayer. Anyone in crisis gets a fixed reply written by people, with 988 and 911.",
    },
    {
      question: "Can we use our own photos?",
      answer:
        "Yes, and we hope you will. The previews use licensed stock photos so you can see each look. Your website is built with your own photos, your own words and your own times.",
    },
    {
      question: "What does customization cost?",
      answer:
        "Customization beyond the template is quoted separately, once we know what you want. Pricing for each level is set with Genesis on a call.",
    },
  ],
} as const;

export const ministryClose = {
  eyebrow: "Genesis Ministry",
  title: "Be ready for whoever walks in this Sunday.",
  line: "Book a consultation and we will walk through your church, the look that fits and the level to start with.",
  primary: ministryHero.primary,
  secondary: ministryHero.secondary,
  footnote: ministryEdition.disclaimer,
} as const;

/*
 * The contact page and consultation form, as a church sees them. A link with
 * a known Ministry topic (below) opens /contact in this version: church
 * words, church roles, and no business plans or prices.
 */
export const ministryContact = {
  intro: {
    eyebrow: "Genesis Ministry",
    title: "Start with a conversation about your church.",
    description: [
      "Tell us about your church and how guests find you today.",
      "The first conversation is free. We listen first, then suggest the look and the level that fit.",
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
      "A member app",
      "Social media",
      "Tools you already use",
    ],
    closingLead: "Not everything needs to change.",
    closing: "We look at what to keep, what to link to, and where Genesis could carry more of the work.",
  },
  form: {
    title: "A few details about your church.",
    lede: "This helps us prepare for the call. You do not need anything technical for the first conversation.",
    company: "Church Name",
    roles: ["Senior pastor", "Church staff", "Volunteer"],
    teamSize: "Staff Size",
    notes: "What would you like help with?",
    notesPlaceholder: "Tell us about your church, your website address and what you would like help with first.",
    success:
      "Genesis will reach out to confirm a time. The call is a conversation about your church, how guests find you and the tools you use today. If it looks like a fit, we will suggest a look and a level before anything is proposed in writing.",
  },
} as const;

/** The operation type a church's consultation is sent with. */
export const MINISTRY_OPERATION_TYPE = "Church";

/*
 * The starting note the contact form fills in for each Ministry topic, so a
 * church that clicks "Book a Consultation" or "Request a Website Check" does
 * not have to explain what it came for. Only these topics are recognized; any
 * other value leaves the note empty.
 */
export const ministryConsultationNotes: Readonly<Record<string, string>> = {
  ministry: "Genesis Ministry for our church. ",
  "ministry-demo": "A walkthrough of the Genesis Ministry demo. ",
  "ministry-welcome": "Genesis Ministry, Level 01 Welcome. ",
  "ministry-connect": "Genesis Ministry, Level 02 Connect. ",
  "ministry-shepherd": "Genesis Ministry, Level 03 Shepherd. ",
  "ministry-enterprise": "Genesis Ministry, Enterprise for more than one campus. ",
  "church-website-check": "Free Church Website Check. Our website address: ",
};

export function ministryConsultationNote(topic: unknown): string {
  return typeof topic === "string" && Object.hasOwn(ministryConsultationNotes, topic)
    ? ministryConsultationNotes[topic]
    : "";
}
