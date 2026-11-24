import Link from "next/link";
import { contact, navigation, navigationLinks, uniqueByHref, type NavItem } from "@/lib/content";
import { allEditions } from "@/lib/editions";
import { genesisPositioning, offerPaths } from "@/lib/offers";
import { FooterDisclaimer } from "./FooterDisclaimer";
import { Logo } from "./Logo";

const columnLabel =
  "font-display text-[0.75rem] leading-[1.4] font-semibold tracking-[0.14em] uppercase text-ivory/72";
/* Every footer link is a full 44px target, with the rows set close together. */
const columnLink =
  "inline-flex min-h-11 w-fit items-center text-[0.92rem] text-ivory/72 transition-colors duration-200 hover:text-gold-light";

/* All five Genesis OS editions, Ministry included, each with its own page, and the church assessment beside Ministry. */
const editionPages = [
  ...allEditions.map((edition) => ({
    label: edition.name.replace(/^Genesis /, ""),
    href: edition.href,
  })),
  { label: "Church Assessment", href: "/assessment?for=church" },
];

/* Managed AI, linked from every page, then the product pages and the two consults. */
const productPages = [
  { label: "Free Assessment", href: "/assessment" },
  ...offerPaths
    .filter((path) => path.id === "custom-infrastructure")
    .map((path) => ({ label: path.product, href: path.href })),
  { label: "How It Works", href: "/how-it-works" },
  { label: "AI Employees", href: "/ai-employees" },
  { label: "Pricing", href: "/pricing" },
  { label: "Capital Desk", href: "/capital-desk" },
  { label: "Leadscout", href: "/leadscout" },
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
 * Three columns of destinations. The navigation repeats some of them, so the
 * whole set is de-duplicated once, in order, and each destination is listed
 * in the first column that claims it.
 */
const allLinks = uniqueByHref([...editionPages, ...productPages, ...companyPages, ...navigationLinks(navigation), ...serviceAreas]);
const inColumn = (column: readonly NavItem[]) =>
  allLinks.filter((link) => column.some((item) => item.href === link.href));
const columns = [
  { label: "Editions", links: inColumn(editionPages) },
  { label: "Product", links: inColumn(productPages).filter((link) => !editionPages.some((e) => e.href === link.href)) },
  {
    label: "Company",
    links: inColumn(companyPages).filter(
      (link) => !editionPages.some((e) => e.href === link.href) && !productPages.some((p) => p.href === link.href),
    ),
  },
];

const bottomLinks = [
  { label: "Classes", href: "/classes" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-ink pt-20 pb-6 text-ivory">
      <div className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-10 pb-[70px] sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="max-lg:col-span-full">
          <Logo light priority={false} />
          <p className="mt-6 font-display text-[0.66rem] leading-[1.5] tracking-[0.16em] text-gold uppercase">
            {genesisPositioning.category}
          </p>
          <p className="mt-3 max-w-sm text-[0.95rem] text-ivory/62">
            {genesisPositioning.brandDescription}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.label}>
            <p className={columnLabel}>{column.label}</p>
            <div className="mt-3 grid">
              {column.links.map((item) => (
                <Link key={item.href} href={item.href} className={columnLink}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
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

      <div className="shell border-t border-line-dark pt-4 text-[0.84rem] text-ivory/66">
        <div className="flex flex-wrap items-center gap-x-6">
          <span className="text-ivory/55">Service areas</span>
          {serviceAreas.map((item) => (
            <Link key={item.href} href={item.href} className={columnLink}>
              {item.label}
            </Link>
          ))}
        </div>
        {/* One baseline: copyright, the legal links, then the line. */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-line-dark pt-3">
          <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6">
            {bottomLinks.map((item) => (
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
