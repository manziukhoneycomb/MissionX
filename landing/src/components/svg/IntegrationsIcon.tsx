import type { ReactElement } from 'react';

export default function IntegrationsIcon(): ReactElement {
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
      <circle cx="60" cy="60" r="40" stroke="#1FB8AA" strokeWidth="2" strokeDasharray="2 4" />

      {/* Connecting dots & lines */}
      <circle cx="60" cy="60" r="12" fill="#1E293B" stroke="#1FB8AA" strokeWidth="2" />
      <circle cx="38" cy="38" r="8" fill="#1E293B" stroke="#06B6D4" strokeWidth="2" />
      <circle cx="82" cy="38" r="8" fill="#1E293B" stroke="#0EA5E9" strokeWidth="2" />
      <circle cx="38" cy="82" r="8" fill="#1E293B" stroke="#0D9488" strokeWidth="2" />
      <circle cx="82" cy="82" r="8" fill="#1E293B" stroke="#1FB8AA" strokeWidth="2" />

      {/* Connection lines */}
      <line
        x1="60"
        y1="48"
        x2="60"
        y2="42"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="60"
        y1="78"
        x2="60"
        y2="72"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="48"
        y1="60"
        x2="42"
        y2="60"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="78"
        y1="60"
        x2="72"
        y2="60"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeDasharray="2 2"
      />

      <line
        x1="46.5"
        y1="46.5"
        x2="42"
        y2="42"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="73.5"
        y1="46.5"
        x2="78"
        y2="42"
        stroke="#0EA5E9"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="46.5"
        y1="73.5"
        x2="42"
        y2="78"
        stroke="#0D9488"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <line
        x1="73.5"
        y1="73.5"
        x2="78"
        y2="78"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeDasharray="2 2"
      />

      {/* Central icon - puzzle piece */}
      <path
        d="M58 54 H62 V50 C62 48 64 48 65 49 C66 50 68 50 68 48 V46 H66 C64 46 64 44 65 43 C66 42 66 40 64 40 H56 C54 40 54 42 55 43 C56 44 56 46 54 46 H52 V48 C52 50 54 50 55 49 C56 48 58 48 58 50 V54 Z"
        fill="#1FB8AA"
      />

      {/* Connection icons */}
      <path d="M38 36 V40 M36 38 H40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 36 V40 M80 38 H84" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 80 V84 M36 82 H40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 80 V84 M80 82 H84" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
