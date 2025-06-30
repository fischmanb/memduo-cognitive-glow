
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-8">
          {/* Current logo with yellow background issues */}
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png" 
              alt="MemDuo Current" 
              className="h-24 w-auto"
              style={{
                mixBlendMode: 'multiply',
                filter: 'invert(1) brightness(2) contrast(1.2) drop-shadow(0 2px 8px rgba(255,255,255,0.3))',
              }}
            />
            <span className="text-xs text-yellow-400 mt-1">Current</span>
          </div>
          
          {/* New clean logo */}
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
              alt="MemDuo New" 
              className="h-24 w-auto"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))',
              }}
            />
            <span className="text-xs text-blue-400 mt-1">New</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
