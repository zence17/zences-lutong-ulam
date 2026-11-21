"use client";

import { useEffect, useId, useState, type ReactElement } from "react";
import Image from "next/image";
import { isSafeImageSrc } from "@/lib/backupStorage";
import type { RecipeCategory } from "@/types/recipe";

interface DishIllustrationProps {
  category: RecipeCategory;
  slug?: string;
  image?: string;
  alt?: string;
  variant?: "card" | "hero";
}

type Palette = {
  from: string;
  to: string;
  ink: string;
  accent: string;
};

const DEFAULT_PALETTE: Palette = {
  from: "#FEF3C7",
  to: "#FDE68A",
  ink: "#9A3412",
  accent: "#C2410C",
};

const PALETTES: Record<RecipeCategory, Palette> = {
  Sabaw: { from: "#FEF3C7", to: "#FDE68A", ink: "#7C2D12", accent: "#C2410C" },
  Karne: { from: "#FFEDD5", to: "#FED7AA", ink: "#7C2D12", accent: "#C2410C" },
  "Prito / Gisa": { from: "#FEF9C3", to: "#FDE047", ink: "#92400E", accent: "#CA8A04" },
  Gulay: { from: "#DCFCE7", to: "#BBF7D0", ink: "#166534", accent: "#15803D" },
};

function paletteFor(category: RecipeCategory): Palette {
  return PALETTES[category] ?? DEFAULT_PALETTE;
}

function labelFor(category: RecipeCategory): string {
  switch (category) {
    case "Sabaw":
      return "Steaming palayok soup with calamansi";
    case "Karne":
      return "Braised meat in a kawali with bay leaf and garlic";
    case "Prito / Gisa":
      return "Golden fried ulam on a woven bilao";
    case "Gulay":
      return "Fresh vegetables with kalabasa and calamansi greens";
    default:
      return "Warm Filipino breakfast illustration";
  }
}

