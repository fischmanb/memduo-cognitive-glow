
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png" 
            alt="MemDuo" 
            className="h-24 w-auto"
            style={{
              mixBlendMode: 'multiply',
              filter: 'invert(1) brightness(2) contrast(1.2) drop-shadow(0 2px 8px rgba(255,255,255,0.3))',
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
