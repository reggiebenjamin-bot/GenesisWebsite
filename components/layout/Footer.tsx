import Link from "next/link";
import { contact, navigation, navigationLinks } from "@/lib/content";
import { genesisPositioning, genesisTools, offerPaths } from "@/lib/offers";
import { Logo } from "./Logo";

const columnLabel =
  "font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase text-ivory/55";
const columnLink =
  "text-[0.92rem] text-ivory/72 transition-colors duration-200 hover:text-gold-light";

/* The page dedicated to each path, by the name of its offer. The toggle's
   labels lead to each path's homepage instead. */
const pathPages = offerPaths.map((path) => ({ label: path.product, href: path.href }));

/* Each tool's own page, linked from every page of the site. */
const toolPages = genesisTools.map((tool) => ({ label: tool.name, href: `/tools/${tool.id}` }));

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-ink pt-20 pb-6 text-ivory">
      <div className="shell grid gap-x-[clamp(32px,5vw,80px)] gap-y-12 pb-[70px] sm:grid-cols-2 lg:grid-cols-[1.8fr_repeat(4,1fr)]">
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
            {[...pathPages, ...navigationLinks(navigation)].map((item) => (
              <Link key={item.href} href={item.href} className={columnLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className={columnLabel}>Tools</p>
          <div className="mt-5 grid gap-3">
            {toolPages.map((item) => (
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

      <div className="shell flex justify-between gap-6 border-t border-line-dark pt-6 text-[0.8rem] text-ivory/62 max-md:flex-col">
        <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
        <p>Tools help you do the task. Managed AI helps your business operate.</p>
      </div>
    </footer>
  );
}
