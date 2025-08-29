import type { ReactElement } from 'react';

export default function CustomReportsIcon(): ReactElement {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 mx-auto mb-4">
      <rect width="120" height="120" rx="60" fill="#0F172A" />

      {/* Background glow */}
      <circle cx="60" cy="60" r="40" fill="#0F172A" />
      <circle cx="60" cy="60" r="40" stroke="#1FB8AA" strokeWidth="2" strokeDasharray="4 2" />

      {/* Report */}
      <rect x="36" y="36" width="48" height="48" rx="4" fill="#1E293B" />

      {/* Header */}
      <rect x="36" y="36" width="48" height="8" rx="2" fill="#0F172A" />
      <rect x="40" y="38" width="24" height="4" rx="1" fill="#1FB8AA" />

      {/* Chart Bars */}
      <rect x="40" y="48" width="4" height="10" rx="1" fill="#0EA5E9" />
      <rect x="48" y="52" width="4" height="6" rx="1" fill="#1FB8AA" />
      <rect x="56" y="46" width="4" height="12" rx="1" fill="#06B6D4" />
      <rect x="64" y="50" width="4" height="8" rx="1" fill="#0D9488" />
      <rect x="72" y="44" width="4" height="14" rx="1" fill="#1FB8AA" />

      {/* Data table */}
      <rect x="40" y="64" width="36" height="4" rx="1" fill="#64748B" />
      <rect x="40" y="72" width="36" height="4" rx="1" fill="#64748B" />

      {/* Settings gear */}
      <circle cx="85" cy="35" r="10" fill="#0F172A" stroke="#1FB8AA" strokeWidth="2" />
      <path
        d="M85 32 L85 38 M82 35 L88 35 M81 31 L89 39 M81 39 L89 31"
        stroke="#1FB8AA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
