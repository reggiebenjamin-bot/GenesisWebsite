import Link from "next/link";
import { contact, navigation } from "@/lib/content";
import { Logo } from "./Logo";

const columnLabel =
  "font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase text-ivory/55";
const columnLink =
  "text-[0.92rem] text-ivory/72 transition-colors duration-200 hover:text-gold-light";

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-ink pt-20 pb-6 text-ivory">
      <div className="shell grid gap-[clamp(40px,7vw,110px)] pb-[70px] md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="max-lg:col-span-full">
          <Logo light />
          <p className="mt-5 max-w-sm text-[0.95rem] text-ivory/62">
            Managed systems that help real-estate operators work faster and
            close more deals.
          </p>
        </div>

        <div>
          <p className={columnLabel}>Explore</p>
          <div className="mt-5 grid gap-3">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={columnLink}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className={columnLink}>
              Contact
            </Link>
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

      <div className="shell flex justify-between gap-6 border-t border-line-dark pt-6 text-[0.76rem] text-ivory/42 max-md:flex-col">
        <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
        <p>Designed for clarity. Managed for continuity.</p>
      </div>
    </footer>
  );
}
