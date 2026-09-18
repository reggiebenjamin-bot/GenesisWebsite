"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

/**
 * Writes the path-choosing script straight into the server HTML, so the
 * browser runs it while parsing, before first paint. It is never part of the
 * client React tree: rendering a <script> there is not executed and React
 * reports it as an error.
 */
export function OfferPathBootstrap({ script }: { script: string }) {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    // The callback runs on every streamed flush; the script belongs once.
    if (inserted.current) return null;
    inserted.current = true;
    return <script id="offer-path" dangerouslySetInnerHTML={{ __html: script }} />;
  });

  return null;
}
