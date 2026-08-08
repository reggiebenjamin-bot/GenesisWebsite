import Link from "next/link";
import { contact, navigation } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>
            Managed systems that help real-estate operators work faster and close
            more deals.
          </p>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <div className="footer-links">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          <div className="footer-links">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={`tel:${contact.phoneHref}`}>{contact.phoneDisplay}</a>
          </div>
        </div>
        <div>
          <p className="footer-label">Follow</p>
          <div className="footer-links">
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={contact.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} Genesis AI. All rights reserved.</p>
        <p>Designed for clarity. Managed for continuity.</p>
      </div>
    </footer>
  );
}
