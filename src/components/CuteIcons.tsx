import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function LuvcartIcon({ size = 28, ...props }: IconProps) {
  const gid = `luvGlow-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <path
        d="M14 18h6l3.2 18.5a4 4 0 003.9 3.3h18.2a4 4 0 003.9-3.1L52 24H22"
        stroke="#FF4F9A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="28" cy="50" r="4" fill="#FF7EB6" />
      <circle cx="44" cy="50" r="4" fill="#FF7EB6" />
      <path
        d="M34 12s-6 4-6 9c0 4 3 6 6 8 3-2 6-4 6-8 0-5-6-9-6-9z"
        fill={`url(#${gid})`}
      />
      <defs>
        <radialGradient id={gid} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 16) rotate(65) scale(14 12)">
          <stop stopColor="#FFB7E2" />
          <stop offset="1" stopColor="#FF4F9A" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** @deprecated use LuvcartIcon */
export const BerryIcon = LuvcartIcon;

export function HeartIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <path
        d="M32 54S10 40 10 24c0-8 6-14 14-14 5 0 8 2 8 2s3-2 8-2c8 0 14 6 14 14 0 16-22 30-22 30z"
        fill="#FF6BA8"
      />
      <path d="M20 24c2-6 8-8 11-6" stroke="#FFD0E8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <path d="M32 6l4 18 18 4-18 4-4 18-4-18-18-4 18-4 4-18z" fill="#FFD66B" />
      <circle cx="50" cy="14" r="4" fill="#FF9ED0" />
      <circle cx="12" cy="46" r="3" fill="#B8F0FF" />
    </svg>
  );
}

export function FlowerIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <circle cx="32" cy="18" r="9" fill="#FF9ED0" />
      <circle cx="18" cy="28" r="9" fill="#FFB4DE" />
      <circle cx="46" cy="28" r="9" fill="#FFB4DE" />
      <circle cx="22" cy="44" r="9" fill="#FFC7E8" />
      <circle cx="42" cy="44" r="9" fill="#FFC7E8" />
      <circle cx="32" cy="32" r="8" fill="#FFE66B" />
    </svg>
  );
}

export function LockCuteIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <rect x="14" y="28" width="36" height="28" rx="8" fill="#FF8EC8" />
      <path d="M22 28v-8a10 10 0 1120 0v8" stroke="#C45A95" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="42" r="4" fill="#FFF0F7" />
    </svg>
  );
}

export function StickerRow() {
  return (
    <div className="bb-stickers" aria-hidden>
      <span className="bb-sticker s1">
        <LuvcartIcon size={42} />
      </span>
      <span className="bb-sticker s2">
        <HeartIcon size={34} />
      </span>
      <span className="bb-sticker s3">
        <SparkleIcon size={30} />
      </span>
      <span className="bb-sticker s4">
        <FlowerIcon size={36} />
      </span>
      <span className="bb-sticker s5">💕</span>
      <span className="bb-sticker s6">✨</span>
      <span className="bb-sticker s7">🛒</span>
      <span className="bb-sticker s8">🌸</span>
    </div>
  );
}
