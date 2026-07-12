import React from 'react';
import EcosystemIllustration from '../illustration/EcosystemIllustration';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-brandbg-subtle select-none font-sans antialiased">
      {/* Left side: Authentication forms */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center py-12 px-6 md:px-12 lg:w-1/2 min-h-screen overflow-y-auto">
        <div className="w-full max-w-[480px] flex justify-center items-center my-auto">
          {children}
        </div>
      </div>

      {/* Right side: Illustration Panel (hidden on screens smaller than lg) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 overflow-hidden h-screen sticky top-0">
        {/* Subtle radial glow overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(96,165,250,0.15)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Large overlay ring details */}
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full border border-white/5 pointer-events-none" />
        
        {/* Full-width illustration renderer */}
        <div className="w-full h-full flex items-center justify-center p-12">
          <EcosystemIllustration />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
