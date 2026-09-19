import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** The size every generated social preview is drawn at. */
export const ogSize = { width: 1200, height: 630 };

const INK = "#08090e";
const IVORY = "#f4efe8";
const GOLD = "#c9a55e";
const GOLD_LIGHT = "#f2d895";

/**
 * A social preview in the site's own look: the mark, a gold label, the page's
 * name large, one line under it, and a footer line. Drawn once at build time.
 * The default typeface is used because the site's fonts ship only as woff2,
 * which the image renderer cannot read.
 */
export async function ogCard({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
}) {
  const logo = await readFile(join(process.cwd(), "public/brand/genesis-logo-gradient.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `radial-gradient(circle at 88% 0%, rgba(201,165,94,0.22), transparent 55%), ${INK}`,
          color: IVORY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not a page */}
          <img src={logoSrc} width={56} height={56} alt="" />
          <span style={{ fontSize: 26, letterSpacing: "0.02em", color: IVORY }}>Genesis AI</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: IVORY,
            }}
          >
            {title}
          </span>
          <span
            style={{
              marginTop: 26,
              maxWidth: 900,
              fontSize: 34,
              lineHeight: 1.25,
              color: "rgba(244,239,232,0.72)",
            }}
          >
            {subtitle}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 26,
            borderTop: "1px solid rgba(201,165,94,0.35)",
            fontSize: 24,
          }}
        >
          <span style={{ color: GOLD_LIGHT }}>{footer}</span>
          <span style={{ color: "rgba(244,239,232,0.55)" }}>geai.us</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
