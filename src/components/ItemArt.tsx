import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ilustrações (SVG) para itens da Loja Verde, avatares e emblemas.
 * Quanto maior o preço do item, mais detalhada é a arte: molduras,
 * raios, joias e brilhos são adicionados por camada.
 */

export type ArtMotif =
  | "leaf"
  | "sprout"
  | "droplets"
  | "trees"
  | "globe"
  | "shield"
  | "shield-check"
  | "trophy"
  | "award"
  | "crown"
  | "palette"
  | "package"
  | "package-open"
  | "gift";

const PALETTE = {
  base: "#F7F5E9",
  leaf: "#A8C928",
  deep: "#3E571C",
  dark: "#26321B",
  water: "#4FA3C4",
  gold: "#E4B429",
  bark: "#8A6A3B",
};

function tierOf(price: number) {
  if (price >= 1500) return 4;
  if (price >= 800) return 3;
  if (price >= 300) return 2;
  if (price >= 150) return 1;
  return 0;
}

function Motif({ motif }: { motif: ArtMotif }): ReactNode {
  switch (motif) {
    case "sprout":
      return (
        <g>
          <path d="M50 74V48" stroke={PALETTE.deep} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 54c-12 0-18-7-18-16 10-1 18 5 18 16Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2" />
          <path d="M50 50c11-2 16-9 15-18-10 0-17 7-15 18Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2" />
        </g>
      );
    case "leaf":
      return (
        <g>
          <path
            d="M68 30C46 30 30 44 30 64c0 4 1 7 2 10 16 4 38-8 38-32 0-4 0-8-2-12Z"
            fill={PALETTE.leaf}
            stroke={PALETTE.deep}
            strokeWidth="2.5"
          />
          <path d="M64 34 34 72" stroke={PALETTE.deep} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "droplets":
      return (
        <g>
          <path d="M50 26c12 16 18 25 18 33a18 18 0 1 1-36 0c0-8 6-17 18-33Z" fill={PALETTE.water} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="M42 58c0 7 4 11 9 12" stroke={PALETTE.base} strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </g>
      );
    case "trees":
      return (
        <g>
          <path d="M36 60 50 30l14 30Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 72 50 44l18 28Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M50 72v10" stroke={PALETTE.bark} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "globe":
      return (
        <g>
          <circle cx="50" cy="52" r="22" fill={PALETTE.water} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="M28 52h44M50 30c8 10 8 34 0 44M50 30c-8 10-8 34 0 44" stroke={PALETTE.base} strokeWidth="2" fill="none" />
          <path d="M38 44c6 3 10 1 14 5s10 2 12 8" stroke={PALETTE.leaf} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "shield":
    case "shield-check":
      return (
        <g>
          <path d="M50 26 72 34v18c0 14-10 22-22 26-12-4-22-12-22-26V34Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" />
          {motif === "shield-check" ? (
            <path d="m40 52 8 8 14-16" stroke={PALETTE.base} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M50 40c-8 4-10 10-4 16 6-2 8-8 4-16Z" fill={PALETTE.base} />
          )}
        </g>
      );
    case "trophy":
      return (
        <g>
          <path d="M36 28h28v14c0 9-6 15-14 15s-14-6-14-15Z" fill={PALETTE.gold} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="M36 32h-8c0 9 4 13 9 14M64 32h8c0 9-4 13-9 14" stroke={PALETTE.deep} strokeWidth="2.5" fill="none" />
          <path d="M50 57v11M40 76h20" stroke={PALETTE.deep} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "award":
      return (
        <g>
          <circle cx="50" cy="44" r="16" fill={PALETTE.gold} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="m40 58-4 20 14-8 14 8-4-20" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="m50 36 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill={PALETTE.base} />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M28 66 24 34l14 12 12-18 12 18 14-12-4 32Z" fill={PALETTE.gold} stroke={PALETTE.deep} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M28 72h44" stroke={PALETTE.deep} strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="56" r="4" fill={PALETTE.leaf} />
        </g>
      );
    case "palette":
      return (
        <g>
          <path d="M50 26c14 0 24 10 24 22 0 8-7 9-11 12-3 3 0 8-5 10-13 4-30-8-30-24 0-12 8-20 22-20Z" fill={PALETTE.base} stroke={PALETTE.deep} strokeWidth="2.5" />
          <circle cx="41" cy="42" r="4" fill={PALETTE.leaf} />
          <circle cx="55" cy="38" r="4" fill={PALETTE.water} />
          <circle cx="62" cy="50" r="4" fill={PALETTE.gold} />
        </g>
      );
    case "package":
    case "package-open":
      return (
        <g>
          <path d="M28 44h44v30H28Z" fill={PALETTE.bark} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="M28 44 50 32l22 12" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M50 32v42" stroke={PALETTE.gold} strokeWidth="5" />
        </g>
      );
    case "gift":
    default:
      return (
        <g>
          <path d="M28 46h44v28H28Z" fill={PALETTE.leaf} stroke={PALETTE.deep} strokeWidth="2.5" />
          <path d="M50 46v28M28 46l6-12 16 12M72 46l-6-12-16 12" stroke={PALETTE.gold} strokeWidth="4" fill="none" strokeLinejoin="round" />
        </g>
      );
  }
}

export function ItemArt({
  motif,
  price = 0,
  className,
  label,
}: {
  motif: ArtMotif;
  price?: number;
  className?: string;
  label?: string;
}) {
  const tier = tierOf(price);
  const ringColor = tier >= 3 ? PALETTE.gold : tier >= 2 ? PALETTE.deep : PALETTE.leaf;

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-16 w-16", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={`bg-${motif}-${tier}`} cx="50%" cy="35%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={tier >= 3 ? "#EDE7C6" : PALETTE.base} />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill={`url(#bg-${motif}-${tier})`} stroke={ringColor} strokeWidth={tier >= 2 ? 3 : 2} />

      {tier >= 1 ? <circle cx="50" cy="50" r="41" fill="none" stroke={ringColor} strokeWidth="1.5" opacity=".6" /> : null}

      {tier >= 2 ? (
        <g opacity=".85">
          {Array.from({ length: 12 }).map((_, index) => (
            <circle
              key={index}
              cx={50 + 44 * Math.cos((index / 12) * Math.PI * 2)}
              cy={50 + 44 * Math.sin((index / 12) * Math.PI * 2)}
              r="2"
              fill={ringColor}
            />
          ))}
        </g>
      ) : null}

      {tier >= 3 ? (
        <g opacity=".9">
          {Array.from({ length: 24 }).map((_, index) => {
            const angle = (index / 24) * Math.PI * 2;
            return (
              <line
                key={index}
                x1={50 + 36 * Math.cos(angle)}
                y1={50 + 36 * Math.sin(angle)}
                x2={50 + 47 * Math.cos(angle)}
                y2={50 + 47 * Math.sin(angle)}
                stroke={PALETTE.gold}
                strokeWidth="1.2"
                opacity=".55"
              />
            );
          })}
        </g>
      ) : null}

      {tier >= 4 ? (
        <g>
          <path d="M50 4 53 12 61 9l-4 8 8 3-8 3 4 8-8-3-3 8-3-8-8 3 4-8-8-3 8-3-4-8 8 3Z" fill={PALETTE.gold} opacity=".9" />
          <circle cx="14" cy="70" r="3" fill={PALETTE.gold} />
          <circle cx="86" cy="70" r="3" fill={PALETTE.gold} />
        </g>
      ) : null}

      <Motif motif={motif} />
    </svg>
  );
}

export function toMotif(icon: string | null | undefined): ArtMotif {
  const list: ArtMotif[] = [
    "leaf",
    "sprout",
    "droplets",
    "trees",
    "globe",
    "shield",
    "shield-check",
    "trophy",
    "award",
    "crown",
    "palette",
    "package",
    "package-open",
    "gift",
  ];
  return list.includes(icon as ArtMotif) ? (icon as ArtMotif) : "leaf";
}
