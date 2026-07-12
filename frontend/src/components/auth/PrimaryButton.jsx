import React, { useState, useEffect } from 'react';

const PrimaryButton = ({
  children,
  onClick,
  type = 'submit',
  disabled = false,
  className = '',
  ...props
}) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      const timer = setTimeout(() => setIsRippling(false), 600);
      return () => clearTimeout(timer);
    } else {
      setIsRippling(false);
    }
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  const handleClick = (e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative overflow-hidden w-full py-2.5 px-4 bg-brandblue hover:bg-brandblue-hover 
        text-white font-semibold text-sm rounded-lg transition-all duration-200 
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-brandblue focus-visible:ring-offset-2 disabled:opacity-50 
        disabled:cursor-not-allowed disabled:active:scale-100 select-none ${className}
      `}
      {...props}
    >
      {isRippling && (
        <span
          className="ripple"
          style={{
            left: coords.x,
            top: coords.y,
            width: '20px',
            height: '20px',
            marginLeft: '-10px',
            marginTop: '-10px',
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default PrimaryButton;