export function DishIllustration({
  category,
  slug,
  image,
  alt,
  variant = "card",
}: DishIllustrationProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  const reactId = useId().replace(/:/g, "");
  const safeSlug = (slug ?? category).replace(/[^a-zA-Z0-9-]/g, "");
  const baseId = `dish-${safeSlug}-${reactId}`;
  const ids = {
    bg: `${baseId}-bg`,
    glow: `${baseId}-glow`,
    weave: `${baseId}-weave`,
    dish: `${baseId}-dish`,
  };
  const palette = paletteFor(category);
  const label = labelFor(category);
  const seed = Array.from(slug ?? category).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  const garnishX = 314 + (seed % 22);
  const heightClass = variant === "hero" ? "h-32 sm:h-40" : "h-40";

  function renderScene(): ReactElement {
    switch (category) {
      case "Sabaw":
        return (
          <g>
            <g fill="none" stroke="#FFF7ED" strokeWidth="3" strokeLinecap="round" opacity="0.85">
              <path d="M169 62c-11-10 9-16-2-29" />
              <path d="M200 56c-12-12 10-18-2-33" />
              <path d="M231 62c-11-10 9-16-2-29" />
            </g>
            <ellipse cx="200" cy="139" rx="76" ry="10" fill="#7C2D12" opacity="0.15" />
            <path
              d="M143 96c-13 0-17 15-4 21M257 96c13 0 17 15 4 21"
              fill="none"
              stroke="#7C2D12"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path d="M142 86c2 37 24 55 58 55s56-18 58-55" fill={`url(#${ids.dish})`} />
            <path
              d="M142 86c2 37 24 55 58 55s56-18 58-55"
              fill="none"
              stroke="#7C2D12"
              strokeWidth="3"
              opacity="0.7"
            />
            <path d="M142 86h116" stroke="#7C2D12" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="200" cy="86" rx="58" ry="14" fill="#C2410C" />
            <ellipse cx="200" cy="84" rx="49" ry="10" fill="#FDBA74" />
            <path d="M169 84c18 8 44 8 62 0" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <path d="M180 91c12 4 28 4 40 0" stroke="#FDE68A" strokeWidth="2" fill="none" />
            <g fill="#15803D">
              <ellipse cx="181" cy="79" rx="5" ry="2.5" transform="rotate(-18 181 79)" />
              <ellipse cx="212" cy="82" rx="5" ry="2.5" transform="rotate(24 212 82)" />
              <ellipse cx="231" cy="78" rx="4" ry="2" transform="rotate(-12 231 78)" />
            </g>
            <g transform="translate(263 107) rotate(-16)">
              <circle r="15" fill="#FDE047" stroke="#65A30D" strokeWidth="3" />
              <path d="M0 0-11-7M0 0 10-8M0 0 12 7" stroke="#65A30D" strokeWidth="1.5" />
              <circle r="3" fill="#FEF9C3" />
            </g>
          </g>
        );
      case "Karne":
        return (
          <g>
            <g fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
              <path d="M133 55c-8-8 7-13-1-22" />
              <path d="M196 49c-9-9 8-14-1-24" />
              <path d="M250 57c-8-8 7-13-1-22" />
            </g>
            <path d="M106 100h180l-16 39H121z" fill="#7C2D12" opacity="0.35" />
            <path d="M284 91h64" stroke="#1F2937" strokeWidth="12" strokeLinecap="round" />
            <path d="M292 91h50" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="190" cy="92" rx="96" ry="28" fill="#1F2937" />
            <ellipse cx="190" cy="87" rx="87" ry="21" fill="#9A3412" />
            <ellipse cx="190" cy="83" rx="78" ry="16" fill="#C2410C" opacity="0.8" />
            <g stroke="#7C2D12" strokeWidth="2.5">
              <rect x="129" y="72" width="39" height="24" rx="8" transform="rotate(-12 148 84)" fill="#7C2D12" />
              <rect x="174" y="67" width="43" height="26" rx="9" transform="rotate(8 195 80)" fill="#92400E" />
              <rect x="219" y="75" width="38" height="23" rx="8" transform="rotate(-7 238 86)" fill="#7C2D12" />
            </g>
            <g fill="#FDBA74" opacity="0.75">
              <rect x="139" y="76" width="16" height="4" rx="2" transform="rotate(-12 147 78)" />
              <rect x="184" y="72" width="18" height="4" rx="2" transform="rotate(8 193 74)" />
              <rect x="228" y="79" width="15" height="4" rx="2" transform="rotate(-7 235 81)" />
            </g>
            <g>
              <ellipse cx="213" cy="94" rx="21" ry="8" transform="rotate(18 213 94)" fill="#365314" />
              <path d="M196 100c12-6 25-6 37-10" stroke="#A3E635" strokeWidth="1.5" fill="none" opacity="0.8" />
            </g>
            <g fill="#FFEDD5">
              <ellipse cx="156" cy="101" rx="7" ry="4" transform="rotate(-20 156 101)" />
              <ellipse cx="173" cy="105" rx="6" ry="3.5" transform="rotate(12 173 105)" />
              <ellipse cx="250" cy="100" rx="7" ry="4" transform="rotate(-14 250 100)" />
            </g>
          </g>
        );
      case "Prito / Gisa":
        return (
          <g>
            <g fill="none" stroke="#FFF7ED" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
              <path d="M150 59c-9-9 8-14-1-24" />
              <path d="M200 52c-10-10 9-15-1-27" />
              <path d="M249 59c-9-9 8-14-1-24" />
            </g>
            <ellipse cx="200" cy="121" rx="114" ry="24" fill="#A16207" opacity="0.2" />
            <ellipse cx="200" cy="111" rx="110" ry="29" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
            <ellipse cx="200" cy="107" rx="96" ry="22" fill="#FEF9C3" stroke="#EAB308" strokeWidth="2" />
            <g stroke="#CA8A04" strokeWidth="1.5" opacity="0.55">
              <path d="M104 107h192M114 96h172M114 118h172" />
              <path d="M124 88l152 38M154 84l92 46M276 88 124 126M246 84l-92 46" />
            </g>
            <g stroke="#B45309" strokeWidth="3">
              <rect x="132" y="76" width="116" height="17" rx="8.5" transform="rotate(-10 190 84)" fill="#F59E0B" />
              <rect x="148" y="93" width="112" height="17" rx="8.5" transform="rotate(9 204 101)" fill="#FBBF24" />
            </g>
            <g stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.9">
              <path d="M150 79l78-13M168 96l76 13" />
            </g>
            <g>
              <circle cx="285" cy="96" r="8" fill="#DC2626" />
              <path d="M285 88c5-5 11-4 14 0-5 3-9 3-14 0" fill="#15803D" />
            </g>
          </g>
        );
      case "Gulay":
        return (
          <g>
            <g fill="none" stroke="#15803D" strokeWidth="5" strokeLinecap="round">
              <path d="M104 108c34-30 71-34 104-16" />
              <path d="M117 125c36-25 75-24 108-3" />
              <path d="M132 92c26-20 57-24 82-12" />
            </g>
            <g fill="#22C55E">
              <ellipse cx="123" cy="88" rx="18" ry="9" transform="rotate(-28 123 88)" />
              <ellipse cx="151" cy="76" rx="20" ry="10" transform="rotate(18 151 76)" />
              <ellipse cx="178" cy="88" rx="18" ry="9" transform="rotate(-16 178 88)" />
              <ellipse cx="141" cy="112" rx="17" ry="8" transform="rotate(28 141 112)" />
              <ellipse cx="174" cy="119" rx="18" ry="9" transform="rotate(-12 174 119)" />
            </g>
            <g stroke="#16A34A" strokeWidth="1.5" opacity="0.8">
              <path d="M108 90h29M137 77h28M165 88h26M128 113h27M160 119h28" />
            </g>
            <g transform="translate(250 93)">
              <path d="M-35 8a35 35 0 0 1 70 0z" fill="#F97316" />
              <path d="M-27 8a27 27 0 0 1 54 0z" fill="#FDBA74" />
              <path d="M-35 8h70" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
              <g fill="#EA580C">
                <ellipse cx="-12" cy="-5" rx="2.5" ry="4" transform="rotate(-18 -12 -5)" />
                <ellipse cx="1" cy="-10" rx="2.5" ry="4" />
                <ellipse cx="14" cy="-5" rx="2.5" ry="4" transform="rotate(18 14 -5)" />
              </g>
            </g>
            <g fill="#FEF3C7" stroke="#CA8A04" strokeWidth="1.5">
              <ellipse cx="306" cy="112" rx="7" ry="4" transform="rotate(-18 306 112)" />
              <ellipse cx="322" cy="105" rx="6" ry="3.5" transform="rotate(16 322 105)" />
            </g>
          </g>
        );
      default:
        return (
          <g>
            <g fill="none" stroke="#FFF7ED" strokeWidth="3" strokeLinecap="round" opacity="0.85">
              <path d="M162 61c-10-10 8-16-2-28" />
              <path d="M196 55c-11-11 9-17-2-30" />
            </g>
            <ellipse cx="160" cy="137" rx="54" ry="9" fill="#7C2D12" opacity="0.14" />
            <path d="M113 87h94l-10 43h-74z" fill="#C2410C" />
            <ellipse cx="160" cy="87" rx="47" ry="11" fill="#FDBA74" />
            <path d="M207 94c23-4 24 26 1 27" fill="none" stroke="#C2410C" strokeWidth="8" />
            <path d="M143 84c11 6 24 6 35 0" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <g transform="translate(277 104)">
              <path d="M-45 0a45 25 0 0 0 90 0z" fill="#FEF3C7" stroke="#CA8A04" strokeWidth="3" />
              <ellipse cy="0" rx="45" ry="11" fill="#FFEDD5" stroke="#CA8A04" strokeWidth="2" />
              <circle cx="-13" cy="-3" r="6" fill="#7C2D12" />
              <circle cx="9" cy="2" r="5" fill="#92400E" />
            </g>
          </g>
        );
    }
  }

  return (
    <div className={`relative w-full overflow-hidden ${heightClass}`}>
      {image && isSafeImageSrc(image) && !imgError ? (
        <>
          <Image
            src={image}
            alt={alt ?? `${category} dish`}
            width={400}
            height={160}
            loading={variant === "hero" ? undefined : "lazy"}
            priority={variant === "hero"}
            unoptimized
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
        </>
      ) : (
        <svg
          role="img"
          viewBox="0 0 400 160"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full"
          focusable="false"
        >
          <title>{label}</title>
          <defs>
            <linearGradient id={ids.bg} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.from} />
              <stop offset="100%" stopColor={palette.to} />
            </linearGradient>
            <radialGradient id={ids.glow} cx="0.8" cy="0.15" r="0.85">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.dish} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.accent} />
              <stop offset="100%" stopColor={palette.ink} />
            </linearGradient>
            <pattern
              id={ids.weave}
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <path
                d="M0 0H28M0 14H28M0 0V28M14 0V28"
                stroke={palette.ink}
                strokeWidth="1"
                fill="none"
                opacity="0.35"
              />
              <path
                d="M0 0 28 28M28 0 0 28"
                stroke={palette.accent}
                strokeWidth="1"
                fill="none"
                opacity="0.25"
              />
              <rect x="12" y="12" width="4" height="4" fill={palette.accent} opacity="0.2" />
            </pattern>
          </defs>
          <rect width="400" height="160" fill={`url(#${ids.bg})`} />
          <rect width="400" height="160" fill={`url(#${ids.weave})`} opacity="0.3" />
          <circle cx="330" cy="24" r="70" fill={`url(#${ids.glow})`} />
          {renderScene()}
          <g opacity="0.55">
            <circle cx={garnishX} cy="32" r="3" fill={palette.accent} />
            <circle cx={garnishX + 16} cy="21" r="2" fill={palette.ink} />
            <circle cx={garnishX - 12} cy="19" r="1.5" fill={palette.ink} />
          </g>
        </svg>
      )}
    </div>
  );
}
