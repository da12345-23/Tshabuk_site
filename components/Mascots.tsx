"use client";

/**
 * Original character illustrations in the تشابك brand style: a nerve
 * mascot (mustard) and a muscle/vessel mascot (maroon), echoing the two
 * "inner" puzzle pieces of the logo as friendly standalone figures.
 */

export function NerveMascot({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 200" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* dendrites */}
      <g stroke="#b8841e" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M80 48 C 70 30, 55 22, 42 16" />
        <path d="M80 48 C 80 26, 80 14, 80 4" />
        <path d="M80 48 C 90 30, 105 22, 118 16" />
        <path d="M42 16 C 36 12, 30 12, 25 15" />
        <path d="M42 16 C 40 9, 42 4, 47 1" />
        <path d="M118 16 C 124 12, 130 12, 135 15" />
        <path d="M118 16 C 120 9, 118 4, 113 1" />
      </g>

      {/* legs */}
      <g stroke="#dba52f" strokeWidth="10" strokeLinecap="round">
        <path d="M65 178 L 58 198" />
        <path d="M95 178 L 102 198" />
      </g>
      <circle cx="57" cy="200" r="7" fill="#dba52f" />
      <circle cx="103" cy="200" r="7" fill="#dba52f" />

      {/* arms */}
      <path d="M45 110 C 25 108, 14 96, 10 80" stroke="#dba52f" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="76" r="9" fill="#f3c243" stroke="#b8841e" strokeWidth="2" />
      <path d="M115 110 C 132 118, 140 130, 140 148" stroke="#dba52f" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="141" cy="151" r="9" fill="#f3c243" stroke="#b8841e" strokeWidth="2" />

      {/* body */}
      <ellipse cx="80" cy="128" rx="46" ry="54" fill="#f3c243" stroke="#b8841e" strokeWidth="3" />
      <ellipse cx="80" cy="128" rx="46" ry="54" fill="url(#nerveShade)" opacity="0.35" />

      {/* face */}
      <circle cx="63" cy="118" r="10" fill="#fffaf0" />
      <circle cx="97" cy="118" r="10" fill="#fffaf0" />
      <circle cx="65" cy="120" r="5" fill="#2b2320" />
      <circle cx="99" cy="120" r="5" fill="#2b2320" />
      <path d="M63 142 Q80 155 97 142" stroke="#8b3a3a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="134" r="6" fill="#e8a86b" opacity="0.55" />
      <circle cx="110" cy="134" r="6" fill="#e8a86b" opacity="0.55" />

      <defs>
        <linearGradient id="nerveShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#b8841e" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MuscleMascot({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 200" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* legs */}
      <g stroke="#6e2c2c" strokeWidth="10" strokeLinecap="round">
        <path d="M65 178 L 58 198" />
        <path d="M95 178 L 102 198" />
      </g>
      <circle cx="57" cy="200" r="7" fill="#6e2c2c" />
      <circle cx="103" cy="200" r="7" fill="#6e2c2c" />

      {/* arms */}
      <path d="M45 108 C 24 100, 12 108, 8 126" stroke="#8b3a3a" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="130" r="9" fill="#a85a58" stroke="#6e2c2c" strokeWidth="2" />
      <path d="M115 108 C 134 100, 145 88, 146 70" stroke="#8b3a3a" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="147" cy="66" r="9" fill="#a85a58" stroke="#6e2c2c" strokeWidth="2" />

      {/* body: rounded muscle silhouette */}
      <path
        d="M80 66 C 108 66 132 84 132 118 C 132 156 110 186 80 186 C 50 186 28 156 28 118 C 28 84 52 66 80 66 Z"
        fill="#a85a58"
        stroke="#6e2c2c"
        strokeWidth="3"
      />
      <path d="M80 66 C108 66 132 84 132 118 C132 156 110 186 80 186 Z" fill="#8b3a3a" opacity="0.28" />

      {/* central oval accent, echoing the logo piece */}
      <ellipse cx="80" cy="126" rx="20" ry="14" fill="#6e2c2c" opacity="0.5" />
      <ellipse cx="74" cy="121" rx="6" ry="4" fill="#f8dc8f" opacity="0.8" />

      {/* face */}
      <circle cx="62" cy="100" r="10" fill="#fffaf0" />
      <circle cx="98" cy="100" r="10" fill="#fffaf0" />
      <circle cx="64" cy="102" r="5" fill="#2b2320" />
      <circle cx="100" cy="102" r="5" fill="#2b2320" />
      <path d="M62 118 Q80 132 98 118" stroke="#4f2020" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="108" r="6" fill="#f3c243" opacity="0.45" />
      <circle cx="112" cy="108" r="6" fill="#f3c243" opacity="0.45" />
    </svg>
  );
}
