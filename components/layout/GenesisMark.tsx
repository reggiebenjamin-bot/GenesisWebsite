import Image from "next/image";

/** The two files of the one Genesis mark. Same paths, same gradient direction. */
export const genesisMarkSrc = {
  /** The gold gradient G for ink, navy and dark photos. */
  dark: "/brand/mark-gold.svg",
  /** The same G in a deeper gold, for ivory, paper and white. */
  light: "/brand/mark-gold-on-light.svg",
} as const;

/**
 * The Genesis G. It is always the gold gradient G, never white: pick the file
 * by the ground it sits on. Both files are cropped tight to the G (891 by 707),
 * so size it by height (for example `h-6 w-auto`) and let the width follow.
 * It is decorative here; the link or the word beside it carries the name.
 */
export function GenesisMark({
  ground = "dark",
  className,
  loading,
  fetchPriority,
}: {
  ground?: keyof typeof genesisMarkSrc;
  className: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <Image
      src={genesisMarkSrc[ground]}
      alt=""
      width={891}
      height={707}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  );
}
