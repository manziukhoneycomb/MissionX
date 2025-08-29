import type { ReactElement } from 'react';

export default function AutomationIcon(): ReactElement {
  return (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full">
      <rect width="240" height="160" rx="12" fill="#0F172A" />

      {/* Dark UI background */}
      <rect x="20" y="20" width="200" height="120" rx="8" fill="#1E293B" />

      {/* Left sidebar */}
      <rect x="20" y="20" width="50" height="120" rx="8" fill="#0F172A" />

      {/* Sidebar items */}
      <rect x="28" y="36" width="34" height="4" rx="2" fill="#64748B" />
      <rect x="28" y="52" width="34" height="4" rx="2" fill="#64748B" />
      <rect x="28" y="68" width="34" height="4" rx="2" fill="#1FB8AA" />
      <rect x="28" y="84" width="34" height="4" rx="2" fill="#64748B" />
      <rect x="28" y="100" width="34" height="4" rx="2" fill="#64748B" />

      {/* Header */}
      <rect x="80" y="28" width="130" height="8" rx="2" fill="#64748B" />

      {/* Workflow steps connected with lines */}
      <rect
        x="85"
        y="50"
        width="40"
        height="30"
        rx="4"
        fill="#0F172A"
        stroke="#1FB8AA"
        strokeWidth="2"
      />
      <rect
        x="158"
        y="50"
        width="40"
        height="30"
        rx="4"
        fill="#0F172A"
        stroke="#06B6D4"
        strokeWidth="2"
      />
      <rect
        x="85"
        y="95"
        width="40"
        height="30"
        rx="4"
        fill="#0F172A"
        stroke="#0EA5E9"
        strokeWidth="2"
      />
      <rect
        x="158"
        y="95"
        width="40"
        height="30"
        rx="4"
        fill="#0F172A"
        stroke="#0D9488"
        strokeWidth="2"
      />

      {/* Step icons */}
      <circle cx="105" cy="65" r="10" fill="#0F172A" stroke="#1FB8AA" strokeWidth="1.5" />
      <path
        d="M100 65 L103 68 L110 61"
        stroke="#1FB8AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="178" cy="65" r="10" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
      <path
        d="M173 65 L178 65 L178 65 M178 60 L178 70"
        stroke="#06B6D4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="105" cy="110" r="10" fill="#0F172A" stroke="#0EA5E9" strokeWidth="1.5" />
      <path
        d="M100 110 L110 110 M105 105 L105 115"
        stroke="#0EA5E9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle cx="178" cy="110" r="10" fill="#0F172A" stroke="#0D9488" strokeWidth="1.5" />
      <rect x="173" y="105" width="10" height="10" rx="1" stroke="#0D9488" strokeWidth="1.5" />

      {/* Connection arrows */}
      <path
        d="M125 65 H138 M138 65 L133 60 M138 65 L133 70"
        stroke="#1FB8AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M178 80 V87.5 H120 V87.5 H120 V95 M120 95 L125 90 M120 95 L115 90"
        stroke="#06B6D4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M125 110 H138 M138 110 L133 105 M138 110 L133 115"
        stroke="#0EA5E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Automation badges */}
      <rect x="105" y="35" width="30" height="10" rx="5" fill="#0F172A" />
      <rect x="107" y="37" width="26" height="6" rx="3" fill="#1FB8AA" />
      <rect x="178" y="35" width="30" height="10" rx="5" fill="#0F172A" />
      <rect x="180" y="37" width="26" height="6" rx="3" fill="#06B6D4" />
    </svg>
  );
}
