import { cn } from '@/lib/utils';

type GilliamCutoutProps = {
  className?: string;
};

/** Single surreal collage — the 2% personality punchline beside the orb. */
export function GilliamCutout({ className }: GilliamCutoutProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none select-none', className)}
    >
      <svg
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[4px_8px_0_rgba(5,5,5,0.08)]"
      >
        {/* Floating eye — cut from another page */}
        <ellipse
          cx="228"
          cy="52"
          rx="22"
          ry="14"
          fill="#F9F8F4"
          stroke="#050505"
          strokeWidth="2"
          transform="rotate(12 228 52)"
        />
        <circle cx="232" cy="50" r="5" fill="#050505" />

        {/* Victorian head — magazine cutout */}
        <path
          d="M72 48 C72 28 92 16 118 16 C148 16 168 34 168 58 C168 72 162 84 152 92 L152 118 L88 118 L88 92 C78 84 72 72 72 58 Z"
          fill="#E8E4DC"
          stroke="#050505"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M88 118 L152 118 L148 138 C140 148 100 148 92 138 Z"
          fill="#D4CFC4"
          stroke="#050505"
          strokeWidth="2"
        />
        {/* Top hat fragment */}
        <rect
          x="98"
          y="8"
          width="64"
          height="18"
          rx="2"
          fill="#050505"
          transform="rotate(-4 130 17)"
        />
        <rect
          x="106"
          y="22"
          width="48"
          height="14"
          fill="#050505"
          transform="rotate(-4 130 29)"
        />

        {/* Torso — mismatched machinery */}
        <rect
          x="78"
          y="138"
          width="84"
          height="56"
          rx="4"
          fill="#C8C2B8"
          stroke="#050505"
          strokeWidth="2"
          transform="rotate(3 120 166)"
        />
        <circle cx="108" cy="166" r="8" fill="#050505" opacity="0.15" />
        <circle cx="132" cy="172" r="5" fill="#050505" />

        {/* Scissor arm — left */}
        <path
          d="M58 148 L38 128 M38 128 L28 108 M38 128 L48 108"
          stroke="#050505"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse
          cx="34"
          cy="118"
          rx="12"
          ry="8"
          fill="#E8E4DC"
          stroke="#050505"
          strokeWidth="2"
          transform="rotate(-30 34 118)"
        />

        {/* Bird leg — right */}
        <path
          d="M168 182 L198 228 L188 238 L158 192"
          fill="#D4CFC4"
          stroke="#050505"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M188 238 L210 248 L205 258 L182 246"
          fill="#050505"
        />

        {/* Wheel base — absurd foundation */}
        <circle
          cx="120"
          cy="268"
          r="36"
          fill="none"
          stroke="#050505"
          strokeWidth="2.5"
        />
        <circle cx="120" cy="268" r="8" fill="#050505" />
        <line
          x1="120"
          y1="232"
          x2="120"
          y2="200"
          stroke="#050505"
          strokeWidth="2"
        />

        {/* Torn paper edge accent — the one sage touch lives on chapters, not here */}
        <path
          d="M200 180 L240 160 L252 200 L212 220 Z"
          fill="#F9F8F4"
          stroke="#050505"
          strokeWidth="2"
          strokeDasharray="4 3"
          transform="rotate(8 226 190)"
        />
      </svg>
    </div>
  );
}
