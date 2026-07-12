import React from 'react';

const Divider = ({ children = 'or continue with' }) => {
  return (
    <div className="relative my-6 flex items-center">
      <div className="flex-grow border-t border-brandborder"></div>
      <span className="mx-4 flex-shrink text-xs font-medium text-brandtext-secondary uppercase tracking-wider select-none">
        {children}
      </span>
      <div className="flex-grow border-t border-brandborder"></div>
    </div>
  );
};

export default Divider;
