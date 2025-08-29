import type { ReactElement } from 'react';

export default function RealTimeInsightsIcon(): ReactElement {
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
      <circle cx="60" cy="60" r="40" stroke="#1FB8AA" strokeWidth="2" />

      {/* Clock face */}
      <circle cx="60" cy="60" r="30" fill="#1E293B" />
      <circle cx="60" cy="60" r="28" fill="transparent" stroke="#64748B" strokeWidth="1" />

      {/* Clock ticks */}
      <line x1="60" y1="34" x2="60" y2="40" stroke="#64748B" strokeWidth="1.5" />
      <line x1="60" y1="80" x2="60" y2="86" stroke="#64748B" strokeWidth="1.5" />
      <line x1="86" y1="60" x2="80" y2="60" stroke="#64748B" strokeWidth="1.5" />
      <line x1="40" y1="60" x2="34" y2="60" stroke="#64748B" strokeWidth="1.5" />

      {/* Clock hands */}
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="42"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="60"
        x2="72"
        y2="60"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="60" r="3" fill="#1FB8AA" />

      {/* Data pulse */}
      <path
        d="M60 100 C80 100, 80 85, 90 85 C100 85, 100 95, 110 95"
        stroke="#1FB8AA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M60 100 C40 100, 40 85, 30 85 C20 85, 20 95, 10 95"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Notification dot */}
      <circle cx="85" cy="35" r="8" fill="#0F172A" />
      <circle cx="85" cy="35" r="6" fill="#0EA5E9" />
      <circle cx="85" cy="35" r="3" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
}
