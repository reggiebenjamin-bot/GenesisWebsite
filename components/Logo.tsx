import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand-lockup ${light ? "brand-lockup--light" : ""}`}
      aria-label="Genesis AI home"
    >
      <Image
        className="brand-mark"
        src="/brand/genesis-logo.svg"
        alt=""
        width={42}
        height={42}
        priority
      />
      <span className="brand-type">
        <span className="brand-word">Genesis</span>
        <span className="brand-ai">AI</span>
      </span>
    </Link>
  );
}
