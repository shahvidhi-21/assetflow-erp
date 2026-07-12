import React from 'react';

export default function FloatingCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  className = '',
  animationClass = 'animate-float-1',
}) {
  return (
    <div
      className={`glass-panel p-4 rounded-3xl shadow-xl shadow-gray-200/50 flex items-start gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-200/80 cursor-pointer ${animationClass} ${className}`}
    >
      <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="flex flex-col text-left gap-0.5">
        <h4 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-gray-500 leading-normal font-medium max-w-[180px]">
          {description}
        </p>
      </div>
    </div>
  );
}
