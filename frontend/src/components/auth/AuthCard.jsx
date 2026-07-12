import React from 'react';

const AuthCard = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        w-full max-w-[480px] bg-brandbg-base border border-brandborder rounded-xl shadow-soft 
        p-8 sm:p-10 md:p-12 opacity-0 animate-fade-up ${className}
      `}
    >
      {children}
    </div>
  );
};

export default AuthCard;
