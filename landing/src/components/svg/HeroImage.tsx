import type { ReactElement } from 'react';

export default function HeroImage(): ReactElement {
  return (
    <svg
      width="600"
      height="400"
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto">
      <rect width="600" height="400" rx="16" fill="#0F172A" />

      {/* Dashboard frame */}
      <rect x="40" y="40" width="520" height="320" rx="8" fill="#1E293B" />

      {/* Header */}
      <rect x="40" y="40" width="520" height="50" rx="8" fill="#0F172A" />
      <circle cx="65" cy="65" r="10" fill="#1FB8AA" />
      <rect x="85" y="60" width="120" height="10" rx="2" fill="#64748B" />
      <rect
        x="440"
        y="55"
        width="100"
        height="20"
        rx="4"
        fill="#0F172A"
        stroke="#1FB8AA"
        strokeWidth="2"
      />
      <rect x="450" y="60" width="80" height="10" rx="2" fill="#1FB8AA" />

      {/* Left sidebar */}
      <rect x="40" y="90" width="140" height="270" rx="4" fill="#0F172A" />
      <rect x="60" y="110" width="100" height="8" rx="2" fill="#64748B" />
      <rect x="60" y="140" width="100" height="8" rx="2" fill="#64748B" />
      <rect x="60" y="170" width="100" height="8" rx="2" fill="#64748B" />
      <rect x="60" y="200" width="100" height="8" rx="2" fill="#64748B" />
      <rect x="60" y="230" width="100" height="8" rx="2" fill="#64748B" />
      <rect x="60" y="170" width="100" height="8" rx="2" fill="#1FB8AA" />

      {/* Main content */}
      <rect x="200" y="110" width="340" height="120" rx="8" fill="#0F172A" />

      {/* Line chart */}
      <path
        d="M220 200 L260 180 L300 190 L340 150 L380 170 L420 140 L460 160 L500 130"
        stroke="#1FB8AA"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M220 200 L260 190 L300 210 L340 180 L380 200 L420 170 L460 190 L500 180"
        stroke="#06B6D4"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* X-axis */}
      <line x1="220" y1="200" x2="500" y2="200" stroke="#64748B" strokeWidth="1" />
      <line x1="260" y1="200" x2="260" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="300" y1="200" x2="300" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="340" y1="200" x2="340" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="380" y1="200" x2="380" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="420" y1="200" x2="420" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="460" y1="200" x2="460" y2="205" stroke="#64748B" strokeWidth="1" />
      <line x1="500" y1="200" x2="500" y2="205" stroke="#64748B" strokeWidth="1" />

      {/* Stats boxes */}
      <rect x="200" y="240" width="160" height="120" rx="8" fill="#0F172A" />
      <rect x="220" y="260" width="120" height="10" rx="2" fill="#64748B" />
      <rect
        x="220"
        y="280"
        width="80"
        height="20"
        rx="2"
        fill="transparent"
        stroke="#1FB8AA"
        strokeWidth="2"
      />
      <text x="240" y="295" fontFamily="Inter" fontSize="14" fill="#1FB8AA">
        +24.8%
      </text>
      <rect x="220" y="310" width="120" height="8" rx="2" fill="#64748B" />
      <rect x="220" y="330" width="80" height="8" rx="2" fill="#64748B" />

      {/* Pie chart */}
      <circle cx="460" cy="300" r="60" fill="transparent" stroke="#0F172A" strokeWidth="2" />
      <path d="M460 300 L460 240 A60 60 0 0 1 513 330 Z" fill="#1FB8AA" />
      <path d="M460 300 L513 330 A60 60 0 0 1 430 358 Z" fill="#06B6D4" />
      <path d="M460 300 L430 358 A60 60 0 0 1 407 270 Z" fill="#0EA5E9" />
      <path d="M460 300 L407 270 A60 60 0 0 1 460 240 Z" fill="#0D9488" />
    </svg>
  );
}
