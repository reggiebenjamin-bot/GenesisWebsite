import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-runtime">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-1000 -translate-y-[150%] bg-ivory px-4 py-2.5 text-ink transition-transform duration-200 focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
