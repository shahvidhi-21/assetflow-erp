import React from 'react';
import FloatingCard from './FloatingCard';
import { kpiCards } from './kpiData';

const EcosystemIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG Network Vector in the background */}
      <svg 
        className="w-full h-full max-w-[520px] max-h-[520px] select-none" 
        viewBox="0 0 600 600" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: -20;
              }
            }
            .sync-line {
              stroke-dasharray: 6, 4;
              animation: dash 1.5s linear infinite;
            }
          `}
        </style>

        {/* Central Cloud Node */}
        <circle cx="300" cy="300" r="48" fill="url(#cloudGlow)" opacity="0.6"/>
        <circle cx="300" cy="300" r="32" fill="#FFFFFF" fillOpacity="0.08" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.25"/>
        {/* Simple white cloud path */}
        <path 
          d="M292 308h16a6 6 0 005.2-9 5 5 0 00-8.8-3 5.5 5.5 0 00-9.8 1.5 5 5 0 00-2.6 10.5z" 
          fill="#FFFFFF" 
          opacity="0.8"
        />

        {/* Top Left: Office Node */}
        <g transform="translate(130, 140)">
          <rect x="-24" y="-32" width="48" height="64" rx="4" fill="#FFFFFF" fillOpacity="0.05" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.15"/>
          <line x1="-12" y1="-16" x2="-4" y2="-16" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="4" y1="-16" x2="12" y2="-16" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="-12" y1="0" x2="-4" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="4" y1="0" x2="12" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="-12" y1="16" x2="-4" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="4" y1="16" x2="12" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
        </g>

        {/* Top Right: Workstations Node */}
        <g transform="translate(470, 150)">
          <rect x="-30" y="-24" width="60" height="48" rx="6" fill="#FFFFFF" fillOpacity="0.05" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.15"/>
          {/* Laptop details */}
          <path d="-12 8 h24" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4"/>
          <rect x="-8" y="-6" width="16" height="12" rx="1" fill="#FFFFFF" fillOpacity="0.1" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2"/>
        </g>

        {/* Middle Left: Network/Printers Node */}
        <g transform="translate(90, 310)">
          <circle cx="0" cy="0" r="24" fill="#FFFFFF" fillOpacity="0.03" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.1"/>
          {/* Simple router/box icon */}
          <rect x="-10" y="-8" width="20" height="16" rx="2" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" fill="none"/>
          <line x1="-6" y1="8" x2="6" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4"/>
        </g>

        {/* Bottom Left: Warehouse Shelves Node */}
        <g transform="translate(150, 480)">
          <rect x="-35" y="-30" width="70" height="60" rx="4" fill="#FFFFFF" fillOpacity="0.05" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.15"/>
          <line x1="-25" y1="-10" x2="25" y2="-10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          <line x1="-25" y1="10" x2="25" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3"/>
          {/* Warehouse box silhouttes */}
          <rect x="-20" y="-24" width="10" height="10" rx="1" fill="#60A5FA" fillOpacity="0.3"/>
          <rect x="10" y="-24" width="10" height="10" rx="1" fill="#FFFFFF" fillOpacity="0.2"/>
          <rect x="-10" y="-4" width="12" height="10" rx="1" fill="#FFFFFF" fillOpacity="0.2"/>
          <rect x="8" y="-4" width="12" height="10" rx="1" fill="#60A5FA" fillOpacity="0.3"/>
        </g>

        {/* Bottom Right: Logistics / Vehicles Node */}
        <g transform="translate(450, 470)">
          <rect x="-40" y="-25" width="80" height="50" rx="6" fill="#FFFFFF" fillOpacity="0.05" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.15"/>
          {/* Simple Truck Path */}
          <path d="M-20 8h40v-4h-8l-4-6h-20l-4 6h-4z" fill="#FFFFFF" fillOpacity="0.1" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3"/>
          <circle cx="-10" cy="8" r="4" fill="#FFFFFF" fillOpacity="0.5"/>
          <circle cx="10" cy="8" r="4" fill="#FFFFFF" fillOpacity="0.5"/>
        </g>

        {/* Synchronizing Data Lines */}
        <path className="sync-line" d="M130 172 L270 280" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />
        <path className="sync-line" d="M470 174 L325 282" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />
        <path className="sync-line" d="M114 310 L268 300" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />
        <path className="sync-line" d="M165 450 L275 320" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />
        <path className="sync-line" d="M420 450 L320 320" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />

        {/* Gradients */}
        <defs>
          <radialGradient id="cloudGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
          </radialGradient>
        </defs>
      </svg>

      {/* Floating Glassmorphic KPI Cards overlay */}
      {kpiCards.map((card) => (
        <FloatingCard 
          key={card.id}
          icon={card.icon}
          label={card.label}
          value={card.value}
          position={card.position}
          animationClass={card.animationClass}
          delay={card.delay}
        />
      ))}
    </div>
  );
};

export default EcosystemIllustration;
