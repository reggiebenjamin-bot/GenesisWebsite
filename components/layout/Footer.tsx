import Link from "next/link";
import { TrackClick } from "@/components/ui/TrackClick";
import { contact, navigation, navigationLinks, uniqueByHref, type NavItem } from "@/lib/content";
import { allEditions } from "@/lib/editions";
import { FooterDisclaimer, FooterTagline } from "./FooterDisclaimer";
import { Logo } from "./Logo";

const columnLabel =
  "font-display text-[0.75rem] leading-[1.4] font-semibold tracking-[0.12em] uppercase text-ivory/72";
/* Every footer link is a full 44px target, at least 44px wide, with the rows set close together. */
const columnLink =
  "inline-flex min-h-11 min-w-11 w-fit items-center text-[0.92rem] text-ivory/72 transition-colors duration-200 hover:text-gold-light";

/* All five Genesis OS editions, Ministry included, each with its own page, and the church assessment beside Ministry. */
const editionPages = [
  ...allEditions.map((edition) => ({
    label: edition.name.replace(/^Genesis /, ""),
    href: edition.href,
  })),
  { label: "Church Assessment", href: "/assessment?for=church" },
];

/* The assessment first, then how Genesis works and what it costs. */
const productPages = [
  { label: "Free Assessment", href: "/assessment" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "AI Employees", href: "/ai-employees" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Is Built", href: "/solutions" },
];

/* The two consults and the classes, under their own label, so they never read as editions. */
/* /classes is static HTML in public/ served by a rewrite, not an App Router route, so it gets a
   plain <a>: next/link would prefetch it as RSC and log a 404. */
const STATIC_PAGES = new Set(["/classes"]);
const toolPages = [
  { label: "Capital Desk", href: "/capital-desk" },
  { label: "Leadscout", href: "/leadscout" },
  { label: "Classes", href: "/classes" },
];

const companyPages = [
  ...navigationLinks(navigation).filter((link) => ["/about", "/results", "/contact"].includes(link.href)),
  { label: "Blog", href: "/blog" },
];

/* Where Genesis works, in one line under the columns. */
const serviceAreas = [
  { label: "Texas", href: "/texas" },
  { label: "Texas Service Businesses", href: "/texas/service-businesses" },
];

/*
 * The columns of destinations. The navigation repeats some of them, so the
 * whole set is de-duplicated once, in order, and each destination is listed
 * in the first column that claims it.
 */
const allLinks = uniqueByHref([
  ...editionPages,
  ...productPages,
  ...companyPages,
  ...toolPages,
  ...navigationLinks(navigation),
  ...serviceAreas,
]);
const claimed = new Set<string>();
const inColumn = (column: readonly NavItem[]) =>
  allLinks.filter((link) => {
    if (claimed.has(link.href) || !column.some((item) => item.href === link.href)) return false;
    claimed.add(link.href);
    return true;
  });
const columns = [
  { label: "Editions", links: inColumn(editionPages) },
  { label: "Product", links: inColumn(productPages) },
  { label: "Company", links: inColumn(companyPages) },
  { label: "Tools and classes", links: inColumn(toolPages) },
];

/* The legal row holds only the legal pages. */
const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-ink pt-20 pb-6 text-ivory">
      <TrackClick event="assessment_link_clicked" from="footer" selector="a[href^='/assessment']">
        {/* Two columns on a phone, so the footer is a few screens shorter. */}
        <div className="shell grid grid-cols-2 gap-x-[clamp(20px,3vw,56px)] gap-y-9 pb-[56px] sm:grid-cols-3 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
          <div className="max-lg:col-span-full">
            {/* The G alone, as in the header. */}
            <Logo light wordmark={false} priority={false} />
            <FooterTagline />
          </div>

          {columns.map((column) => (
            <div key={column.label}>
              <p className={columnLabel}>{column.label}</p>
              <div className="mt-3 grid">
                {column.links.map((item) =>
                  STATIC_PAGES.has(item.href) ? (
                    <a key={item.href} href={item.href} className={columnLink}>
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} className={columnLink}>
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}

          <div className="max-sm:col-span-full">
            <p className={columnLabel}>Contact</p>
            <div className="mt-3 grid">
              <a href={`mailto:${contact.email}`} className={columnLink}>
                {contact.email}
              </a>
              <a href={`tel:${contact.phoneHref}`} className={columnLink}>
                {contact.phoneDisplay}
              </a>
            </div>
            <p className={`${columnLabel} mt-6`}>Follow</p>
            <div className="mt-3 grid">
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className={columnLink}>
                LinkedIn
              </a>
              <a href={contact.facebook} target="_blank" rel="noreferrer" className={columnLink}>
                Facebook
              </a>
            </div>
          </div>
        </div>
      </TrackClick>

      <div className="shell border-t border-line-dark pt-4 text-[0.875rem] text-ivory/66">
        <div className="flex flex-wrap items-center gap-x-6">
          <span className="text-ivory/55">Service areas</span>
          {serviceAreas.map((item) => (
            <Link key={item.href} href={item.href} className={columnLink}>
              {item.label}
            </Link>
          ))}
        </div>
        {/* One baseline: copyright, the legal links, then the one disclaimer. */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-line-dark pt-3">
          <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className={columnLink}>
                {item.label}
              </Link>
            ))}
          </div>
          <FooterDisclaimer />
        </div>
      </div>
    </footer>
  );
}
