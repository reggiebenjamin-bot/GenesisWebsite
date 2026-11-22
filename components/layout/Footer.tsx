import Link from "next/link";
import { softwareDisclaimer } from "@/lib/aiEmployees";
import { contact, navigation, navigationLinks } from "@/lib/content";
import { editions, ministryEdition } from "@/lib/editions";
import { genesisPositioning, offerPaths } from "@/lib/offers";
import { Logo } from "./Logo";

const columnLabel =
  "font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase text-ivory/55";
const columnLink =
  "text-[0.92rem] text-ivory/72 transition-colors duration-200 hover:text-gold-light";

/* Managed AI, linked from every page. */
const pathPages = offerPaths
  .filter((path) => path.id === "custom-infrastructure")
  .map((path) => ({ label: path.product, href: path.href }));

/* The Genesis OS editions, each with its own landing page. Ministry is not on
   the homepage yet, so the footer is how every page links to it. */
const editionPages = [...editions, ministryEdition].map((edition) => ({
  label: edition.name.replace(/^Genesis /, ""),
  href: edition.href,
}));

/* Legal pages and the classes index, linked from the bottom bar. */

const consultPages = [
  { label: "Capital Desk", href: "/capital-desk" },
  { label: "Leadscout", href: "/leadscout" },
];
const bottomLinks = [
  { label: "Classes", href: "/classes" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-ink pt-20 pb-6 text-ivory">
      <div className="shell grid gap-x-[clamp(32px,5vw,80px)] gap-y-12 pb-[70px] sm:grid-cols-2 lg:grid-cols-[1.8fr_repeat(3,1fr)]">
        <div className="max-lg:col-span-full">
          <Logo light />
          <p className="mt-6 font-display text-[0.66rem] leading-[1.5] tracking-[0.16em] text-gold uppercase">
            {genesisPositioning.category}
          </p>
          <p className="mt-3 max-w-sm text-[0.95rem] text-ivory/62">
            {genesisPositioning.brandDescription}
          </p>
        </div>

        <div>
          <p className={columnLabel}>Explore</p>
          <div className="mt-5 grid gap-3">
            {[...pathPages, ...editionPages, ...consultPages, { label: "Texas", href: "/texas" }, { label: "Texas service businesses", href: "/texas/service-businesses" }, ...navigationLinks(navigation), { label: "Blog", href: "/blog" }].map((item) => (
              <Link key={item.href} href={item.href} className={columnLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className={columnLabel}>Contact</p>
          <div className="mt-5 grid gap-3">
            <a href={`mailto:${contact.email}`} className={columnLink}>
              {contact.email}
            </a>
            <a href={`tel:${contact.phoneHref}`} className={columnLink}>
              {contact.phoneDisplay}
            </a>
          </div>
        </div>

        <div>
          <p className={columnLabel}>Follow</p>
          <div className="mt-5 grid gap-3">
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className={columnLink}
            >
              LinkedIn
            </a>
            <a
              href={contact.facebook}
              target="_blank"
              rel="noreferrer"
              className={columnLink}
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="shell border-t border-line-dark pt-6 text-[0.8rem] text-ivory/62">
        <div className="flex justify-between gap-6 max-md:flex-col">
          <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
          <p>Managed AI helps your business operate.</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {bottomLinks.map((item) => (
            <Link key={item.href} href={item.href} className={columnLink}>
              {item.label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-center">{softwareDisclaimer}</p>
      </div>
    </footer>
  );
}
