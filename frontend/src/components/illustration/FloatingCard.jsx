import React from 'react';
import * as Icons from 'lucide-react';

const FloatingCard = ({ icon, label, value, position, animationClass, delay }) => {
  // Dynamically resolve the icon from Lucide React
  const IconComponent = Icons[icon] || Icons.HelpCircle;

  return (
    <div
      className={`
        absolute ${position} ${animationClass} z-10
        backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 
        shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-white w-44
        transition-all duration-300 ease-out hover:scale-105 hover:bg-white/15 
        hover:border-white/30 cursor-default group
      `}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg text-white group-hover:scale-110 transition-transform duration-200">
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-white/60 select-none">
            {label}
          </p>
          <p className="text-xl font-bold text-white tracking-tight mt-0.5 select-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingCard;
