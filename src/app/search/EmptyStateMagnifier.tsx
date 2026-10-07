export default function EmptyStateMagnifier() {
  return (
    <div className="search-empty-magnifier" aria-hidden="true">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="search-empty-magnifier-svg"
      >
        <defs>
          {/* Glass lens gradient */}
          <linearGradient id="lensGrad" x1="12" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.7" />
          </linearGradient>

          {/* Rim 3D gradient */}
          <linearGradient id="rimGrad" x1="10" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Handle gradient */}
          <linearGradient id="handleGrad" x1="38" y1="38" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="35%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>

          {/* Collar gradient */}
          <linearGradient id="collarGrad" x1="33" y1="33" x2="41" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Soft drop shadow */}
          <filter id="softShadow" x="0" y="0" width="68" height="68" filterUnits="userSpaceOnUse">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#64748B" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#softShadow)">
          {/* Handle */}
          <line
            x1="36"
            y1="36"
            x2="53"
            y2="53"
            stroke="url(#handleGrad)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Handle specular shine */}
          <line
            x1="37"
            y1="35"
            x2="51"
            y2="49"
            stroke="#F5F3FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Collar ring */}
          <rect
            x="32"
            y="32"
            width="6"
            height="4"
            rx="1.5"
            transform="rotate(45 32 32)"
            fill="url(#collarGrad)"
          />

          {/* Outer rim */}
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke="url(#rimGrad)"
            strokeWidth="4"
            fill="url(#lensGrad)"
          />

          {/* Inner glass highlight / sheen */}
          <ellipse
            cx="19"
            cy="18"
            rx="7"
            ry="4"
            transform="rotate(-35 19 18)"
            fill="#FFFFFF"
            fillOpacity="0.75"
          />

          <circle
            cx="29"
            cy="29"
            r="2"
            fill="#FFFFFF"
            fillOpacity="0.4"
          />
        </g>
      </svg>
    </div>
  );
}
