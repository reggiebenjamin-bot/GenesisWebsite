/**
 * Structured data for the page it sits on. Rendered as a plain script tag in
 * the server HTML, so crawlers read it without running any JavaScript. `<` is
 * escaped so no value can close the tag early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
