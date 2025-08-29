import type { ReactElement } from 'react';

export default function DashboardIcon(): ReactElement {
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
      <rect x="20" y="20" width="200" height="120" rx="8" fill="url(#dashboardGradient)" />
      <defs>
        <linearGradient
          id="dashboardGradient"
          x1="20"
          y1="20"
          x2="220"
          y2="140"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E7490" stopOpacity="0.3" />
          <stop offset="1" stopColor="#164E63" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Dashboard container */}
      <rect x="40" y="35" width="160" height="100" rx="6" fill="#1E293B" />

      {/* Dashboard header */}
      <rect x="40" y="35" width="160" height="16" rx="4" fill="#0F172A" />
      <rect x="50" y="41" width="40" height="4" rx="2" fill="#1FB8AA" />
      <circle cx="180" cy="43" r="4" fill="#64748B" />
      <circle cx="168" cy="43" r="4" fill="#64748B" />

      {/* KPI cards */}
      <rect x="50" y="61" width="60" height="30" rx="4" fill="#0F172A" />
      <rect x="55" y="66" width="30" height="3" rx="1.5" fill="#64748B" />
      <rect x="55" y="76" width="40" height="5" rx="2.5" fill="#1FB8AA" />
      <path
        d="M90 74 L93 71 L96 74"
        stroke="#1FB8AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="130" y="61" width="60" height="30" rx="4" fill="#0F172A" />
      <rect x="135" y="66" width="30" height="3" rx="1.5" fill="#64748B" />
      <rect x="135" y="76" width="40" height="5" rx="2.5" fill="#0EA5E9" />
      <path
        d="M170 77 L173 80 L176 77"
        stroke="#0EA5E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area chart */}
      <rect x="50" y="101" width="140" height="24" rx="4" fill="#0F172A" />

      {/* Chart background grid */}
      <line
        x1="60"
        y1="105"
        x2="60"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="80"
        y1="105"
        x2="80"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="100"
        y1="105"
        x2="100"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="120"
        y1="105"
        x2="120"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="140"
        y1="105"
        x2="140"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="160"
        y1="105"
        x2="160"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      <line
        x1="55"
        y1="108"
        x2="180"
        y2="108"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="55"
        y1="114"
        x2="180"
        y2="114"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <line
        x1="55"
        y1="120"
        x2="180"
        y2="120"
        stroke="#334155"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      {/* Chart data - area */}
      <path
        d="M60 118 L80 112 L100 116 L120 110 L140 108 L160 114 L180 106 L180 121 L60 121 Z"
        fill="url(#chartGradient)"
      />
      <defs>
        <linearGradient
          id="chartGradient"
          x1="120"
          y1="106"
          x2="120"
          y2="121"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1FB8AA" stopOpacity="0.6" />
          <stop offset="1" stopColor="#1FB8AA" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Chart line */}
      <path
        d="M60 118 L80 112 L100 116 L120 110 L140 108 L160 114 L180 106"
        stroke="#1FB8AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      <circle cx="60" cy="118" r="2" fill="#1FB8AA" />
      <circle cx="80" cy="112" r="2" fill="#1FB8AA" />
      <circle cx="100" cy="116" r="2" fill="#1FB8AA" />
      <circle cx="120" cy="110" r="2" fill="#1FB8AA" />
      <circle cx="140" cy="108" r="2" fill="#1FB8AA" />
      <circle cx="160" cy="114" r="2" fill="#1FB8AA" />
      <circle cx="180" cy="106" r="2" fill="#1FB8AA" />

      {/* Date range selectors */}
      <rect x="50" y="130" width="20" height="5" rx="2.5" fill="#64748B" />
      <rect x="75" y="130" width="20" height="5" rx="2.5" fill="#1FB8AA" />
      <rect x="100" y="130" width="20" height="5" rx="2.5" fill="#64748B" />
    </svg>
  );
}
