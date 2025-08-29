import type { ReactElement } from 'react';

export default function ReportsIcon(): ReactElement {
  return (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full">
      <rect width="240" height="160" rx="12" fill="#0F172A" />

      {/* Gradient card background */}
      <rect x="20" y="20" width="200" height="120" rx="8" fill="url(#reportsGradient)" />
      <defs>
        <linearGradient
          id="reportsGradient"
          x1="20"
          y1="20"
          x2="220"
          y2="140"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F766E" stopOpacity="0.3" />
          <stop offset="1" stopColor="#134E4A" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Invoice document */}
      <rect
        x="40"
        y="40"
        width="90"
        height="110"
        rx="4"
        fill="#1E293B"
        filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))"
      />

      {/* Invoice header */}
      <rect x="40" y="40" width="90" height="16" rx="4" fill="#0F172A" />
      <rect x="46" y="46" width="40" height="4" rx="1" fill="#1FB8AA" />
      <rect x="100" y="46" width="24" height="4" rx="1" fill="#64748B" />

      {/* Invoice details */}
      <rect x="46" y="64" width="78" height="2" rx="1" fill="#64748B" />
      <rect x="46" y="70" width="60" height="2" rx="1" fill="#64748B" />
      <rect x="46" y="76" width="70" height="2" rx="1" fill="#64748B" />

      {/* Invoice items */}
      <rect x="46" y="86" width="78" height="1" rx="0.5" fill="#2D3B4E" />
      <rect x="46" y="92" width="78" height="2" rx="1" fill="#64748B" />
      <rect x="46" y="98" width="78" height="2" rx="1" fill="#64748B" />
      <rect x="46" y="104" width="78" height="2" rx="1" fill="#64748B" />
      <rect x="46" y="110" width="78" height="1" rx="0.5" fill="#2D3B4E" />

      {/* Invoice totals */}
      <rect x="80" y="118" width="44" height="2" rx="1" fill="#1FB8AA" />
      <rect x="80" y="124" width="44" height="4" rx="1" fill="#1FB8AA" />

      {/* Chart */}
      <rect
        x="140"
        y="40"
        width="80"
        height="80"
        rx="4"
        fill="#1E293B"
        filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))"
      />

      {/* Chart bars */}
      <rect x="152" y="96" width="8" height="16" rx="1" fill="#0EA5E9" />
      <rect x="164" y="86" width="8" height="26" rx="1" fill="#1FB8AA" />
      <rect x="176" y="76" width="8" height="36" rx="1" fill="#06B6D4" />
      <rect x="188" y="66" width="8" height="46" rx="1" fill="#0D9488" />
      <rect x="200" y="56" width="8" height="56" rx="1" fill="#1FB8AA" />

      {/* Chart baseline */}
      <line x1="148" y1="96" x2="212" y2="96" stroke="#64748B" strokeWidth="1" />

      {/* Chart title */}
      <rect x="146" y="46" width="68" height="3" rx="1.5" fill="#64748B" />

      {/* Data customization controls */}
      <rect
        x="140"
        y="130"
        width="80"
        height="20"
        rx="4"
        fill="#1E293B"
        filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))"
      />
      <circle cx="150" cy="140" r="4" fill="#1FB8AA" />
      <circle cx="165" cy="140" r="4" fill="#0EA5E9" />
      <circle cx="180" cy="140" r="4" fill="#06B6D4" />
      <rect x="190" y="138" width="24" height="4" rx="2" fill="#64748B" />
    </svg>
  );
}
